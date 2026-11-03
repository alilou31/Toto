import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Confirmer votre adresse e-mail",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function VerificationLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
