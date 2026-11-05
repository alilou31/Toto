import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
  const sql = getDb();
  const rows = await sql`select * from public.profiles where id = ${user.id} limit 1`;
  const own = rows[0];
  if (own?.gender !== "man" && own?.gender !== "woman") return NextResponse.json({ error: "Choisissez Homme ou Femme." }, { status: 409 });
  return NextResponse.json({ profiles: [] });
}
