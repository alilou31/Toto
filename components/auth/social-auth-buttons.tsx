"use client";

import { useEffect, useState } from "react";

type Provider = "google" | "facebook";
type Props = { mode: "login" | "signup"; ageConfirmed?: boolean; acceptedTerms?: boolean };

const errorMessages: Record<string, string> = {
  invalid_state: "La demande de connexion a expiré ou n’est plus valide. Réessayez.",
  cancelled: "Connexion annulée. Vous pouvez réessayer quand vous le souhaitez.",
  provider_failed: "Le fournisseur n’a pas pu confirmer votre identité. Réessayez.",
  email_required: "Le fournisseur n’a pas transmis d’adresse e-mail. Essayez une autre méthode.",
  email_unverified: "Votre adresse Google doit être vérifiée avant de continuer.",
  account_exists: "Un compte utilise déjà cette adresse e-mail. Connectez-vous avec votre méthode habituelle.",
  account_not_found: "Aucun compte social associé. Créez d’abord votre compte depuis l’inscription.",
  account_disabled: "Ce compte est désactivé. Contactez l’assistance.",
  oauth_unavailable: "La connexion sociale est temporairement indisponible. Réessayez plus tard.",
};

function GoogleLogo() {
  return <svg aria-hidden="true" viewBox="0 0 48 48" width="20" height="20">
    <path fill="#4285F4" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.9 6.1-15Z"/>
    <path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.6-5.1c-1.8 1.2-4 2-6.9 2-5.3 0-9.8-3.6-11.4-8.4H5.8v5.3A20 20 0 0 0 24 44Z"/>
    <path fill="#FBBC05" d="M12.6 27.6a12 12 0 0 1 0-7.2v-5.3H5.8a20 20 0 0 0 0 17.8l6.8-5.3Z"/>
    <path fill="#EA4335" d="M24 12c3 0 5.7 1 7.8 3.1l5.8-5.8C34.1 6 29.5 4 24 4A20 20 0 0 0 5.8 15.1l6.8 5.3C14.2 15.6 18.7 12 24 12Z"/>
  </svg>;
}
function FacebookLogo() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20">
    <path fill="#1877F2" d="M24 12a12 12 0 1 0-13.875 11.85v-8.38H7.08V12h3.045V9.35c0-3.005 1.79-4.665 4.53-4.665 1.31 0 2.68.235 2.68.235v2.945h-1.51c-1.49 0-1.955.925-1.955 1.875V12h3.325l-.53 3.47H13.87v8.38A12 12 0 0 0 24 12Z"/>
    <path fill="#FFFFFF" d="M16.665 15.47 17.195 12H13.87V9.74c0-.95.465-1.875 1.955-1.875h1.51V4.92s-1.37-.235-2.68-.235c-2.74 0-4.53 1.66-4.53 4.665V12H7.08v3.47h3.045v8.38a12.1 12.1 0 0 0 3.745 0v-8.38h2.795Z"/>
  </svg>;
}

export default function SocialAuthButtons({ mode, ageConfirmed = false, acceptedTerms = false }: Props) {
  const [loading, setLoading] = useState<Provider | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("oauth_error");
    if (code) setMessage(errorMessages[code] ?? "La connexion sociale a échoué. Réessayez.");
  }, []);

  async function start(provider: Provider) {
    if (loading) return;
    if (mode === "signup" && (!ageConfirmed || !acceptedTerms)) {
      setMessage("Confirmez votre majorité et acceptez les conditions avant de créer votre compte.");
      return;
    }
    setMessage("");
    setLoading(provider);
    try {
      const response = await fetch("/api/auth/oauth/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ provider, mode, ageConfirmed, acceptedTerms }),
      });
      const result: unknown = await response.json();
      if (!response.ok || typeof result !== "object" || result === null ||
          !("url" in result) || typeof result.url !== "string") {
        const error = typeof result === "object" && result !== null && "error" in result && typeof result.error === "string"
          ? result.error : "La connexion sociale n’est pas disponible pour le moment.";
        setMessage(error);
        setLoading(null);
        return;
      }
      window.location.assign(result.url);
    } catch {
      setMessage("Service indisponible. Vérifiez votre connexion puis réessayez.");
      setLoading(null);
    }
  }

  const signupBlocked = mode === "signup" && (!ageConfirmed || !acceptedTerms);
  return <div className="social-auth">
    <div className="social-auth-divider"><span>ou continuer avec</span></div>
    <div className="social-auth-buttons">
      <button type="button" className="social-auth-button" onClick={() => void start("google")} disabled={Boolean(loading) || signupBlocked}>
        <GoogleLogo /><span>{loading === "google" ? "Redirection…" : "Google"}</span>
      </button>
      <button type="button" className="social-auth-button" onClick={() => void start("facebook")} disabled={Boolean(loading) || signupBlocked}>
        <FacebookLogo /><span>{loading === "facebook" ? "Redirection…" : "Facebook"}</span>
      </button>
    </div>
    {mode === "signup" && signupBlocked && <p className="social-auth-hint">Cochez les deux confirmations ci-dessus pour continuer.</p>}
    {message && <p className="social-auth-message" role="status">{message}</p>}
  </div>;
}
