import type { Metadata } from "next";
import Link from "next/link";
import HomeHeader from "@/app/components/home-header";
import { ArrowRight, ArrowDown, Brain, Heart, LockKeyhole, ShieldCheck, Check, MessageCircleHeart } from "lucide-react";

const values = [
  { icon: Heart, title: "Des intentions qui se rencontrent", text: "Faites connaissance avec des adultes qui souhaitent construire une relation sincère et durable." },
  { icon: Brain, title: "Le jeu révèle la personnalité", text: "Énigmes, défis et questions ouvrent la conversation et révèlent vos façons de penser." },
  { icon: LockKeyhole, title: "À votre rythme, en confiance", text: "Prenez le temps de découvrir l’autre. Vos informations personnelles méritent du respect." },
];
const steps = [
  { number: "01", title: "Un profil qui vous ressemble", text: "Partagez vos centres d’intérêt, vos valeurs et ce que vous espérez construire à deux." },
  { number: "02", title: "Jouez pour faire connaissance", text: "Répondez à une question, résolvez une énigme ou relevez un défi ensemble." },
  { number: "03", title: "Laissez la complicité grandir", text: "Poursuivez la discussion et découvrez si vos envies et vos projets se rejoignent." },
];
const games = [
  { icon: "✳", tone: "lavender", type: "COOPÉRATION", title: "Mots croisés à deux", text: "Mettez vos idées en commun et découvrez votre façon de réfléchir ensemble.", duration: "5–8 MIN" },
  { icon: "?", tone: "peach", type: "CURIOSITÉ", title: "L’énigme partagée", text: "Croisez vos indices, confrontez vos intuitions et trouvez la solution à deux.", duration: "3 MIN" },
  { icon: "♡", tone: "mint", type: "CONNEXION", title: "Les questions complices", text: "Parlez de vos goûts, de vos rêves et de ce qui compte vraiment pour vous.", duration: "À VOTRE RYTHME" },
];
const faqs = [
  { q: "À qui s’adresse NIKAHYA ?", a: "NIKAHYA s’adresse aux adultes de 18 ans et plus qui souhaitent une relation sérieuse et veulent prendre le temps de découvrir une personne au-delà de son apparence." },
  { q: "Pourquoi faire connaissance en jouant ?", a: "Un jeu partagé donne un point de départ naturel à la conversation. Il permet de découvrir les façons de réfléchir, les centres d’intérêt et le sens de l’humour, sans prétendre résumer une personne à un score." },
  { q: "Est-ce une application de rencontre sérieuse ?", a: "Oui, NIKAHYA est pensé pour des rencontres intentionnelles : les jeux facilitent les premiers échanges, tandis que les valeurs, les intentions et les projets de vie restent au centre." },
  { q: "Mes informations personnelles sont-elles publiques ?", a: "Votre adresse e-mail et votre date de naissance complète ne sont pas destinées à être affichées sur votre profil. La page de confidentialité publiée est encore en cours de finalisation et doit préciser les données traitées, les durées de conservation et vos droits." },
  { q: "Puis-je bloquer ou signaler un profil ?", a: "Oui. Depuis la page Découvrir, vous pouvez bloquer un profil ou envoyer un signalement en choisissant une catégorie et en ajoutant, si besoin, des détails. Si une interaction vous met mal à l’aise, interrompez-la et utilisez ces outils." },
];
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://nikahya.rassoul-ali.workers.dev").replace(/\/$/, "");

export const metadata: Metadata = {
  title: "Rencontres sérieuses : faites connaissance en jouant",
  description: "Envie d’une relation sérieuse ? Découvrez NIKAHYA, l’application de rencontre qui vous aide à faire connaissance grâce aux jeux, aux affinités, aux valeurs et aux projets de vie.",
  alternates: { canonical: "/" },
};

