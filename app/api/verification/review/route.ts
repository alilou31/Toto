import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
async function reviewer() {
  const user = await getCurrentUser().catch(() => null);
  const allow = (process.env.VERIFICATION_REVIEWER_EMAILS ?? "").split(",").map(x => x.trim().toLowerCase()).filter(Boolean);
  return user && allow.includes(user.email.toLowerCase()) ? user : null;
}
export async function GET(request: Request) {
  const who = await reviewer();
  if (!who) return NextResponse.json({ error: "Accès réservé aux réviseurs autorisés." }, { status: 403, headers: { "Cache-Control": "no-store" } });
  const sql = getDb();
  try {
    const mediaId = new URL(request.url).searchParams.get("mediaId");
    if (mediaId) {
      const rows = await sql`select evidence_bytes, evidence_mime from public.profile_verification_requests where id = ${mediaId} and status = 'pending' limit 1`;
      if (!rows[0]) return NextResponse.json({ error: "Preuve introuvable ou déjà traitée." }, { status: 404, headers: { "Cache-Control": "no-store" } });
      return new NextResponse(Buffer.from(rows[0].evidence_bytes as Uint8Array), { headers: { "Content-Type": String(rows[0].evidence_mime), "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", "Content-Disposition": "inline" } });
    }
    const rows = await sql`select r.id, r.user_id, p.public_name, p.birth_date, p.gender, r.evidence_mime, r.submitted_at, exists(select 1 from public.profile_photos ph where ph.user_id = p.id and ph.moderation_status = 'approved') as has_approved_profile_photo from public.profile_verification_requests r join public.profiles p on p.id = r.user_id where r.status = 'pending' order by r.submitted_at asc limit 50`;
    return NextResponse.json({ requests: rows }, { headers: { "Cache-Control": "no-store" } });
  } catch { return NextResponse.json({ error: "File de vérification indisponible." }, { status: 503 }); }
}
export async function POST(request: Request) {
  const who = await reviewer();
  if (!who) return NextResponse.json({ error: "Accès réservé aux réviseurs autorisés." }, { status: 403, headers: { "Cache-Control": "no-store" } });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Requête invalide." }, { status: 400 }); }
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  const { requestId, decision, note } = body as Record<string, unknown>;
  if (typeof requestId !== "string" || !/^[0-9a-f-]{36}$/i.test(requestId) || !["approved", "rejected"].includes(String(decision)) || (note !== undefined && (typeof note !== "string" || note.length > 500))) return NextResponse.json({ error: "Décision invalide." }, { status: 400 });
  const sql = getDb();
  try {
    const rows = await sql`update public.profile_verification_requests set status = ${decision as string}, reviewed_by = ${who.email}, reviewed_at = now(), review_note = ${typeof note === "string" ? note : null}, evidence_bytes = ''::bytea where id = ${requestId} and status = 'pending' returning user_id, status`;
    if (!rows[0]) return NextResponse.json({ error: "Demande introuvable ou déjà traitée." }, { status: 404 });
    await sql`update public.profiles set verification_status = ${decision === "approved" ? "verified" : "rejected"}, verification_reviewed_at = now() where id = ${rows[0].user_id}`;
    return NextResponse.json({ ok: true, status: decision }, { headers: { "Cache-Control": "no-store" } });
  } catch { return NextResponse.json({ error: "Impossible d’enregistrer la décision." }, { status: 503 }); }
}
