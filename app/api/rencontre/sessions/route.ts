import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const GAME_KEYS = new Set(["snake", "logic", "cooperative", "english"]);

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentification requise." }, { status: 401, headers: { "Cache-Control": "no-store" } });
    }

    const sql = getDb();
    const sessions = await sql`
      select s.id, s.match_id, s.game_key, s.status, s.state, s.created_at, s.updated_at,
        case when m.user_a = ${user.id} then pb.public_name else pa.public_name end as partner_name
      from public.rencontre_sessions s
      join public.matches m on m.id = s.match_id
      join public.profiles pa on pa.id = m.user_a
      join public.profiles pb on pb.id = m.user_b
      where (m.user_a = ${user.id} or m.user_b = ${user.id})
        and not exists (
          select 1 from public.blocks b
          where (b.blocker_id = m.user_a and b.blocked_id = m.user_b)
             or (b.blocker_id = m.user_b and b.blocked_id = m.user_a)
        )
      order by s.created_at desc
      limit 50
    `;

    return NextResponse.json({ sessions }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    console.error("NIKAHYA rencontre sessions read failed.");
    return NextResponse.json({ error: "Impossible de charger les activités pour le moment." }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}

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

  const data = body as Record<string, unknown>;
  const matchId = typeof data.matchId === "string" ? data.matchId.trim() : "";
  const gameKey = typeof data.gameKey === "string" ? data.gameKey : "";

  if (!UUID.test(matchId)) {
    return NextResponse.json({ error: "Sélectionnez un match valide." }, { status: 400 });
  }
  if (!GAME_KEYS.has(gameKey)) {
    return NextResponse.json({ error: "Choisissez une activité valide." }, { status: 400 });
  }

  const user = await getCurrentUser().catch(() => null);
  if (!user) {
    return NextResponse.json({ error: "Authentification requise." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }

  try {
    const sql = getDb();
    const eligible = await sql`
      select m.id
      from public.matches m
      where m.id = ${matchId}::uuid
        and (m.user_a = ${user.id} or m.user_b = ${user.id})
        and not exists (
          select 1 from public.blocks b
          where (b.blocker_id = m.user_a and b.blocked_id = m.user_b)
             or (b.blocker_id = m.user_b and b.blocked_id = m.user_a)
        )
      limit 1
    `;

    if (!eligible.length) {
      return NextResponse.json({ error: "Ce match n’est pas disponible pour une activité." }, { status: 404 });
    }

    const created = await sql`
      insert into public.rencontre_sessions (match_id, created_by, game_key, status)
      values (${matchId}::uuid, ${user.id}, ${gameKey}, 'invited')
      returning id, match_id, game_key, status, created_at
    `;

    return NextResponse.json({ ok: true, session: created[0] }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch {
    console.error("NIKAHYA rencontre session create failed.");
    return NextResponse.json({ error: "Impossible de créer cette invitation. Vérifiez que la migration 003 est appliquée." }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
