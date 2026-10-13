"use client";

import { useEffect, useState } from "react";
import { ArrowRight, MailCheck } from "lucide-react";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [consent, setConsent] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const status = new URLSearchParams(window.location.search).get("newsletter");
    if (status === "confirmed") setMessage("Votre inscription à la newsletter est confirmée. Merci !");
    else if (status === "invalid") setMessage("Ce lien de confirmation est invalide ou expiré. Vous pouvez demander un nouveau lien.");
    else if (status === "error") setMessage("La confirmation a échoué temporairement. Réessayez plus tard.");
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, website, consent, source: "landing_page" }),
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
        <label className="check-row newsletter-consent"><input type="checkbox" required checked={consent} onChange={(event) => setConsent(event.target.checked)} /><span>J’accepte de recevoir la newsletter NIKAHYA par e-mail. Je pourrai me désinscrire à tout moment.</span></label>
        <div className="newsletter-honeypot" aria-hidden="true">
          <label htmlFor="newsletter-website">Ne pas remplir</label>
          <input id="newsletter-website" tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} />
        </div>
        <p className="newsletter-privacy">Inscription volontaire avec confirmation par e-mail. Consultez notre politique de confidentialité. <a href="/confidentialite">Confidentialité</a>.</p>
        {message && <p className="newsletter-message" role="status">{message}</p>}
      </form>
    </section>
  );
}
