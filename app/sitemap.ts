import { getSiteUrl } from "@/lib/site-origin";
import type { MetadataRoute } from "next";
const siteUrl = getSiteUrl();

export default function sitemap(): MetadataRoute.Sitemap {
  // Only index public editorial content; accounts, member profiles and legal drafts stay out.
  return [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: siteUrl + "/demo", changeFrequency: "monthly", priority: 0.8 },
    { url: siteUrl + "/bons-plans", changeFrequency: "weekly", priority: 0.6 },
  ];
}