export default function Home() {
  const structuredData = [
    { "@context": "https://schema.org", "@type": "Organization", name: "NIKAHYA", url: siteUrl, description: "NIKAHYA aide les adultes qui recherchent une relation sérieuse à faire connaissance grâce aux jeux, aux centres d’intérêt et aux conversations." },
    { "@context": "https://schema.org", "@type": "WebSite", name: "NIKAHYA", url: siteUrl, inLanguage: "fr-FR", description: "L’application de rencontre sérieuse pour faire connaissance en jouant." },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
  ];
  return (
    <main className="landing-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <HomeHeader />
      <section className="hero landing-hero" aria-labelledby="landing-title">
        <div className="hero-copy landing-hero-copy">
          <div className="eyebrow"><span className="eyebrow-line" /> LA RENCONTRE, AUTREMENT</div>
          <h1 id="landing-title">Et si vous trouviez la bonne personne <em>en jouant&nbsp;?</em></h1>
          <p className="hero-lede">Une énigme pour briser la glace. Un jeu pour se découvrir. Une conversation pour voir si vos chemins peuvent se rejoindre. <strong>Avec NIKAHYA, la rencontre sérieuse commence par la complicité.</strong></p>
          <div className="hero-actions landing-hero-actions">
            <Link href="/inscription" className="button button-green landing-primary-cta">Faire le premier pas <ArrowRight size={17} /></Link>
            <Link href="/demo" className="button button-quiet landing-secondary-cta">Voir comment ça marche <ArrowDown size={16} /></Link>
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
      <section className="intro section-pad landing-intro" id="concept">
        <div className="section-kicker"><span>01</span> / UNE RENCONTRE QUI A DU SENS</div>
        <div className="intro-grid"><h2>Moins de swipe.<br /><em>Plus de complicité.</em></h2><div className="intro-copy"><p>Un profil ne raconte jamais toute une personne. Chez NIKAHYA, les jeux deviennent un prétexte pour échanger, rire, réfléchir ensemble et découvrir ce qui vous rapproche.</p><p className="muted">Parce qu’une relation durable se construit sur plus qu’une photo : les intentions, les valeurs, les centres d’intérêt et les projets de vie comptent aussi.</p></div></div>
        <div className="value-grid">{values.map(({ icon: Icon, title, text }, i) => <article className="value-card landing-glass-value" key={title}><div className="value-top"><span className="value-icon"><Icon size={21} /></span><span className="card-number">0{i + 1}</span></div><h3>{title}</h3><p>{text}</p><span className="value-line" /></article>)}</div>
      </section>
      <section className="games-showcase section-pad landing-games" id="jeux">
        <div className="section-kicker"><span>02</span> / LE JEU COMME PREMIER LIEN</div>
        <div className="games-showcase-heading"><h2>Jouez pour vous découvrir.<br /><em>Restez pour ce qui vous lie.</em></h2><p>Pas besoin d’être un champion. Juste d’être curieux, sincère et prêt à découvrir une autre personne.</p></div>
        <div className="landing-game-grid">{games.map((game) => <article className="landing-game-card landing-glass-game" key={game.title}><span className={"landing-game-icon " + game.tone}>{game.icon}</span><span className="landing-game-type">{game.type}</span><h3>{game.title}</h3><p>{game.text}</p><span className="landing-game-time">{game.duration} · À DEUX</span></article>)}</div>
        <div className="games-showcase-cta"><span>Le but n’est pas de gagner. C’est de mieux se connaître.</span><Link href="/demo" className="button button-green landing-primary-cta">Découvrir l’expérience <ArrowRight size={16} /></Link></div>
      </section>
      <section className="method section-pad landing-method" id="methode">
        <div className="method-heading"><div className="section-kicker"><span>03</span> / SIMPLEMENT, SINCÈREMENT</div><h2>Une belle histoire,<br /><em>pas à pas.</em></h2><p>La bonne rencontre n’a pas besoin d’être compliquée.</p></div>
        <div className="steps">{steps.map((s, i) => <article className="step" key={s.number}><div className="step-top"><span>{s.number}</span>{i < 2 && <span className="step-connector" />}</div><h3>{s.title}</h3><p>{s.text}</p></article>)}</div>
        <div className="method-cta"><span>Prêt·e à faire une rencontre qui a du sens&nbsp;?</span><Link href="/inscription" className="button button-light">Créer mon profil <ArrowRight size={16} /></Link></div>
      </section>
      <section className="safety section-pad landing-safety" id="securite">
        <div className="safety-visual"><div className="safety-orb"><div className="safety-ring ring-a" /><div className="safety-ring ring-b" /><div className="shield-core"><ShieldCheck size={48} strokeWidth={1.2} /></div><span className="orb-spark spark-a">✳</span><span className="orb-spark spark-b">✦</span></div><div className="safety-stamp"><LockKeyhole size={15} /> LA CONFIANCE AVANT TOUT</div></div>
        <div className="safety-copy"><div className="section-kicker"><span>04</span> / VOTRE TRANQUILLITÉ COMPTE</div><h2>Une rencontre sincère mérite <em>un cadre rassurant.</em></h2><p>La confiance se construit aussi grâce à des informations claires, au respect de la vie privée et à la possibilité de garder le contrôle de ses interactions.</p><ul><li><Check size={16} /> Des informations sur la confidentialité accessibles</li><li><Check size={16} /> Des règles d’utilisation présentées clairement</li><li><Check size={16} /> Des choix de visibilité à comprendre avant de se lancer</li></ul><Link href="/confidentialite" className="text-link">Lire notre politique de confidentialité <ArrowRight size={16} /></Link><p className="fine-print">Consultez les fonctionnalités et paramètres actuellement disponibles dans votre espace avant de partager des informations personnelles.</p></div>
      </section>
      <section className="faq section-pad landing-faq" id="faq"><div className="faq-heading"><div className="section-kicker"><span>05</span> / LES QUESTIONS QUE VOUS VOUS POSEZ</div><h2>Avant de se rencontrer,<br /><em>faisons connaissance.</em></h2><p>Tout commence par la confiance et la transparence.</p></div><div className="faq-list">{faqs.map((f, i) => <details className="faq-item" key={f.q} open={i === 0}><summary><span>{f.q}</span><span className="faq-plus">+</span></summary><p>{f.a}</p></details>)}</div></section>
      <section className="final-cta landing-final-cta"><div className="cta-flower">✳</div><div className="section-kicker">VOTRE HISTOIRE PEUT COMMENCER ICI</div><h2>La bonne rencontre<br />commence parfois <em>par un jeu.</em></h2><p>Faites le premier pas. Le reste se découvre à deux.</p><Link href="/inscription" className="button button-light landing-final-button">Créer mon compte gratuitement <ArrowRight size={17} /></Link><span className="cta-signature">NIKAHYA — La rencontre qui change tout.</span></section>
      <footer className="footer landing-footer"><div className="footer-main"><Link href="/" className="brand brand-footer" aria-label="NIKAHYA, accueil"><span className="brand-mark"><Heart size={19} /></span><span className="brand-word">NIKAHYA<span className="brand-dot">.</span></span></Link><p>Faire connaissance en jouant.<br />Se rapprocher pour ce qui compte.</p><div className="footer-social">FAIT AVEC INTENTION <Heart size={13} /></div></div><div className="footer-links"><div><strong>Découvrir</strong><a href="#concept">Notre concept</a><a href="#jeux">Les jeux</a><a href="#methode">Comment ça marche</a><a href="#securite">Confidentialité</a></div><div><strong>Votre espace</strong><Link href="/inscription">Créer un profil</Link><Link href="/connexion">Connexion</Link><Link href="/demo">Découvrir la démo</Link></div><div><strong>Informations</strong><Link href="/confidentialite">Confidentialité</Link><Link href="/conditions">Conditions d’utilisation</Link><a href="mailto:contact@nikahya.fr">Nous contacter</a></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} NIKAHYA. Tous droits réservés.</span><span>Réservé aux adultes de 18 ans et plus.</span><span>Conçu avec soin, en France.</span></div></footer>
    </main>
  );
}
