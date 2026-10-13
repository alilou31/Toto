"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Ban, Gamepad2, Heart, MapPin, ShieldCheck, UserRound, Sparkles } from "lucide-react";

type PlayedGame = { game_id: string; games_played: number };
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
  played_games?: PlayedGame[];
  is_online?: boolean;
};

const intentions: Record<string, string> = {
  marriage: "Recherche une relation tournée vers le mariage",
  serious: "Recherche une relation sérieuse",
  friendship: "Souhaite faire connaissance",
  unspecified: "Préfère en discuter",
};
const gameLabels: Record<string, string> = {
  "mots-croises": "Mots croisés",
  enigme: "Énigmes",
  calcul: "Défis de calcul",
  personnalite: "Quiz de personnalité",
  duel: "Duel",
  tournoi: "Tournoi",
};

export default function MemberProfilePage() {
  const params = useParams<{ profileId: string }>();
  const router = useRouter();
  const profileId = params.profileId;
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [blocking, setBlocking] = useState(false);
  const [notice, setNotice] = useState("");

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

  async function blockMember() {
    if (!profile || !window.confirm(`Bloquer ${profile.public_name} ? Cette personne ne pourra plus apparaître dans vos découvertes, matchs ou conversations.`)) return;
    setBlocking(true);
    setNotice("");
    try {
      const response = await fetch("/api/blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blockedUserId: profile.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Impossible de bloquer ce profil.");
      setNotice("Profil bloqué. Il ne sera plus proposé dans vos découvertes.");
      router.push("/decouvrir?blocked=1");
    } catch (cause) {
      setNotice(cause instanceof Error ? cause.message : "Service indisponible.");
    } finally {
      setBlocking(false);
    }
  }

  return (
    <main className="auth-page">
      <Link href="/decouvrir" className="auth-back"><ArrowLeft size={16}/> Retour aux profils</Link>
      <section className="auth-card auth-card-wide member-detail-card">
        <Link href="/tableau-de-bord" className="brand auth-brand"><span className="brand-mark"><Heart size={20}/></span><span className="brand-word">NAKAHYA<span className="brand-dot">.</span></span></Link>
        <div className="section-kicker auth-kicker">UNE RENCONTRE QUI A DU SENS</div>
        {loading ? <p role="status">Chargement de la fiche…</p> : error ? (
          <div role="alert" className="auth-notice"><p>{error}</p><Link href="/decouvrir" className="button button-green">Revenir à la découverte</Link></div>
        ) : profile ? (
          <>
            <div className="member-detail-hero">
              <span className="member-detail-avatar" aria-hidden="true">{profile.public_name.trim().slice(0, 1).toLocaleUpperCase()}</span>
              <div>
                <div className="card-number">PROFIL MEMBRE</div>
                <h1 className="auth-title">{profile.public_name}<em>.</em></h1>
                <p className={"profile-presence-label" + (profile.is_online ? " is-online" : "")}><span className="profile-online-dot" aria-hidden="true"/>{profile.is_online ? "En ligne" : "Hors ligne"}</p>
                {profile.city && <p className="member-detail-city"><MapPin size={15}/>{profile.city}</p>}
                <p className="member-detail-intention">{intentions[profile.relationship_intention] || intentions.unspecified}</p>
              </div>
            </div>
            <div className="member-detail-columns">
              <section className="member-detail-panel">
                <h2>Ce qui compte pour moi</h2>
                <p>{profile.bio?.trim() || "Cette personne préfère faire connaissance au fil de la conversation."}</p>
              </section>
              <section className="member-detail-panel">
                <h2><Sparkles size={17}/> Ses passions et sujets de conversation</h2>
                {profile.occupation && <p><strong>Métier :</strong> {profile.occupation}</p>}
                {profile.favorite_games?.length ? <p><strong>Jeux favoris :</strong> {profile.favorite_games.join(" · ")}</p> : null}
                {profile.hobbies?.length ? <p><strong>Hobbies :</strong> {profile.hobbies.join(" · ")}</p> : null}
                {profile.interests?.length ? <p><strong>Centres d’intérêt :</strong> {profile.interests.join(" · ")}</p> : null}
                {(profile.religion || profile.ethnicity) ? <p><strong>Informations partagées :</strong> {[profile.religion, profile.ethnicity].filter(Boolean).join(" · ")}</p> : null}
                {!profile.occupation && !profile.favorite_games?.length && !profile.hobbies?.length && !profile.interests?.length && !profile.religion && !profile.ethnicity && <p>Ces informations seront partagées si cette personne complète ces rubriques.</p>}
              </section>
              <section className="member-detail-panel member-detail-games">
                <h2><Gamepad2 size={17}/> Jeux auxquels cette personne a joué</h2>
                {profile.played_games?.length ? <>
                  <p className="member-detail-muted">Activité de jeu enregistrée sur NAKAHYA, sans afficher ses réponses ni ses scores privés.</p>
                  <div className="member-game-list">{profile.played_games.map(game => <div key={game.game_id}><span>{gameLabels[game.game_id] ?? game.game_id}</span><strong>{game.games_played} partie{game.games_played > 1 ? "s" : ""}</strong></div>)}</div>
                </> : <p>Pas encore de partie enregistrée à afficher. Vous pourrez peut-être découvrir un jeu ensemble.</p>}
              </section>
            </div>
            <p className="password-hint member-detail-privacy"><ShieldCheck size={15}/> Les coordonnées privées et la date de naissance ne sont pas affichées. Les profils bloqués ne sont pas accessibles dans la découverte.</p>
            {notice && <p className="auth-notice" role="status">{notice}</p>}
            <div className="member-detail-actions">
              <Link href="/decouvrir" className="button button-quiet"><ArrowLeft size={16}/> Continuer la découverte</Link>
              <Link href="/matchs" className="button button-green">Mes affinités <Heart size={16}/></Link>
              <button type="button" className="button button-quiet member-block-button" onClick={() => void blockMember()} disabled={blocking}><Ban size={15}/>{blocking ? "Blocage…" : "Bloquer ce profil"}</button>
            </div>
          </>
        ) : null}
      </section>
    </main>
  );
}
