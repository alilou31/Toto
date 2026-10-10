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
    const blocks = await sql`
      select b.blocked_id as "blockedUserId", p.public_name as "publicName", b.created_at as "createdAt"
      from public.blocks b
      left join public.profiles p on p.id = b.blocked_id
      where b.blocker_id = ${user.id}
      order by b.created_at desc
      limit 500
    `;
    return NextResponse.json({ blocks }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    console.error("NIKAHYA blocks read failed.");
    return NextResponse.json({ error: "Impossible de charger les blocages." }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Requête invalide." }, { status: 400 }); }
  if (!body || typeof body !== "object" || typeof (body as Record<string, unknown>).blockedUserId !== "string") {
    return NextResponse.json({ error: "Profil à bloquer invalide." }, { status: 400 });
  }
  const blockedUserId = ((body as Record<string, unknown>).blockedUserId as string).trim();
  if (!blockedUserId || blockedUserId.length > 128) return NextResponse.json({ error: "Profil à bloquer invalide." }, { status: 400 });

  const user = await getCurrentUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Authentification requise." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  if (blockedUserId === user.id) return NextResponse.json({ error: "Vous ne pouvez pas vous bloquer vous-même." }, { status: 400 });

  try {
    const sql = getDb();
    const target = await sql`select id from public.profiles where id = ${blockedUserId} limit 1`;
    if (!target.length) return NextResponse.json({ error: "Profil introuvable." }, { status: 404 });
    await sql`insert into public.blocks (blocker_id, blocked_id) values (${user.id}, ${blockedUserId}) on conflict (blocker_id, blocked_id) do nothing`;
    // Hide pending interactions in both directions without deleting their audit trail.
    await sql`update public.interests set status = 'withdrawn', updated_at = now()
      where sender_id = ${user.id} and recipient_id = ${blockedUserId} and status = 'pending'`;
    await sql`update public.interests set status = 'ignored', updated_at = now()
      where sender_id = ${blockedUserId} and recipient_id = ${user.id} and status = 'pending'`;
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    console.error("NIKAHYA block action failed.");
    return NextResponse.json({ error: "Impossible d’appliquer ce blocage pour le moment." }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}

export async function DELETE(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Requête invalide." }, { status: 400 }); }
  if (!body || typeof body !== "object" || typeof (body as Record<string, unknown>).blockedUserId !== "string") {
    return NextResponse.json({ error: "Profil à débloquer invalide." }, { status: 400 });
  }
  const blockedUserId = ((body as Record<string, unknown>).blockedUserId as string).trim();
  if (!blockedUserId || blockedUserId.length > 128) return NextResponse.json({ error: "Profil à débloquer invalide." }, { status: 400 });
  const user = await getCurrentUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Authentification requise." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  try {
    const sql = getDb();
    await sql`delete from public.blocks where blocker_id = ${user.id} and blocked_id = ${blockedUserId}`;
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    console.error("NIKAHYA unblock action failed.");
    return NextResponse.json({ error: "Impossible de lever ce blocage pour le moment." }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
