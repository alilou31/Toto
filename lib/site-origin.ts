export const OFFICIAL_SITE_ORIGIN = "https://nakahya.com";
export const LEGACY_SITE_HOST = "nikahya.rassoul-ali.workers.dev";

/** Production links never depend on a stale dashboard/build variable or request Host. */
export function getSiteUrl(env: Record<string, string | undefined> = process.env): string {
  if (env.NODE_ENV === "production") return OFFICIAL_SITE_ORIGIN;
  try {
    const url = new URL(env.NEXT_PUBLIC_SITE_URL || OFFICIAL_SITE_ORIGIN);
    if (url.username || url.password || url.pathname !== "/" || url.search || url.hash) return OFFICIAL_SITE_ORIGIN;
    if (url.protocol === "https:") return url.hostname === "www.nakahya.com" ? OFFICIAL_SITE_ORIGIN : url.origin;
    if (url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname)) return url.origin;
  } catch { /* Invalid configuration cannot create links to an untrusted origin. */ }
  return OFFICIAL_SITE_ORIGIN;
}

export const PRIVATE_PATHS = [
  "/api", "/tableau-de-bord", "/cockpit", "/profil", "/membre", "/matchs", "/messages",
  "/notifications", "/connexion", "/inscription", "/verification", "/parametres", "/rencontre",
  "/disponibilites", "/classement", "/decouvrir", "/sorties", "/mot-de-passe-oublie", "/reinitialiser-mot-de-passe",
] as const;

export function privatePath(path: string): boolean {
  return PRIVATE_PATHS.some(prefix => path === prefix || path.startsWith(prefix + "/"));
}

/** Keep legacy API methods/bodies/cookies on their original host for integrations. */
export function canonicalRedirect(requestUrl: string, method = "GET"): string | null {
  const url = new URL(requestUrl);
  if (!["nakahya.com", "www.nakahya.com", LEGACY_SITE_HOST].includes(url.hostname)) return null;
  const navigation = ["GET", "HEAD"].includes(method) && !url.pathname.startsWith("/api/") && url.pathname !== "/api";
  if (url.protocol !== "https:") {
    url.protocol = "https:";
    if (navigation) url.host = "nakahya.com";
    return url.toString();
  }
  if (navigation && url.hostname !== "nakahya.com") {
    url.host = "nakahya.com";
    return url.toString();
  }
  return null;
}
