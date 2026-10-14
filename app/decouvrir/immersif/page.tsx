"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Heart, MapPin, SkipForward, Sparkles, UserRound } from "lucide-react";
import { GameShell, PageHeading } from "../../components/game-shell";

type Profile = {
  id: string;
  public_name: string;
  city?: string | null;
  bio?: string | null;
  photo_url?: string | null;
  relationship_intention?: string | null;
  is_verified?: boolean;
};

const intentions: Record<string, string> = {
  marriage: "Projet de mariage",
  serious: "Relation sérieuse",
  friendship: "Faire connaissance",
};

export default function ImmersiveDiscoveryPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const current = profiles[index];

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch("/api/discover", { cache: "no-store" });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || (response.status === 401 ? "Connectez-vous pour découvrir les profils." : "Impossible de charger les profils."));
        if (!cancelled) setProfiles(Array.isArray(data.profiles) ? data.profiles : []);
      } catch (cause) {
        if (!cancelled) setError(cause instanceof Error ? cause.message : "Service indisponible.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  function pass() {
    setNotice("Profil passé.");
    setIndex(value => Math.min(value + 1, profiles.length));
  }

  async function like() {
    if (!current || busy) return;
    setBusy(true);
    setNotice("");
    try {
      const response = await fetch("/api/interests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientId: current.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Impossible d’envoyer cet intérêt.");
      setNotice(data.matched ? "C’est réciproque ! Vous avez un nouveau match." : "Intérêt envoyé.");
      setIndex(value => Math.min(value + 1, profiles.length));
    } catch (cause) {
      setNotice(cause instanceof Error ? cause.message : "Service indisponible.");
    } finally {
      setBusy(false);
    }
  }

  return <GameShell active="/decouvrir/immersif">
    <PageHeading eyebrow="À VOTRE RYTHME" title={<>Une personne à la fois, <em>vraiment.</em></>} description="Prenez le temps de regarder, de lire et de choisir. Un passage ne transmet aucun intérêt." action={<Link href="/decouvrir" className="game-button game-button-secondary"><ArrowLeft size={16}/> Vue profils</Link>} />
    {notice && <p role="status" className="discovery-notice">{notice}</p>}
    {loading ? <p role="status" className="discovery-state">Chargement des profils…</p>
      : error ? <div className="discovery-state" role="alert"><p>{error}</p><Link href="/connexion" className="game-button game-button-primary">Se connecter</Link></div>
      : !current ? <section className="immersive-empty"><span><Sparkles size={24}/></span><h2>Vous avez parcouru tous les profils</h2><p>Revenez plus tard pour de nouvelles rencontres.</p><button className="game-button game-button-secondary" onClick={() => { setIndex(0); setNotice(""); }} disabled={profiles.length === 0}>Revoir les profils passés</button><Link href="/decouvrir" className="game-button game-button-primary">Voir la grille</Link></section>
      : <section className="immersive-layout" aria-label="Profil à découvrir">
        <article className="immersive-profile">
          <div className="immersive-photo" style={current.photo_url ? { backgroundImage: `linear-gradient(180deg, transparent 35%, rgba(7,28,22,.9) 100%), url("${current.photo_url}")` } : undefined}>
            {!current.photo_url && <span className="immersive-placeholder"><UserRound size={64}/></span>}
            <span className="immersive-count">{index + 1} / {profiles.length}</span>
            <div className="immersive-photo-caption">
              <span className="immersive-intention">{intentions[current.relationship_intention ?? ""] ?? "À découvrir"}</span>
              <h2>{current.public_name}</h2>
              {current.city && <p><MapPin size={15}/>{current.city}</p>}
            </div>
          </div>
          <div className="immersive-summary">
            <p>{current.bio?.trim() || "Cette personne préfère se dévoiler au fil de la conversation."}</p>
            <Link href={`/membre/${encodeURIComponent(current.id)}`} className="immersive-full-profile">Consulter le profil complet <span aria-hidden="true">↗</span></Link>
            <div className="immersive-actions">
              <button type="button" className="immersive-pass" onClick={pass} disabled={busy} aria-label="Passer ce profil"><SkipForward size={19}/><span>Passer</span></button>
              <button type="button" className="immersive-like" onClick={() => void like()} disabled={busy} aria-label={`Liker ${current.public_name}`}><Heart size={21}/><span>{busy ? "Envoi…" : "Liker"}</span></button>
            </div>
          </div>
        </article>
        <p className="immersive-hint">♡ Un like est envoyé uniquement lorsque vous choisissez « Liker ».</p>
      </section>}
  </GameShell>;
}
