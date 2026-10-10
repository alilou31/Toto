import Link from "next/link";
import { ArrowDown, ArrowRight, Check, Heart, LockKeyhole, ShieldCheck, Sparkles, UsersRound, Menu } from "lucide-react";

const values = [
  { icon: Heart, title: "Des intentions claires", text: "Rencontrez des personnes qui savent ce qu’elles recherchent, dans le respect du rythme de chacun." },
  { icon: Sparkles, title: "Une compatibilité qui a du sens", text: "Explorez les valeurs, les envies et les projets de vie qui peuvent vous rapprocher." },
  { icon: LockKeyhole, title: "Votre vie privée, vos règles", text: "Gardez le contrôle sur vos informations et choisissez ce que vous souhaitez partager." },
];

const steps = [
  { number: "01", title: "Racontez votre histoire", text: "Créez un profil qui vous ressemble et partagez ce qui compte vraiment pour vous." },
  { number: "02", title: "Découvrez l’essentiel", text: "Explorez des profils selon vos préférences et des critères de compatibilité explicables." },
  { number: "03", title: "Laissez le lien se créer", text: "Échangez à votre rythme, avec des outils pensés pour des conversations sereines." },
];

const faqs = [
  { q: "À qui s’adresse NIKAHYA ?", a: "NIKAHYA est conçu pour les adultes de 18 ans et plus qui souhaitent construire une relation sérieuse, avec une attention particulière portée aux intentions et aux valeurs." },
  { q: "Mes informations personnelles sont-elles publiques ?", a: "Non. Les informations privées comme votre e-mail et votre date de naissance complète ne sont pas destinées à être affichées sur votre profil. Vous gardez la main sur la visibilité des informations que vous partagez." },
  { q: "Comment fonctionne la compatibilité ?", a: "Les suggestions peuvent s’appuyer sur les préférences que vous renseignez volontairement. Un score éventuel est indicatif, explicable et ne garantit jamais la réussite d’une relation." },
  { q: "Puis-je signaler ou bloquer un profil ?", a: "La sécurité doit rester accessible à chaque étape. Les outils de signalement et de blocage font partie des fonctionnalités prévues au cœur du produit." },
];

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <Link href="/" className="brand" aria-label="NIKAHYA, accueil">
          <span className="brand-mark"><Heart size={20} strokeWidth={2.1} /></span>
          <span className="brand-word">NIKAHYA<span className="brand-dot">.</span></span>
        </Link>
        <nav className="desktop-nav" aria-label="Navigation principale">
          <a href="#concept">Le concept</a><a href="#methode">Comment ça marche</a><a href="#securite">Sécurité</a>
        </nav>
        <div className="header-actions">
          <Link href="/connexion" className="login-link">Connexion</Link>
          <Link href="/demo" className="login-link">Essayer la démo</Link><Link href="/inscription" className="button button-dark button-small">Créer mon profil <ArrowRight size={15}/></Link>
        </div>
        <button className="mobile-menu" aria-label="Menu"><Menu size={23}/></button>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-line"/> POUR LES HISTOIRES QUI COMPTENT</div>
          <h1>Et si votre prochaine rencontre <em>était la bonne&nbsp;?</em></h1>
          <p className="hero-lede">Une belle histoire commence bien avant le premier message. Rencontrez des personnes qui partagent vos intentions, vos valeurs et votre vision de l’avenir.</p>
          <div className="hero-actions">
            <Link href="/inscription" className="button button-green">Trouver ma moitié <ArrowRight size={17}/></Link>
            <a href="#concept" className="button button-quiet">Découvrir le concept <ArrowDown size={16}/></a>
          </div>
          <div className="hero-note"><span className="note-icon"><ShieldCheck size={17}/></span><span>Un espace pensé pour la sincérité.<br/><strong>Vos choix, votre rythme, votre histoire.</strong></span></div>
        </div>
        <div className="hero-visual" aria-label="Illustration chaleureuse d'une rencontre au coucher du soleil">
          <div className="photo-frame">
            <div className="photo-overlay"/>
            <div className="photo-topline"><span className="live-dot"/> UNE AUTRE FAÇON DE SE RENCONTRER</div>
            <div className="photo-quote"><span className="quote-mark">“</span><p>Les plus belles histoires commencent quand on se comprend vraiment.</p><span className="quote-rule"/></div>
            <div className="photo-caption"><span className="caption-symbol"><Heart size={18} fill="currentColor"/></span><span><strong>La rencontre qui change tout.</strong><small>Et si tout commençait ici&nbsp;?</small></span></div>
          </div>
          <div className="floating-card floating-card-top"><span className="float-icon"><UsersRound size={17}/></span><span><strong>Ce qui vous rapproche</strong><small>Des valeurs, des projets, des envies</small></span></div>
          <div className="floating-card floating-card-bottom"><span className="float-check"><Check size={16}/></span><span><strong>À votre rythme</strong><small>Une connexion, jamais une pression</small></span></div>
          <div className="hero-orbit orbit-one"/><div className="hero-orbit orbit-two"/>
        </div>
        <div className="hero-bottom"><span>UNE RENCONTRE PLUS INTENTIONNELLE</span><span className="bottom-center">FRANCE · FRANCOPHONIE</span><a href="#concept">EN SAVOIR PLUS ↓</a></div>
      </section>

      <section className="intro section-pad" id="concept">
        <div className="section-kicker"><span>01</span> / UNE RENCONTRE QUI A DU SENS</div>
        <div className="intro-grid"><h2>Moins de défilement.<br/><em>Plus de profondeur.</em></h2><div className="intro-copy"><p>Et si vous preniez le temps de découvrir la personne derrière le profil&nbsp;? NIKAHYA place les intentions, les valeurs et les projets de vie au cœur de la rencontre.</p><p className="muted">Pas de promesses irréalistes. Juste un espace pour faire connaissance avec attention, respect et authenticité.</p></div></div>
        <div className="value-grid">{values.map(({icon:Icon,title,text},i)=><article className="value-card" key={title}><div className="value-top"><span className="value-icon"><Icon size={21}/></span><span className="card-number">0{i+1}</span></div><h3>{title}</h3><p>{text}</p><span className="value-line"/></article>)}</div>
      </section>

      <section className="method section-pad" id="methode">
        <div className="method-heading"><div className="section-kicker"><span>02</span> / SIMPLEMENT, SINCÈREMENT</div><h2>Une belle histoire,<br/><em>pas à pas.</em></h2><p>La bonne rencontre n’a pas besoin d’être compliquée.</p></div>
        <div className="steps">{steps.map((s,i)=><article className="step" key={s.number}><div className="step-top"><span>{s.number}</span>{i<2&&<span className="step-connector"/>}</div><h3>{s.title}</h3><p>{s.text}</p></article>)}</div>
        <div className="method-cta"><span>Prêt·e à écrire la suite&nbsp;?</span><Link href="/inscription" className="button button-light">Créer mon profil <ArrowRight size={16}/></Link></div>
      </section>

      <section className="safety section-pad" id="securite">
        <div className="safety-visual"><div className="safety-orb"><div className="safety-ring ring-a"/><div className="safety-ring ring-b"/><div className="shield-core"><ShieldCheck size={48} strokeWidth={1.2}/></div><span className="orb-spark spark-a">✳</span><span className="orb-spark spark-b">✦</span></div><div className="safety-stamp"><LockKeyhole size={15}/> LA CONFIANCE AVANT TOUT</div></div>
        <div className="safety-copy"><div className="section-kicker"><span>03</span> / VOTRE TRANQUILLITÉ COMPTE</div><h2>La confiance n’est pas une option. <em>C’est le début.</em></h2><p>Une rencontre sincère mérite un cadre rassurant. La confidentialité et la sécurité guident la conception de NIKAHYA, dès les premiers choix du produit.</p><ul><li><Check size={16}/> Contrôle de la visibilité de vos informations</li><li><Check size={16}/> Outils de blocage et de signalement prévus au cœur du service</li><li><Check size={16}/> Des pratiques transparentes sur vos données</li></ul><a href="#faq" className="text-link">Nos engagements, en toute transparence <ArrowRight size={16}/></a><p className="fine-print">Les fonctionnalités de sécurité sont en cours de construction. Les vérifications de profils ne seront signalées comme effectives qu’après un contrôle réel.</p></div>
      </section>

      <section className="faq section-pad" id="faq"><div className="faq-heading"><div className="section-kicker"><span>04</span> / BON À SAVOIR</div><h2>Vos questions,<br/><em>nos réponses.</em></h2><p>La transparence fait aussi partie de la rencontre.</p></div><div className="faq-list">{faqs.map((f,i)=><details className="faq-item" key={f.q} open={i===0}><summary><span>{f.q}</span><span className="faq-plus">+</span></summary><p>{f.a}</p></details>)}</div></section>

      <section className="final-cta"><div className="cta-flower">✳</div><div className="section-kicker">VOTRE HISTOIRE PEUT COMMENCER ICI</div><h2>Et si le plus beau<br/>restait <em>à venir&nbsp;?</em></h2><p>Faites le premier pas vers une rencontre qui vous ressemble.</p><Link href="/demo" className="button button-light">Essayer la démo <ArrowRight size={17}/></Link><span className="cta-signature">NIKAHYA — La rencontre qui change tout.</span></section>

      <footer className="footer"><div className="footer-main"><Link href="/" className="brand brand-footer"><span className="brand-mark"><Heart size={19}/></span><span className="brand-word">NIKAHYA<span className="brand-dot">.</span></span></Link><p>Les rencontres qui commencent<br/>par ce qui compte vraiment.</p><div className="footer-social">FAIT AVEC INTENTION <Heart size={13}/></div></div><div className="footer-links"><div><strong>Découvrir</strong><a href="#concept">Notre concept</a><a href="#methode">Comment ça marche</a><a href="#securite">Sécurité</a></div><div><strong>Votre espace</strong><Link href="/inscription">Créer un profil</Link><Link href="/connexion">Connexion</Link><Link href="/demo">Démo interactive</Link><Link href="/validation">Banc de tests</Link></div><div><strong>Informations</strong><a href="/confidentialite">Confidentialité</a><a href="/conditions">Conditions d’utilisation</a><a href="mailto:contact@nikahya.fr">Nous contacter</a></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} NIKAHYA. Tous droits réservés.</span><span>Réservé aux adultes de 18 ans et plus.</span><span>Conçu avec soin, en France.</span></div></footer>
    </main>
  );
}
