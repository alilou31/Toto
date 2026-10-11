"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, Heart, LayoutDashboard, LogOut, Menu, MessageCircle, Search, UserRound, X } from "lucide-react";

type User = { id?: string; email?: string } | null;
type Session = "checking" | "signed-in" | "signed-out";

export default function HomeHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<Session>("checking");
  const [user, setUser] = useState<User>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/me", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error("Session indisponible");
        return data.user ?? null;
      })
      .then((currentUser) => {
        if (active) {
          setUser(currentUser);
          setSession(currentUser ? "signed-in" : "signed-out");
        }
      })
      .catch(() => {
        if (active) {
          setUser(null);
          setSession("signed-out");
        }
      });
    return () => { active = false; };
  }, [pathname]);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
  }

  async function logout() {
    setLoggingOut(true);
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("Déconnexion impossible");
      setUser(null);
      setSession("signed-out");
      setMenuOpen(false);
      router.replace("/");
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  }

  return (
    <header className="site-header">
      <button
        className="mobile-menu"
        type="button"
        aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
        aria-expanded={menuOpen}
        aria-controls="mobile-navigation"
        onClick={() => setMenuOpen((open) => !open)}
      >
        {menuOpen ? <X size={23} /> : <Menu size={23} />}
      </button>
      <Link href="/" className="brand" aria-label="NIKAHYA, accueil">
        <span className="brand-mark"><Heart size={20} strokeWidth={2.1} /></span>
        <span className="brand-word">NIKAHYA<span className="brand-dot">.</span></span>
      </Link>
      <nav className="desktop-nav" aria-label="Navigation principale">
        <Link href="/#concept">Le concept</Link><Link href="/#methode">Comment ça marche</Link><Link href="/#securite">Sécurité</Link>
      </nav>
      <div className="header-actions" aria-live="polite">
        {session === "checking" ? <span className="login-link" role="status">Vérification…</span> : session === "signed-in" ? (
          <>
            <Link href="/tableau-de-bord" className="login-link">Tableau de bord</Link>
            <Link href="/profil" className="login-link">Mon profil</Link>
            <Link href="/decouvrir" className="login-link">Découvrir</Link>
            <button type="button" className="login-link header-logout" onClick={logout} disabled={loggingOut}>{loggingOut ? "Déconnexion…" : "Déconnexion"}</button>
          </>
        ) : (
          <>
            <Link href="/connexion" className="login-link">Se connecter</Link>
            <Link href="/inscription" className="button button-dark button-small">Créer un compte <ArrowRight size={15} /></Link>
          </>
        )}
      </div>
      <nav id="mobile-navigation" className={`mobile-navigation ${menuOpen ? "is-open" : ""}`} aria-label="Menu mobile" hidden={!menuOpen} onClick={(event) => { if ((event.target as HTMLElement).closest("a")) closeMenu(); }}>
        <div className="mobile-nav-section">
          <span className="mobile-nav-label">Découvrir NIKAHYA</span>
          <Link href="/#concept"><Heart size={17}/> Le concept</Link>
          <Link href="/#methode"><ArrowRight size={17}/> Comment ça marche</Link>
          <Link href="/#securite"><UserRound size={17}/> Sécurité et confidentialité</Link>
        </div>
        {session === "signed-in" ? (
          <div className="mobile-nav-section">
            <span className="mobile-nav-label">Mon espace{user?.email ? ` · ${user.email}` : ""}</span>
            <Link href="/tableau-de-bord"><LayoutDashboard size={17}/> Tableau de bord</Link>
            <Link href="/profil"><UserRound size={17}/> Mon profil</Link>
            <Link href="/decouvrir"><Search size={17}/> Découvrir des profils</Link>
            <Link href="/matchs"><Heart size={17}/> Mes affinités</Link>
            <Link href="/rencontre"><MessageCircle size={17}/> Mode rencontre</Link>
            <button type="button" onClick={logout} disabled={loggingOut}><LogOut size={17}/>{loggingOut ? "Déconnexion…" : "Se déconnecter"}</button>
          </div>
        ) : (
          <div className="mobile-nav-account">
            <Link href="/connexion" className="button button-quiet">Se connecter</Link>
            <Link href="/inscription" className="button button-green">Créer mon compte <ArrowRight size={16}/></Link>
            <Link href="/demo" className="mobile-demo-link">Essayer la démo</Link>
          </div>
        )}
      </nav>
    </header>
  );
}
