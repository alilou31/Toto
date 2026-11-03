import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { createVerificationEmail, createVerificationToken, hashVerificationToken } from "@/lib/email-verification";
import { isResendConfigured, sendResendEmail } from "@/lib/resend";
import { getSiteUrl } from "@/lib/site-origin";
import { getDb } from "@/lib/db";
import { createSession, hashPassword } from "@/lib/auth";
import { consumeAuthRateLimit, getTrustedClientIp } from "@/lib/auth-rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const { email, password, ageConfirmed, acceptedTerms, acceptedPrivacy } = body as Record<string, unknown>;
  if (typeof email !== "string" || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return NextResponse.json({ error: "Veuillez saisir une adresse e-mail valide." }, { status: 400 });
  }
  if (typeof password !== "string" || password.length < 12 || password.length > 256) {
    return NextResponse.json({ error: "Le mot de passe doit contenir entre 12 et 256 caractères." }, { status: 400 });
  }
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
    return NextResponse.json({ error: "Renforcez votre mot de passe : ajoutez une minuscule, une majuscule, un chiffre et un caractère spécial." }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }
  if (ageConfirmed !== true || acceptedTerms !== true || acceptedPrivacy !== true) {
    return NextResponse.json({ error: "Confirmez votre majorité, acceptez les conditions et confirmez la lecture de la politique de confidentialité pour continuer." }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();
  try {
    const emailLimit = await consumeAuthRateLimit("register-email", normalizedEmail, 5, 60 * 60);
    const clientIp = getTrustedClientIp(request);
    const ipLimit = clientIp
      ? await consumeAuthRateLimit("register-ip", clientIp, 10, 60 * 60)
      : { allowed: true, retryAfterSeconds: 0 };
    if (!emailLimit.allowed || !ipLimit.allowed) {
      const retryAfter = Math.max(emailLimit.allowed ? 0 : emailLimit.retryAfterSeconds, ipLimit.allowed ? 0 : ipLimit.retryAfterSeconds);
      return NextResponse.json(
        { error: "Trop de tentatives. Réessayez plus tard." },
        { status: 429, headers: { "Cache-Control": "no-store", "Retry-After": String(retryAfter) } },
      );
    }
    const sql = getDb();
    const verificationEnabled = process.env.EMAIL_VERIFICATION_ENABLED === "true";
    // Never create an unconfirmed account when delivery cannot be attempted.
    if (verificationEnabled && !isResendConfigured()) {
      return NextResponse.json({ error: "La confirmation par e-mail est momentanément indisponible." }, { status: 503, headers: { "Cache-Control": "no-store" } });
    }

    const id = randomUUID();
    const passwordHash = await hashPassword(password);
    if (verificationEnabled) {
      // An existing account receives the same response as a pending registration.
      const existing = await sql`select id from public.auth_users where email_normalized = ${normalizedEmail} limit 1`;
      const message = "Si cette adresse peut être utilisée, un e-mail de confirmation sera envoyé. Consultez aussi vos courriers indésirables.";
      if (existing.length) {
        return NextResponse.json({ verificationRequired: true, message }, { status: 202, headers: { "Cache-Control": "no-store" } });
      }
      const token = createVerificationToken();
      const tokenHash = hashVerificationToken(token);
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      // No member session exists before verification. An expired signup can be renewed.
      await sql`delete from public.pending_email_registrations where expires_at < now()`;
      await sql`
        insert into public.pending_email_registrations
          (email, email_normalized, password_hash, token_hash, expires_at, age_confirmed_at, terms_accepted_at, privacy_acknowledged_at)
        values (${normalizedEmail}, ${normalizedEmail}, ${passwordHash}, ${tokenHash}, ${expiresAt}, now(), now(), now())
        on conflict (email_normalized) do update set
          password_hash = excluded.password_hash,
          token_hash = excluded.token_hash,
          expires_at = excluded.expires_at,
          age_confirmed_at = excluded.age_confirmed_at,
          terms_accepted_at = excluded.terms_accepted_at,
          privacy_acknowledged_at = excluded.privacy_acknowledged_at,
          updated_at = now()
      `;
      const emailMessage = createVerificationEmail(token, getSiteUrl());
      const sent = await sendResendEmail({ to: normalizedEmail, ...emailMessage });
      if (!sent.ok) {
        // Do not leave unusable pending registrations after a failed Resend call.
        await sql`delete from public.pending_email_registrations where token_hash = ${tokenHash}`.catch(() => []);
        console.error("NAKAHYA registration confirmation delivery failed.", sent.status ?? "network");
        return NextResponse.json({ error: "L’e-mail de confirmation n’a pas pu être envoyé. Réessayez plus tard." }, { status: 503, headers: { "Cache-Control": "no-store" } });
      }
      return NextResponse.json({ verificationRequired: true, message }, { status: 202, headers: { "Cache-Control": "no-store" } });
    }
    await sql`
      insert into public.auth_users (id, email, email_normalized, password_hash, age_confirmed_at, terms_accepted_at, privacy_acknowledged_at)
      values (${id}, ${normalizedEmail}, ${normalizedEmail}, ${passwordHash}, now(), now(), now())
    `;
    await createSession(id);
    return NextResponse.json({ ok: true }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    // Do not return SQL errors or secrets to the browser.
    const code = typeof error === "object" && error !== null && "code" in error
      ? String((error as { code?: unknown }).code)
      : "";
    if (code === "23505") {
      return NextResponse.json({ error: "Impossible de créer ce compte avec ces informations." }, { status: 409 });
    }
    console.error("NAKAHYA registration failed.");
    return NextResponse.json({ error: "La création du compte a échoué. Réessayez plus tard." }, { status: 500 });
  }
}
