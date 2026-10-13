import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID, randomBytes } from "node:crypto";
import { getDb } from "@/lib/db";
import { createSession, hashPassword } from "@/lib/auth";
import {
  decodeOAuthTransaction, getFacebookGraphVersion, getSiteOrigin,
  OAUTH_TRANSACTION_COOKIE, safeEqual, type OAuthProvider, type OAuthTransaction,
} from "@/lib/oauth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ProviderIdentity = { id: string; email: string; emailVerified: boolean };
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
function errorCode(error: unknown): string {
  if (!isRecord(error) || !("code" in error)) return "";
  return typeof error.code === "string" ? error.code : "";
}
function redirectToSite(path: string, origin: string) {
  return NextResponse.redirect(new URL(path, origin), { status: 303 });
}
function errorRedirect(transaction: OAuthTransaction | null, code: string, origin: string) {
  const path = transaction?.mode === "signup" ? "/inscription" : "/connexion";
  const target = new URL(path, origin);
  target.searchParams.set("oauth_error", code);
  return NextResponse.redirect(target, { status: 303 });
}

async function fetchGoogleIdentity(code: string, transaction: OAuthTransaction, callbackUri: string): Promise<ProviderIdentity> {
  const clientId = process.env.GOOGLE_CLIENT_ID, clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("provider_not_configured");
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId, client_secret: clientSecret, code,
      code_verifier: transaction.verifier, grant_type: "authorization_code", redirect_uri: callbackUri,
    }),
    signal: AbortSignal.timeout(10000), cache: "no-store",
  });
  const tokenData: unknown = await tokenResponse.json();
  if (!tokenResponse.ok || !isRecord(tokenData) || typeof tokenData.access_token !== "string") {
    throw new Error("provider_token_failed");
  }
  const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: "Bearer " + tokenData.access_token },
    signal: AbortSignal.timeout(10000), cache: "no-store",
  });
  const profile: unknown = await profileResponse.json();
  if (!profileResponse.ok || !isRecord(profile) || typeof profile.sub !== "string" ||
      typeof profile.email !== "string" || profile.email_verified !== true) {
    throw new Error("provider_profile_failed");
  }
  return { id: profile.sub, email: profile.email, emailVerified: true };
}

async function fetchFacebookIdentity(code: string, callbackUri: string): Promise<ProviderIdentity> {
  const clientId = process.env.FACEBOOK_APP_ID, clientSecret = process.env.FACEBOOK_APP_SECRET;
  if (!clientId || !clientSecret) throw new Error("provider_not_configured");
  const version = getFacebookGraphVersion();
  const tokenUrl = new URL("https://graph.facebook.com/" + version + "/oauth/access_token");
  tokenUrl.search = new URLSearchParams({
    client_id: clientId, client_secret: clientSecret, redirect_uri: callbackUri, code,
  }).toString();
  const tokenResponse = await fetch(tokenUrl, { signal: AbortSignal.timeout(10000), cache: "no-store" });
  const tokenData: unknown = await tokenResponse.json();
  if (!tokenResponse.ok || !isRecord(tokenData) || typeof tokenData.access_token !== "string") {
    throw new Error("provider_token_failed");
  }
  const profileUrl = new URL("https://graph.facebook.com/" + version + "/me");
  profileUrl.search = new URLSearchParams({ fields: "id,email", access_token: tokenData.access_token }).toString();
  const profileResponse = await fetch(profileUrl, { signal: AbortSignal.timeout(10000), cache: "no-store" });
  const profile: unknown = await profileResponse.json();
  if (!profileResponse.ok || !isRecord(profile) || typeof profile.id !== "string" || typeof profile.email !== "string") {
    throw new Error("provider_profile_failed");
  }
  return { id: profile.id, email: profile.email, emailVerified: false };
}

async function getProviderIdentity(provider: OAuthProvider, code: string, transaction: OAuthTransaction, callbackUri: string) {
  if (provider === "google") return fetchGoogleIdentity(code, transaction, callbackUri);
  return fetchFacebookIdentity(code, callbackUri);
}

export async function GET(request: Request) {
  const origin = getSiteOrigin() ?? new URL(request.url).origin;
  const requestUrl = new URL(request.url);
  const cookieStore = await cookies();
  const transaction = decodeOAuthTransaction(cookieStore.get(OAUTH_TRANSACTION_COOKIE)?.value);
  cookieStore.set(OAUTH_TRANSACTION_COOKIE, "", {
    httpOnly: true, secure: process.env.NODE_ENV === "production",
    sameSite: "lax", path: "/api/auth/oauth", expires: new Date(0),
  });

  const returnedState = requestUrl.searchParams.get("state") ?? "";
  if (!transaction || !returnedState || !safeEqual(transaction.state, returnedState)) {
    return errorRedirect(null, "invalid_state", origin);
  }
  if (requestUrl.searchParams.has("error")) return errorRedirect(transaction, "cancelled", origin);
  const code = requestUrl.searchParams.get("code");
  if (!code || code.length > 4096) return errorRedirect(transaction, "provider_failed", origin);

  const callbackUri = new URL("/api/auth/oauth/callback", origin).toString();
  try {
    const identity = await getProviderIdentity(transaction.provider, code, transaction, callbackUri);
    const email = identity.email.trim().toLowerCase();
    if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return errorRedirect(transaction, "email_required", origin);
    }
    if (transaction.provider === "google" && !identity.emailVerified) {
      return errorRedirect(transaction, "email_unverified", origin);
    }

    const sql = getDb();
    const linkedRows = await sql`
      select u.id, u.disabled_at
      from public.oauth_identities oi
      join public.auth_users u on u.id = oi.user_id
      where oi.provider = ${transaction.provider}
        and oi.provider_user_id = ${identity.id}
      limit 1
    `;
    const linked = linkedRows[0] as { id: string; disabled_at: string | null } | undefined;
    if (linked) {
      if (linked.disabled_at) return errorRedirect(transaction, "account_disabled", origin);
      await createSession(linked.id);
      return redirectToSite(transaction.next, origin);
    }

    const emailRows = await sql`
      select id from public.auth_users
      where email_normalized = ${email}
      limit 1
    `;
    if (emailRows.length > 0) return errorRedirect(transaction, "account_exists", origin);
    if (transaction.mode !== "signup" || !transaction.consentAccepted) {
      return errorRedirect(transaction, "account_not_found", origin);
    }

    const userId = randomUUID();
    const passwordHash = await hashPassword(randomBytes(48).toString("base64url"));
    const acceptedAt = new Date().toISOString();
    try {
      await sql`
        insert into public.auth_users (id, email, email_normalized, password_hash)
        values (${userId}, ${email}, ${email}, ${passwordHash})
      `;
      await sql`
        insert into public.oauth_identities
          (user_id, provider, provider_user_id, email, age_confirmed_at, terms_accepted_at)
        values
          (${userId}, ${transaction.provider}, ${identity.id}, ${email}, ${acceptedAt}, ${acceptedAt})
      `;
    } catch (error) {
      await sql`delete from public.auth_users where id = ${userId}`.catch(() => undefined);
      if (errorCode(error) === "23505") return errorRedirect(transaction, "account_exists", origin);
      throw error;
    }
    await createSession(userId);
    return redirectToSite(transaction.next, origin);
  } catch {
    console.error("NIKAHYA OAuth callback failed.");
    return errorRedirect(transaction, "oauth_unavailable", origin);
  }
}
