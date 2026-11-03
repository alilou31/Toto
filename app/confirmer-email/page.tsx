"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart, MailCheck } from "lucide-react";

export default function ConfirmerEmailPage() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get("token") ?? "";
    setToken(value);
    // Keep the secret out of browser history after reading the link.
    if (value) window.history.replaceState(window.history.state, "", "/confirmer-email");
  }, []);

  async function confirm() {
    if (!token || loading) return;
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/auth/confirm-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error ?? "Impossible de confirmer votre adresse.");
        return;
      }
      window.location.replace("/tableau-de-bord");
    } catch {
      setMessage("Service indisponible. Réessayez plus tard.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card auth-card-wide">
        <Link href="/" className="brand auth-brand"><span className="brand-mark"><Heart size={20}/></span><span className="brand-word">NAKAHYA<span className="brand-dot">.</span></span></Link>
        <MailCheck size={32} aria-hidden="true" />
        <h1 className="auth-title">Confirmez votre adresse e-mail</h1>
        <p className="auth-description">Validez votre adresse pour accéder à votre espace personnel. Le lien est valable 24 heures et ne peut servir qu’une fois.</p>
        {token === null ? <p role="status">Chargement de votre confirmation…</p> : token ? (
          <button type="button" className="button button-green auth-submit" onClick={confirm} disabled={loading}>
            {loading ? "Confirmation…" : "Confirmer mon adresse"}
          </button>
        ) : <p role="alert">Le lien de confirmation est absent. Recommencez votre inscription pour recevoir un nouveau lien.</p>}
        {message && <p className="auth-notice" role="alert">{message}</p>}
        <p className="auth-switch"><Link href="/inscription">Recommencer l’inscription</Link></p>
      </section>
    </main>
  );
}
