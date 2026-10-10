import { NextResponse } from "next/server";
import { destroyCurrentSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await destroyCurrentSession();
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Déconnexion indisponible. Réessayez." }, { status: 500 });
  }
}
