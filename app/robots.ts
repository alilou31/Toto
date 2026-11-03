import type { MetadataRoute } from "next";
import { getSiteUrl, PRIVATE_PATHS } from "@/lib/site-origin";
const siteUrl = getSiteUrl();
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{
      userAgent: "*",
      allow: "/",
      disallow: PRIVATE_PATHS.map(path => path === "/api" ? "/api/" : path),
    }],
    sitemap: siteUrl + "/sitemap.xml",
    host: siteUrl,
  };
}

