import type { MetadataRoute } from "next";
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://nikahya.rassoul-ali.workers.dev").replace(/\/$/, "");

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  // Legal pages remain accessible to visitors but are explicitly marked noindex
  // until the real publisher identity and final wording have been reviewed.
  return [
    { url: siteUrl, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: siteUrl + "/demo", lastModified, changeFrequency: "monthly", priority: 0.8 },
  ];
}
