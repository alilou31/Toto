import type { Metadata } from "next";
import { cookies } from "next/headers";
import { normalizeLocale } from "@/lib/i18n";
import ConnectedAppChrome from "@/app/components/connected-app-chrome";
import "./gamified.css";
import "./profile-ui.css";
import "./auth.css";
import "./legal.css";
import "./globals.css";
import "./landing-premium.css";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://nikahya.rassoul-ali.workers.dev").replace(/\/$/, "");
const siteTitle = "NAKAHYA — Rencontres sérieuses, faites connaissance en jouant";
const siteDescription = "Envie d’une relation sérieuse ? Découvrez NAKAHYA : une nouvelle façon de faire connaissance grâce aux jeux, aux affinités, aux valeurs et aux projets de vie.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: siteTitle, template: "%s | NAKAHYA" },
  description: siteDescription,
  applicationName: "NAKAHYA",
  category: "social",
  keywords: ["rencontre sérieuse", "application de rencontre", "faire connaissance en jouant", "rencontre par affinités", "rencontre par centres d’intérêt", "compatibilité amoureuse", "relation durable", "rencontre francophone", "jeux pour faire connaissance"],
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  openGraph: {
    title: siteTitle, description: siteDescription, url: siteUrl, siteName: "NAKAHYA", type: "website", locale: "fr_FR",
    images: [{ url: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1200&q=85", width: 1200, height: 630, alt: "NAKAHYA — Faites connaissance en jouant" }],
  },
  twitter: { card: "summary_large_image", title: siteTitle, description: siteDescription, images: ["https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1200&q=85"] },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get("nikahya_locale")?.value);
  return <html lang={locale}><body><ConnectedAppChrome>{children}</ConnectedAppChrome></body></html>;
}
