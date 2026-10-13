import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { consumeAuthRateLimit, getTrustedClientIp } from "@/lib/auth-rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

  const { token, password } = body as Record<string, unknown>;
  if (typeof token !== "string" || token.length < 32 || token.length > 128 || !/^[A-Za-z0-9_-]+$/.test(token)) {
    return NextResponse.json({ error: "Ce lien est invalide ou a expiré. Demandez un nouveau lien." }, { status: 400, headers: noStore });
  }
  if (typeof password !== "string" || password.length < 12 || password.length > 256) {
    return NextResponse.json({ error: "Le mot de passe doit contenir entre 12 et 256 caractères." }, { status: 400, headers: noStore });
  }
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
    return NextResponse.json({ error: "Renforcez votre mot de passe : ajoutez une minuscule, une majuscule, un chiffre et un caractère spécial." }, { status: 400, headers: noStore });
  }

  try {
    const clientIp = getTrustedClientIp(request);
    if (clientIp) {
      const limit = await consumeAuthRateLimit("password-reset-confirm-ip", clientIp, 10, 60 * 60);
      if (!limit.allowed) {
        return NextResponse.json(
          { error: "Trop de tentatives. Réessayez plus tard." },
          { status: 429, headers: { ...noStore, "Retry-After": String(limit.retryAfterSeconds) } },
        );
      }
    }

    const passwordHash = await hashPassword(password);
    const tokenHash = hashToken(token);
    const sql = getDb();

    // Claim the token, update the password and revoke all sessions in one SQL statement.
    // A concurrent request cannot successfully claim the same unused token twice.
    const rows = await sql`
      with claimed_token as (
        update public.password_reset_tokens
        set used_at = now()
        where token_hash = ${tokenHash}
          and used_at is null
          and expires_at > now()
        returning user_id
      ),
      changed_user as (
        update public.auth_users as u
        set password_hash = ${passwordHash}
        from claimed_token as t
        where u.id = t.user_id
          and u.disabled_at is null
        returning u.id
      ),
      revoked_sessions as (
        delete from public.auth_sessions as s
        using changed_user as u
        where s.user_id = u.id
        returning s.user_id
      )
      select id from changed_user limit 1
    `;

    if (!rows[0]) {
      return NextResponse.json(
        { error: "Ce lien est invalide ou a expiré. Demandez un nouveau lien." },
        { status: 400, headers: noStore },
      );
    }

    return NextResponse.json(
      { message: "Votre mot de passe a été modifié. Vous pouvez vous connecter." },
      { headers: noStore },
    );
  } catch {
    console.error("NIKAHYA password reset confirmation failed.");
    return NextResponse.json({ error: "La modification n’a pas pu être effectuée. Réessayez plus tard." }, { status: 503, headers: noStore });
  }
}
