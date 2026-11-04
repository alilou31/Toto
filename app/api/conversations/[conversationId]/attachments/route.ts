import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ conversationId: string }> };
type PrivateBucket = {
  put(key: string, value: ArrayBuffer, options: { httpMetadata: { contentType: string }; customMetadata: Record<string, string> }): Promise<unknown>;
  get(key: string): Promise<{ body: ReadableStream<Uint8Array>; httpMetadata?: { contentType?: string }; size: number } | null>;
  delete(key: string): Promise<void>;
};

const GLOBAL_LIMIT = 8 * 1024 * 1024 * 1024;\nconst USER_LIMIT = 100 * 1024 * 1024;\nconst CONVERSATION_LIMIT = 250 * 1024 * 1024;\n\nconst MAX_SIZE: Record<string, number> = {
  "image/jpeg": 10 * 1024 * 1024,
  "image/png": 20 * 1024 * 1024,
  "image/webp": 20 * 1024 * 1024,
  "image/gif": 10 * 1024 * 1024,
  "video/mp4": 25 * 1024 * 1024,
  "video/webm": 40 * 1024 * 1024,
  "video/quicktime": 40 * 1024 * 1024,
  "audio/webm": 10 * 1024 * 1024,
  "audio/ogg": 15 * 1024 * 1024,
  "audio/mpeg": 15 * 1024 * 1024,
  "audio/mp4": 15 * 1024 * 1024,
  "audio/wav": 15 * 1024 * 1024,
};

async function getBucket() {
  const { env } = await getCloudflareContext({ async: true });
  return (env as unknown as { CHAT_MEDIA_BUCKET?: PrivateBucket }).CHAT_MEDIA_BUCKET ?? null;
}

async function authorizedConversation(conversationId: string, userId: string) {
  const sql = getDb();
  const rows = await sql`
    select c.id
    from public.conversations c
    join public.matches m on m.id = c.match_id
    where c.id = ${conversationId}
      and (m.user_a = ${userId} or m.user_b = ${userId})
      and not exists (
        select 1 from public.blocks b
        where (b.blocker_id = ${userId}
          and b.blocked_id = case when m.user_a = ${userId} then m.user_b else m.user_a end)
           or (b.blocked_id = ${userId}
          and b.blocker_id = case when m.user_a = ${userId} then m.user_b else m.user_a end)
      )
    limit 1
  `;
  return rows.length > 0;
}

function hasValidSignature(mime: string, bytes: Uint8Array): boolean {
  const starts = (...values: number[]) => values.every((value, index) => bytes[index] === value);
  if (mime === "image/jpeg") return starts(0xff, 0xd8, 0xff);
  if (mime === "image/png") return starts(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a);
  if (mime === "image/gif") return ["GIF87a", "GIF89a"].some(value => new TextDecoder().decode(bytes.slice(0, 6)) === value);
  if (mime === "image/webp") return new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" && new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP";
  if (mime === "video/mp4" || mime === "video/quicktime" || mime === "audio/mp4") return new TextDecoder().decode(bytes.slice(4, 8)) === "ftyp";
  if (mime === "video/webm" || mime === "audio/webm") return starts(0x1a, 0x45, 0xdf, 0xa3);
  if (mime === "audio/ogg") return new TextDecoder().decode(bytes.slice(0, 4)) === "OggS";
  if (mime === "audio/wav") return new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" && new TextDecoder().decode(bytes.slice(8, 12)) === "WAVE";
  if (mime === "audio/mpeg") return new TextDecoder().decode(bytes.slice(0, 3)) === "ID3" || (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0);
  return false;
}

function mediaKind(mime: string): "image" | "video" | "audio" | null {
  if (mime.startsWith("image/") && mime in MAX_SIZE) return "image";
  if (mime.startsWith("video/") && mime in MAX_SIZE) return "video";
  if (mime.startsWith("audio/") && mime in MAX_SIZE) return "audio";
  return null;
}

