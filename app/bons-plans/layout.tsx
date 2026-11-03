import type { Metadata } from "next";

const title = "Idées de rendez-vous et bons plans";
const description = "Trouvez une idée de rendez-vous : café, promenade et activités à deux selon vos envies et votre budget. Suggestions éditoriales, sans réservation garantie.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/bons-plans" },
  openGraph: { title, description, url: "/bons-plans", type: "website", locale: "fr_FR", siteName: "NAKAHYA" },
  twitter: { card: "summary", title, description },
};

export default function BonsPlansLayout({ children }: { children: React.ReactNode }) {
  return children;
}
