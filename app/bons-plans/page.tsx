"use client";

import Link from "next/link";
import { ArrowRight, Bike, Coffee, Compass, Heart, Leaf, MapPin, Sparkles, TicketPercent } from "lucide-react";

const ideas = [
  { icon: Coffee, category: "Gourmand", title: "Un café qui laisse place à la conversation", description: "Choisissez un café calme, une pâtisserie de quartier ou un salon de thé pour faire connaissance sans pression.", tag: "Simple & chaleureux", tone: "lilac" },
  { icon: Compass, category: "Culture", title: "Découvrir un lieu ensemble", description: "Une exposition, un musée à tarif réduit ou une visite guidée : une découverte commune donne naturellement matière à discuter.", tag: "Curiosité partagée", tone: "coral" },
  { icon: Bike, category: "Activités", title: "Bouger et rire à deux", description: "Balade à vélo, mini-golf, jeu de piste ou activité associative : privilégiez une expérience adaptée à vos envies.", tag: "Complicité", tone: "cream" },
  { icon: Leaf, category: "Plein air", title: "Une promenade qui change du quotidien", description: "Parc, jardin, marché local ou sentier facile : une idée accessible pour discuter à votre rythme.", tag: "Petit budget", tone: "mint" },
];

export default function BonsPlansPage() {
  return (
    <main className="bons-plans-page">
      <header className="bons-plans-header">
        <Link href="/tableau-de-bord" className="bons-plans-back">← Mon espace</Link>
        <span className="bons-plans-brand"><Heart size={17} fill="currentColor" /> NAKAHYA</span>
      </header>
      <section className="bons-plans-hero">
        <span className="bons-plans-eyebrow"><TicketPercent size={15} /> VOTRE CARNET D’IDÉES</span>
        <h1>Les bons plans pour <em>se rapprocher.</em></h1>
        <p>Des idées de sorties et d’activités pour faire connaissance autrement, sans se ruiner ni se mettre la pression.</p>
        <div className="bons-plans-hero-note"><Sparkles size={17} /><span>Le meilleur bon plan : une activité qui vous ressemble à tous les deux.</span></div>
      </section>
      <section className="bons-plans-section">
        <div className="bons-plans-section-heading"><div><span className="bons-plans-eyebrow">INSPIRATION</span><h2>À vous de choisir l’ambiance</h2></div><span className="bons-plans-count">4 idées pour commencer</span></div>
        <div className="bons-plans-grid">
          {ideas.map(({ icon: Icon, category, title, description, tag, tone }) => (
            <article className={`bons-plans-card tone-${tone}`} key={category}>
              <div className="bons-plans-card-top"><span className="bons-plans-card-icon"><Icon size={22} /></span><span className="bons-plans-category">{category}</span></div>
              <h3>{title}</h3><p>{description}</p>
              <div className="bons-plans-card-footer"><span>{tag}</span><MapPin size={15} aria-hidden="true" /></div>
            </article>
          ))}
        </div>
      </section>
      <section className="bons-plans-bottom">
        <div><span className="bons-plans-eyebrow">À DEUX, C’EST MIEUX</span><h2>Vous avez déjà une affinité ?</h2><p>Proposez une idée simple et laissez la conversation décider de la suite.</p></div>
        <Link href="/matchs" className="bons-plans-cta">Retrouver mes affinités <ArrowRight size={17} /></Link>
      </section>
      <p className="bons-plans-disclaimer">Ces suggestions sont des idées d’activités, pas des offres commerciales partenaires vérifiées. Les tarifs et disponibilités sont à confirmer auprès des lieux choisis.</p>
    </main>
  );
}
