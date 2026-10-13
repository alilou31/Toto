import { randomBytes, createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { consumeAuthRateLimit, getTrustedClientIp } from "@/lib/auth-rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GENERIC_MESSAGE = "Si cette adresse correspond à un compte, un lien de réinitialisation sera envoyé sous peu.";
const noStore = { "Cache-Control": "no-store" };

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400, headers: noStore });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400, headers: noStore });
  }

  const emailValue = (body as Record<string, unknown>).email;
  if (typeof emailValue !== "string" || emailValue.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue.trim())) {
    return NextResponse.json({ error: "Veuillez saisir une adresse e-mail valide." }, { status: 400, headers: noStore });
  }

  const email = emailValue.trim().toLowerCase();
  const clientIp = getTrustedClientIp(request);
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error("NIKAHYA password reset email is not configured.");
      return NextResponse.json({ error: "La récupération par e-mail est momentanément indisponible." }, { status: 503, headers: noStore });
    }

    const emailLimit = await consumeAuthRateLimit("password-reset-email", email, 3, 60 * 60);
    const ipLimit = clientIp
      ? await consumeAuthRateLimit("password-reset-ip", clientIp, 10, 60 * 60)
      : { allowed: true, retryAfterSeconds: 0 };
    if (!emailLimit.allowed || !ipLimit.allowed) {
      const retryAfter = Math.max(emailLimit.allowed ? 0 : emailLimit.retryAfterSeconds, ipLimit.allowed ? 0 : ipLimit.retryAfterSeconds);
      return NextResponse.json({ error: "Trop de demandes. Réessayez plus tard." }, { status: 429, headers: { ...noStore, "Retry-After": String(retryAfter) } });
    }

    const sql = getDb();
    const users = await sql`select id from public.auth_users where email_normalized = ${email} and disabled_at is null limit 1`;
    const user = users[0] as { id: string } | undefined;
    if (!user) return NextResponse.json({ message: GENERIC_MESSAGE }, { headers: noStore });

    const token = randomBytes(32).toString("base64url");
    const tokenHash = hashToken(token);
    await sql`delete from public.password_reset_tokens where user_id = ${user.id} and used_at is null`;
    await sql`insert into public.password_reset_tokens (user_id, token_hash, expires_at)
      values (${user.id}, ${tokenHash}, ${new Date(Date.now() + 60 * 60 * 1000).toISOString()})`;

    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://nikahya.rassoul-ali.workers.dev").replace(/\/$/, "");
    const resetUrl = `${siteUrl}/reinitialiser-mot-de-passe?token=${encodeURIComponent(token)}`;
    const from = process.env.RESEND_FROM_EMAIL || "NIKAHYA <onboarding@resend.dev>";
    const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head><body style="margin:0;background:#faf8f2;font-family:Arial,sans-serif;color:#202824"><main style="max-width:560px;margin:32px auto;padding:32px 24px;background:#fff;border-radius:16px"><p style="font-size:12px;letter-spacing:2px;color:#075b4b;font-weight:bold">NIKAHYA</p><h1 style="font-size:26px">Réinitialisez votre mot de passe</h1><p>Vous avez demandé à modifier le mot de passe de votre compte NIKAHYA.</p><p style="margin:28px 0"><a href="${resetUrl}" style="display:inline-block;padding:15px 22px;background:#075b4b;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold">Choisir un nouveau mot de passe</a></p><p>Ce lien est valable pendant 60 minutes et ne peut être utilisé qu'une seule fois.</p><p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail. Votre mot de passe ne changera pas.</p><p style="font-size:12px;color:#68716b">Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br><a href="${resetUrl}">${resetUrl}</a></p></main></body></html>`;
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [email],
        subject: "Réinitialisation de votre mot de passe NIKAHYA",
        html,
        text: `Vous avez demandé à réinitialiser votre mot de passe NIKAHYA. Ouvrez ce lien (valable 60 minutes) : ${resetUrl}\n\nSi vous n'avez pas demandé ce changement, ignorez cet e-mail.`,
      }),
    });

    if (!response.ok) {
      await sql`delete from public.password_reset_tokens where token_hash = ${tokenHash}`.catch(() => []);
      console.error("NIKAHYA password reset email delivery failed with HTTP status", response.status);
    }
    // Identical response for existing and unknown accounts prevents account enumeration.
    return NextResponse.json({ message: GENERIC_MESSAGE }, { headers: noStore });
  } catch {
    console.error("NIKAHYA password reset request failed.");
    return NextResponse.json({ error: "La demande n’a pas pu être traitée. Réessayez plus tard." }, { status: 503, headers: noStore });
  }
}
