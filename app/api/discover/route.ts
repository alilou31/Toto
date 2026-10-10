import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentification requise." }, { status: 401, headers: { "Cache-Control": "no-store" } });
    }

    const sql = getDb();
    const profiles = await sql`
      select p.id, p.public_name, p.city, p.bio, p.relationship_intention
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
    return NextResponse.json({ profiles }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    console.error("NIKAHYA discovery request failed.");
    return NextResponse.json({ error: "La découverte est momentanément indisponible." }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
