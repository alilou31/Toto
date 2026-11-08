import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, HeartHandshake, MessageCircle, ShieldCheck } from "lucide-react";
import FeedbackForm from "@/app/components/feedback-form";

export const metadata: Metadata = {
  title: "Votre avis compte",
  description: "Partagez vos idées et votre expérience pour aider NAKAHYA à améliorer les rencontres.",
  robots: { index: false, follow: false },
};

export default function FeedbackPage() {
  return (
    <main className="voc-page">
      <div className="voc-shell">
        <Link href="/" className="voc-back"><ArrowLeft size={16} /> Retour à NAKAHYA</Link>
        <header className="voc-hero">
          <span className="voc-eyebrow"><HeartHandshake size={15} /> VOTRE VOIX COMPTE</span>
          <h1>Une meilleure rencontre commence aussi par <em>vous écouter.</em></h1>
          <p>Votre expérience nous aide à construire une application plus humaine, plus simple et plus sûre. Les retours sincères sont les bienvenus, même lorsqu’ils sont critiques.</p>
        </header>
        <div className="voc-layout">
          <section className="voc-form-card">
            <h2>Partagez votre expérience</h2>
            <p>Quelques lignes suffisent. Vous pouvez rester anonyme.</p>
            <FeedbackForm />
          </section>
          <aside className="voc-aside">
            <div><MessageCircle size={21}/><h3>Du concret</h3><p>Dites-nous ce qui vous aide, vous bloque ou vous manque.</p></div>
            <div><ShieldCheck size={21}/><h3>En confiance</h3><p>Vos réponses sont réservées à l’équipe produit autorisée.</p></div>
            <div><HeartHandshake size={21}/><h3>Une amélioration continue</h3><p>Chaque retour utile peut contribuer à faire évoluer NAKAHYA.</p></div>
          </aside>
        </div>
      </div>
    </main>
  );
}
