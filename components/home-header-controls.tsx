"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Heart, Menu, UserRound, X } from "lucide-react";

type SessionUser = { id: string; email: string } | null;

export default function HomeHeaderControls() {
  const [user, setUser] = useState<SessionUser>(null);
  const [checked, setChecked] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/me", { cache: "no-store" })
      .then(async response => {
        if (!response.ok) return null;
        const data = await response.json();
        return data.user ?? null;
      })
      .then(value => {
        if (active) {
          setUser(value);
          setChecked(true);
        }
      })
      .catch(() => {
        if (active) setChecked(true);
      });
    return () => { active = false; };
  }, []);

  const primaryHref = user ? "/tableau-de-bord" : "/connexion";
  const primaryLabel = user ? "Mon tableau de bord" : "Connexion";

  return <>
    <div className="header-actions">
      {user ? (
        <>
          <Link href="/tableau-de-bord" className="login-link"><UserRound size={15} style={{display:"inline",verticalAlign:"-3px",marginRight:5}}/>Mon tableau de bord</Link>
          <Link href="/decouvrir" className="login-link"><Heart size={15} style={{display:"inline",verticalAlign:"-3px",marginRight:5}}/>Commencer à liker</Link>
          <Link href="/jeux" className="login-link">Jeux pour faire connaissance</Link>
        </>
      ) : (
        <>
          <Link href="/connexion" className="login-link">Connexion</Link>
          <Link href="/demo" className="login-link">Essayer la démo</Link>
        </>
      )}
      <Link href={user ? "/tableau-de-bord" : "/inscription"} className="button button-dark button-small">
        {user ? "Accéder à mon espace" : "Créer mon profil"} <ArrowRight size={15}/>
      </Link>
    </div>
    <button className="mobile-menu" type="button" aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"} aria-expanded={menuOpen} aria-controls="mobile-site-menu" onClick={() => setMenuOpen(open => !open)}>
      {menuOpen ? <X size={23}/> : <Menu size={23}/>}
    </button>
    {menuOpen && <nav id="mobile-site-menu" className="mobile-site-menu" aria-label="Menu mobile">
      <a href="#concept" onClick={() => setMenuOpen(false)}>Le concept</a>
      <a href="#methode" onClick={() => setMenuOpen(false)}>Comment ça marche</a>
      <a href="#securite" onClick={() => setMenuOpen(false)}>Sécurité</a>
      <Link href={primaryHref} onClick={() => setMenuOpen(false)}>{primaryLabel}</Link>
      {user ? <>
        <Link href="/tableau-de-bord" onClick={() => setMenuOpen(false)}>Mon tableau de bord</Link>
        <Link href="/decouvrir" onClick={() => setMenuOpen(false)}>Commencer à liker</Link>
        <Link href="/jeux" onClick={() => setMenuOpen(false)}>Jeux pour faire connaissance</Link>
        <Link href="/matchs" onClick={() => setMenuOpen(false)}>Mes matchs</Link>
      </> : <>
        <Link href="/demo" onClick={() => setMenuOpen(false)}>Essayer la démo</Link>
        <Link href="/inscription" onClick={() => setMenuOpen(false)}>Créer mon profil</Link>
      </>}
    </nav>}
    {checked && user && <span className="sr-only">Session connectée</span>}
  </>;
}

export function DashboardHeroCta() {
  const [user, setUser] = useState<SessionUser>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/me", { cache: "no-store" })
      .then(async response => response.ok ? (await response.json()).user ?? null : null)
      .then(value => { if (active) { setUser(value); setChecked(true); } })
      .catch(() => { if (active) setChecked(true); });
    return () => { active = false; };
  }, []);

  if (!checked || !user) return null;
  return <div className="signed-in-hero-cta">
    <div><strong>Ravi de vous retrouver.</strong><span>Votre espace personnel est prêt.</span></div>
    <Link href="/tableau-de-bord" className="button button-dark">Mon tableau de bord <ArrowRight size={16}/></Link>
    <Link href="/decouvrir" className="button button-green"><Heart size={16}/> Commencer à liker</Link>
  </div>;
}
