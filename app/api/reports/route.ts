import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { consumeAuthRateLimit } from "@/lib/auth-rate-limit";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REPORT_CATEGORIES = new Set(["fake_profile", "harassment", "scam", "inappropriate_content", "underage_concern", "other"]);

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }

  const data = body as Record<string, unknown>;
  const reportedUserId = typeof data.reportedUserId === "string" ? data.reportedUserId.trim() : "";
  const category = typeof data.category === "string" ? data.category : "";
  const details = typeof data.details === "string" ? data.details.trim() : "";
  if (!reportedUserId || reportedUserId.length > 128 || !REPORT_CATEGORIES.has(category) || details.length > 3000) {
    return NextResponse.json({ error: "Vérifiez le profil, le motif et les précisions du signalement." }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }

  const user = await getCurrentUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Connectez-vous pour signaler un profil." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  if (reportedUserId === user.id) {
    return NextResponse.json({ error: "Vous ne pouvez pas signaler votre propre profil." }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }

  try {
    const limit = await consumeAuthRateLimit("report-user", user.id, 20, 60 * 60);
    if (!limit.allowed) {
      return NextResponse.json({ error: "Vous avez atteint la limite de signalements. Réessayez plus tard." }, { status: 429, headers: { "Cache-Control": "no-store", "Retry-After": String(limit.retryAfterSeconds) } });
    }

    const sql = getDb();
    const visible = "visible";
    const target = await sql`select id from public.profiles where id = ${reportedUserId} and visibility = ${visible} and onboarding_completed = true limit 1`;
    if (!target.length) {
      return NextResponse.json({ error: "Ce profil n’est pas disponible pour un signalement." }, { status: 404, headers: { "Cache-Control": "no-store" } });
    }

    const existing = await sql`select id from public.reports where reporter_id = ${user.id} and reported_user_id = ${reportedUserId} and category = ${category} and (status = 'open' or status = 'reviewing') and created_at > now() - interval '24 hours' limit 1`;
    if (existing.length) return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });

    await sql`insert into public.reports (reporter_id, reported_user_id, category, details) values (${user.id}, ${reportedUserId}, ${category}, ${details || null})`;
    return NextResponse.json({ ok: true }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch {
    console.error("NIKAHYA report submission failed.");
    return NextResponse.json({ error: "Le signalement n’a pas pu être enregistré. Réessayez plus tard." }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
