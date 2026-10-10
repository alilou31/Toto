import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAdultDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + "T00:00:00.000Z");
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) return false;
  const today = new Date();
  let age = today.getUTCFullYear() - date.getUTCFullYear();
  if (today.getUTCMonth() < date.getUTCMonth() || (today.getUTCMonth() === date.getUTCMonth() && today.getUTCDate() < date.getUTCDate())) age--;
  return age >= 18;
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Authentification requise." }, { status: 401, headers: { "Cache-Control": "no-store" } });
    const sql = getDb();
    const rows = await sql`select id, public_name, city, bio, relationship_intention, birth_date, visibility, onboarding_completed from public.profiles where id = ${user.id} limit 1`;
    return NextResponse.json({ profile: rows[0] ?? null }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    console.error("NIKAHYA profile read failed.");
    return NextResponse.json({ error: "Lecture du profil indisponible." }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}

export async function PUT(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Requête invalide." }, { status: 400 }); }
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  const user = await getCurrentUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Authentification requise." }, { status: 401 });

  const data = body as Record<string, unknown>;
  const name = typeof data.publicName === "string" ? data.publicName.trim() : "";
  const city = typeof data.city === "string" ? data.city.trim() : "";
  const bio = typeof data.bio === "string" ? data.bio.trim() : "";
  const intention = typeof data.relationshipIntention === "string" ? data.relationshipIntention : "";
  const visibility = typeof data.visibility === "string" ? data.visibility : "hidden";
  if (name.length < 2 || name.length > 40) return NextResponse.json({ error: "Le nom public doit contenir entre 2 et 40 caractères." }, { status: 400 });
  if (city.length > 100 || bio.length > 1000) return NextResponse.json({ error: "La ville ou la présentation dépasse la longueur autorisée." }, { status: 400 });
  if (!isAdultDate(data.birthDate)) return NextResponse.json({ error: "Saisissez une date de naissance valide confirmant que vous avez au moins 18 ans." }, { status: 400 });
  if (!["serious", "marriage", "friendship", "unspecified"].includes(intention)) return NextResponse.json({ error: "Choisissez une intention valide." }, { status: 400 });
  if (!["hidden", "visible", "paused"].includes(visibility)) return NextResponse.json({ error: "Choisissez une visibilité valide." }, { status: 400 });

  try {
    const sql = getDb();
    const rows = await sql`insert into public.profiles (id, public_name, city, bio, relationship_intention, birth_date, visibility, onboarding_completed)
      values (${user.id}, ${name}, ${city || null}, ${bio}, ${intention}, ${data.birthDate as string}, ${visibility}, true)
      on conflict (id) do update set public_name = excluded.public_name, city = excluded.city, bio = excluded.bio,
        relationship_intention = excluded.relationship_intention, birth_date = excluded.birth_date, visibility = excluded.visibility, onboarding_completed = true, updated_at = now()
      returning id, public_name, city, bio, relationship_intention, birth_date, visibility, onboarding_completed`;
    return NextResponse.json({ profile: rows[0] }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    console.error("NIKAHYA profile save failed.");
    return NextResponse.json({ error: "Enregistrement du profil indisponible. Vérifiez que les migrations de base sont appliquées." }, { status: 500 });
  }
}
