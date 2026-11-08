"use client";

import { useState } from "react";
import { ArrowRight, MessageSquareHeart } from "lucide-react";

export default function FeedbackForm() {
  const [category, setCategory] = useState("experience");
  const [rating, setRating] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    setLoading(true);
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, rating: rating || null, message, consent, website }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Votre retour n’a pas pu être envoyé.");
      setMessage("");
      setRating("");
      setConsent(false);
      setStatus("Merci ! Votre retour a bien été transmis à l’équipe NAKAHYA.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Service momentanément indisponible.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="voc-form" onSubmit={submit}>
      <label htmlFor="voc-category">Quel sujet souhaitez-vous partager ?</label>
      <select id="voc-category" value={category} onChange={event => setCategory(event.target.value)}>
        <option value="experience">Expérience générale</option>
        <option value="discovery">Découverte et profils</option>
        <option value="games">Jeux et interactions</option>
        <option value="trust_safety">Confiance et sécurité</option>
        <option value="pricing">Offres et tarifs</option>
        <option value="other">Autre sujet</option>
      </select>

      <label htmlFor="voc-rating">Quelle note donneriez-vous à votre expérience ? <span>(facultatif)</span></label>
      <select id="voc-rating" value={rating} onChange={event => setRating(event.target.value)}>
        <option value="">Je préfère ne pas noter</option>
        <option value="1">1 — Très décevante</option>
        <option value="2">2 — Décevante</option>
        <option value="3">3 — Correcte</option>
        <option value="4">4 — Très bonne</option>
        <option value="5">5 — Excellente</option>
      </select>

      <label htmlFor="voc-message">Votre retour</label>
      <textarea id="voc-message" required minLength={10} maxLength={2000} rows={6} value={message} onChange={event => setMessage(event.target.value)} placeholder="Qu’est-ce qui fonctionne bien ? Qu’est-ce qui vous manque ? Qu’est-ce qui pourrait vous faire hésiter ?" />
      <small className="voc-counter">{message.length}/2000 caractères</small>

      <div className="voc-honeypot" aria-hidden="true">
        <label htmlFor="voc-website">Ne pas remplir</label>
        <input id="voc-website" tabIndex={-1} autoComplete="off" value={website} onChange={event => setWebsite(event.target.value)} />
      </div>

      <label className="voc-consent"><input type="checkbox" required checked={consent} onChange={event => setConsent(event.target.checked)} /><span>J’accepte que ce retour soit utilisé pour améliorer NAKAHYA. Ne partagez aucune information sensible.</span></label>
      <button className="voc-submit" type="submit" disabled={loading || message.trim().length < 10 || !consent}>{loading ? "Envoi…" : "Envoyer mon retour"} <ArrowRight size={17} /></button>
      {status && <p className="voc-status" role="status">{status}</p>}
      <p className="voc-privacy">Vous pouvez répondre sans créer de compte. Les retours sont accessibles uniquement à l’équipe produit autorisée. Ce formulaire n’est pas un canal de signalement d’urgence.</p>
    </form>
  );
}
