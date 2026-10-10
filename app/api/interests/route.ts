import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Authentification requise." }, { status: 401, headers: { "Cache-Control": "no-store" } });
    const sql = getDb();
    const interests = await sql`
      select i.id, i.sender_id, p.public_name, p.city, p.bio, p.relationship_intention, i.status, i.created_at
      from public.interests i
      join public.profiles p on p.id = i.sender_id
      where i.recipient_id = ${user.id}
        and i.status in ('pending', 'accepted')
        and p.visibility = 'visible'
        and not exists (
          select 1 from public.blocks b
          where (b.blocker_id = ${user.id} and b.blocked_id = p.id)
             or (b.blocker_id = p.id and b.blocked_id = ${user.id})
        )
      order by i.created_at desc
      limit 100
    `;
    return NextResponse.json({ interests }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    console.error("NIKAHYA interests read failed.");
    return NextResponse.json({ error: "Impossible de charger les intérêts pour le moment." }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Requête invalide." }, { status: 400 }); }
  if (!body || typeof body !== "object" || typeof (body as Record<string, unknown>).recipientId !== "string") {
    return NextResponse.json({ error: "Profil destinataire invalide." }, { status: 400 });
  }
  const recipientId = ((body as Record<string, unknown>).recipientId as string).trim();
  if (!recipientId || recipientId.length > 128) return NextResponse.json({ error: "Profil destinataire invalide." }, { status: 400 });

  const user = await getCurrentUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
  if (recipientId === user.id) return NextResponse.json({ error: "Vous ne pouvez pas vous envoyer un intérêt." }, { status: 400 });

  try {
    const sql = getDb();
    const eligible = await sql`
      select p.id
      from public.profiles me
      join public.profiles p on p.id = ${recipientId}
      where me.id = ${user.id}
        and me.onboarding_completed = true
        and me.birth_date is not null
        and me.birth_date <= (current_date - interval '18 years')::date
        and p.visibility = 'visible'
        and p.onboarding_completed = true
        and p.birth_date is not null
        and p.birth_date <= (current_date - interval '18 years')::date
        and not exists (
          select 1 from public.blocks b
          where (b.blocker_id = me.id and b.blocked_id = p.id)
             or (b.blocker_id = p.id and b.blocked_id = me.id)
        )
      limit 1
    `;
    if (!eligible.length) return NextResponse.json({ error: "Ce profil n’est pas disponible pour un intérêt." }, { status: 404 });

    await sql`
      insert into public.interests as current_interest (sender_id, recipient_id, status)
      values (${user.id}, ${recipientId}, 'pending')
      on conflict (sender_id, recipient_id) do update
      set status = case when current_interest.status = 'accepted' then 'accepted' else 'pending' end,
          updated_at = now()
    `;

    const reverse = await sql`
      select id from public.interests
      where sender_id = ${recipientId} and recipient_id = ${user.id}
        and status in ('pending', 'accepted')
      limit 1
    `;
    if (!reverse.length) return NextResponse.json({ ok: true, matched: false }, { headers: { "Cache-Control": "no-store" } });

    await sql`update public.interests set status = 'accepted', updated_at = now()
      where (sender_id = ${user.id} and recipient_id = ${recipientId})
         or (sender_id = ${recipientId} and recipient_id = ${user.id})`;
    const [userA, userB] = [user.id, recipientId].sort();
    const matches = await sql`
      insert into public.matches (user_a, user_b)
      values (${userA}, ${userB})
      on conflict (user_a, user_b) do update set user_a = excluded.user_a
      returning id
    `;
    const matchId = matches[0]?.id;
    if (matchId) {
      await sql`insert into public.conversations (match_id)
        values (${matchId}) on conflict (match_id) do nothing`;
    }
    return NextResponse.json({ ok: true, matched: true }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    console.error("NIKAHYA interest action failed.");
    return NextResponse.json({ error: "Impossible d’enregistrer cet intérêt pour le moment." }, { status: 500 });
  }
}
