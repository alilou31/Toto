import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3, Heart, ShieldCheck } from "lucide-react";
import "./success.css";

export default function SubscriptionSuccessPage() {
  return (
    <main className="subscription-return-page">
      <section className="subscription-return-card" aria-labelledby="subscription-return-title">
        <Link href="/" className="subscription-return-brand" aria-label="NAKAHYA, accueil">
          <span className="subscription-return-mark"><Heart size={19} /></span>
          <span>NAKAHYA<span className="subscription-return-dot">.</span></span>
        </Link>
        <div className="subscription-return-icon"><CheckCircle2 size={30} /></div>
        <p className="subscription-return-kicker">RETOUR DE PAIEMENT</p>
        <h1 id="subscription-return-title">Merci, vous êtes presque arrivé.</h1>
        <p className="subscription-return-lead">
          Votre retour depuis Stripe a bien été reçu. Nous devons encore vérifier
          la confirmation du paiement avant d’activer votre abonnement.
        </p>
        <div className="subscription-return-status" role="status">
          <Clock3 size={19} />
          <span><strong>Vérification en attente</strong>Les avantages Premium ou Élite ne sont pas activés par cette page seule.</span>
        </div>
        <p className="subscription-return-note">
          Pour votre sécurité, seul le serveur NAKAHYA peut confirmer un abonnement
          à partir d’une notification Stripe authentifiée. Ne relancez pas le paiement
          si vous avez déjà été débité.
        </p>
        <Link href="/tableau-de-bord" className="subscription-return-cta">
          Retourner à mon espace <ArrowRight size={17} />
        </Link>
        <p className="subscription-return-security"><ShieldCheck size={15} /> Paiement et droits contrôlés côté serveur</p>
      </section>
    </main>
  );
}
