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
    <style jsx global>{`
      .immersive-layout{max-width:760px;margin:22px auto 0}
      .immersive-profile{overflow:hidden;border:1px solid #e5e8e1;border-radius:22px;background:#fff;box-shadow:0 18px 55px rgba(20,50,35,.12)}
      .immersive-photo{height:min(62vh,640px);min-height:380px;position:relative;display:flex;align-items:center;justify-content:center;background:linear-gradient(145deg,#dfe9dd,#f3eee2);background-position:center 35%;background-size:cover;color:#075b4b}
      .immersive-placeholder{display:grid;place-items:center;width:112px;height:112px;border-radius:50%;background:#ffffffa8}
      .immersive-count{position:absolute;right:18px;top:18px;padding:8px 12px;border-radius:999px;background:#142c23a8;color:white;font-size:12px;font-weight:700;backdrop-filter:blur(10px)}
      .immersive-photo-caption{position:absolute;left:clamp(20px,5vw,38px);right:22px;bottom:28px;color:#fff}
      .immersive-intention{display:inline-flex;padding:7px 10px;border:1px solid #ffffff6b;border-radius:999px;background:#ffffff20;font-size:11px;font-weight:700;backdrop-filter:blur(10px)}
      .immersive-photo-caption h2{margin:13px 0 7px;font-size:clamp(34px,6vw,48px);color:white;letter-spacing:-1px}
      .immersive-photo-caption p{display:flex;align-items:center;gap:6px;margin:0;font-size:14px}
      .immersive-summary{padding:22px clamp(18px,4vw,32px) 26px}
      .immersive-summary>p{margin:0 0 12px;color:#4e5c53;font-size:15px;line-height:1.7}
      .immersive-full-profile{display:inline-flex;gap:8px;align-items:center;color:#075b4b;font-size:13px;font-weight:700;padding:7px 0}
      .immersive-actions{display:grid;grid-template-columns:1fr 1.25fr;gap:12px;margin-top:18px}
      .immersive-actions button{display:flex;justify-content:center;align-items:center;gap:9px;min-height:54px;border-radius:999px;font:700 14px inherit;cursor:pointer;transition:transform .18s,box-shadow .18s}
      .immersive-actions button:hover{transform:translateY(-2px);box-shadow:0 7px 18px #173c2a1a}
      .immersive-actions button:disabled{opacity:.55;cursor:wait}
      .immersive-pass{border:1px solid #dfe5dc;background:#fff;color:#46534a}
      .immersive-like{border:1px solid #075b4b;background:#075b4b;color:#fff}
      .immersive-hint{text-align:center;color:#788179;font-size:11px;margin:14px 0 30px}
      .immersive-empty{max-width:600px;margin:35px auto;padding:38px 22px;text-align:center;background:#fff;border:1px solid #e5e8e1;border-radius:18px}
      .immersive-empty>span{display:inline-grid;place-items:center;width:52px;height:52px;border-radius:50%;background:#edf4ee;color:#075b4b}
      .immersive-empty h2{margin:18px 0 10px;font-size:28px}
      .immersive-empty p{color:#68716b;line-height:1.7}
      .immersive-empty .game-button{margin:6px}
      @media(max-width:640px){.immersive-layout{margin:12px -10px 0}.immersive-profile{border-radius:18px}.immersive-photo{height:54vh;min-height:350px;max-height:590px}.immersive-summary{padding:18px 16px 20px}.immersive-actions button{min-height:52px}.immersive-photo-caption h2{font-size:37px}}
    `}</style>
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
