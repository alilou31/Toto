import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { consumeAuthRateLimit, getTrustedClientIp } from "@/lib/auth-rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getCurrentUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Connectez-vous pour vérifier votre profil." }, { status: 401, headers: { "Cache-Control": "no-store" } });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Consentement requis." }, { status: 400, headers: { "Cache-Control": "no-store" } }); }
  if (!body || typeof body !== "object" || (body as Record<string, unknown>).identityConsent !== true) {
    return NextResponse.json({ error: "Votre consentement au contrôle d’identité par le prestataire est requis." }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) return NextResponse.json({ error: "La vérification automatique n’est pas encore configurée. Le prestataire d’identité doit être activé dans Cloudflare." }, { status: 503, headers: { "Cache-Control": "no-store" } });

  try {
    const userLimit = await consumeAuthRateLimit("identity-verification-user", user.id, 3, 60 * 60);
    const clientIp = getTrustedClientIp(request);
    const ipLimit = clientIp ? await consumeAuthRateLimit("identity-verification-ip", clientIp, 10, 60 * 60) : { allowed: true, retryAfterSeconds: 0 };
    if (!userLimit.allowed || !ipLimit.allowed) {
      const retryAfter = Math.max(userLimit.allowed ? 0 : userLimit.retryAfterSeconds, ipLimit.allowed ? 0 : ipLimit.retryAfterSeconds);
      return NextResponse.json({ error: "Trop de demandes de vérification. Réessayez plus tard." }, { status: 429, headers: { "Cache-Control": "no-store", "Retry-After": String(retryAfter) } });
    }
    const sql = getDb();
    const profileRows = await sql`select birth_date, verification_status from public.profiles where id = ${user.id} limit 1`;
    const profile = profileRows[0];
    if (!profile?.birth_date) return NextResponse.json({ error: "Complétez d’abord votre date de naissance dans votre profil." }, { status: 400 });
    if (profile.verification_status === "verified") return NextResponse.json({ error: "Votre profil est déjà vérifié." }, { status: 409 });

    const active = await sql`select id from public.profile_identity_verification_sessions where user_id = ${user.id} and status in ('requires_input','processing') and created_at > now() - interval '30 minutes' limit 1`;
    if (active.length) return NextResponse.json({ error: "Une vérification automatique est déjà en cours. Reprenez-la depuis votre parcours de vérification." }, { status: 409 });

    const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://nikahya.rassoul-ali.workers.dev").replace(/\/$/, "");
    const form = new URLSearchParams();
    form.set("type", "document");
    form.set("options[document][require_matching_selfie]", "true");
    form.set("return_url", baseUrl + "/verification?automatic=return");
    form.set("metadata[user_id]", user.id);
    form.set("metadata[product]", "NIKAHYA");
    const response = await fetch("https://api.stripe.com/v1/identity/verification_sessions", {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
      signal: AbortSignal.timeout(15000),
    });
    const session = await response.json() as { id?: string; url?: string; status?: string; error?: { message?: string } };
    if (!response.ok || !session.id || !session.url) {
      console.error("Stripe Identity session creation failed.");
      return NextResponse.json({ error: "Le prestataire de vérification est momentanément indisponible." }, { status: 502, headers: { "Cache-Control": "no-store" } });
    }

    await sql`
      insert into public.profile_identity_verification_sessions (user_id, provider_session_id, status)
      values (${user.id}, ${session.id}, ${session.status === "processing" ? "processing" : "requires_input"})
    `;
    await sql`update public.profiles set verification_status = 'pending' where id = ${user.id}`;
    return NextResponse.json({ url: session.url }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch {
    console.error("Automatic identity verification could not be started.");
    return NextResponse.json({ error: "Impossible de démarrer la vérification. Réessayez plus tard." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
