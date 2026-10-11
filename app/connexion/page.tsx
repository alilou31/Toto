"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, ArrowLeft, Mail, LockKeyhole } from "lucide-react";

export default function ConnexionPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Keep an authenticated member out of the sign-in page, including after browser Back/BFCache.
  useEffect(() => {
    let active = true;
    const redirectIfAuthenticated = async () => {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        const data = await response.json();
        if (active && response.ok && data.user) {
          const requested = new URLSearchParams(window.location.search).get("next");
          const destination = requested && requested.startsWith("/") && !requested.startsWith("//") ? requested : "/tableau-de-bord";
          router.replace(destination);
          router.refresh();
        }
      } catch {
        // Keep the form available if session verification is temporarily unavailable.
      }
    };
    void redirectIfAuthenticated();
    window.addEventListener("pageshow", redirectIfAuthenticated);
    return () => {
      active = false;
      window.removeEventListener("pageshow", redirectIfAuthenticated);
    };
  }, [router]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();
      if (!response.ok) {
        setMessage(result.error ?? "Connexion impossible.");
        return;
      }
      const requested = new URLSearchParams(window.location.search).get("next");
      const destination = requested && requested.startsWith("/") && !requested.startsWith("//") ? requested : "/tableau-de-bord";
      router.replace(destination);
      router.refresh();
    } catch {
      setMessage("Service indisponible. Vérifiez votre connexion puis réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return <main className="auth-page"><Link href="/" className="auth-back"><ArrowLeft size={16}/> Retour à l’accueil</Link><section className="auth-card"><Link href="/" className="brand auth-brand"><span className="brand-mark"><Heart size={20}/></span><span className="brand-word">NIKAHYA<span className="brand-dot">.</span></span></Link><div className="section-kicker auth-kicker">HEUREUX DE VOUS REVOIR</div><h1 className="auth-title">Votre histoire<br/><em>continue ici.</em></h1><p className="auth-description">Connectez-vous à votre espace personnel.</p><form onSubmit={submit} className="auth-form"><label htmlFor="email">Adresse e-mail</label><div className="input-wrap"><Mail size={17}/><input id="email" type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="vous@exemple.fr" maxLength={254}/></div><label htmlFor="password">Mot de passe</label><div className="input-wrap"><LockKeyhole size={17}/><input id="password" type="password" autoComplete="current-password" required minLength={1} maxLength={256} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Votre mot de passe"/></div><button className="button button-green auth-submit" type="submit" disabled={loading}>{loading ? "Connexion…" : "Se connecter"} <span>→</span></button>{message&&<p className="auth-notice" role="status">{message}</p>}</form><p className="auth-switch">Vous n’avez pas de compte&nbsp;? <Link href="/inscription">Créer mon profil</Link></p><p className="auth-legal">En continuant, vous confirmez avoir 18 ans ou plus.</p></section></main>;
}
