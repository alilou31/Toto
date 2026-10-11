import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const GAME_IDS = new Set(["mots-croises", "enigme", "calcul", "personnalite", "duel", "tournoi"]);

function inviteCode() {
  return randomBytes(5).toString("hex").slice(0, 8).toUpperCase();
}

export async function GET() {
  const user = await getCurrentUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Authentification requise." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  try {
    const sql = getDb();
    const sessions = await sql`
      select s.id, s.invite_code, s.game_id, s.status, s.current_question, s.created_at, s.updated_at, s.completed_at,
        (s.host_user_id = ${user.id}) as is_host,
        case when s.host_user_id = ${user.id} then s.guest_user_id is not null else s.host_user_id is not null end as has_opponent
      from public.game_sessions s
      where s.host_user_id = ${user.id} or s.guest_user_id = ${user.id}
      order by s.created_at desc limit 30
    `;
    return NextResponse.json({ sessions }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    console.error("NIKAHYA game sessions list failed.");
    return NextResponse.json({ error: "Les défis synchronisés ne sont pas prêts. Appliquez la migration 005_game_sessions.sql dans Neon." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Connectez-vous pour créer un défi." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Requête invalide." }, { status: 400 }); }
  const gameId = body && typeof body === "object" ? (body as Record<string, unknown>).gameId : null;
  if (typeof gameId !== "string" || !GAME_IDS.has(gameId)) return NextResponse.json({ error: "Choisissez un jeu valide." }, { status: 400 });
  try {
    const sql = getDb();
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const rows = await sql`
          insert into public.game_sessions (invite_code, game_id, host_user_id)
          values (${inviteCode()}, ${gameId}, ${user.id})
          returning id, invite_code, game_id, status, current_question, created_at
        `;
        return NextResponse.json({ session: { ...rows[0], is_host: true, has_opponent: false } }, { status: 201, headers: { "Cache-Control": "no-store" } });
      } catch (error) {
        if (attempt === 2) throw error;
      }
    }
    return NextResponse.json({ error: "Impossible de créer ce défi." }, { status: 503 });
  } catch {
    console.error("NIKAHYA game session create failed.");
    return NextResponse.json({ error: "Défi non créé. Vérifiez que la migration 005_game_sessions.sql est appliquée." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
