import Link from "next/link";
import { ArrowLeft, Check, CreditCard, Gift, Heart, LockKeyhole, ShieldCheck, Sparkles, Zap } from "lucide-react";

const freeFeatures = [
  "Profil personnel et découverte de tous les profils sans filtre",
  "Likes, Pass et matchs réciproques",
  "Jeux individuels et défis de base",
  "Réception des matchs et consultation des profils",
  "Blocage et signalement des profils",
  "Aucun message texte, photo, vidéo ou audio",
];
const premiumFeatures = [
  "Tous les avantages Découverte",
  "Messagerie privée après match",
  "Échange de photos, vidéos et messages audio",
  "Jusqu’à 6 photos de profil et vidéo de présentation",
  "Filtres avancés et historique des likes reçus",
  "Invitations de sortie et disponibilités avancées",
  "Statistiques de jeux et compatibilité enrichies",
];
const eliteFeatures = [
  "Tous les avantages Premium",
  "Jusqu’à 9 photos et présentation vidéo enrichie",
  "Priorité de visibilité dans les profils disponibles",
  "Filtres et suggestions de compatibilité avancés",
  "Club NAKAHYA : offres partenaires exclusives",
  "Codes d’achat et codes promotionnels réservés Élite",
  "Avantages privilégiés restaurants, loisirs et week-ends",
  "Accès anticipé aux nouveautés",
];
function Features({ items }: { items: string[] }) { return <ul>{items.map(feature => <li key={feature}><Check size={15}/>{feature}</li>)}</ul>; }

export default function OffersPage() {
  return <main className="pricing-page">
    <header className="pricing-header">
      <Link href="/tableau-de-bord" className="pricing-back"><ArrowLeft size={16}/> Mon espace</Link>
      <Link href="/" className="brand" aria-label="NAKAHYA, accueil"><span className="brand-mark"><Heart size={18}/></span><span className="brand-word">NAKAHYA<span className="brand-dot">.</span></span></Link>
      <span className="pricing-header-note"><ShieldCheck size={14}/> Sans engagement caché</span>
    </header>
    <section className="pricing-content">
      <div className="pricing-intro">
        <div className="section-kicker">PRENDRE LE TEMPS DE SE RENCONTRER</div>
        <h1>Un match pour commencer.<br/><em>Une rencontre pour aller plus loin.</em></h1>
        <p>Découvrez les profils gratuitement. Les échanges privés, les médias et les invitations sont réservés aux membres abonnés, dans un cadre clair et réciproque.</p>
        <div className="pricing-promise"><ShieldCheck size={17}/> Paiement non activé : aucun prélèvement n’est possible pour le moment.</div>
      </div>
      <div className="pricing-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", alignItems: "stretch" }}>
        <article className="pricing-card pricing-card-free">
          <div className="pricing-plan-icon"><Heart size={19}/></div><p className="pricing-eyebrow">POUR DÉCOUVRIR</p><h2>Découverte</h2>
          <p className="pricing-summary">Faites des likes et créez des matchs, sans messagerie.</p><div className="pricing-price">0 € <span>/ toujours</span></div>
          <Link href="/tableau-de-bord" className="pricing-cta pricing-cta-secondary">Continuer gratuitement <ArrowLeft size={15}/></Link>
          <Features items={freeFeatures}/><p className="pricing-footnote">Les matchs restent visibles. Aucun échange privé n’est possible avec le compte gratuit.</p>
        </article>
        <article className="pricing-card pricing-card-premium">
          <div className="pricing-recommended"><Sparkles size={13}/> LE PLUS ÉQUILIBRÉ</div><div className="pricing-plan-icon"><Zap size={19}/></div>
          <p className="pricing-eyebrow">POUR APPROFONDIR</p><h2>Premium</h2><p className="pricing-summary">Passez du match à la conversation.</p>
          <div className="pricing-price">19,99 € <span>/ mois</span></div><p className="pricing-annual">Ou 179,90 € / an <strong>soit environ 14,99 € / mois</strong></p>
          <button type="button" className="pricing-cta pricing-cta-primary" disabled aria-describedby="pricing-payment-status">Abonnement bientôt disponible</button>
          <Features items={premiumFeatures}/><p className="pricing-footnote" id="pricing-payment-status">Tarif proposé. Le paiement et l’activation automatique des abonnements restent à intégrer.</p>
        </article>
        <article className="pricing-card pricing-card-elite" style={{ border: "1px solid #b88b45", background: "linear-gradient(160deg, rgba(184,139,69,.12), transparent 45%)" }}>
          <div className="pricing-recommended"><Gift size={13}/> CLUB EXCLUSIF</div><div className="pricing-plan-icon" style={{ color: "#a87828" }}><LockKeyhole size={19}/></div>
          <p className="pricing-eyebrow">EXPÉRIENCE PRIVILÉGIÉE</p><h2>Élite</h2><p className="pricing-summary">Rencontres, sorties et avantages partenaires.</p>
          <div className="pricing-price">29,99 € <span>/ mois</span></div><p className="pricing-annual">Ou 269,90 € / an <strong>soit environ 22,49 € / mois</strong></p>
          <button type="button" className="pricing-cta pricing-cta-primary" style={{ background: "#9a6a20", borderColor: "#9a6a20" }} disabled>Abonnement bientôt disponible</button>
          <Features items={eliteFeatures}/><p className="pricing-footnote">Les codes et réductions seront activés au fur et à mesure de la contractualisation des partenaires. Aucune remise fictive n’est promise.</p>
        </article>
      </div>
      <section className="pricing-values">
        <div><span><ShieldCheck size={18}/></span><strong>Réciprocité</strong><p>Les échanges privés sont débloqués uniquement lorsque les deux membres ont un abonnement actif.</p></div>
        <div><span><Heart size={18}/></span><strong>Rencontres d’abord</strong><p>Un compte gratuit peut découvrir, liker et matcher, sans être obligé de payer pour consulter ses matchs.</p></div>
        <div><span><CreditCard size={18}/></span><strong>Transparence</strong><p>Les paiements ne seront ouverts qu’après intégration et tests du prestataire.</p></div>
      </section>
      <p className="pricing-bottom-link"><Link href="/confidentialite">Confidentialité</Link> · <Link href="/tableau-de-bord">Retour à mon espace</Link></p>
    </section>
  </main>;
}
