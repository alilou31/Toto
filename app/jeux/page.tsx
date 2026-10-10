import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ArrowRight, Brain, Gamepad2, Heart, MessageCircleHeart, Sparkles } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const games = [
  { id: "questions", icon: MessageCircleHeart, name: "Les questions qui rapprochent", kind: "Conversation guidée", description: "Des questions douces puis plus profondes pour découvrir les valeurs, les envies et la vision du couple.", duration: "10–15 min", levels: ["Tous niveaux", "Intermédiaire", "Avancé"] },
  { id: "quiz", icon: Brain, name: "Le quiz des affinités", kind: "Quiz à deux", description: "Répondez à des questions sur vos habitudes et comparez vos réponses pour ouvrir la discussion, sans score qui juge la relation.", duration: "5–10 min", levels: ["Tous niveaux", "Intermédiaire", "Avancé"] },
  { id: "scenario", icon: Sparkles, name: "Et si… ?", kind: "Scénarios de vie", description: "Échangez autour de situations concrètes : projets, communication, quotidien et choix importants.", duration: "10 min", levels: ["Tous niveaux", "Intermédiaire", "Avancé"] },
];

export default async function GamesPage() {
  let user = null;
  try { user = await getCurrentUser(); } catch { redirect("/connexion"); }
  if (!user) redirect("/connexion");

  return <main className="auth-page"><section className="auth-card auth-card-wide games-page-card">
    <Link href="/tableau-de-bord" className="auth-back"><ArrowLeft size={16}/> Mon tableau de bord</Link>
    <Link href="/" className="brand auth-brand"><span className="brand-mark"><Gamepad2 size={20}/></span><span className="brand-word">NIKAHYA<span className="brand-dot">.</span></span></Link>
    <div className="section-kicker auth-kicker">JOUER POUR MIEUX SE CONNAÎTRE</div>
    <h1 className="auth-title">Une partie, une conversation,<br/><em>une vraie découverte.</em></h1>
    <p className="auth-description">Choisissez une activité pour faire connaissance à deux. Pour certains jeux, les membres pourront demander un niveau minimum afin de rejoindre une partie. Les parties en direct et les préférences enregistrées sont encore en cours de développement : rien n’est réservé ni sauvegardé sur cette page.</p>
    <div className="games-grid">{games.map(game => { const Icon = game.icon; return <article className="game-card" key={game.id}>
      <div className="game-card-top"><span className="dashboard-action-icon"><Icon size={22}/></span><span className="game-duration">{game.duration}</span></div>
      <p className="game-kind">{game.kind}</p><h2>{game.name}</h2><p>{game.description}</p>
      <div className="game-levels"><strong>Niveau possible pour la partie</strong><div>{game.levels.map(level => <span key={level}>{level}</span>)}</div></div>
      <button type="button" className="button button-quiet" disabled aria-disabled="true">Bientôt disponible <ArrowRight size={15}/></button>
    </article>; })}</div>
    <div className="games-footer-cta"><span>Envie de commencer par une rencontre ?</span><Link href="/decouvrir" className="button button-green">Découvrir les profils <Heart size={16}/></Link></div>
  </section></main>;
}
