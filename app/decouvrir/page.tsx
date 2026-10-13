"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Ban, Flag, Heart, MapPin, RefreshCw, UserRound, Sparkles } from "lucide-react";

type PublicProfile = {
  id: string;
  public_name: string;
  city: string | null;
  bio: string;
  relationship_intention: "marriage" | "serious" | "friendship" | "unspecified";
  hobbies?: string[] | null;
  favorite_games?: string[] | null;
  interests?: string[] | null;
  occupation?: string | null;
  is_online?: boolean;
  religion?: string | null;
  ethnicity?: string | null;
};

const intentionLabels: Record<PublicProfile["relationship_intention"], string> = {
  marriage: "Mariage",
  serious: "Relation sérieuse",
  friendship: "Faire connaissance",
  unspecified: "À discuter",
};

export default function DiscoverPage() {
  const [profiles, setProfiles] = useState<PublicProfile[]>([]);
  const [myInterests, setMyInterests] = useState<string[]>([]);
  const [myGames, setMyGames] = useState<string[]>([]);
  const [myHobbies, setMyHobbies] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [liking, setLiking] = useState<string | null>(null);
  const [blocking, setBlocking] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [reportTarget, setReportTarget] = useState<string | null>(null);
  const [reportCategory, setReportCategory] = useState("fake_profile");
  const [reportDetails, setReportDetails] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);

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
      const ownResponse = await fetch("/api/profile", { cache: "no-store" });
      if (ownResponse.ok) {
        const ownData = await ownResponse.json();
        setMyInterests(Array.isArray(ownData.profile?.interests) ? ownData.profile.interests : []);
        setMyGames(Array.isArray(ownData.profile?.favorite_games) ? ownData.profile.favorite_games : []);
        setMyHobbies(Array.isArray(ownData.profile?.hobbies) ? ownData.profile.hobbies : []);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Service indisponible.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadProfiles(); }, []);

  async function likeProfile(profileId: string) {
    setLiking(profileId);
    setNotice("");
    try {
      const response = await fetch("/api/interests", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientId: profileId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Impossible d’envoyer cet intérêt.");
      setNotice(data.matched ? "C’est réciproque ! Vous avez un nouveau match." : "Intérêt envoyé. Si cette personne vous choisit aussi, vous aurez un match.");
    } catch (cause) {
      setNotice(cause instanceof Error ? cause.message : "Service indisponible.");
    } finally {
      setLiking(null);
    }
  }

  async function submitReport(event: React.FormEvent<HTMLFormElement>, profileId: string) {
    event.preventDefault();
    setSubmittingReport(true);
    setNotice("");
    try {
      const response = await fetch("/api/reports", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportedUserId: profileId, category: reportCategory, details: reportDetails }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Impossible d’envoyer le signalement.");
      setReportTarget(null);
      setReportDetails("");
      setReportCategory("fake_profile");
      setNotice("Merci. Votre signalement a été transmis de manière confidentielle.");
    } catch (cause) {
      setNotice(cause instanceof Error ? cause.message : "Service indisponible.");
    } finally {
      setSubmittingReport(false);
    }
  }

  async function blockProfile(profile: PublicProfile) {
    if (!window.confirm(`Bloquer ${profile.public_name} ? Ce profil ne pourra plus apparaître dans vos découvertes, matchs ou conversations.`)) return;
    setBlocking(profile.id);
    setNotice("");
    try {
      const response = await fetch("/api/blocks", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blockedUserId: profile.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Impossible de bloquer ce profil.");
      setProfiles(current => current.filter(item => item.id !== profile.id));
      setNotice(`Le profil de ${profile.public_name} a été bloqué.`);
    } catch (cause) {
      setNotice(cause instanceof Error ? cause.message : "Service indisponible.");
    } finally {
      setBlocking(null);
    }
  }

  return (
    <main className="discovery-page">
      <header className="discovery-header">
        <Link href="/tableau-de-bord" className="discovery-back"><ArrowLeft size={16}/> Mon espace</Link>
        <Link href="/" className="brand" aria-label="NIKAHYA, accueil"><span className="brand-mark"><Heart size={18}/></span><span className="brand-word">NIKAHYA<span className="brand-dot">.</span></span></Link>
        <nav aria-label="Navigation découverte">
          <Link href="/matchs">Mes affinités</Link>
          <Link href="/profil">Mon profil</Link>
        </nav>
      </header>

      <section className="discovery-content">
        <div className="discovery-heading">
          <div>
            <div className="section-kicker">DES RENCONTRES QUI ONT DU SENS</div>
            <h1>La bonne rencontre<br/><em>commence par un détail.</em></h1>
            <p>Parcourez les profils en un coup d’œil, puis ouvrez une fiche pour découvrir ce qui compte vraiment.</p>
          </div>
          <div className="discovery-heading-actions">
            <Link href="/offres" className="discovery-premium-link"><Sparkles size={15}/> Voir les offres</Link>
            <button className="button button-quiet" type="button" onClick={() => void loadProfiles()} disabled={loading}><RefreshCw size={15}/> Actualiser</button>
          </div>
        </div>

        {notice && <p className="discovery-notice" role="status">{notice} <Link href="/matchs">Voir mes affinités</Link></p>}
        {loading ? <div className="discovery-state" role="status">Chargement des profils visibles…</div>
          : error ? <div className="discovery-state" role="alert"><p>{error}</p><Link href="/connexion" className="button button-green">Se connecter</Link></div>
          : profiles.length === 0 ? <div className="discovery-empty"><span><UserRound size={25}/></span><h2>De nouvelles rencontres bientôt</h2><p>Il n’y a pas encore de profils visibles à vous présenter. Complétez le vôtre pour rejoindre la découverte.</p><Link href="/profil" className="button button-green">Compléter mon profil</Link></div>
          : <>
            <div className="discovery-results-bar"><span><strong>{profiles.length}</strong> profils à découvrir</span><span>Profils visibles · 18+</span></div>
            <div className="discovery-grid">
              {profiles.map(profile => {
                const mine = [...myInterests, ...myGames, ...myHobbies];
                const theirs = [...(profile.interests ?? []), ...(profile.favorite_games ?? []), ...(profile.hobbies ?? [])];
                const shared = theirs.filter(value => mine.some(item => item.trim().toLowerCase() === value.trim().toLowerCase()));
                const tags = [...(profile.interests ?? []), ...(profile.favorite_games ?? []), ...(profile.hobbies ?? [])]
                  .filter((value, index, values) => values.indexOf(value) === index);
                // Show shared interests first so the compact card surfaces the most useful compatibility signals.
                const visibleTags = [...tags].sort((a, b) => {
                  const aShared = shared.some(value => value.toLowerCase() === a.toLowerCase());
                  const bShared = shared.some(value => value.toLowerCase() === b.toLowerCase());
                  return Number(bShared) - Number(aShared);
                });
                return <article className="discovery-card" key={profile.id}>
                  <div className="discovery-card-top">
                    <span className="discovery-avatar-wrap"><span className="discovery-avatar" aria-hidden="true">{profile.public_name.trim().slice(0, 1).toLocaleUpperCase()}</span>{profile.is_online && <span className="profile-online-dot" aria-label="En ligne" title="En ligne"/>}</span>
                    <span className="discovery-intention">{intentionLabels[profile.relationship_intention] ?? "À discuter"}</span>
                  </div>
                  <h2><Link href={`/membre/${encodeURIComponent(profile.id)}`} aria-label={`Voir la fiche de ${profile.public_name}`}>{profile.public_name}</Link></h2>
                  {profile.city && <p className="discovery-city"><MapPin size={13}/>{profile.city}</p>}
                  <p className="discovery-bio">{profile.bio?.trim() || "Préfère faire connaissance au fil de la conversation."}</p>
                  {shared.length > 0 && <p className="discovery-shared"><Sparkles size={13}/>{shared.length} point{shared.length > 1 ? "s" : ""} en commun</p>}
                  <div className="discovery-tags">
                    {visibleTags.slice(0, 3).map(tag => <span key={tag} className={shared.some(value => value.toLowerCase() === tag.toLowerCase()) ? "is-shared" : ""}>{tag}</span>)}
                    {tags.length > 3 && <span className="discovery-more">+{tags.length - 3}</span>}
                    {tags.length === 0 && <span>À découvrir</span>}
                  </div>
                  <div className="discovery-card-actions">
                    <Link href={`/membre/${encodeURIComponent(profile.id)}`} className="discovery-detail-link" aria-label={`Consulter la fiche de ${profile.public_name}`}>Voir la fiche</Link>
                    <button className="discovery-like" type="button" onClick={() => void likeProfile(profile.id)} disabled={liking !== null || blocking !== null} aria-label={`Envoyer un intérêt à ${profile.public_name}`} title="Envoyer un intérêt">
                      <Heart size={16} fill="none"/>{liking === profile.id ? "…" : "Intéressé·e"}
                    </button>
                  </div>
                  <div className="discovery-secondary-actions">
                    <button type="button" onClick={() => void blockProfile(profile)} disabled={blocking !== null || liking !== null} aria-label={`Bloquer ${profile.public_name}`}><Ban size={13}/>{blocking === profile.id ? "Blocage…" : "Bloquer"}</button>
                    <button type="button" onClick={() => { setReportTarget(current => current === profile.id ? null : profile.id); setReportDetails(""); setNotice(""); }} disabled={blocking !== null || liking !== null || submittingReport} aria-expanded={reportTarget === profile.id} aria-label={`Signaler ${profile.public_name}`}><Flag size={13}/> Signaler</button>
                  </div>
                  {reportTarget === profile.id && <form className="discovery-report-form" onSubmit={event => void submitReport(event, profile.id)}>
                    <h3>Signaler ce profil</h3>
                    <label htmlFor={`report-category-${profile.id}`}>Motif</label>
                    <select id={`report-category-${profile.id}`} value={reportCategory} onChange={event => setReportCategory(event.target.value)} required>
                      <option value="fake_profile">Faux profil ou usurpation</option>
                      <option value="harassment">Harcèlement ou comportement abusif</option>
                      <option value="scam">Arnaque ou demande d’argent</option>
                      <option value="inappropriate_content">Contenu inapproprié</option>
                      <option value="underage_concern">Suspicion de minorité</option>
                      <option value="other">Autre motif</option>
                    </select>
                    <label htmlFor={`report-details-${profile.id}`}>Précisions (facultatif)</label>
                    <textarea id={`report-details-${profile.id}`} rows={3} maxLength={3000} value={reportDetails} onChange={event => setReportDetails(event.target.value)} placeholder="Décrivez brièvement ce qui vous préoccupe."/>
                    <div className="discovery-report-actions"><button type="submit" disabled={submittingReport}>{submittingReport ? "Envoi…" : "Envoyer"}</button><button type="button" onClick={() => setReportTarget(null)} disabled={submittingReport}>Annuler</button></div>
                  </form>}
                </article>;
              })}
            </div>
          </>}
        <p className="discovery-privacy"><span aria-hidden="true">✦</span> Vos coordonnées privées et votre date de naissance ne sont jamais affichées.</p>
      </section>
    </main>
  );
}
