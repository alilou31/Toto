import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const GAME_KEYS = new Set(["snake", "logic", "cooperative", "english"]);
const NO_STORE = { "Cache-Control": "no-store" };

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Authentification requise." }, { status: 401, headers: NO_STORE });

    const sql = getDb();
    const sessions = await sql`
      select s.id, s.match_id, s.game_key, s.status, s.state, s.created_at, s.updated_at,
        s.created_by, case when m.user_a = ${user.id} then pb.public_name else pa.public_name end as partner_name,
        (s.created_by = ${user.id}) as is_creator
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
    return NextResponse.json({ sessions }, { headers: NO_STORE });
  } catch {
    console.error("NIKAHYA rencontre sessions read failed.");
    return NextResponse.json({ error: "Impossible de charger les activités pour le moment." }, { status: 500, headers: NO_STORE });
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Requête invalide." }, { status: 400 }); }

  if (!body || typeof body !== "object") return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  const data = body as Record<string, unknown>;
  const matchId = typeof data.matchId === "string" ? data.matchId.trim() : "";
  const gameKey = typeof data.gameKey === "string" ? data.gameKey : "";

  if (!UUID.test(matchId)) return NextResponse.json({ error: "Sélectionnez un match valide." }, { status: 400 });
  if (!GAME_KEYS.has(gameKey)) return NextResponse.json({ error: "Choisissez une activité valide." }, { status: 400 });

  const user = await getCurrentUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Authentification requise." }, { status: 401, headers: NO_STORE });

  try {
    const sql = getDb();
    const eligible = await sql`
      select m.id from public.matches m
      where m.id = ${matchId}::uuid
        and (m.user_a = ${user.id} or m.user_b = ${user.id})
        and not exists (
          select 1 from public.blocks b
          where (b.blocker_id = m.user_a and b.blocked_id = m.user_b)
             or (b.blocker_id = m.user_b and b.blocked_id = m.user_a)
        )
      limit 1
    `;
    if (!eligible.length) return NextResponse.json({ error: "Ce match n’est pas disponible pour une activité." }, { status: 404 });

    const created = await sql`
      insert into public.rencontre_sessions (match_id, created_by, game_key, status)
      values (${matchId}::uuid, ${user.id}, ${gameKey}, 'invited')
      returning id, match_id, game_key, status, created_at
    `;
    return NextResponse.json({ ok: true, session: created[0] }, { status: 201, headers: NO_STORE });
  } catch {
    console.error("NIKAHYA rencontre session create failed.");
    return NextResponse.json({ error: "Impossible de créer cette invitation. Vérifiez que la migration 003 est appliquée." }, { status: 500, headers: NO_STORE });
  }
}

export async function PATCH(request: Request) {
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Requête invalide." }, { status: 400 }); }
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Requête invalide." }, { status: 400 });

  const data = body as Record<string, unknown>;
  const sessionId = typeof data.sessionId === "string" ? data.sessionId.trim() : "";
  const action = typeof data.action === "string" ? data.action : "";
  if (!UUID.test(sessionId)) return NextResponse.json({ error: "Sélectionnez une activité valide." }, { status: 400 });
  if (!["accept", "complete", "cancel", "progress"].includes(action)) {
    return NextResponse.json({ error: "Action non autorisée." }, { status: 400 });
  }

  const user = await getCurrentUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Authentification requise." }, { status: 401, headers: NO_STORE });

  try {
    const sql = getDb();
    const rows = await sql`
      select s.id, s.created_by, s.status, s.state, s.game_key, m.user_a, m.user_b
      from public.rencontre_sessions s
      join public.matches m on m.id = s.match_id
      where s.id = ${sessionId}::uuid
        and (${user.id} = m.user_a or ${user.id} = m.user_b)
        and not exists (
          select 1 from public.blocks b
          where (b.blocker_id = m.user_a and b.blocked_id = m.user_b)
             or (b.blocker_id = m.user_b and b.blocked_id = m.user_a)
        )
      limit 1
    `;
    const session = rows[0];
    if (!session) return NextResponse.json({ error: "Activité introuvable ou indisponible." }, { status: 404 });

    let updated;
    if (action === "accept") {
      if (session.status !== "invited" || session.created_by === user.id) {
        return NextResponse.json({ error: "Seul l’autre membre du match peut accepter une invitation en attente." }, { status: 409 });
      }
      updated = await sql`
        update public.rencontre_sessions set status = 'active', updated_at = now()
        where id = ${sessionId}::uuid and status = 'invited'
        returning id, status, state, updated_at
      `;
    } else if (action === "complete") {
      if (session.status !== "active") return NextResponse.json({ error: "Seule une activité en cours peut être terminée." }, { status: 409 });
      updated = await sql`
        update public.rencontre_sessions set status = 'completed', completed_at = now(), updated_at = now()
        where id = ${sessionId}::uuid and status = 'active'
        returning id, status, state, updated_at
      `;
    } else if (action === "cancel") {
      if (session.status === "completed" || session.status === "cancelled") {
        return NextResponse.json({ error: "Cette activité est déjà terminée." }, { status: 409 });
      }
      updated = await sql`
        update public.rencontre_sessions set status = 'cancelled', updated_at = now()
        where id = ${sessionId}::uuid and status in ('invited', 'active')
        returning id, status, state, updated_at
      `;
    } else {
      const progress = data.progress;
      if (!progress || typeof progress !== "object" || Array.isArray(progress) || JSON.stringify(progress).length > 2000) {
        return NextResponse.json({ error: "Progression invalide ou trop volumineuse." }, { status: 400 });
      }
      if (session.status !== "active") return NextResponse.json({ error: "Acceptez l’activité avant de modifier sa progression." }, { status: 409 });
      const value = progress as Record<string, unknown>;
      const allowedKeys = new Set(["round", "score", "answers", "moves", "completedChallenges", "lastPrompt"]);
      if (Object.keys(value).some((key) => !allowedKeys.has(key))) {
        return NextResponse.json({ error: "La progression contient des champs non autorisés." }, { status: 400 });
      }

      // Restrict each game to its own state shape so a client cannot accidentally
      // mutate another game's counters or attach unrelated state.
      const gameKeys: Record<string, Set<string>> = {
        snake: new Set(["score", "moves"]),
        logic: new Set(["round", "score", "answers", "lastPrompt"]),
        english: new Set(["round", "score", "answers", "lastPrompt"]),
        cooperative: new Set(["round", "completedChallenges", "lastPrompt"]),
      };
      if (Object.keys(value).some((key) => !gameKeys[session.game_key]?.has(key))) {
        return NextResponse.json({ error: "Ces champs ne sont pas valides pour cette activité." }, { status: 400 });
      }

      const currentState = session.state && typeof session.state === "object" ? session.state as Record<string, unknown> : {};
      const monotonicFields = ["round", "score", "moves", "completedChallenges"] as const;
      for (const key of monotonicFields) {
        if (typeof value[key] === "number" && typeof currentState[key] === "number" && value[key] < (currentState[key] as number)) {
          return NextResponse.json({ error: "La progression ne peut pas revenir en arrière." }, { status: 409 });
        }
      }
      if (Array.isArray(value.answers) && Array.isArray(currentState.answers) && value.answers.length < currentState.answers.length) {
        return NextResponse.json({ error: "Les réponses déjà enregistrées ne peuvent pas être supprimées." }, { status: 409 });
      }

      if (Object.hasOwn(value, "round") && (!Number.isInteger(value.round) || Number(value.round) < 0 || Number(value.round) > 100)) {
        return NextResponse.json({ error: "Numéro de manche invalide." }, { status: 400 });
      }
      if (Object.hasOwn(value, "score") && (!Number.isInteger(value.score) || Number(value.score) < 0 || Number(value.score) > 100000)) {
        return NextResponse.json({ error: "Score invalide." }, { status: 400 });
      }
      if (Object.hasOwn(value, "answers") && (!Array.isArray(value.answers) || value.answers.length > 30 || value.answers.some((item) => typeof item !== "string" || item.length > 120))) {
        return NextResponse.json({ error: "Réponses invalides." }, { status: 400 });
      }
      if (Object.hasOwn(value, "moves") && (!Number.isInteger(value.moves) || Number(value.moves) < 0 || Number(value.moves) > 10000)) {
        return NextResponse.json({ error: "Nombre de coups invalide." }, { status: 400 });
      }
      if (Object.hasOwn(value, "completedChallenges") && (!Number.isInteger(value.completedChallenges) || Number(value.completedChallenges) < 0 || Number(value.completedChallenges) > 100)) {
        return NextResponse.json({ error: "Nombre de défis invalide." }, { status: 400 });
      }
      if (Object.hasOwn(value, "lastPrompt") && (typeof value.lastPrompt !== "string" || value.lastPrompt.length > 180)) {
        return NextResponse.json({ error: "Texte du défi invalide." }, { status: 400 });
      }
      updated = await sql`
        update public.rencontre_sessions
        set state = state || ${JSON.stringify(value)}::jsonb, updated_at = now()
        where id = ${sessionId}::uuid
          and status = 'active'
          and state = ${JSON.stringify(session.state)}::jsonb
        returning id, status, state, updated_at
      `;
    }

    if (!updated?.length) return NextResponse.json({ error: "L’activité a changé entre-temps. Actualisez la page." }, { status: 409 });
    return NextResponse.json({ ok: true, session: updated[0] }, { headers: NO_STORE });
  } catch {
    console.error("NIKAHYA rencontre session update failed.");
    return NextResponse.json({ error: "Impossible de mettre à jour cette activité pour le moment." }, { status: 500, headers: NO_STORE });
  }
}
