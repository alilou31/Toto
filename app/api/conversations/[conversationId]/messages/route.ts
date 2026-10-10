import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ conversationId: string }> };

async function authorizedConversation(conversationId: string, userId: string) {
  const sql = getDb();
  const rows = await sql`
    select c.id
    from public.conversations c
    join public.matches m on m.id = c.match_id
    where c.id = ${conversationId} and (m.user_a = ${userId} or m.user_b = ${userId})
    limit 1
  `;
  return rows.length > 0;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Authentification requise." }, { status: 401, headers: { "Cache-Control": "no-store" } });
    const { conversationId } = await context.params;
    if (!/^[0-9a-f-]{36}$/i.test(conversationId)) return NextResponse.json({ error: "Conversation introuvable." }, { status: 404 });
    if (!(await authorizedConversation(conversationId, user.id))) return NextResponse.json({ error: "Conversation introuvable." }, { status: 404 });
    const sql = getDb();
    const messages = await sql`
      select id, sender_id, body, created_at, read_at
      from public.messages where conversation_id = ${conversationId}
      order by created_at asc limit 200
    `;
    await sql`update public.messages set read_at = now()
      where conversation_id = ${conversationId} and sender_id <> ${user.id} and read_at is null`;
    return NextResponse.json({ messages, currentUserId: user.id }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    console.error("NIKAHYA messages read failed.");
    return NextResponse.json({ error: "Impossible de charger les messages." }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}

export async function POST(request: Request, context: RouteContext) {
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Requête invalide." }, { status: 400 }); }
  if (!body || typeof body !== "object" || typeof (body as Record<string, unknown>).body !== "string") {
    return NextResponse.json({ error: "Message invalide." }, { status: 400 });
  }
  const text = ((body as Record<string, unknown>).body as string).trim();
  if (!text || text.length > 5000) return NextResponse.json({ error: "Le message doit contenir entre 1 et 5 000 caractères." }, { status: 400 });
  const user = await getCurrentUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
  try {
    const { conversationId } = await context.params;
    if (!/^[0-9a-f-]{36}$/i.test(conversationId)) return NextResponse.json({ error: "Conversation introuvable." }, { status: 404 });
    if (!(await authorizedConversation(conversationId, user.id))) return NextResponse.json({ error: "Conversation introuvable." }, { status: 404 });
    const sql = getDb();
    const rows = await sql`
      insert into public.messages (conversation_id, sender_id, body)
      values (${conversationId}, ${user.id}, ${text})
      returning id, sender_id, body, created_at, read_at
    `;
    await sql`update public.conversations set last_message_at = now() where id = ${conversationId}`;
    return NextResponse.json({ message: rows[0] }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch {
    console.error("NIKAHYA message send failed.");
    return NextResponse.json({ error: "Impossible d’envoyer ce message pour le moment." }, { status: 500 });
  }
}
