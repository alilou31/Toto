"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ShieldCheck, Trash2 } from "lucide-react";

export default function SecuritySettingsPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (confirmation !== "SUPPRIMER") {
      setMessage("Tapez exactement SUPPRIMER pour confirmer.");
      return;
    }
    if (!window.confirm("Confirmez-vous la suppression définitive de votre compte et de vos données associées ?")) return;
    setLoading(true);
    try {
      const response = await fetch("/api/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, confirmation }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Suppression impossible.");
      router.replace("/");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Service indisponible. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <Link href="/tableau-de-bord" className="auth-back"><ArrowLeft size={16}/> Retour au tableau de bord</Link>
      <section className="auth-card auth-card-wide">
        <Link href="/" className="brand auth-brand"><span className="brand-mark"><ShieldCheck size={20}/></span><span className="brand-word">NIKAHYA<span className="brand-dot">.</span></span></Link>
        <div className="section-kicker auth-kicker">SÉCURITÉ / VOTRE COMPTE</div>
        <h1 className="auth-title">Garder le contrôle,<br/><em>jusqu’au bout.</em></h1>
        <p className="auth-description">Vous pouvez supprimer votre compte sans contacter un prestataire. La suppression retire votre profil, vos intérêts, matchs, conversations, messages, blocages, signalements associés et vos sessions de connexion.</p>
        <p className="password-hint">Cette action est définitive. Les données supprimées ne pourront pas être restaurées. Certaines obligations légales de conservation peuvent s’appliquer aux données devant être conservées par l’éditeur.</p>
        <form className="auth-form" onSubmit={submit}>
          <label htmlFor="account-password">Confirmez votre mot de passe</label>
          <input id="account-password" className="form-control" type="password" autoComplete="current-password" required minLength={1} maxLength={256} value={password} onChange={event => setPassword(event.target.value)} />
          <label htmlFor="account-confirmation">Tapez SUPPRIMER pour confirmer</label>
          <input id="account-confirmation" className="form-control" required value={confirmation} onChange={event => setConfirmation(event.target.value)} autoComplete="off" />
          <button className="button button-dark auth-submit" type="submit" disabled={loading || confirmation !== "SUPPRIMER" || password.length === 0}>
            <Trash2 size={17}/>{loading ? "Suppression en cours…" : "Supprimer définitivement mon compte"}
          </button>
          {message && <p className="auth-notice" role="alert">{message}</p>}
        </form>
        <p className="auth-switch"><Link href="/confidentialite">Consulter la politique de confidentialité</Link></p>
      </section>
    </main>
  );
}
