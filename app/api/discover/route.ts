import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
  const sql = getDb();
  return NextResponse.json({ error: "Choisissez Homme ou Femme dans votre profil.", code: "GENDER_REQUIRED" }, { status: 409 });
}
