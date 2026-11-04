import type { Metadata } from "next";
import Link from "next/link";
import HomeHeader from "@/app/components/home-header";
import { ArrowRight, BookOpen, Heart } from "lucide-react";

export const metadata: Metadata = {
  title: "Conseils pour une rencontre sérieuse et durable",
  description: "Des conseils concrets pour faire connaissance, parler de ses valeurs et construire une relation sincère. Le guide NAKAHYA de la rencontre sérieuse.",
  alternates: { canonical: "/conseils" },
  openGraph: { title: "Conseils pour une rencontre sérieuse | NAKAHYA", description: "Des repères simples pour faire connaissance et construire une relation sincère.", url: "/conseils", type: "website", locale: "fr_FR", siteName: "NAKAHYA" },
};

const articles = [
  { slug: "rencontre-serieuse-ou-commencer", category: "PREMIERS PAS", title: "Rencontre sérieuse : par où commencer ?", excerpt: "Clarifier ses intentions, prendre le temps et créer les conditions d'un premier échange authentique.", reading: "4 min" },
  { slug: "questions-pour-faire-connaissance", category: "CONVERSATION", title: "15 questions pour vraiment faire connaissance", excerpt: "Des questions ouvertes pour parler des valeurs, du quotidien et des projets sans transformer le rendez-vous en entretien.", reading: "5 min" },
  { slug: "valeurs-compatibilite-couple", category: "AFFINITÉS", title: "Valeurs et compatibilité : comment en parler ?", excerpt: "Découvrir ce qui compte pour chacun, sans chercher une personne parfaite ni réduire une relation à un score.", reading: "5 min" },
];

export default function ConseilsPage() {
  const structuredData = { "@context": "https://schema.org", "@type": "CollectionPage", name: "Conseils pour une rencontre sérieuse", url: "https://nakahya.com/conseils", description: metadata.description, mainEntity: articles.map((article) => ({ "@type": "Article", headline: article.title, url: `https://nakahya.com/conseils/${article.slug}` })) };
  return <main className="landing-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
    <HomeHeader locale="fr" />
    <section className="section-pad" style={{ background: "var(--ivory)", minHeight: "50vh" }}>
      <div className="section-kicker"><span>NAKAHYA</span> / LE JOURNAL DE LA RENCONTRE</div>
      <h1 style={{ maxWidth: 850 }}>Faire connaissance avec <em>intention.</em></h1>
      <p style={{ maxWidth: 680, lineHeight: 1.9, color: "var(--muted)", fontSize: 16 }}>Des repères simples et sans jugement pour aborder une rencontre, mieux se connaître et parler de ce qui compte vraiment. La rencontre reste au centre ; les jeux ne sont qu'une façon d'ouvrir la conversation.</p>
      <div className="value-grid" style={{ marginTop: 48 }}>
        {articles.map((article) => <article className="value-card" key={article.slug} style={{ background: "#fff", minHeight: 250 }}>
          <div className="value-top"><span className="value-icon"><BookOpen size={20}/></span><span className="card-number">{article.reading.toUpperCase()}</span></div>
          <p className="section-kicker">{article.category}</p><h2 style={{ fontSize: 25, letterSpacing: "-.4px", marginBottom: 12 }}>{article.title}</h2><p>{article.excerpt}</p>
          <Link className="text-link" href={`/conseils/${article.slug}`}>Lire le conseil <ArrowRight size={15}/></Link>
        </article>)}
      </div>
      <div style={{ marginTop: 52, padding: 28, background: "#075b4b", color: "#fff", borderRadius: 8 }}>
        <Heart size={24}/><h2 style={{ color: "#fff", margin: "14px 0" }}>Et si la prochaine rencontre commençait autrement ?</h2>
        <p style={{ color: "#e0ebe4", lineHeight: 1.8 }}>NAKAHYA est une application de rencontre sérieuse où les jeux servent à briser la glace et à faire émerger de vraies conversations.</p>
        <Link href="/inscription" className="button button-light">Créer mon profil <ArrowRight size={16}/></Link>
      </div>
    </section>
    <footer className="footer landing-footer"><div className="footer-bottom"><Link href="/">NAKAHYA</Link><Link href="/conseils">Conseils</Link><Link href="/confidentialite">Confidentialité</Link><Link href="/conditions">Conditions</Link></div></footer>
  </main>;
}
