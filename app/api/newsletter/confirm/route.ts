import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  if (!token || token.length > 200) return NextResponse.redirect(new URL("/?newsletter=invalid", url.origin));
  try {
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const sql = getDb();
    const result = await sql`
      update public.newsletter_subscriptions
      set status = 'confirmed', confirmed_at = now(), confirmation_token_hash = null,
          confirmation_expires_at = null, updated_at = now()
      where confirmation_token_hash = ${tokenHash}
        and status = 'pending_confirmation'
        and confirmation_expires_at > now()
      returning id
    `;
    if (result.length) return NextResponse.redirect(new URL("/?newsletter=confirmed", url.origin));
    return NextResponse.redirect(new URL("/?newsletter=invalid", url.origin));
  } catch {
    return NextResponse.redirect(new URL("/?newsletter=error", url.origin));
  }
}
