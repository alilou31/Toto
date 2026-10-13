import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  createPkceChallenge, createRandomToken, encodeOAuthTransaction, getSiteOrigin,
  OAUTH_TRANSACTION_COOKIE, type OAuthMode, type OAuthProvider, type OAuthTransaction,
} from "@/lib/oauth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); }
  catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }
  if (!isRecord(body)) {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }
  const provider = body.provider, mode = body.mode;
  if ((provider !== "google" && provider !== "facebook") || (mode !== "login" && mode !== "signup")) {
    return NextResponse.json({ error: "Fournisseur de connexion invalide." }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }
  if (mode === "signup" && (body.ageConfirmed !== true || body.acceptedTerms !== true)) {
    return NextResponse.json({ error: "Confirmez votre majorité et acceptez les conditions pour créer un compte." }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }
  const origin = getSiteOrigin();
  if (!origin) {
    return NextResponse.json({ error: "La connexion sociale n'est pas encore configurée sur ce site." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
  const requestOrigin = request.headers.get("origin");
  if (requestOrigin) {
    try {
      if (new URL(requestOrigin).origin !== origin) {
        return NextResponse.json({ error: "Origine de requête invalide." }, { status: 403, headers: { "Cache-Control": "no-store" } });
      }
    } catch {
      return NextResponse.json({ error: "Origine de requête invalide." }, { status: 403, headers: { "Cache-Control": "no-store" } });
    }
  }
  const clientId = provider === "google" ? process.env.GOOGLE_CLIENT_ID : process.env.FACEBOOK_APP_ID;
  if (!clientId) {
    return NextResponse.json({ error: "Ce fournisseur n'est pas encore activé. Réessayez plus tard." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }

  const state = createRandomToken(), verifier = createRandomToken();
  const transaction: OAuthTransaction = {
    provider: provider as OAuthProvider, mode: mode as OAuthMode, state, verifier,
    next: "/tableau-de-bord",
    consentAccepted: mode === "signup" && body.ageConfirmed === true && body.acceptedTerms === true,
  };
  const callbackUri = new URL("/api/auth/oauth/callback", origin).toString();
  const version = process.env.FACEBOOK_GRAPH_API_VERSION && /^v\d+\.\d+$/.test(process.env.FACEBOOK_GRAPH_API_VERSION)
    ? process.env.FACEBOOK_GRAPH_API_VERSION : "v26.0";
  let authorizationUrl: URL;
  if (provider === "google") {
    authorizationUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    authorizationUrl.search = new URLSearchParams({
      client_id: clientId, redirect_uri: callbackUri, response_type: "code",
      scope: "openid email profile", state,
      code_challenge: createPkceChallenge(verifier), code_challenge_method: "S256",
      prompt: "select_account",
    }).toString();
  } else {
    authorizationUrl = new URL("https://www.facebook.com/" + version + "/dialog/oauth");
    authorizationUrl.search = new URLSearchParams({
      client_id: clientId, redirect_uri: callbackUri, response_type: "code",
      scope: "email,public_profile", state,
    }).toString();
  }
  const cookieStore = await cookies();
  cookieStore.set(OAUTH_TRANSACTION_COOKIE, encodeOAuthTransaction(transaction), {
    httpOnly: true, secure: process.env.NODE_ENV === "production",
    sameSite: "lax", path: "/api/auth/oauth", maxAge: 10 * 60,
  });
  return NextResponse.json({ url: authorizationUrl.toString() }, { headers: { "Cache-Control": "no-store" } });
}
