"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Heart, LogOut, Menu } from "lucide-react";

type SessionState = "checking" | "signed-in" | "signed-out";

export default function HomeHeader() {
  const router = useRouter();
  const [session, setSession] = useState<SessionState>("checking");
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/me", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error("Session indisponible");
        return data.user;
      })
      .then((user) => {
        if (active) setSession(user ? "signed-in" : "signed-out");
      })
      .catch(() => {
        if (active) setSession("signed-out");
      });
    return () => {
      active = false;
    };
  }, []);

  async function logout() {
    setLoggingOut(true);
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("Déconnexion impossible");
      setSession("signed-out");
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  }

  return (
    <header className="site-header">
      <Link href="/" className="brand" aria-label="NIKAHYA, accueil">
        <span className="brand-mark"><Heart size={20} strokeWidth={2.1} /></span>
        <span className="brand-word">NIKAHYA<span className="brand-dot">.</span></span>
      </Link>
      <nav className="desktop-nav" aria-label="Navigation principale">
        <a href="#concept">Le concept</a><a href="#methode">Comment ça marche</a><a href="#securite">Sécurité</a>
      </nav>
      <div className="header-actions" aria-live="polite">
        {session === "checking" ? (
          <span className="login-link" role="status">Vérification de la session…</span>
        ) : session === "signed-in" ? (
          <>
            <Link href="/profil" className="login-link">Mon profil</Link>
            <Link href="/decouvrir" className="login-link">Découvrir</Link>
            <button type="button" className="login-link" onClick={logout} disabled={loggingOut} style={{ border: 0, padding: 0, background: "transparent", fontFamily: "inherit", cursor: loggingOut ? "wait" : "pointer", display: "inline-flex", alignItems: "center", gap: 5 }}>
              <LogOut size={14} aria-hidden="true" /> {loggingOut ? "Déconnexion…" : "Déconnexion"}
            </button>
          </>
        ) : (
          <>
            <Link href="/connexion" className="login-link">Connexion</Link>
            <Link href="/demo" className="login-link">Essayer la démo</Link>
            <Link href="/inscription" className="button button-dark button-small">Créer mon profil <ArrowRight size={15}/></Link>
          </>
        )}
      </div>
      <button className="mobile-menu" aria-label="Menu"><Menu size={23}/></button>
    </header>
  );
}
