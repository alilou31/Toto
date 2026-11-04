import { getSiteUrl } from "@/lib/site-origin";
import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { localeFromAcceptLanguage, normalizeLocale, localeMessages } from "@/lib/i18n";
import Link from "next/link";
import HomeHeader from "@/app/components/home-header";
import { getCurrentUser } from "@/lib/auth";
import NewsletterSignup from "@/app/components/newsletter-signup";
import { ArrowRight, ArrowDown, Heart, LockKeyhole, ShieldCheck, Check } from "lucide-react";

const faqs = [
  { q: "À qui s’adresse NAKAHYA ?", a: "Aux adultes de 18 ans et plus qui souhaitent une relation sérieuse et préfèrent découvrir une personne au-delà d’une photo." },
  { q: "Pourquoi faire connaissance en jouant ?", a: "Les jeux donnent un point de départ naturel à la conversation. Ils aident à rire, réfléchir et découvrir l’autre, sans réduire une personne à un score." },
  { q: "Est-ce une application de rencontre sérieuse ?", a: "Oui. Les intentions, les valeurs et les projets de vie restent au centre. Les jeux sont simplement un moyen de briser la glace." },
  { q: "Comment garder le contrôle de mes échanges ?", a: "Prenez le temps de compléter votre profil, choisissez les informations que vous partagez et utilisez les fonctions de blocage ou de signalement si nécessaire." },
];
const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "NAKAHYA — Rencontres sérieuses : faites connaissance en jouant",
  description: "Envie d’une relation sérieuse ? Découvrez NAKAHYA, l’application de rencontre qui vous aide à faire connaissance grâce aux jeux, aux affinités, aux valeurs et aux projets de vie.",
  alternates: { canonical: "/" },
};

