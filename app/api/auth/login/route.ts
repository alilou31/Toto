import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { createSession, verifyPassword } from "@/lib/auth";

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
  const { email, password } = body as Record<string, unknown>;
  if (typeof email !== "string" || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || typeof password !== "string" || password.length < 1 || password.length > 256) {
    return NextResponse.json({ error: "Adresse e-mail ou mot de passe incorrect." }, { status: 401 });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const sql = getDb();
    const rows = await sql`
      select id, password_hash
      from public.auth_users
      where email_normalized = ${normalizedEmail} and disabled_at is null
      limit 1
    `;
    const user = rows[0] as { id: string; password_hash: string } | undefined;
    if (!user || !(await verifyPassword(password, user.password_hash))) {
      return NextResponse.json({ error: "Adresse e-mail ou mot de passe incorrect." }, { status: 401 });
    }
    await createSession(user.id);
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    console.error("NIKAHYA login failed.");
    return NextResponse.json({ error: "Connexion indisponible. Réessayez plus tard." }, { status: 500 });
  }
}
