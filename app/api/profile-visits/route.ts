import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Authentification requise." }, { status: 401, headers: { "Cache-Control": "no-store" } });

  try {
    const sql = getDb();
    const visits = await sql`
      select p.id as visitor_id, p.public_name, p.city, pv.visited_at,
        (p.last_seen_at >= now() - interval '2 minutes') as is_online
      from public.profile_visits pv
      join public.profiles p on p.id = pv.visitor_id
      where pv.profile_id = ${user.id}
        and pv.visitor_id <> ${user.id}
        and p.visibility = 'visible'
        and p.onboarding_completed = true
        and p.birth_date is not null
        and p.birth_date <= (current_date - interval '18 years')::date
        and not exists (
          select 1 from public.blocks b
          where (b.blocker_id = ${user.id} and b.blocked_id = p.id)
             or (b.blocker_id = p.id and b.blocked_id = ${user.id})
        )
      order by pv.visited_at desc
      limit 50
    `;
    return NextResponse.json({ visits }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    console.error("NIKAHYA profile visits read failed.");
    return NextResponse.json({ error: "Visites indisponibles. Vérifiez que la migration 009_profile_visits_and_presence.sql est appliquée dans Neon." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
