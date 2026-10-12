"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, ArrowLeft, Mail, LockKeyhole, Sparkles, Brain, Puzzle, ShieldCheck } from "lucide-react";

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

  return (
    <main className="auth-page auth-page-premium">
      <Link href="/" className="auth-back"><ArrowLeft size={16} /> Retour à l’accueil</Link>
      <div className="auth-layout">
        <aside className="auth-story" aria-label="La méthode NIKAHYA">
          <Link href="/" className="brand auth-story-brand" aria-label="NIKAHYA, accueil">
            <span className="brand-mark"><Heart size={20} /></span>
            <span className="brand-word">NIKAHYA<span className="brand-dot">.</span></span>
          </Link>
          <div className="auth-story-copy">
            <span className="auth-story-eyebrow"><Sparkles size={14} /> LA RENCONTRE, AUTREMENT</span>
            <h1>Moins de swipe.<br /><em>Plus de vrai.</em></h1>
            <p>Apprenez à vous connaître en jouant. Des affinités sincères, des conversations qui ont du sens, à votre rythme.</p>
          </div>
          <div className="auth-game-preview" aria-label="Des jeux pour mieux se connaître">
            <div className="auth-game-card auth-game-card-main">
              <span className="auth-game-icon"><Puzzle size={20} /></span>
              <span><strong>Le mot juste</strong><small>Un indice, deux regards</small></span>
              <span className="auth-game-spark">✦</span>
            </div>
            <div className="auth-game-card auth-game-card-small">
              <span className="auth-game-icon"><Brain size={18} /></span>
              <span><strong>Esprit d’équipe</strong><small>Réfléchir ensemble</small></span>
            </div>
            <div className="auth-story-note"><ShieldCheck size={16} /><span>Votre rythme, vos valeurs, votre vie privée.</span></div>
          </div>
          <div className="auth-story-footer"><span>01 — SINCÉRITÉ</span><span>02 — COMPLICITÉ</span><span>03 — PROJETS DE VIE</span></div>
        </aside>
        <section className="auth-card auth-card-premium" aria-labelledby="auth-login-title">
          <div className="auth-mobile-brand">
            <Link href="/" className="brand auth-brand"><span className="brand-mark"><Heart size={20} /></span><span className="brand-word">NIKAHYA<span className="brand-dot">.</span></span></Link>
          </div>
          <div className="auth-card-topline"><span className="auth-status-dot" /> VOTRE ESPACE PERSONNEL</div>
          <div className="section-kicker auth-kicker">HEUREUX DE VOUS REVOIR</div>
          <h2 id="auth-login-title" className="auth-title">Votre histoire<br /><em>continue ici.</em></h2>
          <p className="auth-description">Retrouvez vos affinités, vos défis et les belles conversations en cours.</p>
          <form onSubmit={submit} className="auth-form">
            <label htmlFor="email">Adresse e-mail</label>
            <div className="input-wrap"><Mail size={17} /><input id="email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="vous@exemple.fr" maxLength={254} /></div>
            <label htmlFor="password">Mot de passe</label>
            <div className="input-wrap"><LockKeyhole size={17} /><input id="password" type="password" autoComplete="current-password" required minLength={1} maxLength={256} value={password} onChange={e => setPassword(e.target.value)} placeholder="Votre mot de passe" /></div>
            <button className="button button-green auth-submit" type="submit" disabled={loading}>{loading ? "Connexion…" : "Se connecter"} <span>→</span></button>
            {message && <p className="auth-notice" role="status">{message}</p>}
          </form>
          <p className="auth-switch">Vous n’avez pas de compte&nbsp;? <Link href="/inscription">Créer mon profil</Link></p>
          <p className="auth-legal"><ShieldCheck size={13} /> Réservé aux adultes de 18 ans et plus.</p>
        </section>
      </div>
    </main>
  );
}