export default async function Home() {
  const cookieStore = await cookies();
  const requestHeaders = await headers();
  const savedLocale = cookieStore.get("nikahya_locale")?.value;
  const locale = savedLocale ? normalizeLocale(savedLocale) : localeFromAcceptLanguage(requestHeaders.get("accept-language"));
  const t = localeMessages[locale];
  const currentUser = await getCurrentUser().catch(() => null);
  const structuredData = [
    { "@context": "https://schema.org", "@type": "Organization", name: "NAKAHYA", url: siteUrl, description: "NAKAHYA aide les adultes qui recherchent une relation sérieuse à faire connaissance grâce aux jeux, aux centres d’intérêt et aux conversations." },
    { "@context": "https://schema.org", "@type": "WebSite", name: "NAKAHYA", url: siteUrl, inLanguage: "fr-FR", description: "L’application de rencontre sérieuse pour faire connaissance en jouant." },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
  ];
  return (
    <main className="landing-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <HomeHeader locale={locale} />
      <section className="hero landing-hero" aria-labelledby="landing-title">
        <div className="hero-copy landing-hero-copy">
          <div className="eyebrow"><span className="eyebrow-line" /> LA RENCONTRE, AUTREMENT</div>
          <h1 id="landing-title">{t.hero}</h1>
          <p className="hero-lede">{t.intro} <strong>Avec NAKAHYA, la rencontre sérieuse commence par la complicité.</strong></p>
          <div className="hero-actions landing-hero-actions">
            <Link href="/inscription" className="button button-green landing-primary-cta">{t.heroCta} <ArrowRight size={17} /></Link>
            <Link href="/demo" className="button button-quiet landing-secondary-cta">Comment ça marche <ArrowDown size={16} /></Link>
          </div>
          <div className="landing-login-line">Déjà membre&nbsp;? <Link href="/connexion">Se connecter <ArrowRight size={14} /></Link></div>
          <div className="hero-note"><span className="note-icon"><ShieldCheck size={17} /></span><span>Pour les adultes qui veulent une relation sincère.<br /><strong>Pas de swipe infini. Prenez le temps de vous découvrir.</strong></span></div>
        </div>
        <div className="hero-visual landing-hero-visual" aria-label="Illustration d'une rencontre et de jeux pour apprendre à se connaître">
          <div className="landing-glow landing-glow-one" /><div className="landing-glow landing-glow-two" />
          <div className="photo-frame landing-photo-frame"><div className="photo-overlay" />
            <div className="landing-hero-label"><span className="landing-label-spark">✳</span> LES RENCONTRES QUI ONT DU SENS</div>
            <div className="landing-hero-message"><span className="quote-mark">“</span><p>La complicité se découvre. Elle ne se scrolle pas.</p><span className="quote-rule" /></div>
            <div className="landing-hero-bottom"><span className="landing-hero-heart"><Heart size={17} fill="currentColor" /></span><span><strong>Une rencontre qui vous ressemble</strong><small>Valeurs · Jeux · Projets de vie</small></span></div>
          </div>
          <div className="floating-card floating-card-top landing-glass-card"><span className="float-icon"><Brain size={18} /></span><span><strong>Un défi à deux</strong><small>Et la conversation commence</small></span></div>
          <div className="floating-card floating-card-bottom landing-glass-card"><span className="float-check"><MessageCircleHeart size={17} /></span><span><strong>Une vraie découverte</strong><small>À votre rythme, sans pression</small></span></div>
          <div className="landing-orbit landing-orbit-one" /><div className="landing-orbit landing-orbit-two" />
        </div>
        <div className="hero-bottom"><span>RENCONTRES SÉRIEUSES · JEUX · AFFINITÉS</span><span className="bottom-center">FRANCE & FRANCOPHONIE</span><a href="#concept">DÉCOUVRIR ↓</a></div>
      </section>
      <section className="landing-human section-pad" id="concept" aria-labelledby="landing-human-title">
        <div className="landing-human-copy">
          <div className="section-kicker"><span>01</span> / L’HUMAIN AVANT TOUT</div>
          <h2 id="landing-human-title">Derrière chaque profil,<br /><em>une vraie personne.</em></h2>
          <p>Une histoire, des envies, des valeurs, une personnalité. NAKAHYA vous invite à prendre le temps de découvrir qui se trouve de l’autre côté de l’écran — sans vous perdre dans un défilement sans fin.</p>
          <p className="landing-human-emphasis">On ne cherche pas le profil parfait. On cherche une rencontre qui a du sens.</p>
        </div>
        <div className="landing-human-gallery" aria-label="Des personnes qui partagent un moment ensemble">
          <div className="landing-human-photo landing-human-photo-main" role="img" aria-label="Deux personnes qui partagent un moment complice" />
          <div className="landing-human-photo landing-human-photo-side" role="img" aria-label="Portrait souriant d’une personne" />
          <div className="landing-human-note"><Heart size={17} /> <span>La sincérité commence<br /><strong>par une vraie conversation.</strong></span></div>
        </div>
      </section>
      <section className="landing-how section-pad" id="comment-ca-marche" aria-labelledby="landing-how-title">
        <div className="section-kicker"><span>02</span> / SIMPLE, NATUREL, À VOTRE RYTHME</div>
        <div className="landing-how-heading">
          <h2 id="landing-how-title">Trois étapes.<br /><em>Une vraie rencontre.</em></h2>
          <p>Pas de parcours compliqué. Vous avancez à votre rythme, avec une intention claire.</p>
        </div>
        <div className="landing-how-grid">
          <article><span>01</span><h3>Présentez-vous</h3><p>Parlez de vos centres d’intérêt, de vos valeurs et de ce que vous souhaitez construire.</p></article>
          <article><span>02</span><h3>Découvrez l’autre</h3><p>Les affinités et les petits jeux ouvrent la discussion et facilitent les premiers échanges.</p></article>
          <article><span>03</span><h3>Laissez le lien grandir</h3><p>Discutez, apprenez à vous connaître et voyez si vos envies se rejoignent.</p></article>
        </div>
        <div className="landing-how-cta"><Link href="/inscription" className="button button-green landing-primary-cta">Créer mon profil <ArrowRight size={16} /></Link><span>Gratuit pour commencer · Réservé aux 18 ans et plus</span></div>
      </section>
      <section className="safety section-pad landing-safety" id="securite">
        <div className="safety-visual"><div className="safety-orb"><div className="safety-ring ring-a" /><div className="safety-ring ring-b" /><div className="shield-core"><ShieldCheck size={48} strokeWidth={1.2} /></div><span className="orb-spark spark-a">✳</span><span className="orb-spark spark-b">✦</span></div><div className="safety-stamp"><LockKeyhole size={15} /> LA CONFIANCE AVANT TOUT</div></div>
        <div className="safety-copy"><div className="section-kicker"><span>03</span> / VOTRE TRANQUILLITÉ COMPTE</div><h2>Une rencontre sincère mérite <em>un cadre rassurant.</em></h2><p>La confiance se construit aussi grâce à des informations claires, au respect de la vie privée et à la possibilité de garder le contrôle de ses interactions.</p><ul><li><Check size={16} /> Des informations sur la confidentialité accessibles</li><li><Check size={16} /> Des règles d’utilisation présentées clairement</li><li><Check size={16} /> Des choix de visibilité à comprendre avant de se lancer</li></ul><Link href="/confidentialite" className="text-link">Lire notre politique de confidentialité <ArrowRight size={16} /></Link><p className="fine-print">Consultez les fonctionnalités et paramètres actuellement disponibles dans votre espace avant de partager des informations personnelles.</p></div>
      </section>
      <section className="faq section-pad landing-faq" id="faq"><div className="faq-heading"><div className="section-kicker"><span>04</span> / LES QUESTIONS QUE VOUS VOUS POSEZ</div><h2>Avant de se rencontrer,<br /><em>faisons connaissance.</em></h2><p>Tout commence par la confiance et la transparence.</p></div><div className="faq-list">{faqs.map((f, i) => <details className="faq-item" key={f.q} open={i === 0}><summary><span>{f.q}</span><span className="faq-plus">+</span></summary><p>{f.a}</p></details>)}</div></section>
      <section className="landing-apps" aria-labelledby="landing-apps-title">
        <div className="landing-apps-copy">
          <span className="section-kicker">BIENTÔT DANS VOTRE POCHE</span>
          <h2 id="landing-apps-title">La rencontre continue<br /><em>sur votre téléphone.</em></h2>
          <p>NAKAHYA est conçu pour vous accompagner partout. Les liens officiels des boutiques seront ajoutés dès la publication des applications.</p>
        </div>
        <div className="landing-store-badges" aria-label="Disponibilité mobile à venir">
          <div className="landing-store-badge"><span className="landing-store-icon">●</span><span><small>À VENIR SUR</small><strong>App Store</strong></span></div>
          <div className="landing-store-badge"><span className="landing-store-icon">▶</span><span><small>À VENIR SUR</small><strong>Google Play</strong></span></div>
        </div>
      </section>
      {!currentUser && <NewsletterSignup />}
      <section className="final-cta landing-final-cta"><div className="cta-flower">✳</div><div className="section-kicker">VOTRE HISTOIRE PEUT COMMENCER ICI</div><h2>La bonne rencontre<br />commence parfois <em>par un jeu.</em></h2><p>Faites le premier pas. Le reste se découvre à deux.</p><Link href="/inscription" className="button button-light landing-final-button">Créer mon compte gratuitement <ArrowRight size={17} /></Link><span className="cta-signature">NAKAHYA — La rencontre qui change tout.</span></section>
      <footer className="footer landing-footer"><div className="footer-main"><Link href="/" className="brand brand-footer" aria-label="NAKAHYA, accueil"><span className="brand-mark"><Heart size={19} /></span><span className="brand-word">NAKAHYA<span className="brand-dot">.</span></span></Link><p>Faire connaissance en jouant.<br />Se rapprocher pour ce qui compte.</p><div className="footer-social">FAIT AVEC INTENTION <Heart size={13} /></div></div><div className="footer-links"><div><strong>Découvrir</strong><a href="#concept">Notre approche</a><a href="#comment-ca-marche">Comment ça marche</a><a href="#confiance">Confiance</a><a href="#faq">FAQ</a></div><div><strong>Votre espace</strong><Link href="/inscription">Créer un profil</Link><Link href="/connexion">Connexion</Link></div><div><strong>Informations</strong><Link href="/confidentialite">Confidentialité</Link><Link href="/conditions">Conditions d’utilisation</Link><Link href="/mentions-legales#contact">Contact éditeur</Link></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} NAKAHYA. Tous droits réservés.</span><span>Réservé aux adultes de 18 ans et plus.</span><span>Conçu avec soin, en France.</span></div></footer>
    </main>
  );
}

