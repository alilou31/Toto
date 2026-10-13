import type { MetadataRoute } from "next";
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://nikahya.rassoul-ali.workers.dev").replace(/\/$/, "");
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: siteUrl, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: siteUrl + "/demo", lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: siteUrl + "/confidentialite", lastModified, changeFrequency: "yearly", priority: 0.4 },
    { url: siteUrl + "/conditions", lastModified, changeFrequency: "yearly", priority: 0.4 },
  ];
}
