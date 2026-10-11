"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Heart, MapPin, ShieldCheck, UserRound } from "lucide-react";

type PublicProfile = {
  id: string;
  public_name: string;
  city: string | null;
  bio: string | null;
  relationship_intention: string;
  hobbies?: string[] | null;
  favorite_games?: string[] | null;
  interests?: string[] | null;
  occupation?: string | null;
  religion?: string | null;
  ethnicity?: string | null;
};

const intentions: Record<string, string> = {
  marriage: "Recherche une relation tournée vers le mariage",
  serious: "Recherche une relation sérieuse",
  friendship: "Souhaite faire connaissance",
  unspecified: "Préfère en discuter",
};

export default function MemberProfilePage() {
  const params = useParams<{ profileId: string }>();
  const profileId = params.profileId;
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("/api/profiles/" + encodeURIComponent(profileId), { cache: "no-store" });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Cette fiche n’est pas disponible.");
        if (active) setProfile(data.profile);
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : "Service indisponible.");
      } finally {
        if (active) setLoading(false);
      }
    }
    if (profileId) void load();
    return () => { active = false; };
  }, [profileId]);

  return (
    <main className="auth-page">
      <Link href="/decouvrir" className="auth-back"><ArrowLeft size={16}/> Retour aux profils</Link>
      <section className="auth-card auth-card-wide">
        <Link href="/tableau-de-bord" className="brand auth-brand"><span className="brand-mark"><Heart size={20}/></span><span className="brand-word">NIKAHYA<span className="brand-dot">.</span></span></Link>
        <div className="section-kicker auth-kicker">UNE RENCONTRE QUI A DU SENS</div>
        {loading ? <p role="status">Chargement de la fiche…</p> : error ? (
          <div role="alert" className="auth-notice"><p>{error}</p><Link href="/decouvrir" className="button button-green">Revenir à la découverte</Link></div>
        ) : profile ? (
          <>
            <div className="value-top" style={{ justifyContent: "flex-start", gap: 14, marginTop: 26 }}>
              <span className="value-icon"><UserRound size={25}/></span>
              <span className="card-number">PROFIL MEMBRE</span>
            </div>
            <h1 className="auth-title">{profile.public_name}<em>.</em></h1>
            {profile.city && <p><MapPin size={15} style={{ display: "inline", verticalAlign: "-2px" }} /> {profile.city}</p>}
            <p className="auth-description">{intentions[profile.relationship_intention] || intentions.unspecified}</p>
            <div className="value-card" style={{ marginTop: 22 }}>
              <h2>Ce qui compte pour moi</h2>
              <p>{profile.bio?.trim() || "Cette personne préfère faire connaissance au fil de la conversation."}</p>
            </div>
            {(profile.favorite_games?.length || profile.hobbies?.length || profile.interests?.length || profile.occupation || profile.religion || profile.ethnicity) ? <div className="value-card" style={{ marginTop: 14 }}>
              <h2>Ses passions et sujets de conversation</h2>
              {profile.occupation && <p><strong>Métier :</strong> {profile.occupation}</p>}
              {profile.favorite_games?.length ? <p><strong>Jeux favoris :</strong> {profile.favorite_games.join(" · ")}</p> : null}
              {profile.hobbies?.length ? <p><strong>Hobbies :</strong> {profile.hobbies.join(" · ")}</p> : null}
              {profile.interests?.length ? <p><strong>Centres d’intérêt :</strong> {profile.interests.join(" · ")}</p> : null}
              {(profile.religion || profile.ethnicity) ? <p><strong>Informations partagées :</strong> {[profile.religion, profile.ethnicity].filter(Boolean).join(" · ")}</p> : null}
              <p className="password-hint">Un jeu ou un centre d’intérêt en commun est un bon prétexte pour engager la conversation.</p>
            </div> : null}
            <p className="password-hint" style={{ marginTop: 18 }}><ShieldCheck size={15} style={{ display: "inline", verticalAlign: "-3px" }} /> Les coordonnées privées et la date de naissance ne sont pas affichées.</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 20 }}>
              <Link href="/decouvrir" className="button button-quiet"><ArrowLeft size={16}/> Continuer la découverte</Link>
              <Link href="/matchs" className="button button-green">Mes affinités <Heart size={16}/></Link>
            </div>
          </>
        ) : null}
      </section>
    </main>
  );
}
