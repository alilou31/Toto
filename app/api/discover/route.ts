import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentification requise." },
        { status: 401, headers: { "Cache-Control": "no-store" } },
      );
    }

    const sql = getDb();
    let profiles;

    try {
      profiles = await sql`
        select p.id, p.public_name, p.city, p.bio, p.relationship_intention, p.birth_date,
          p.hobbies, p.favorite_games, p.interests, p.occupation,
          (select pp.storage_path from public.profile_photos pp where pp.user_id = p.id and pp.moderation_status = 'approved' order by pp.display_order asc limit 1) as photo_url,
          coalesce(p.last_seen_at >= now() - interval '2 minutes', false) as is_online,
          case
            when p.last_seen_at >= now() - interval '2 minutes' then 'En ligne'
            when p.last_seen_at >= now() - interval '1 hour' then 'Vu récemment'
            when p.last_seen_at >= now() - interval '24 hours' then 'Vu aujourd’hui'
            else null
          end as last_seen_label,
          (p.verification_status = 'verified') as is_verified,
          case when p.show_sensitive_identity then p.religion else null end as religion,
          case when p.show_sensitive_identity then p.ethnicity else null end as ethnicity
        from public.profiles p
        where p.visibility = 'visible'
          and p.onboarding_completed = true
          and p.birth_date is not null
          and p.birth_date <= (current_date - interval '18 years')::date
          and p.id <> ${user.id}
          and not exists (
            select 1 from public.blocks b
            where (b.blocker_id = ${user.id} and b.blocked_id = p.id)
               or (b.blocker_id = p.id and b.blocked_id = ${user.id})
          )
        order by p.updated_at desc
        limit 50
      `;
    } catch {
      // Keep discovery usable until migration 009 is applied in Neon.
      profiles = await sql`
        select p.id, p.public_name, p.city, p.bio, p.relationship_intention, p.birth_date,
          p.hobbies, p.favorite_games, p.interests, p.occupation,
          (select pp.storage_path from public.profile_photos pp where pp.user_id = p.id and pp.moderation_status = 'approved' order by pp.display_order asc limit 1) as photo_url,
          false as is_online,
          null::text as last_seen_label,
          (p.verification_status = 'verified') as is_verified,
          case when p.show_sensitive_identity then p.religion else null end as religion,
          case when p.show_sensitive_identity then p.ethnicity else null end as ethnicity
        from public.profiles p
        where p.visibility = 'visible'
          and p.onboarding_completed = true
          and p.birth_date is not null
          and p.birth_date <= (current_date - interval '18 years')::date
          and p.id <> ${user.id}
          and not exists (
            select 1 from public.blocks b
            where (b.blocker_id = ${user.id} and b.blocked_id = p.id)
               or (b.blocker_id = p.id and b.blocked_id = ${user.id})
          )
        order by p.updated_at desc
        limit 50
      `;
    }

    return NextResponse.json(
      { profiles },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    console.error("NIKAHYA discovery request failed.");
    return NextResponse.json(
      { error: "La découverte est momentanément indisponible." },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
