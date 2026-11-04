import type { Metadata } from "next";
export const metadata: Metadata = {
  title: { default: "Conseils pour une rencontre sérieuse", template: "%s | NAKAHYA" },
  description: "Des conseils concrets pour faire connaissance, parler de ses valeurs et construire une relation sincère.",
  alternates: { canonical: "/conseils" },
};
export default function ConseilsLayout({ children }: { children: React.ReactNode }) { return children; }
