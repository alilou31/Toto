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
    const rows = await sql`select available_for, is_available, city, country, available_from, available_until, note, updated_at from public.member_availability where user_id = ${user.id} limit 1`;
    return NextResponse.json({ availability: rows[0] ?? null }, { headers: { "Cache-Control": "no-store" } });
  } catch { return NextResponse.json({ error: "Disponibilités indisponibles. Vérifiez la migration 014_activity_availability.sql." }, { status: 503, headers: { "Cache-Control": "no-store" } }); }
}
export async function PUT(request: Request) {
  const user = await getCurrentUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Authentification requise." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  let data: Record<string, unknown>;
  try { data = await request.json() as Record<string, unknown>; } catch { return NextResponse.json({ error: "Requête invalide." }, { status: 400, headers: { "Cache-Control": "no-store" } }); }
  const availableFor = typeof data.availableFor === "string" ? data.availableFor : "";
  const isAvailable = data.isAvailable === true;
  const city = typeof data.city === "string" ? data.city.trim().slice(0, 100) : "";
  const country = typeof data.country === "string" ? data.country.trim().slice(0, 100) : "";
  const from = typeof data.availableFrom === "string" && /^\d{4}-\d{2}-\d{2}$/.test(data.availableFrom) ? data.availableFrom : null;
  const until = typeof data.availableUntil === "string" && /^\d{4}-\d{2}-\d{2}$/.test(data.availableUntil) ? data.availableUntil : null;
  const note = typeof data.note === "string" ? data.note.trim().slice(0, 240) : "";
  if (!["restaurant", "game", "weekend", "travel"].includes(availableFor)) return NextResponse.json({ error: "Choisissez un type d’activité valide." }, { status: 400, headers: { "Cache-Control": "no-store" } });
  if (until && from && until < from) return NextResponse.json({ error: "La date de fin doit être postérieure à la date de début." }, { status: 400, headers: { "Cache-Control": "no-store" } });
  try {
    const sql = getDb();
    const rows = await sql`insert into public.member_availability (user_id, available_for, is_available, city, country, available_from, available_until, note, updated_at)
      values (${user.id}, ${availableFor}, ${isAvailable}, ${city || null}, ${country || null}, ${from}, ${until}, ${note || null}, now())
      on conflict (user_id) do update set available_for = excluded.available_for, is_available = excluded.is_available, city = excluded.city, country = excluded.country, available_from = excluded.available_from, available_until = excluded.available_until, note = excluded.note, updated_at = now()
      returning available_for, is_available, city, country, available_from, available_until, note, updated_at`;
    return NextResponse.json({ availability: rows[0] }, { headers: { "Cache-Control": "no-store" } });
  } catch { return NextResponse.json({ error: "Enregistrement indisponible. Vérifiez la migration 014_activity_availability.sql." }, { status: 503, headers: { "Cache-Control": "no-store" } }); }
}
