import "server-only";

import { createHash } from "node:crypto";
import { getDb } from "@/lib/db";

export type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

function hashKey(scope: string, identifier: string): string {
  return createHash("sha256").update(`nikahya-auth-rate-limit:${scope}:${identifier}`).digest("hex");
}

/**
 * Atomically increments a persistent counter in Neon. The migration
 * 003_auth_rate_limits.sql must be applied before enabling this helper.
 * Only a one-way key hash is stored, not the email address or client IP.
 */
export async function consumeAuthRateLimit(
  scope: string,
  identifier: string,
  limit: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  const keyHash = hashKey(scope, identifier);
  const sql = getDb();
  const rows = await sql`
    insert into public.auth_rate_limits (key_hash, window_started_at, attempts, updated_at)
    values (${keyHash}, now(), 1, now())
    on conflict (key_hash) do update set
      attempts = case
        when public.auth_rate_limits.window_started_at <= now() - (${windowSeconds} * interval '1 second') then 1
        else public.auth_rate_limits.attempts + 1
      end,
      window_started_at = case
        when public.auth_rate_limits.window_started_at <= now() - (${windowSeconds} * interval '1 second') then now()
        else public.auth_rate_limits.window_started_at
      end,
      updated_at = now()
    returning
      attempts,
      greatest(1, ceil(extract(epoch from (
        window_started_at + (${windowSeconds} * interval '1 second') - now()
      ))))::integer as retry_after_seconds
  `;
  const row = rows[0] as { attempts: number; retry_after_seconds: number } | undefined;
  if (!row) throw new Error("Rate limit counter did not return a row");

  // Opportunistic cleanup to avoid retaining old pseudonymous keys indefinitely.
  await sql`delete from public.auth_rate_limits where updated_at < now() - interval '2 days'`;

  return {
    allowed: Number(row.attempts) <= limit,
    retryAfterSeconds: Math.max(1, Number(row.retry_after_seconds) || windowSeconds),
  };
}

/** Cloudflare supplies this header at the edge; don't trust arbitrary forwarded-for chains. */
export function getTrustedClientIp(request: Request): string | null {
  const value = request.headers.get("cf-connecting-ip")?.trim();
  return value && value.length <= 64 ? value : null;
}
