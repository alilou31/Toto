/** Affiliate offers are disabled by default. Never expose raw provider configuration. */
export const affiliateIdeaIds = ["cafe", "dinner", "culture", "activity", "walk", "getaway"] as const;
export type AffiliateIdeaId = (typeof affiliateIdeaIds)[number];
export type PublicAffiliateOffer = { ideaId: AffiliateIdeaId; partner: string; url: string; label: string };
export function approvedAffiliateOffers(env: Record<string,string|undefined> = process.env): PublicAffiliateOffer[] {
  if (env.AFFILIATION_ENABLED !== "true") return [];
  let parsed: unknown;
  try { parsed = JSON.parse(env.AFFILIATION_OFFERS_JSON || "[]"); } catch { return []; }
  if (!Array.isArray(parsed)) return [];
  const result: PublicAffiliateOffer[] = [];
  const seen = new Set<string>();
  for (const item of parsed) {
    if (!item || typeof item !== "object") continue;
    const x = item as Record<string,unknown>;
    if (x.approved !== true || typeof x.ideaId !== "string" || !affiliateIdeaIds.includes(x.ideaId as AffiliateIdeaId) || seen.has(x.ideaId)) continue;
    if (typeof x.partner !== "string" || !x.partner.trim() || x.partner.length > 80 || typeof x.url !== "string" || typeof x.label !== "string" || !x.label.trim() || x.label.length > 80) continue;
    if (typeof x.expiresAt !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(x.expiresAt) || x.expiresAt < new Date().toISOString().slice(0,10)) continue;
    const expiration = new Date(`${x.expiresAt}T00:00:00.000Z`);
    if (!Number.isFinite(expiration.getTime()) || expiration.toISOString().slice(0,10) !== x.expiresAt) continue;
    try {
      const url = new URL(x.url);
      if (url.protocol !== "https:" || url.username || url.password || url.port || url.hostname === "localhost" || !url.hostname.includes(".") || /(?:^|\.)(?:localhost|local|internal|test)$/.test(url.hostname) || /^(?:\d+\.){3}\d+$/.test(url.hostname) || x.url.length > 2048) continue;
      const allowedHosts = (env.AFFILIATION_ALLOWED_HOSTS || "").split(",").map(s=>s.trim().toLowerCase()).filter(Boolean);
      if (!allowedHosts.includes(url.hostname.toLowerCase())) continue;
      result.push({ ideaId:x.ideaId as AffiliateIdeaId, partner:x.partner.trim(), url:url.toString(), label:x.label.trim() });
      seen.add(x.ideaId);
    } catch { continue; }
  }
  return result;
}
