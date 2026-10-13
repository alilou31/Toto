import { NextResponse } from "next/server";
import { createHash, randomBytes } from "node:crypto";
import { getDb } from "@/lib/db";
import { consumeAuthRateLimit, getTrustedClientIp } from "@/lib/auth-rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Requête invalide." }, { status: 400 }); }
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  const data = body as Record<string, unknown>;
  if (typeof data.website === "string" && data.website.trim()) return NextResponse.json({ ok: true }, { status: 200 });
  if (data.consent !== true) return NextResponse.json({ error: "Votre accord est nécessaire pour recevoir la newsletter." }, { status: 400 });
  if (typeof data.email !== "string" || data.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    return NextResponse.json({ error: "Veuillez saisir une adresse e-mail valide." }, { status: 400 });
  }

  const email = data.email.trim().toLowerCase();
  const source = data.source === "registration" ? "registration" : "landing_page";
  try {
    const ip = getTrustedClientIp(request);
    const emailLimit = await consumeAuthRateLimit("newsletter-email", email, 3, 60 * 60);
    const ipLimit = ip ? await consumeAuthRateLimit("newsletter-ip", ip, 10, 60 * 60) : { allowed: true, retryAfterSeconds: 0 };
    if (!emailLimit.allowed || !ipLimit.allowed) {
      return NextResponse.json({ error: "Trop de tentatives. Réessayez plus tard." }, { status: 429, headers: { "Retry-After": String(Math.max(emailLimit.retryAfterSeconds, ipLimit.retryAfterSeconds)), "Cache-Control": "no-store" } });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "La newsletter n’est pas encore configurée pour envoyer les e-mails de confirmation." }, { status: 503 });
    const sql = getDb();
    const existing = await sql`select status from public.newsletter_subscriptions where email_normalized = ${email} limit 1`;
    if (existing[0]?.status === "confirmed") return NextResponse.json({ ok: true }, { status: 200, headers: { "Cache-Control": "no-store" } });

    const token = randomBytes(32).toString("base64url");
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await sql`
      insert into public.newsletter_subscriptions
        (email, email_normalized, status, consent_at, confirmation_token_hash, confirmation_expires_at, source, updated_at)
      values (${email}, ${email}, 'pending_confirmation', now(), ${tokenHash}, ${expiresAt.toISOString()}, ${source}, now())
      on conflict (email_normalized) do update set
        email = excluded.email,
        status = 'pending_confirmation',
        consent_at = now(),
        confirmation_token_hash = excluded.confirmation_token_hash,
        confirmation_expires_at = excluded.confirmation_expires_at,
        source = excluded.source,
        updated_at = now(),
        confirmed_at = null,
        unsubscribed_at = null
    `;

    const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://nikahya.rassoul-ali.workers.dev").replace(/\/$/, "");
    const confirmationUrl = `${baseUrl}/api/newsletter/confirm?token=${encodeURIComponent(token)}`;
    const from = process.env.RESEND_FROM_EMAIL || "NAKAHYA <onboarding@resend.dev>";
    const sent = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [email],
        subject: "Confirmez votre inscription à la newsletter NAKAHYA",
        html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#202824"><h1>Un peu plus de complicité ?</h1><p>Vous avez demandé à recevoir les nouvelles de NAKAHYA.</p><p><a href="${confirmationUrl}" style="display:inline-block;background:#075b4b;color:white;padding:14px 20px;text-decoration:none;border-radius:6px">Confirmer mon inscription</a></p><p>Ce lien expire dans 24 heures. Si vous n’êtes pas à l’origine de cette demande, ignorez ce message.</p><p style="font-size:12px;color:#68716b">NAKAHYA — La rencontre qui change tout.</p></div>`,
      }),
    });
    if (!sent.ok) {
      console.error("Newsletter confirmation email failed to send.");
      return NextResponse.json({ error: "L’e-mail de confirmation n’a pas pu être envoyé. Réessayez plus tard." }, { status: 502 });
    }
    return NextResponse.json({ ok: true }, { status: 202, headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "L’inscription à la newsletter a échoué. Réessayez plus tard." }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
