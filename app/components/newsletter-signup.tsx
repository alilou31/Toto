"use client";

import { useState } from "react";
import { ArrowRight, MailCheck } from "lucide-react";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, website, consent: true, source: "landing_page" }),
      });
      const result = await response.json();
      if (!response.ok) {
        setMessage(result.error ?? "L’inscription n’a pas pu être enregistrée. Réessayez plus tard.");
        return;
      }
      setMessage("Presque terminé : consultez votre boîte e-mail pour confirmer votre inscription.");
      setEmail("");
    } catch {
      setMessage("Service momentanément indisponible. Réessayez plus tard.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="newsletter-section" aria-labelledby="newsletter-title">
      <div className="newsletter-icon"><MailCheck size={22} /></div>
      <div className="newsletter-copy">
        <p className="section-kicker">LES NOUVELLES QUI ONT DU SENS</p>
        <h2 id="newsletter-title">Un peu plus de complicité dans votre boîte mail.</h2>
        <p>Recevez les nouveautés NIKAHYA, des idées de jeux à deux et des conseils pour faire connaissance, sans spam.</p>
      </div>
      <form className="newsletter-form" onSubmit={submit}>
        <label htmlFor="newsletter-email">Votre adresse e-mail</label>
        <div className="newsletter-input-row">
          <input id="newsletter-email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="vous@exemple.fr" />
          <button className="button button-green" type="submit" disabled={loading}>{loading ? "Envoi…" : "M’inscrire"} <ArrowRight size={16} /></button>
        </div>
        <div className="newsletter-honeypot" aria-hidden="true">
          <label htmlFor="newsletter-website">Ne pas remplir</label>
          <input id="newsletter-website" tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} />
        </div>
        <p className="newsletter-privacy">Inscription volontaire, confirmée par e-mail. Désinscription possible à tout moment. <a href="/confidentialite">Confidentialité</a>.</p>
        {message && <p className="newsletter-message" role="status">{message}</p>}
      </form>
    </section>
  );
}
