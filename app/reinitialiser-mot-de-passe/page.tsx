"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Heart, LockKeyhole, Mail, ShieldCheck } from "lucide-react";

export default function ReinitialiserMotDePassePage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get("token") ?? "");
  }, []);

  async function requestReset(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setIsError(false);
    try {
      const response = await fetch("/api/auth/password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();
      if (!response.ok) {
        setIsError(true);
        setMessage(result.error ?? "La demande n’a pas pu être traitée. Réessayez plus tard.");
      } else {
        setMessage(result.message ?? "Si cette adresse correspond à un compte, un lien sera envoyé sous peu.");
      }
    } catch {
      setIsError(true);
      setMessage("Service indisponible. Vérifiez votre connexion puis réessayez.");
    } finally {
      setLoading(false);
    }
  }

  async function confirmReset(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== confirmation) {
      setIsError(true);
      setMessage("Les deux mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    setMessage("");
    setIsError(false);
    try {
      const response = await fetch("/api/auth/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const result = await response.json();
      if (!response.ok) {
        setIsError(true);
        setMessage(result.error ?? "Le lien est invalide ou a expiré.");
      } else {
        setMessage(result.message ?? "Mot de passe modifié.");
        setPassword("");
        setConfirmation("");
        window.setTimeout(() => router.replace("/connexion"), 1200);
      }
    } catch {
      setIsError(true);
      setMessage("Service indisponible. Vérifiez votre connexion puis réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page auth-page-premium">
      <Link href="/connexion" className="auth-back"><ArrowLeft size={16} /> Retour à la connexion</Link>
      <section className="auth-card auth-card-premium" aria-labelledby="reset-title">
        <Link href="/" className="brand auth-brand" aria-label="NIKAHYA, accueil">
          <span className="brand-mark"><Heart size={20} /></span>
          <span className="brand-word">NIKAHYA<span className="brand-dot">.</span></span>
        </Link>
        <div className="section-kicker auth-kicker">{token ? "SÉCURITÉ DU COMPTE" : "RETROUVER VOTRE ACCÈS"}</div>
        <h1 id="reset-title" className="auth-title">{token ? <>Un nouveau départ,<br /><em>en toute sécurité.</em></> : <>Retrouvons le chemin<br /><em>vers votre histoire.</em></>}</h1>
        <p className="auth-description">
          {token
            ? "Choisissez un nouveau mot de passe. Le lien est personnel, à usage unique et valable 60 minutes."
            : "Indiquez l’adresse e-mail associée à votre compte. Si un compte existe, vous recevrez un lien de réinitialisation."}
        </p>
        {token ? (
          <form onSubmit={confirmReset} className="auth-form">
            <label htmlFor="new-password">Nouveau mot de passe</label>
            <div className="input-wrap"><LockKeyhole size={17} /><input id="new-password" type="password" autoComplete="new-password" minLength={12} maxLength={256} required value={password} onChange={event => setPassword(event.target.value)} placeholder="12 caractères minimum" /></div>
            <label htmlFor="confirm-password">Confirmer le mot de passe</label>
            <div className="input-wrap"><LockKeyhole size={17} /><input id="confirm-password" type="password" autoComplete="new-password" minLength={12} maxLength={256} required value={confirmation} onChange={event => setConfirmation(event.target.value)} placeholder="Saisissez-le à nouveau" /></div>
            <button className="button button-green auth-submit" type="submit" disabled={loading}>{loading ? "Modification…" : "Modifier mon mot de passe"} <span>→</span></button>
          </form>
        ) : (
          <form onSubmit={requestReset} className="auth-form">
            <label htmlFor="email">Adresse e-mail</label>
            <div className="input-wrap"><Mail size={17} /><input id="email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={event => setEmail(event.target.value)} placeholder="vous@exemple.fr" /></div>
            <button className="button button-green auth-submit" type="submit" disabled={loading}>{loading ? "Envoi de la demande…" : "Recevoir un lien sécurisé"} <span>→</span></button>
          </form>
        )}
        {message && <p className="auth-notice" role="status" aria-live="polite" data-error={isError}>{message}</p>}
        <p className="auth-legal"><ShieldCheck size={13} /> Votre compte reste protégé. Ne partagez jamais ce lien.</p>
        <p className="auth-switch"><Link href="/connexion">Revenir à la connexion</Link></p>
      </section>
    </main>
  );
}
