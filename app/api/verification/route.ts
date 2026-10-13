import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm"]);
export async function GET() {
  const user = await getCurrentUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Authentification requise." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  try {
    const sql = getDb();
    const rows = await sql`select verification_status, verification_reviewed_at from public.profiles where id = ${user.id} limit 1`;
    const requests = await sql`select id, status, submitted_at, reviewed_at, review_note from public.profile_verification_requests where user_id = ${user.id} order by submitted_at desc limit 5`;
    return NextResponse.json({ status: rows[0]?.verification_status ?? "unverified", reviewedAt: rows[0]?.verification_reviewed_at ?? null, requests }, { headers: { "Cache-Control": "no-store" } });
  } catch { return NextResponse.json({ error: "Service de vérification indisponible. Appliquez la migration 011." }, { status: 503, headers: { "Cache-Control": "no-store" } }); }
}
export async function POST(request: Request) {
  const user = await getCurrentUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Authentification requise." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  let form: FormData;
  try { form = await request.formData(); } catch { return NextResponse.json({ error: "Fichier invalide." }, { status: 400 }); }
  const evidence = form.get("evidence");
  if (form.get("consent") !== "true") return NextResponse.json({ error: "Votre consentement au contrôle manuel est requis." }, { status: 400 });
  if (!(evidence instanceof File) || !ALLOWED.has(evidence.type) || evidence.size < 1 || evidence.size > MAX_BYTES) return NextResponse.json({ error: "Photo JPEG, PNG, WebP ou vidéo MP4/WebM de 8 Mo maximum requise." }, { status: 400 });
  try {
    const sql = getDb();
    const profile = await sql`select birth_date from public.profiles where id = ${user.id} limit 1`;
    if (!profile[0]?.birth_date) return NextResponse.json({ error: "Complétez d’abord votre date de naissance dans le profil." }, { status: 400 });
    const birth = new Date(String(profile[0].birth_date) + "T00:00:00Z");
    const now = new Date();
    let age = now.getUTCFullYear() - birth.getUTCFullYear();
    if (now.getUTCMonth() < birth.getUTCMonth() || (now.getUTCMonth() === birth.getUTCMonth() && now.getUTCDate() < birth.getUTCDate())) age--;
    if (age < 18) return NextResponse.json({ error: "La vérification est réservée aux adultes de 18 ans et plus." }, { status: 403 });
    const pending = await sql`select id from public.profile_verification_requests where user_id = ${user.id} and status = 'pending' limit 1`;
    if (pending.length) return NextResponse.json({ error: "Une vérification est déjà en attente." }, { status: 409 });
    const bytes = Buffer.from(await evidence.arrayBuffer());
    const rows = await sql`insert into public.profile_verification_requests (user_id, evidence_bytes, evidence_mime, consent_at, status) values (${user.id}, ${bytes}, ${evidence.type}, now(), 'pending') returning id, status, submitted_at`;
    await sql`update public.profiles set verification_status = 'pending' where id = ${user.id}`;
    return NextResponse.json({ request: rows[0], message: "Demande reçue. Le badge sera activé après contrôle humain." }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch { console.error("NIKAHYA verification submission failed."); return NextResponse.json({ error: "Impossible d’enregistrer la demande. Réessayez plus tard." }, { status: 503, headers: { "Cache-Control": "no-store" } }); }
}
