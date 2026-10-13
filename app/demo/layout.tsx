import type { Metadata } from "next";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://nikahya.rassoul-ali.workers.dev").replace(/\/$/, "");
const title = "Démo NIKAHYA — Découvrez les rencontres en jouant";
const description = "Explorez la démonstration interactive de NIKAHYA avec des profils fictifs. Testez la découverte, les likes et la création d’un profil sans créer de compte ni envoyer de données.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${siteUrl}/demo` },
  openGraph: {
    title,
    description,
    url: `${siteUrl}/demo`,
    siteName: "NIKAHYA",
    type: "website",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary",
    title,
    description,
  },
};

export default function DemoLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
