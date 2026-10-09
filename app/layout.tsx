import type { Metadata } from "next";
import "./globals.css";
import "./auth.css";
import "./legal.css";

export const metadata: Metadata = {
  title: "NIKAHYA — La rencontre qui change tout",
  description: "Rencontrez des personnes qui partagent vos intentions, vos valeurs et votre vision de l'avenir.",
  applicationName: "NIKAHYA",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "NIKAHYA — La rencontre qui change tout",
    description: "Une rencontre sincère commence par ce qui compte vraiment.",
    type: "website",
    locale: "fr_FR",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr"><body>{children}</body></html>;
}
