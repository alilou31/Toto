import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ profileId: string }> }) {
  const user = await getCurrentUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Authentification requise." }, { status: 401, headers: { "Cache-Control": "no-store" } });

  const { profileId } = await context.params;
  if (!profileId || profileId.length > 128) return NextResponse.json({ error: "Profil introuvable." }, { status: 404, headers: { "Cache-Control": "no-store" } });

  try {
    const sql = getDb();
    if (profileId === user.id) {
      const own = await sql`select id, public_name, city, bio, relationship_intention, visibility, hobbies, favorite_games, interests, occupation, religion, ethnicity, show_sensitive_identity
        from public.profiles where id = ${user.id} and onboarding_completed = true limit 1`;
      if (!own.length) return NextResponse.json({ error: "Profil introuvable." }, { status: 404, headers: { "Cache-Control": "no-store" } });
      return NextResponse.json({ profile: own[0] }, { headers: { "Cache-Control": "no-store" } });
    }
    let rows;
    try {
      rows = await sql`
        select p.id, p.public_name, p.city, p.bio, p.relationship_intention, p.visibility, p.hobbies, p.favorite_games, p.interests, p.occupation,
          coalesce(p.last_seen_at >= now() - interval '2 minutes', false) as is_online,
          case when p.show_sensitive_identity then p.religion else null end as religion,
          case when p.show_sensitive_identity then p.ethnicity else null end as ethnicity
        from public.profiles p
        where p.id = ${profileId}
          and p.visibility = 'visible'
          and p.onboarding_completed = true
          and p.birth_date is not null
          and p.birth_date <= (current_date - interval '18 years')::date
          and not exists (
            select 1 from public.blocks b
            where (b.blocker_id = ${user.id} and b.blocked_id = p.id)
               or (b.blocker_id = p.id and b.blocked_id = ${user.id})
          )
        limit 1
      `;
  
    } catch {
      // Preserve profile access until migration 009 is applied in Neon.
      rows = await sql`
        select p.id, p.public_name, p.city, p.bio, p.relationship_intention, p.visibility, p.hobbies, p.favorite_games, p.interests, p.occupation,
          false as is_online,
          case when p.show_sensitive_identity then p.religion else null end as religion,
          case when p.show_sensitive_identity then p.ethnicity else null end as ethnicity
        from public.profiles p
        where p.id = ${profileId}
          and p.visibility = 'visible'
          and p.onboarding_completed = true
          and p.birth_date is not null
          and p.birth_date <= (current_date - interval '18 years')::date
          and not exists (
            select 1 from public.blocks b
            where (b.blocker_id = ${user.id} and b.blocked_id = p.id)
               or (b.blocker_id = p.id and b.blocked_id = ${user.id})
          )
        limit 1
      `;
  
    }
    if (!rows.length) return NextResponse.json({ error: "Ce profil n’est pas disponible." }, { status: 404, headers: { "Cache-Control": "no-store" } });
    // Record a real visit, but never count a member viewing their own profile.
    // A visit-tracking failure must not make an otherwise valid profile unavailable.
    try {
      await sql`insert into public.profile_visits (visitor_id, profile_id, visited_at)
        values (${user.id}, ${profileId}, now())
        on conflict (visitor_id, profile_id) do update set visited_at = excluded.visited_at`;
    } catch {
      console.error("NIKAHYA profile visit tracking failed.");
    }
    const playedGames = await sql`
      select game_id, count(*)::int as games_played
      from public.game_results
      where user_id = ${profileId}
      group by game_id
      order by max(completed_at) desc
      limit 6
    `;
    return NextResponse.json({
      profile: {
        ...rows[0],
        played_games: playedGames.map((game) => ({
          game_id: game.game_id,
          games_played: game.games_played,
        })),
      },
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    console.error("NIKAHYA public profile read failed.");
    return NextResponse.json({ error: "Fiche profil indisponible." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
