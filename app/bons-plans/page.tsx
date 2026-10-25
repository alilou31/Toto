"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Bike, Coffee, Compass, Heart, Leaf, MapPin, Sparkles, TicketPercent, Utensils, Hotel, SlidersHorizontal } from "lucide-react";

type Budget = "all" | "free" | "small" | "medium";
type Category = "all" | "restaurant" | "activity" | "getaway";
const ideas = [
  { icon: Coffee, category: "restaurant" as const, title: "Un café pour faire connaissance", description: "Un café calme ou un salon de thé pour échanger à votre rythme.", tag: "Petit budget", budget: "small" as const, tone: "lilac" },
  { icon: Utensils, category: "restaurant" as const, title: "Un dîner à deux", description: "Une adresse conviviale pour prolonger une belle conversation.", tag: "Restaurant", budget: "medium" as const, tone: "coral" },
  { icon: Compass, category: "activity" as const, title: "Découvrir un lieu ensemble", description: "Une exposition, un musée ou une visite pour partager une découverte.", tag: "Culture", budget: "small" as const, tone: "cream" },
  { icon: Bike, category: "activity" as const, title: "Bouger et rire à deux", description: "Vélo, mini-golf ou jeu de piste : choisissez selon vos envies.", tag: "Complicité", budget: "medium" as const, tone: "mint" },
  { icon: Leaf, category: "activity" as const, title: "Une promenade à votre rythme", description: "Parc, jardin ou balade : une rencontre simple, sans pression.", tag: "Gratuit", budget: "free" as const, tone: "mint" },
  { icon: Hotel, category: "getaway" as const, title: "Imaginer une escapade", description: "Quand la relation est bien établie, explorez des idées de week-end ensemble.", tag: "À organiser ensemble", budget: "medium" as const, tone: "lilac" },
];
const categoryLabels: Record<Category, string> = { all: "Toutes les idées", restaurant: "Restaurants", activity: "Activités", getaway: "Week-ends" };
const budgetLabels: Record<Budget, string> = { all: "Tous les budgets", free: "Gratuit", small: "Petit budget", medium: "Budget à prévoir" };

export default function BonsPlansPage() {
  const [category, setCategory] = useState<Category>("all");
  const [budget, setBudget] = useState<Budget>("all");
  const filtered = useMemo(() => ideas.filter((idea) =>
    (category === "all" || idea.category === category) &&
    (budget === "all" || idea.budget === budget)
  ), [category, budget]);

  return (
    <main className="bons-plans-page">
      <header className="bons-plans-header">
        <Link href="/tableau-de-bord" className="bons-plans-back">← Mon espace</Link>
        <span className="bons-plans-brand"><Heart size={17} fill="currentColor" /> NAKAHYA</span>
      </header>
      <section className="bons-plans-hero">
        <span className="bons-plans-eyebrow"><TicketPercent size={15} /> VOTRE CARNET D’IDÉES</span>
        <h1>Les bons plans pour <em>se rapprocher.</em></h1>
        <p>Restaurants, activités et escapades : trouvez une idée qui vous ressemble, à votre rythme.</p>
        <div className="bons-plans-hero-note"><Sparkles size={17} /><span>Les réservations ne sont pas encore proposées sur NAKAHYA.</span></div>
      </section>
      <section className="bons-plans-section" aria-label="Découvrir les idées de sorties">
        <div className="bons-plans-section-heading"><div><span className="bons-plans-eyebrow">INSPIRATION</span><h2>À vous de choisir l’ambiance</h2></div><span className="bons-plans-count">{filtered.length} idée{filtered.length > 1 ? "s" : ""}</span></div>
        <div style={{display:"flex", flexWrap:"wrap", gap:12, marginBottom:24, alignItems:"end"}}>
          <label style={{display:"grid", gap:6}}><span><SlidersHorizontal size={14} aria-hidden="true" /> Type de sortie</span>
            <select aria-label="Type de sortie" value={category} onChange={(event) => setCategory(event.target.value as Category)} style={{padding:"10px 12px", borderRadius:10, color:"inherit", background:"var(--background, #151b21)", border:"1px solid currentColor"}}>
              {Object.entries(categoryLabels).map(([value,label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label style={{display:"grid", gap:6}}><span>Budget indicatif</span>
            <select aria-label="Budget indicatif" value={budget} onChange={(event) => setBudget(event.target.value as Budget)} style={{padding:"10px 12px", borderRadius:10, color:"inherit", background:"var(--background, #151b21)", border:"1px solid currentColor"}}>
              {Object.entries(budgetLabels).map(([value,label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
        </div>
        {filtered.length === 0 ? <p role="status">Aucune idée pour ces filtres. Essayez un autre budget ou une autre catégorie.</p> : (
          <div className="bons-plans-grid">
            {filtered.map(({ icon: Icon, category: kind, title, description, tag, tone }) => (
              <article className={`bons-plans-card tone-${tone}`} key={title}>
                <div className="bons-plans-card-top"><span className="bons-plans-card-icon"><Icon size={22} /></span><span className="bons-plans-category">{categoryLabels[kind]}</span></div>
                <h3>{title}</h3><p>{description}</p>
                <div className="bons-plans-card-footer"><span>{tag}</span><MapPin size={15} aria-hidden="true" /></div>
              </article>
            ))}
          </div>
        )}
      </section>
      <section className="bons-plans-bottom">
        <div><span className="bons-plans-eyebrow">À DEUX, C’EST MIEUX</span><h2>Vous avez déjà une affinité ?</h2><p>Proposez une idée simple et laissez la conversation décider de la suite.</p></div>
        <Link href="/matchs" className="bons-plans-cta">Retrouver mes affinités <ArrowRight size={17} /></Link>
      </section>
      <p className="bons-plans-disclaimer">Ces suggestions sont éditoriales : aucun partenariat, tarif, disponibilité ou réservation n’est garanti. Les futurs liens affiliés seront identifiés clairement avant publication. Ne partagez pas de données personnelles avec un prestataire sans nécessité.</p>
    </main>
  );
}
