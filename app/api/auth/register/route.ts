import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
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

  const { email, password, ageConfirmed, acceptedTerms } = body as Record<string, unknown>;
  if (typeof email !== "string" || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return NextResponse.json({ error: "Veuillez saisir une adresse e-mail valide." }, { status: 400 });
  }
  if (typeof password !== "string" || password.length < 12 || password.length > 256) {
    return NextResponse.json({ error: "Le mot de passe doit contenir entre 12 et 256 caractères." }, { status: 400 });
  }
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
    return NextResponse.json({ error: "Renforcez votre mot de passe : ajoutez une minuscule, une majuscule, un chiffre et un caractère spécial." }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }
  if (ageConfirmed !== true || acceptedTerms !== true) {
    return NextResponse.json({ error: "Confirmez votre majorité et acceptez les conditions pour continuer." }, { status: 400 });
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
    const id = randomUUID();
    const passwordHash = await hashPassword(password);
    await sql`
      insert into public.auth_users (id, email, email_normalized, password_hash)
      values (${id}, ${normalizedEmail}, ${normalizedEmail}, ${passwordHash})
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
    console.error("NIKAHYA registration failed.");
    return NextResponse.json({ error: "La création du compte a échoué. Réessayez plus tard." }, { status: 500 });
  }
}
