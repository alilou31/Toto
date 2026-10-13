import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const user = await getCurrentUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Authentification requise." }, { status: 401, headers: { "Cache-Control": "no-store" } });

  try {
    const sql = getDb();
    const rows = await sql`update public.profiles set last_seen_at = now() where id = ${user.id} returning id`;
    return NextResponse.json({ ok: true, active: rows.length > 0 }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    console.error("NIKAHYA presence heartbeat failed.");
    return NextResponse.json({ error: "Présence temporairement indisponible." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
