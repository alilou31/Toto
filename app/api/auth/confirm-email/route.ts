import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { hashVerificationToken, isVerificationToken } from "@/lib/email-verification";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const noStore = { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" };

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Requête invalide." }, { status: 400, headers: noStore }); }
  const token = body && typeof body === "object" && "token" in body ? body.token : null;
  if (!isVerificationToken(token)) {
    return NextResponse.json({ error: "Ce lien de confirmation est invalide ou a expiré." }, { status: 400, headers: noStore });
  }
  if (process.env.EMAIL_VERIFICATION_ENABLED !== "true") {
    return NextResponse.json({ error: "La confirmation par e-mail est indisponible." }, { status: 503, headers: noStore });
  }

  const tokenHash = hashVerificationToken(token);
  try {
    const sql = getDb();
    // Atomic one-time claim + account creation. A duplicate or expired token
    // cannot create a second account; previously registered members are untouched.
    const rows = await sql`
      with claimed as (
        delete from public.pending_email_registrations
        where token_hash = ${tokenHash} and expires_at > now()
        returning email, email_normalized, password_hash, age_confirmed_at, terms_accepted_at, privacy_acknowledged_at
      )
      insert into public.auth_users
        (id, email, email_normalized, password_hash, age_confirmed_at, terms_accepted_at, privacy_acknowledged_at)
      select ${randomUUID()}, email, email_normalized, password_hash,
        age_confirmed_at, terms_accepted_at, privacy_acknowledged_at
      from claimed where true
      on conflict (email_normalized) do nothing
      returning id
    `;
    const user = rows[0] as { id: string } | undefined;
    if (!user) return NextResponse.json({ error: "Ce lien de confirmation est invalide ou a expiré." }, { status: 400, headers: noStore });
    await createSession(user.id);
    return NextResponse.json({ ok: true }, { headers: noStore });
  } catch {
    console.error("NAKAHYA email confirmation failed.");
    return NextResponse.json({ error: "La confirmation n’a pas pu être effectuée. Réessayez plus tard." }, { status: 503, headers: noStore });
  }
}
