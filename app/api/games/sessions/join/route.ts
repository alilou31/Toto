import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getCurrentUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Connectez-vous pour rejoindre un défi." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Requête invalide." }, { status: 400 }); }
  const code = body && typeof body === "object" ? (body as Record<string, unknown>).code : null;
  if (typeof code !== "string" || !/^[A-Za-z0-9]{8}$/.test(code.trim())) return NextResponse.json({ error: "Saisissez un code d'invitation de 8 caractères." }, { status: 400 });
  try {
    const sql = getDb();
    const rows = await sql`
      update public.game_sessions
      set guest_user_id = ${user.id}, status = 'active', updated_at = now()
      where invite_code = ${code.trim().toUpperCase()} and status = 'waiting'
        and guest_user_id is null and host_user_id <> ${user.id}
      returning id, invite_code, game_id, status, current_question, created_at, updated_at
    `;
    if (rows.length) return NextResponse.json({ session: { ...rows[0], is_host: false, has_opponent: true } }, { headers: { "Cache-Control": "no-store" } });
    const existing = await sql`select id, host_user_id, guest_user_id, status from public.game_sessions where invite_code = ${code.trim().toUpperCase()} limit 1`;
    if (!existing.length) return NextResponse.json({ error: "Ce code d'invitation n'existe pas." }, { status: 404 });
    if (existing[0].host_user_id === user.id) return NextResponse.json({ error: "Vous ne pouvez pas rejoindre votre propre défi avec le même compte." }, { status: 409 });
    if (existing[0].guest_user_id === user.id) return NextResponse.json({ error: "Vous avez déjà rejoint ce défi." }, { status: 409 });
    return NextResponse.json({ error: "Ce défi a déjà commencé ou est terminé." }, { status: 409 });
  } catch {
    console.error("NIKAHYA game session join failed.");
    return NextResponse.json({ error: "Impossible de rejoindre ce défi. Vérifiez que la migration 005_game_sessions.sql est appliquée." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
