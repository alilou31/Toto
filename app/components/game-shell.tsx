import Link from "next/link";
import { CircleUserRound, Eye, Gamepad2, Heart, House, Search, ShieldCheck, Sparkles } from "lucide-react";

const navigation = [
  { href: "/cockpit", label: "Mon espace", shortLabel: "Accueil", icon: House },
  { href: "/decouvrir", label: "Découvrir", shortLabel: "Découvrir", icon: Search, primary: true },
  { href: "/cockpit/jeux", label: "Jouer", shortLabel: "Jouer", icon: Gamepad2 },
  { href: "/matchs", label: "Affinités", shortLabel: "Affinités", icon: Sparkles },
  { href: "/profil", label: "Mon profil", shortLabel: "Profil", icon: CircleUserRound },
  { href: "/cockpit/visites", label: "Visites de profil", shortLabel: "Visites", icon: Eye },
];

function isActiveRoute(active: string, href: string) {
  if (href === "/cockpit") return active === "/cockpit";
  return active === href || active.startsWith(`${href}/`);
}

export function GameShell({ children, active = "/cockpit" }: { children: React.ReactNode; active?: string }) {
  return <div className="game-app">
    <aside className="game-sidebar">
      <Link href="/" className="game-brand"><span className="game-brand-mark"><Heart size={19} fill="currentColor"/></span><span>NIKAHYA<span className="game-brand-dot">.</span><small>SE RENCONTRER AUTREMENT</small></span></Link>
      <p className="game-nav-label">VOTRE ESPACE</p>
      <nav aria-label="Navigation principale">{navigation.map(({href,label,icon:Icon,primary})=><Link key={href} href={href} aria-current={isActiveRoute(active,href)?"page":undefined} className={`game-nav-link${primary ? " game-nav-link-primary" : ""}`}><Icon size={18}/><span>{label}</span></Link>)}</nav>
      <div className="game-sidebar-bottom"><div className="game-safety"><ShieldCheck size={18}/><span><strong>Un espace bienveillant</strong><small>Votre rythme, vos règles.</small></span></div><Link href="/" className="game-back-home">← Retour au site</Link></div>
    </aside>
    <div className="game-main"><header className="game-topbar"><div className="game-breadcrumb">Votre espace <span>/</span> <strong>{navigation.find(n=>isActiveRoute(active,n.href))?.label ?? "Découvrir"}</strong></div><div className="game-top-actions"><Link href="/decouvrir" className="game-button game-button-primary"><Search size={16}/> Découvrir</Link><Link href="/profil" className="game-avatar" aria-label="Modifier mon profil"><CircleUserRound size={18}/></Link></div></header><main className="game-content">{children}</main><nav className="game-mobile-nav" aria-label="Navigation mobile">{navigation.map(({href,label,shortLabel,icon:Icon,primary})=><Link key={href} href={href} aria-current={isActiveRoute(active,href)?"page":undefined} aria-label={label} className={primary ? "game-mobile-nav-primary" : undefined}><Icon size={19}/><span>{shortLabel}</span></Link>)}</nav></div>
  </div>;
}

export function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: React.ReactNode; description: string; action?: React.ReactNode }) {
  return <div className="game-page-heading"><div><p className="game-eyebrow"><Sparkles size={14}/>{eyebrow}</p><h1>{title}</h1><p className="game-page-description">{description}</p></div>{action}</div>;
}
