import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const user = await getCurrentUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
  const scope = new URL(request.url).searchParams.get("scope") ?? "city";
  if (!["city", "country", "weekend", "travel"].includes(scope)) return NextResponse.json({ error: "Classement invalide." }, { status: 400 });
  try {
    const sql = getDb();
    const mine = await sql`select city, country from public.member_availability where user_id = ${user.id} limit 1`;
    const myCity = String(mine[0]?.city ?? "");
    const myCountry = String(mine[0]?.country ?? "");
    type RankingRow = { id: string; public_name: string; location: string | null; score: number; games: number };
    const normalizeRows = (result: Array<Record<string, unknown>>): RankingRow[] => result.map((row) => ({
      id: String(row.id),
      public_name: String(row.public_name ?? "Membre"),
      location: row.location == null ? null : String(row.location),
      score: Number(row.score ?? 0),
      games: Number(row.games ?? 0),
    }));
    let rows: RankingRow[] = [];
    if (scope === "city" && myCity) {
      rows = normalizeRows(await sql`select p.id, p.public_name, a.city as location, coalesce(sum(gr.score), 0)::int as score, count(gr.id)::int as games
        from public.profiles p join public.member_availability a on a.user_id = p.id and lower(a.city) = lower(${myCity})
        left join public.game_results gr on gr.user_id = p.id
        where a.is_available = true and p.visibility = 'visible'
        group by p.id, p.public_name, a.city order by score desc, games desc, p.public_name asc limit 50`);
    } else if (scope === "country" && myCountry) {
      rows = normalizeRows(await sql`select p.id, p.public_name, a.country as location, coalesce(sum(gr.score), 0)::int as score, count(gr.id)::int as games
        from public.profiles p join public.member_availability a on a.user_id = p.id and lower(a.country) = lower(${myCountry})
        left join public.game_results gr on gr.user_id = p.id
        where a.is_available = true and p.visibility = 'visible'
        group by p.id, p.public_name, a.country order by score desc, games desc, p.public_name asc limit 50`);
    } else if (scope === "weekend" || scope === "travel") {
      const kind = scope === "weekend" ? "weekend" : "travel";
      rows = normalizeRows(await sql`select p.id, p.public_name, coalesce(a.city, a.country, 'À préciser') as location, coalesce(sum(gr.score), 0)::int as score, count(gr.id)::int as games
        from public.profiles p join public.member_availability a on a.user_id = p.id and a.available_for = ${kind}
        left join public.game_results gr on gr.user_id = p.id
        where a.is_available = true and p.visibility = 'visible'
        group by p.id, p.public_name, a.city, a.country order by score desc, games desc, p.public_name asc limit 50`);
    } else rows = [];
    return NextResponse.json({ scope, location: scope === "city" ? myCity : scope === "country" ? myCountry : null, rankings: rows }, { headers: { "Cache-Control": "no-store" } });
  } catch { return NextResponse.json({ error: "Classement indisponible. Vérifiez les migrations 004_games.sql et 014_activity_availability.sql." }, { status: 503 }); }
}
