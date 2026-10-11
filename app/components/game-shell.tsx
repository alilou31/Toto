import Link from "next/link";
import { Activity, Brain, ChartNoAxesCombined, CircleUserRound, Compass, Gamepad2, Heart, History, House, MessagesSquare, ShieldCheck, Sparkles, Swords, Users, Eye } from "lucide-react";

const navigation = [
  { href: "/cockpit", label: "Mon cockpit", icon: House },
  { href: "/cockpit/jeux", label: "Explorer les jeux", icon: Gamepad2 },
  { href: "/cockpit/defis", label: "Mes défis", icon: Swords },
  { href: "/cockpit/likes", label: "Likes & matchs", icon: Heart },
  { href: "/cockpit/visites", label: "Visites", icon: Eye },
  { href: "/cockpit/historique", label: "Historique", icon: History },
  { href: "/profil", label: "Mon profil", icon: CircleUserRound },
];

export function GameShell({ children, active = "/cockpit" }: { children: React.ReactNode; active?: string }) {
  return <div className="game-app">
    <aside className="game-sidebar">
      <Link href="/" className="game-brand"><span className="game-brand-mark"><Heart size={19} fill="currentColor"/></span><span>NIKAHYA<span className="game-brand-dot">.</span><small>SE RENCONTRER AUTREMENT</small></span></Link>
      <p className="game-nav-label">VOTRE ESPACE</p>
      <nav aria-label="Navigation principale">{navigation.map(({href,label,icon:Icon})=><Link key={href} href={href} aria-current={active===href?"page":undefined} className="game-nav-link"><Icon size={18}/><span>{label}</span></Link>)}</nav>
      <div className="game-sidebar-bottom"><div className="game-safety"><ShieldCheck size={18}/><span><strong>Un espace bienveillant</strong><small>Votre rythme, vos règles.</small></span></div><Link href="/" className="game-back-home">← Retour au site</Link></div>
    </aside>
    <div className="game-main"><header className="game-topbar"><div className="game-breadcrumb">Votre espace <span>/</span> <strong>{navigation.find(n=>n.href===active)?.label ?? "Découvrir"}</strong></div><div className="game-top-actions"><span className="game-level-chip"><Sparkles size={15}/> Niveau 1</span><Link href="/profil" className="game-avatar" aria-label="Modifier mon profil">N</Link></div></header><main className="game-content">{children}</main><nav className="game-mobile-nav" aria-label="Navigation mobile">{navigation.slice(0,5).map(({href,label,icon:Icon})=><Link key={href} href={href} aria-current={active===href?"page":undefined} aria-label={label}><Icon size={19}/><span>{label.split(" ")[0]}</span></Link>)}</nav></div>
  </div>;
}

export function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: React.ReactNode; description: string; action?: React.ReactNode }) {
  return <div className="game-page-heading"><div><p className="game-eyebrow"><Sparkles size={14}/>{eyebrow}</p><h1>{title}</h1><p className="game-page-description">{description}</p></div>{action}</div>;
}
