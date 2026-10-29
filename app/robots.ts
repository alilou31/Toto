import type { MetadataRoute } from "next";
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://nikahya.rassoul-ali.workers.dev").replace(/\/$/, "");
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/", "/tableau-de-bord", "/cockpit", "/profil", "/membre",
        "/matchs", "/messages", "/notifications", "/connexion", "/inscription",
        "/verification", "/parametres", "/rencontre", "/disponibilites",
        "/classement", "/decouvrir",
      ],
    }],
    sitemap: siteUrl + "/sitemap.xml",
    host: siteUrl,
  };
}
