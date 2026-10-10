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
    const matches = await sql`
      select m.id as match_id, c.id as conversation_id, p.id as profile_id,
        p.public_name, p.city, p.bio, p.relationship_intention,
        c.last_message_at,
        (select msg.body from public.messages msg where msg.conversation_id = c.id order by msg.created_at desc limit 1) as last_message
      from public.matches m
      join public.conversations c on c.match_id = m.id
      join public.profiles p on p.id = case when m.user_a = ${user.id} then m.user_b else m.user_a end
      where m.user_a = ${user.id} or m.user_b = ${user.id}
      order by coalesce(c.last_message_at, c.created_at) desc
      limit 100
    `;
    return NextResponse.json({ matches }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    console.error("NIKAHYA matches read failed.");
    return NextResponse.json({ error: "Impossible de charger vos matchs pour le moment." }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
