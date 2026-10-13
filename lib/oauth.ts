import "server-only";

import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export type OAuthProvider = "google" | "facebook";
export type OAuthMode = "login" | "signup";
export type OAuthTransaction = {
  provider: OAuthProvider;
  mode: OAuthMode;
  state: string;
  verifier: string;
  next: "/tableau-de-bord";
  consentAccepted: boolean;
};
export const OAUTH_TRANSACTION_COOKIE = "nikahya_oauth_transaction";

export function getSiteOrigin(): string | null {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (!configured) return null;
  try {
    const url = new URL(configured);
    if (url.protocol !== "https:" && process.env.NODE_ENV === "production") return null;
    if (url.protocol !== "https:" && url.hostname !== "localhost" && url.hostname !== "127.0.0.1") return null;
    return url.origin;
  } catch { return null; }
}
export function createRandomToken(): string { return randomBytes(32).toString("base64url"); }
export function createPkceChallenge(verifier: string): string {
  return createHash("sha256").update(verifier).digest("base64url");
}
export function safeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left), b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}
export function encodeOAuthTransaction(transaction: OAuthTransaction): string {
  return Buffer.from(JSON.stringify(transaction), "utf8").toString("base64url");
}
export function decodeOAuthTransaction(value: string | undefined): OAuthTransaction | null {
  if (!value || value.length > 2048) return null;
  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as Partial<OAuthTransaction>;
    if ((parsed.provider !== "google" && parsed.provider !== "facebook") ||
      (parsed.mode !== "login" && parsed.mode !== "signup") ||
      typeof parsed.state !== "string" || typeof parsed.verifier !== "string" ||
      parsed.next !== "/tableau-de-bord" || typeof parsed.consentAccepted !== "boolean") return null;
    return parsed as OAuthTransaction;
  } catch { return null; }
}
export function getFacebookGraphVersion(): string {
  const configured = process.env.FACEBOOK_GRAPH_API_VERSION;
  return configured && /^v\d+\.\d+$/.test(configured) ? configured : "v26.0";
}
