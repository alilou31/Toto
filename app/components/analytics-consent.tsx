"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "nakahya-analytics-consent";
const GTM_ID = "GTM-MPMV8SSW";

type Consent = "granted" | "denied";

export default function AnalyticsConsent() {
  const [consent, setConsent] = useState<Consent | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY) as Consent | null;
    if (saved === "granted" || saved === "denied") setConsent(saved);
    else setShowBanner(true);
  }, []);

  useEffect(() => {
    if (consent !== "granted") return;
    if (document.querySelector('script[data-nakahya-gtm="true"]')) return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtm.js?id=" + GTM_ID;
    script.dataset.nakahyaGtm = "true";
    document.head.appendChild(script);
  }, [consent]);

  function choose(value: Consent) {
    window.localStorage.setItem(STORAGE_KEY, value);
    setConsent(value);
    setShowBanner(false);
  }

  return (
    <>
      {showBanner && (
        <aside className="nakahya-consent-banner" aria-label="Choix des cookies">
          <div><strong>Votre vie privée compte.</strong><p>Les cookies de mesure d’audience Google Tag Manager ne sont activés qu’avec votre accord. Vous pouvez continuer sans accepter.</p><a href="/confidentialite">En savoir plus</a></div>
          <div className="nakahya-consent-actions">
            <button type="button" className="nakahya-consent-secondary" onClick={() => choose("denied")}>Continuer sans accepter</button>
            <button type="button" className="nakahya-consent-primary" onClick={() => choose("granted")}>Accepter la mesure d’audience</button>
          </div>
        </aside>
      )}
      {!showBanner && <button type="button" className="nakahya-consent-manage" onClick={() => setShowBanner(true)} aria-label="Gérer les cookies">Cookies</button>}
    </>
  );
}

declare global {
  interface Window { dataLayer: Array<Record<string, unknown>>; }
}
