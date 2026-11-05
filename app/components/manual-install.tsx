"use client";

import { useEffect, useState } from "react";
import { Download, Smartphone, Share, MoreVertical } from "lucide-react";

type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

export default function ManualInstall() {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    const onInstalled = () => { setInstalled(true); setInstallPrompt(null); };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    if (window.matchMedia("(display-mode: standalone)").matches) setInstalled(true);
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function install() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") setInstalled(true);
    setInstallPrompt(null);
  }

  return (
    <section className="landing-manual-install" id="installation-manuelle" aria-labelledby="manual-install-title">
      <div className="landing-manual-install-icon"><Smartphone size={25} /></div>
      <div className="landing-manual-install-copy">
        <span className="section-kicker">DÈS MAINTENANT, SUR VOTRE ÉCRAN D’ACCUEIL</span>
        <h3 id="manual-install-title">Installer NAKAHYA manuellement</h3>
        <p>Ajoutez le site à votre écran d’accueil pour le retrouver comme une application, sans attendre sa publication sur les stores.</p>
        <div className="landing-install-instructions">
          <div><strong><span>iPhone / iPad</span></strong><p>Ouvrez NAKAHYA dans Safari, touchez <Share size={14} aria-label="Partager" /> <b>Partager</b>, puis <b>Sur l’écran d’accueil</b> et confirmez.</p></div>
          <div><strong><span>Android</span></strong><p>Ouvrez NAKAHYA dans Chrome, touchez <MoreVertical size={14} aria-label="Menu" /> le menu, puis <b>Installer l’application</b> ou <b>Ajouter à l’écran d’accueil</b>.</p></div>
        </div>
        {installed ? <p className="landing-install-status" role="status">NAKAHYA est installé sur cet appareil.</p> : installPrompt ? <button type="button" className="button button-green landing-install-button" onClick={install}><Download size={16} /> Installer maintenant</button> : <p className="landing-install-note">L’option d’installation dépend du navigateur. Suivez les étapes ci-dessus si le bouton n’apparaît pas.</p>}
      </div>
    </section>
  );
}
