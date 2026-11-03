import { createHash, randomBytes } from "node:crypto";

export const EMAIL_VERIFICATION_TOKEN_BYTES = 32;
export const EMAIL_VERIFICATION_TTL_HOURS = 24;

export function createVerificationToken(): string {
  return randomBytes(EMAIL_VERIFICATION_TOKEN_BYTES).toString("base64url");
}
export function isVerificationToken(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9_-]{43}$/.test(value);
}
export function hashVerificationToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
export function createVerificationEmail(token: string, origin: string) {
  const url = new URL("/confirmer-email", origin);
  url.searchParams.set("token", token);
  const link = url.toString();
  return {
    subject: "Confirmez votre adresse e-mail NAKAHYA",
    text: `Bienvenue sur NAKAHYA. Confirmez votre adresse e-mail avec ce lien (valable 24 heures) : ${link}\n\nSi vous n’avez pas créé de compte, ignorez ce message.`,
    html: `<!doctype html><html lang="fr"><body style="font-family:Arial,sans-serif;color:#202824;background:#faf8f2;padding:32px"><main style="max-width:550px;margin:auto;background:#fff;padding:28px;border-radius:14px"><p style="color:#075b4b;letter-spacing:2px;font-size:13px;font-weight:bold">NAKAHYA</p><h1>Bienvenue sur NAKAHYA</h1><p>Confirmez votre adresse e-mail pour activer votre compte.</p><p><a href="${link}" style="display:inline-block;padding:14px 22px;background:#075b4b;color:white;border-radius:8px;text-decoration:none">Confirmer mon adresse</a></p><p>Le lien est valable 24 heures et ne peut être utilisé qu’une seule fois.</p><p>Si vous n’êtes pas à l’origine de cette demande, ignorez cet e-mail.</p></main></body></html>`,
  };
}
