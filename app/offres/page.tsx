import Link from "next/link";
import { ArrowLeft, Check, CreditCard, Heart, ShieldCheck, Sparkles, Zap } from "lucide-react";

const freeFeatures = [
  "Profil personnel et centres d’intérêt",
  "Découverte des profils visibles",
  "Jeux et défis de base",
  "Affinités et conversations réciproques",
  "Blocage et signalement des profils",
];
const premiumFeatures = [
  "Tout ce qui est inclus dans Gratuit",
  "Filtres avancés par centres d’intérêt",
  "Voir les personnes qui vous ont envoyé un intérêt",
  "Historique et statistiques de jeux enrichis",
  "Plus de possibilités pour personnaliser vos découvertes",
];

export default function OffersPage() {
  return (
    <main className="pricing-page">
      <header className="pricing-header">
        <Link href="/tableau-de-bord" className="pricing-back"><ArrowLeft size={16}/> Mon espace</Link>
        <Link href="/" className="brand" aria-label="NIKAHYA, accueil"><span className="brand-mark"><Heart size={18}/></span><span className="brand-word">NIKAHYA<span className="brand-dot">.</span></span></Link>
        <span className="pricing-header-note"><ShieldCheck size={14}/> Sans engagement caché</span>
      </header>
      <section className="pricing-content">
        <div className="pricing-intro">
          <div className="section-kicker">PRENDRE LE TEMPS DE SE RENCONTRER</div>
          <h1>La sincérité d’abord.<br/><em>Le bon rythme pour vous.</em></h1>
          <p>NIKAHYA restera utile gratuitement. L’offre Premium est pensée pour celles et ceux qui veulent approfondir leurs découvertes, sans publicité intrusive ni swipe infini.</p>
          <div className="pricing-promise"><ShieldCheck size={17}/> Pas de paiement activé pour le moment : aucun prélèvement n’est possible sur cette page.</div>
        </div>

        <div className="pricing-grid">
          <article className="pricing-card">
            <div className="pricing-plan-icon"><Heart size={19}/></div>
            <p className="pricing-eyebrow">POUR COMMENCER</p>
            <h2>Essentiel</h2>
            <p className="pricing-summary">Une vraie expérience de rencontre, sans payer.</p>
            <div className="pricing-price">0 € <span>/ toujours</span></div>
            <Link href="/tableau-de-bord" className="pricing-cta pricing-cta-secondary">Continuer gratuitement <ArrowLeft size={15}/></Link>
            <ul>{freeFeatures.map(feature => <li key={feature}><Check size={15}/>{feature}</li>)}</ul>
            <p className="pricing-footnote">Le compte gratuit reste utilisable sans limite de durée.</p>
          </article>

          <article className="pricing-card pricing-card-premium">
            <div className="pricing-recommended"><Sparkles size={13}/> POUR ALLER PLUS LOIN</div>
            <div className="pricing-plan-icon"><Zap size={19}/></div>
            <p className="pricing-eyebrow">FORMULE PROPOSÉE</p>
            <h2>Premium</h2>
            <p className="pricing-summary">Plus de clarté sur vos affinités et vos découvertes.</p>
            <div className="pricing-price">9,99 € <span>/ mois</span></div>
            <p className="pricing-annual">Ou 79,99 € / an <strong>soit environ 6,67 € / mois</strong></p>
            <button type="button" className="pricing-cta pricing-cta-primary" disabled aria-describedby="pricing-payment-status">Paiement bientôt disponible</button>
            <ul>{premiumFeatures.map(feature => <li key={feature}><Check size={15}/>{feature}</li>)}</ul>
            <p className="pricing-footnote" id="pricing-payment-status">Tarifs et avantages proposés à titre indicatif. L’intégration sécurisée du paiement et l’activation des avantages Premium sont encore nécessaires.</p>
          </article>
        </div>

        <section className="pricing-values">
          <div><span><ShieldCheck size={18}/></span><strong>Transparence</strong><p>Le prix et la durée seront affichés avant toute validation.</p></div>
          <div><span><Heart size={18}/></span><strong>Pas de pression</strong><p>Les rencontres sérieuses ne doivent pas dépendre d’un compte payant.</p></div>
          <div><span><CreditCard size={18}/></span><strong>Paiement sécurisé</strong><p>Les paiements ne seront ouverts qu’après l’intégration et les tests du prestataire.</p></div>
        </section>
        <p className="pricing-bottom-link"><Link href="/confidentialite">Confidentialité</Link> · <Link href="/tableau-de-bord">Retour à mon espace</Link></p>
      </section>
    </main>
  );
}
