"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Heart, MapPin, RefreshCw, UserRound } from "lucide-react";

type PublicProfile = {
  id: string;
  public_name: string;
  city: string | null;
  bio: string;
  relationship_intention: "marriage" | "serious" | "friendship" | "unspecified";
};

const intentionLabels: Record<PublicProfile["relationship_intention"], string> = {
  marriage: "Mariage",
  serious: "Relation sérieuse",
  friendship: "Faire connaissance",
  unspecified: "À discuter",
};

export default function DiscoverPage() {
  const [profiles, setProfiles] = useState<PublicProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [liking, setLiking] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  async function loadProfiles() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/discover", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 401) throw new Error("Connectez-vous pour découvrir les profils.");
        throw new Error(data.error || "Impossible de charger les profils.");
      }
      setProfiles(Array.isArray(data.profiles) ? data.profiles : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Service indisponible.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadProfiles(); }, []);

  async function likeProfile(profileId: string) {
    setLiking(profileId); setNotice("");
    try {
      const response = await fetch("/api/interests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ recipientId: profileId }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Impossible d’envoyer cet intérêt.");
      setNotice(data.matched ? "C’est réciproque ! Vous avez un nouveau match." : "Intérêt envoyé. Si cette personne vous choisit aussi, vous aurez un match.");
    } catch (e) { setNotice(e instanceof Error ? e.message : "Service indisponible."); }
    finally { setLiking(null); }
  }

  return <main className="auth-page">
    <Link href="/" className="auth-back"><ArrowLeft size={16}/> Retour à l’accueil</Link>
    <section className="auth-card auth-card-wide">
      <Link href="/" className="brand auth-brand"><span className="brand-mark"><Heart size={20}/></span><span className="brand-word">NIKAHYA<span className="brand-dot">.</span></span></Link>
      <div className="section-kicker auth-kicker">DES RENCONTRES QUI ONT DU SENS</div>
      <h1 className="auth-title">Découvrez des profils<br/><em>en toute sincérité.</em></h1>
      <p className="auth-description">Seuls les profils que leurs membres ont choisi de rendre visibles apparaissent ici. Les e-mails et dates de naissance ne sont jamais affichés.</p>
      <div style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:20}}>
        <Link href="/profil" className="button button-green">Mon profil</Link>
        <Link href="/matchs" className="button button-quiet">Mes matchs</Link>
        <button className="button button-quiet" type="button" onClick={() => void loadProfiles()} disabled={loading}><RefreshCw size={16}/> Actualiser</button>
      </div>
      {notice && <p className="auth-notice" role="status">{notice} <Link href="/matchs">Voir mes matchs</Link></p>}
      {loading ? <p role="status">Chargement des profils visibles…</p> : error ? <div><p className="auth-notice" role="alert">{error}</p><Link href="/connexion" className="button button-green">Se connecter</Link></div> : profiles.length === 0 ? <div className="value-card"><UserRound size={28}/><h2>Pas encore de profil visible</h2><p>Il n’y a pas encore de profils publiés à vous présenter. Vous pouvez compléter le vôtre et choisir sa visibilité.</p><Link href="/profil" className="button button-green">Compléter mon profil</Link></div> : <div className="value-grid">{profiles.map(profile => <article className="value-card" key={profile.id}>
        <div className="value-top"><span className="value-icon"><UserRound size={22}/></span><span className="card-number">{intentionLabels[profile.relationship_intention] ?? "À discuter"}</span></div>
        <h2>{profile.public_name}</h2>
        {profile.city && <p><MapPin size={14} style={{display:"inline",verticalAlign:"-2px"}}/> {profile.city}</p>}
        <p>{profile.bio || "Cette personne préfère faire connaissance au fil de la conversation."}</p>
        <button className="button button-green" type="button" onClick={() => void likeProfile(profile.id)} disabled={liking !== null}><Heart size={16}/>{liking === profile.id ? "Envoi…" : "Envoyer un intérêt"}</button>
      </article>)}</div>}
      <p className="auth-switch"><Link href="/profil">Gérer mon profil</Link> · <Link href="/">Accueil</Link></p>
    </section>
  </main>;
}
