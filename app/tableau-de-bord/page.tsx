import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Compass, Gamepad2, Heart, UserRound } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let user = null;
  try { user = await getCurrentUser(); } catch { redirect("/connexion"); }
  if (!user) redirect("/connexion");

  return <main className="auth-page"><section className="auth-card auth-card-wide dashboard-card">
    <Link href="/" className="brand auth-brand"><span className="brand-mark"><Heart size={20}/></span><span className="brand-word">NIKAHYA<span className="brand-dot">.</span></span></Link>
    <div className="section-kicker auth-kicker">VOTRE ESPACE PERSONNEL</div>
    <h1 className="auth-title">Bienvenue,<br/><em>votre histoire continue ici.</em></h1>
    <p className="auth-description">Connecté avec {user.email}. Choisissez la prochaine étape qui vous ressemble.</p>
    <div className="dashboard-actions">
      <Link href="/decouvrir" className="dashboard-action dashboard-action-primary"><span className="dashboard-action-icon"><Heart size={22}/></span><span><strong>Commencer à liker</strong><small>Découvrez les profils visibles et manifestez votre intérêt.</small></span><ArrowRight size={18}/></Link>
      <Link href="/jeux" className="dashboard-action"><span className="dashboard-action-icon"><Gamepad2 size={22}/></span><span><strong>Jeux pour faire connaissance</strong><small>Des activités guidées pour lancer la conversation.</small></span><ArrowRight size={18}/></Link>
      <Link href="/profil" className="dashboard-action"><span className="dashboard-action-icon"><UserRound size={22}/></span><span><strong>Mon profil</strong><small>Complétez les informations que vous souhaitez partager.</small></span><ArrowRight size={18}/></Link>
      <Link href="/matchs" className="dashboard-action"><span className="dashboard-action-icon"><Compass size={22}/></span><span><strong>Mes matchs</strong><small>Retrouvez vos rencontres réciproques.</small></span><ArrowRight size={18}/></Link>
    </div>
    <p className="auth-switch"><Link href="/">Retour à l’accueil</Link></p>
  </section></main>;
}
