/* eslint-disable react/no-unescaped-entities */
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Brain, Calculator, Clock3, Heart, Puzzle, Users, Zap } from "lucide-react";
import { GameShell, PageHeading } from "@/app/components/game-shell";

type GameFilter = "all" | "cooperation" | "duel" | "quick";
const filters: { id: GameFilter; label: string }[] = [
  { id: "all", label: "Tous les jeux" },
  { id: "cooperation", label: "Coopération" },
  { id: "duel", label: "Défi 1v1" },
  { id: "quick", label: "Partie rapide" },
];
const games = [
  { id: "mots-croises", name: "Mots croisés à deux", kind: "COOPÉRATIF", time: "5–8 min", desc: "Une grille, deux regards. Chacun apporte ses indices pour compléter les mots ensemble.", icon: Puzzle, tone: "mint", tag: "À deux, c'est plus simple", filter: "cooperation" as GameFilter },
  { id: "enigme", name: "L'énigme partagée", kind: "LOGIQUE", time: "3 min", desc: "Chaque personne possède une partie des indices. La solution naît de votre échange.", icon: Brain, tone: "purple", tag: "Réfléchissez ensemble", filter: "cooperation" as GameFilter },
  { id: "calcul", name: "Sprint de calcul", kind: "SPEED GAME", time: "2 min", desc: "Un petit défi mental amusant pour lancer la conversation avec légèreté.", icon: Calculator, tone: "amber", tag: "Une partie express", filter: "quick" as GameFilter },
  { id: "personnalite", name: "Qui me connaît ?", kind: "PERSONNALITÉ", time: "3 min", desc: "Répondez à des questions légères et utilisez vos choix pour lancer la conversation.", icon: Heart, tone: "pink", tag: "Découvrez vos ressemblances", filter: "quick" as GameFilter },
  { id: "duel", name: "Défi tête-à-tête", kind: "1 CONTRE 1", time: "3–5 min", desc: "Un défi amical où la curiosité compte autant que le résultat.", icon: Zap, tone: "purple", tag: "Le plaisir du défi", filter: "duel" as GameFilter },
  { id: "tournoi", name: "Tournoi amical", kind: "MULTIJOUEUR", time: "Variable", desc: "Lancez une partie à deux dès maintenant. Le tableau de tournoi et les classements communautaires arriveront plus tard.", icon: Users, tone: "mint", tag: "Bientôt en communauté", filter: "duel" as GameFilter },
];

export default function JeuxPage() {
  const [activeFilter, setActiveFilter] = useState<GameFilter>("all");
  const visibleGames = useMemo(
    () => activeFilter === "all" ? games : games.filter((game) => game.filter === activeFilter),
    [activeFilter],
  );

  return (
    <GameShell active="/cockpit/jeux">
      <PageHeading eyebrow="UN JEU PEUT TOUT CHANGER" title={<>À chacun son <em>terrain de jeu.</em></>} description="Choisissez un format, suivez votre curiosité et découvrez l'autre autrement. Rien à prouver : juste le plaisir d'apprendre à se connaître." />
      <div className="game-filter-row" aria-label="Filtrer les jeux">
        <span className="game-filter-label">CHOISIR UN FORMAT</span>
        {filters.map((filter) => (
          <button
            type="button"
            key={filter.id}
            className={"game-filter-chip" + (activeFilter === filter.id ? " active" : "")}
            aria-pressed={activeFilter === filter.id}
            onClick={() => setActiveFilter(filter.id)}
          >
            {filter.label}
          </button>
        ))}
      </div>
      <p className="game-filter-count" role="status">
        {visibleGames.length} {visibleGames.length > 1 ? "jeux disponibles" : "jeu disponible"}
      </p>
      <p className="game-catalog-challenge-cta"><Link className="game-button game-button-secondary" href="/cockpit/defis"><Users size={16} /> Inviter quelqu’un à jouer à deux <ArrowRight size={16} /></Link></p>
      <div className="game-catalog-grid">
        {visibleGames.map(({ icon: Icon, ...game }) => (
          <article className="game-catalog-card" key={game.id}>
            <div className="game-catalog-top">
              <span className={"game-feature-icon " + game.tone}><Icon size={23} /></span>
              <span className="game-card-type">{game.kind}</span>
            </div>
            <span className="game-catalog-tag">{game.tag}</span>
            <h2>{game.name}</h2>
            <p>{game.desc}</p>
            <div className="game-catalog-meta">
              <span><Clock3 size={14} />{game.time}</span>
              <span><Users size={14} />Partie individuelle</span>
            </div>
            <Link className="game-button game-button-primary game-button-full" href={"/cockpit/jeux/" + game.id}>
              Découvrir ce jeu <ArrowRight size={16} />
            </Link>
          </article>
        ))}
      </div>
      <p className="game-disclaimer">Les six modes proposent une partie individuelle de quatre questions. Vous pouvez aussi inviter une autre personne depuis « Défis » : chacun répond à son rythme et la progression se synchronise. Les tableaux de tournoi et classements communautaires restent à venir.</p>
    </GameShell>
  );
}
