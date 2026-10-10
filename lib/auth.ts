import "server-only";

import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";

const scrypt = promisify(scryptCallback);
const SESSION_COOKIE = "nikahya_session";
const SESSION_DAYS = 14;

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt$${salt}$${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, encoded: string): Promise<boolean> {
  const [algorithm, salt, expectedHex] = encoded.split("$");
  if (algorithm !== "scrypt" || !salt || !expectedHex || !/^[a-f0-9]{128}$/i.test(expectedHex)) {
    return false;
  }
  const actual = (await scrypt(password, salt, 64)) as Buffer;
  const expected = Buffer.from(expectedHex, "hex");
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const tokenHash = sha256(token);
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  const sql = getDb();
  await sql`
    insert into public.auth_sessions (user_id, token_hash, expires_at)
    values (${userId}, ${tokenHash}, ${expiresAt.toISOString()})
  `;

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function getCurrentUser(): Promise<{ id: string; email: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token || token.length > 128) return null;

  const sql = getDb();
  const rows = await sql`
    select u.id, u.email
    from public.auth_sessions s
    join public.auth_users u on u.id = s.user_id
    where s.token_hash = ${sha256(token)}
      and s.expires_at > now()
      and u.disabled_at is null
    limit 1
  `;
  const user = rows[0] as { id: string; email: string } | undefined;
  return user ?? null;
}

export async function destroyCurrentSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token && token.length <= 128) {
    const sql = getDb();
    await sql`delete from public.auth_sessions where token_hash = ${sha256(token)}`;
  }
  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });
}
