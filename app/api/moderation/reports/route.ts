import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const noStore = { "Cache-Control": "no-store" };
const validStatuses = ["open", "reviewing", "resolved", "dismissed"] as const;

async function reviewer() {
  const user = await getCurrentUser().catch(() => null);
  const emails = (process.env.MODERATION_REVIEWER_EMAILS ?? "")
    .split(",").map(email => email.trim().toLowerCase()).filter(Boolean);
  return user && emails.includes(user.email.toLowerCase()) ? user : null;
}

export async function GET(request: Request) {
  const user = await reviewer();
  if (!user) return NextResponse.json({ error: "Accès réservé à la modération." }, { status: 403, headers: noStore });

  const status = new URL(request.url).searchParams.get("status") ?? "open";
  if (!(validStatuses as readonly string[]).includes(status)) {
    return NextResponse.json({ error: "Statut de signalement invalide." }, { status: 400, headers: noStore });
  }
  try {
    const sql = getDb();
    const reports = await sql`
      select r.id, r.reported_user_id, r.category, r.details, r.status, r.created_at
      from public.reports r
      where r.status = ${status}
      order by r.created_at asc
      limit 50
    `;
    // Reporter identities are intentionally omitted from the moderation queue.
    return NextResponse.json({ reports }, { headers: noStore });
  } catch {
    console.error("NAKAHYA moderation queue unavailable.");
    return NextResponse.json({ error: "File de modération indisponible." }, { status: 503, headers: noStore });
  }
}

export async function PATCH(request: Request) {
  const user = await reviewer();
  if (!user) return NextResponse.json({ error: "Accès réservé à la modération." }, { status: 403, headers: noStore });

  let input: unknown;
  try { input = await request.json(); }
  catch { return NextResponse.json({ error: "Requête invalide." }, { status: 400, headers: noStore }); }
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400, headers: noStore });
  }
  const { reportId, status } = input as Record<string, unknown>;
  if (typeof reportId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(reportId)
    || typeof status !== "string" || !["reviewing", "resolved", "dismissed"].includes(status)) {
    return NextResponse.json({ error: "Décision invalide." }, { status: 400, headers: noStore });
  }

  try {
    const sql = getDb();
    const updated = await sql`
      update public.reports set status = ${status}
      where id = ${reportId} and status in ('open', 'reviewing')
      returning id, status
    `;
    if (!updated.length) return NextResponse.json({ error: "Signalement introuvable ou déjà clôturé." }, { status: 404, headers: noStore });
    // Audit log contains only action metadata; no reporter details or message bodies.
    console.info("NAKAHYA moderation status updated.", { reportId, status, reviewerId: user.id });
    return NextResponse.json({ report: updated[0] }, { headers: noStore });
  } catch {
    console.error("NAKAHYA moderation action unavailable.");
    return NextResponse.json({ error: "Décision de modération indisponible." }, { status: 503, headers: noStore });
  }
}
