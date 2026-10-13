import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function signatureIsValid(rawBody: string, header: string, secret: string): boolean {
  const parts = header.split(",").map((part) => part.split("=", 2));
  const timestamp = parts.find(([key]) => key === "t")?.[1];
  const signatures = parts.filter(([key]) => key === "v1").map(([, value]) => value);
  if (!timestamp || !/^\d+$/.test(timestamp) || !signatures.length) return false;
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;
  const expected = createHmac("sha256", secret).update(timestamp + "." + rawBody).digest("hex");
  return signatures.some((signature) => {
    if (!/^[a-f0-9]{64}$/i.test(signature)) return false;
    const actualBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expected, "hex");
    return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
  });
}

function isAdult(dob: { day?: number; month?: number; year?: number } | undefined): boolean {
  if (!dob?.day || !dob.month || !dob.year) return false;
  const birth = new Date(Date.UTC(dob.year, dob.month - 1, dob.day));
  if (Number.isNaN(birth.getTime()) || birth.getUTCFullYear() !== dob.year || birth.getUTCMonth() !== dob.month - 1 || birth.getUTCDate() !== dob.day) return false;
  const now = new Date();
  let age = now.getUTCFullYear() - dob.year;
  if (now.getUTCMonth() < dob.month - 1 || (now.getUTCMonth() === dob.month - 1 && now.getUTCDate() < dob.day)) age--;
  return age >= 18;
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_IDENTITY_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (!secret || !signature) return NextResponse.json({ error: "Webhook non configuré." }, { status: 400 });
  const rawBody = await request.text();
  if (!signatureIsValid(rawBody, signature, secret)) return NextResponse.json({ error: "Signature invalide." }, { status: 400 });

  let event: { type?: string; data?: { object?: Record<string, unknown> } };
  try { event = JSON.parse(rawBody) as typeof event; } catch { return NextResponse.json({ error: "Payload invalide." }, { status: 400 }); }
  const session = event.data?.object;
  const sessionId = typeof session?.id === "string" ? session.id : null;
  if (!sessionId) return NextResponse.json({ received: true });
  const supported = new Set(["identity.verification_session.verified", "identity.verification_session.requires_input", "identity.verification_session.canceled", "identity.verification_session.processing"]);
  if (!event.type || !supported.has(event.type)) return NextResponse.json({ received: true });

  try {
    const sql = getDb();
    const rows = await sql`select id, user_id from public.profile_identity_verification_sessions where provider_session_id = ${sessionId} limit 1`;
    if (!rows[0]) return NextResponse.json({ received: true });
    const userId = String(rows[0].user_id);

    if (event.type === "identity.verification_session.verified") {
      const outputs = session?.verified_outputs as { dob?: { day?: number; month?: number; year?: number } } | undefined;
      const dob = outputs?.dob;
      const profileRows = await sql`select birth_date from public.profiles where id = ${userId} limit 1`;
      const declaredDate = profileRows[0]?.birth_date ? String(profileRows[0].birth_date).slice(0, 10) : "";
      const verifiedDate = dob?.year && dob.month && dob.day
        ? `${String(dob.year).padStart(4, "0")}-${String(dob.month).padStart(2, "0")}-${String(dob.day).padStart(2, "0")}`
        : "";
      const verified = isAdult(dob) && declaredDate === verifiedDate;
      await sql`update public.profile_identity_verification_sessions set status = ${verified ? "verified" : "rejected"}, verified_at = ${verified ? new Date().toISOString() : null}, failure_reason = ${verified ? null : "La majorité ou la date de naissance ne correspond pas au profil."}, updated_at = now() where provider_session_id = ${sessionId}`;
      await sql`update public.profiles set verification_status = ${verified ? "verified" : "rejected"}, verification_reviewed_at = now() where id = ${userId}`;
    } else if (event.type === "identity.verification_session.processing") {
      await sql`update public.profile_identity_verification_sessions set status = 'processing', updated_at = now() where provider_session_id = ${sessionId}`;
    } else {
      const status = event.type.endsWith(".canceled") ? "canceled" : "requires_input";
      await sql`update public.profile_identity_verification_sessions set status = ${status}, updated_at = now() where provider_session_id = ${sessionId}`;
      if (status === "canceled") await sql`update public.profiles set verification_status = 'unverified' where id = ${userId} and verification_status = 'pending'`;
    }
    return NextResponse.json({ received: true }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    console.error("Stripe Identity webhook processing failed.");
    return NextResponse.json({ error: "Traitement temporairement indisponible." }, { status: 500 });
  }
}
