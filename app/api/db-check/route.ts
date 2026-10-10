import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { ok: false, status: "not_configured", message: "DATABASE_URL is missing." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const sql = getDb();
    const rows = await sql`select now() as database_time`;

    return NextResponse.json(
      { ok: true, status: "connected", databaseTime: rows[0]?.database_time ?? null },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    // Keep connection strings and database details out of the public response.
    console.error("Neon database health check failed:", error);
    return NextResponse.json(
      { ok: false, status: "connection_failed", message: "Database connection failed. Check server logs and DATABASE_URL." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