export async function POST(request: Request, context: RouteContext) {
  const user = await getCurrentUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Authentification requise." }, { status: 401, headers: { "Cache-Control": "no-store" } });

  try {
    const { conversationId } = await context.params;
    if (!/^[0-9a-f-]{36}$/i.test(conversationId) || !(await authorizedConversation(conversationId, user.id))) {
      return NextResponse.json({ error: "Conversation introuvable." }, { status: 404, headers: { "Cache-Control": "no-store" } });
    }
    const bucket = await getBucket();
    if (!bucket) return NextResponse.json({ error: "Le stockage privé des médias n'est pas encore configuré." }, { status: 503, headers: { "Cache-Control": "no-store" } });

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "Sélectionnez un fichier à envoyer." }, { status: 400 });
    const mime = file.type.toLowerCase().split(";")[0].trim();
    const kind = mediaKind(mime);
    if (!kind) return NextResponse.json({ error: "Format non accepté. Utilisez une image, une vidéo ou un fichier audio compatible." }, { status: 415 });
    if (file.size < 1 || file.size > MAX_SIZE[mime]) return NextResponse.json({ error: "Fichier trop volumineux pour ce format." }, { status: 413 });

    const viewLimit = kind === "image" ? null : Number(form.get("viewLimit") || 1);
    if (kind !== "image" && viewLimit !== 1 && viewLimit !== 2) return NextResponse.json({ error: "Choisissez une ou deux consultations." }, { status: 400 });
    const usage = await sql`
      select
        coalesce(sum(attachment_size), 0)::bigint as global_bytes,
        coalesce(sum(attachment_size) filter (where sender_id = ${user.id}), 0)::bigint as user_bytes,
        coalesce(sum(attachment_size) filter (where conversation_id = ${conversationId}), 0)::bigint as conversation_bytes
      from public.messages where attachment_key is not null
    `;
    if (Number(usage[0]?.global_bytes || 0) + file.size > GLOBAL_LIMIT
      || Number(usage[0]?.user_bytes || 0) + file.size > USER_LIMIT
      || Number(usage[0]?.conversation_bytes || 0) + file.size > CONVERSATION_LIMIT) {
      return NextResponse.json({ error: "Quota de médias atteint." }, { status: 507, headers: { "Cache-Control": "no-store" } });
    }
    const bytes = await file.arrayBuffer();\n    if (!hasValidSignature(mime, new Uint8Array(bytes))) return NextResponse.json({ error: "Le contenu du fichier ne correspond pas au format annoncé." }, { status: 415 });
    const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8) || "bin";
    const key = `${kind === "image" ? "photos" : "ephemeral"}/${conversationId}/${crypto.randomUUID()}.${extension}`;
    await bucket.put(key, bytes, {
      httpMetadata: { contentType: mime },
      customMetadata: { conversationId, senderId: user.id },
    });

    try {
      const sql = getDb();
      const label = kind === "image" ? "Photo envoyée" : kind === "video" ? "Vidéo envoyée" : "Message vocal";
      const rows = await sql`
        insert into public.messages
          (conversation_id, sender_id, body, message_type, attachment_key, attachment_mime_type, attachment_size, attachment_name)
        values
          (${conversationId}, ${user.id}, ${label}, ${kind}, ${key}, ${mime}, ${file.size}, ${file.name.slice(0, 180)})
        returning id, sender_id, body, created_at, read_at, message_type, attachment_mime_type, attachment_size, attachment_name
      `;
      await sql`update public.conversations set last_message_at = now() where id = ${conversationId}`;
      return NextResponse.json({ message: rows[0] }, { status: 201, headers: { "Cache-Control": "no-store" } });
    } catch (error) {
      await bucket.delete(key).catch(() => undefined);
      throw error;
    }
  } catch {
    console.error("NIKAHYA media message upload failed.");
    return NextResponse.json({ error: "Impossible d'envoyer ce média pour le moment." }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}

export async function GET(_request: Request, context: RouteContext) {
  const user = await getCurrentUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Authentification requise." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  try {
    const { conversationId } = await context.params;
    if (!/^[0-9a-f-]{36}$/i.test(conversationId) || !(await authorizedConversation(conversationId, user.id))) {
      return NextResponse.json({ error: "Conversation introuvable." }, { status: 404, headers: { "Cache-Control": "no-store" } });
    }
    const url = new URL(_request.url);
    const messageId = url.searchParams.get("messageId");
    if (!messageId || !/^[0-9a-f-]{36}$/i.test(messageId)) return NextResponse.json({ error: "Média introuvable." }, { status: 404 });
    const sql = getDb();
    const rows = await sql`
      select attachment_key, attachment_mime_type
      from public.messages
      where id = ${messageId} and conversation_id = ${conversationId} and message_type <> 'text'
      limit 1
    `;
    if (!rows.length) return NextResponse.json({ error: "Média introuvable." }, { status: 404 });
    const bucket = await getBucket();
    if (!bucket) return NextResponse.json({ error: "Stockage indisponible." }, { status: 503 });
    const object = await bucket.get(media.attachment_key);
    if (!object) return NextResponse.json({ error: "Média introuvable." }, { status: 404 });
    const shouldDelete = !isSender && media.message_type !== "image" && Number(media.attachment_view_count) >= Number(media.attachment_max_views);\n    if (shouldDelete) {\n      await bucket.delete(media.attachment_key);\n      await sql`update public.messages set attachment_key = null, attachment_deleted_at = now() where id = ${messageId} and attachment_key = ${media.attachment_key}`;\n    }\n    return new Response(object.body, {
      headers: {
        "Content-Type": rows[0].attachment_mime_type || object.httpMetadata?.contentType || "application/octet-stream",
        "Content-Length": String(object.size),
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
        "Content-Disposition": "inline",
      },
    });
  } catch {
    console.error("NIKAHYA media message read failed.");
    return NextResponse.json({ error: "Impossible de charger ce média." }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
