import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { consumeAuthRateLimit, getTrustedClientIp } from "@/lib/auth-rate-limit";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const categories = new Set(["experience", "discovery", "games", "trust_safety", "pricing", "other"]);
const noStore = { "Cache-Control": "no-store" };

export async function POST(request: Request) {
  let input: unknown;
  try { input = await request.json(); }
  catch { return NextResponse.json({ error: "Requête invalide." }, { status: 400, headers: noStore }); }
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400, headers: noStore });
  }

  const data = input as Record<string, unknown>;
  if (typeof data.website === "string" && data.website.trim()) {
    return NextResponse.json({ ok: true }, { status: 202, headers: noStore });
  }
  const category = typeof data.category === "string" ? data.category : "";
  const message = typeof data.message === "string" ? data.message.trim() : "";
  const rating = data.rating === null || data.rating === undefined || data.rating === "" ? null : Number(data.rating);
  if (!categories.has(category) || message.length < 10 || message.length > 2000
    || (rating !== null && (!Number.isInteger(rating) || rating < 1 || rating > 5))
    || data.consent !== true) {
    return NextResponse.json({ error: "Vérifiez le thème, votre message et votre accord de traitement." }, { status: 400, headers: noStore });
  }

  try {
    const ip = getTrustedClientIp(request);
    if (ip) {
      const limit = await consumeAuthRateLimit("product-feedback-ip", ip, 5, 60 * 60);
      if (!limit.allowed) {
        return NextResponse.json({ error: "Trop de retours envoyés. Réessayez plus tard." }, {
          status: 429, headers: { ...noStore, "Retry-After": String(limit.retryAfterSeconds) },
        });
      }
    }
    const user = await getCurrentUser().catch(() => null);
    const sql = getDb();
    await sql`
      insert into public.product_feedback (user_id, category, rating, message)
      values (${user?.id ?? null}, ${category}, ${rating}, ${message})
    `;
    return NextResponse.json({ ok: true }, { status: 201, headers: noStore });
  } catch {
    console.error("NAKAHYA product feedback submission failed.");
    return NextResponse.json({ error: "Le retour n’a pas pu être enregistré. Réessayez plus tard." }, { status: 503, headers: noStore });
  }
}
