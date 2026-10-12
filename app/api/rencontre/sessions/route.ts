import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const GAME_KEYS = new Set(["logic", "english", "snake", "cooperative"]);
const SESSION_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const noStore = { "Cache-Control": "no-store" };

export async function GET() {
  const user = await getCurrentUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Connectez-vous pour utiliser Alchimie." }, { status: 401, headers: noStore });
  try {
    const sql = getDb();
    const sessions = await sql`
      select s.id, s.match_id, s.game_key, s.status, s.state, s.created_at,
        s.created_by, (s.created_by = ${user.id}) as is_creator,
        case when s.created_by = ${user.id} then invited.public_name else creator.public_name end as partner_name
      from public.rencontre_sessions s
      join public.profiles creator on creator.id = s.created_by
      join public.profiles invited on invited.id = s.invited_user_id
      where s.created_by = ${user.id} or s.invited_user_id = ${user.id}
      order by s.created_at desc limit 50
    `;
    return NextResponse.json({ sessions }, { headers: noStore });
  } catch {
    console.error("NIKAHYA rencontre sessions list failed.");
    return NextResponse.json({ error: "Le service Alchimie nécessite la migration 007_rencontre_sessions.sql dans Neon." }, { status: 503, headers: noStore });
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Connectez-vous pour proposer une activité." }, { status: 401, headers: noStore });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Requête invalide." }, { status: 400 }); }
  const data = body && typeof body === "object" ? body as Record<string, unknown> : {};
  const matchId = data.matchId;
  const gameKey = data.gameKey;
  if (typeof matchId !== "string" || !SESSION_ID.test(matchId)) return NextResponse.json({ error: "Choisissez un match valide." }, { status: 400 });
  if (typeof gameKey !== "string" || !GAME_KEYS.has(gameKey)) return NextResponse.json({ error: "Choisissez une activité valide." }, { status: 400 });
  try {
    const sql = getDb();
    const matches = await sql`
      select id, user_a, user_b from public.matches
      where id = ${matchId} and (${user.id} = user_a or ${user.id} = user_b)
        and exists (
          select 1 from public.conversations c where c.match_id = public.matches.id
        )
        and not exists (
          select 1 from public.blocks b
          where (b.blocker_id = ${user.id} and b.blocked_id = case when user_a = ${user.id} then user_b else user_a end)
             or (b.blocker_id = case when user_a = ${user.id} then user_b else user_a end and b.blocked_id = ${user.id})
        )
      limit 1
    `;
    if (!matches.length) return NextResponse.json({ error: "Activité impossible : ce membre n’est pas dans vos matchs disponibles." }, { status: 403, headers: noStore });
    const partnerId = matches[0].user_a === user.id ? matches[0].user_b : matches[0].user_a;
    const rows = await sql`
      insert into public.rencontre_sessions (match_id, created_by, invited_user_id, game_key)
      values (${matchId}, ${user.id}, ${partnerId}, ${gameKey})
      returning id, match_id, game_key, status, state, created_at, created_by
    `;
    const partner = await sql`select public_name from public.profiles where id = ${partnerId} limit 1`;
    return NextResponse.json({ session: { ...rows[0], partner_name: partner[0]?.public_name ?? "Votre match", is_creator: true } }, { status: 201, headers: noStore });
  } catch {
    console.error("NIKAHYA rencontre session create failed.");
    return NextResponse.json({ error: "Impossible de créer l’activité. Vérifiez la migration 007_rencontre_sessions.sql dans Neon." }, { status: 503, headers: noStore });
  }
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Connectez-vous pour mettre à jour l’activité." }, { status: 401, headers: noStore });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Requête invalide." }, { status: 400 }); }
  const data = body && typeof body === "object" ? body as Record<string, unknown> : {};
  const { sessionId, action } = data;
  if (typeof sessionId !== "string" || !SESSION_ID.test(sessionId)) return NextResponse.json({ error: "Activité introuvable." }, { status: 404 });
  if (!["accept", "complete", "cancel"].includes(String(action)) && action !== undefined) return NextResponse.json({ error: "Action invalide." }, { status: 400 });
  try {
    const sql = getDb();
    const found = await sql`select * from public.rencontre_sessions where id = ${sessionId} and (${user.id} = created_by or ${user.id} = invited_user_id) limit 1`;
    if (!found.length) return NextResponse.json({ error: "Activité introuvable ou accès non autorisé." }, { status: 404, headers: noStore });
    const session = found[0];
    if (action === "accept") {
      if (session.invited_user_id !== user.id || session.status !== "invited") return NextResponse.json({ error: "Seul le destinataire peut accepter une invitation en attente." }, { status: 409, headers: noStore });
      const rows = await sql`update public.rencontre_sessions set status = 'active', updated_at = now() where id = ${sessionId} and status = 'invited' returning id`;
      if (!rows.length) return NextResponse.json({ error: "Cette invitation a déjà été traitée." }, { status: 409, headers: noStore });
    } else if (action === "complete") {
      if (session.status !== "active") return NextResponse.json({ error: "Seule une activité en cours peut être terminée." }, { status: 409, headers: noStore });
      await sql`update public.rencontre_sessions set status = 'completed', completed_at = now(), updated_at = now() where id = ${sessionId}`;
    } else if (action === "cancel") {
      if (!["invited", "active"].includes(session.status)) return NextResponse.json({ error: "Cette activité ne peut plus être annulée." }, { status: 409, headers: noStore });
      await sql`update public.rencontre_sessions set status = 'cancelled', updated_at = now() where id = ${sessionId}`;
    } else {
      if (session.status !== "active") return NextResponse.json({ error: "L’activité doit être acceptée avant de jouer." }, { status: 409, headers: noStore });
      const progress = data.progress;
      if (!progress || typeof progress !== "object" || Array.isArray(progress)) return NextResponse.json({ error: "Progression invalide." }, { status: 400 });
      const safeProgress = Object.fromEntries(Object.entries(progress as Record<string, unknown>).filter(([key, value]) => ["round", "score", "moves", "completedChallenges", "lastPrompt", "answers"].includes(key) && ["string", "number", "boolean"].includes(typeof value) || key === "answers" && Array.isArray(value)).slice(0, 12));
      await sql`update public.rencontre_sessions set state = state || ${JSON.stringify(safeProgress)}::jsonb, updated_at = now() where id = ${sessionId}`;
    }
    return NextResponse.json({ ok: true }, { headers: noStore });
  } catch {
    console.error("NIKAHYA rencontre session update failed.");
    return NextResponse.json({ error: "Mise à jour impossible. Vérifiez la migration 007_rencontre_sessions.sql dans Neon." }, { status: 503, headers: noStore });
  }
}
