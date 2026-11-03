import "server-only";

export type OutgoingEmail = { to: string; subject: string; html: string; text?: string };

/** This sender domain must be verified in Resend; no onboarding@resend.dev fallback in production. */
export function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL?.trim());
}

export async function sendResendEmail(message: OutgoingEmail): Promise<{ ok: boolean; status: number | null }> {
  if (!isResendConfigured()) return { ok: false, status: null };
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ ...message, from: process.env.RESEND_FROM_EMAIL, to: [message.to] }),
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    return { ok: response.ok, status: response.status };
  } catch {
    // Never log the address, message body, access token or verification URL.
    return { ok: false, status: null };
  }
}
