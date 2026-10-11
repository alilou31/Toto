"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Ban, Flag, Heart, MapPin, RefreshCw, UserRound } from "lucide-react";

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
      if (ownResponse.ok) { const ownData = await ownResponse.json(); setMyInterests(Array.isArray(ownData.profile?.interests) ? ownData.profile.interests : []); setMyGames(Array.isArray(ownData.profile?.favorite_games) ? ownData.profile.favorite_games : []); setMyHobbies(Array.isArray(ownData.profile?.hobbies) ? ownData.profile.hobbies : []); }
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

  async function submitReport(event: React.FormEvent<HTMLFormElement>, profileId: string) {
    event.preventDefault();
    setSubmittingReport(true);
    setNotice("");
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportedUserId: profileId, category: reportCategory, details: reportDetails }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Impossible d’envoyer le signalement.");
      setReportTarget(null);
      setReportDetails("");
      setReportCategory("fake_profile");
      setNotice("Merci. Votre signalement a été transmis de manière confidentielle.");
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Service indisponible.");
    } finally {
      setSubmittingReport(false);
    }
  }

  async function blockProfile(profile: PublicProfile) {
    if (!window.confirm(`Bloquer ${profile.public_name} ? Ce profil ne pourra plus apparaître dans vos découvertes, matchs ou conversations.`)) return;
    setBlocking(profile.id); setNotice("");
    try {
      const response = await fetch("/api/blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blockedUserId: profile.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Impossible de bloquer ce profil.");
      setProfiles(current => current.filter(item => item.id !== profile.id));
      setNotice(`Le profil de ${profile.public_name} a été bloqué.`);
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Service indisponible.");
    } finally {
      setBlocking(null);
    }
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
        <h2><Link href={`/membre/${encodeURIComponent(profile.id)}`} aria-label={`Voir la fiche de ${profile.public_name}`}>{profile.public_name}</Link></h2>
        {profile.city && <p><MapPin size={14} style={{display:"inline",verticalAlign:"-2px"}}/> {profile.city}</p>}
        <p>{profile.bio || "Cette personne préfère faire connaissance au fil de la conversation."}</p>
        {(() => { const mine = [...myInterests, ...myGames, ...myHobbies]; const theirs = [...(profile.interests ?? []), ...(profile.favorite_games ?? []), ...(profile.hobbies ?? [])]; const shared = theirs.filter(value => mine.some(item => item.trim().toLowerCase() === value.trim().toLowerCase())); return <div style={{margin:"10px 0"}}>{shared.length > 0 && <p style={{fontWeight:700,color:"#075b4b"}}>✨ {shared.length} point(s) commun(s) avec vous</p>}<div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{shared.map(value => <span key={value} style={{padding:"5px 8px",borderRadius:20,background:"#e5f3ed",color:"#075b4b",fontSize:12}}>En commun · {value}</span>)}{(profile.favorite_games ?? []).filter(value => !shared.includes(value)).slice(0,3).map(value => <span key={value} style={{padding:"5px 8px",borderRadius:20,background:"#f3f5f0",fontSize:12}}>🎮 {value}</span>)}{(profile.hobbies ?? []).filter(value => !shared.includes(value)).slice(0,3).map(value => <span key={value} style={{padding:"5px 8px",borderRadius:20,background:"#f3f5f0",fontSize:12}}>♥ {value}</span>)}{profile.occupation && <span style={{padding:"5px 8px",borderRadius:20,background:"#f3f5f0",fontSize:12}}>Métier : {profile.occupation}</span>}</div></div>; })()}
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <Link href={`/membre/${encodeURIComponent(profile.id)}`} className="button button-quiet" aria-label={`Consulter la fiche de ${profile.public_name}`}>Voir la fiche <UserRound size={16}/></Link>
          <button className="button button-green" type="button" onClick={() => void likeProfile(profile.id)} disabled={liking !== null || blocking !== null}><Heart size={16}/>{liking === profile.id ? "Envoi…" : "Envoyer un intérêt"}</button>
          <button className="button button-quiet" type="button" onClick={() => void blockProfile(profile)} disabled={blocking !== null || liking !== null} aria-label={`Bloquer ${profile.public_name}`}><Ban size={16}/>{blocking === profile.id ? "Blocage…" : "Bloquer"}</button>
          <button className="button button-quiet" type="button" onClick={() => { setReportTarget(current => current === profile.id ? null : profile.id); setReportDetails(""); setNotice(""); }} disabled={blocking !== null || liking !== null || submittingReport} aria-expanded={reportTarget === profile.id} aria-label={`Signaler ${profile.public_name}`}><Flag size={16}/> Signaler</button>
        </div>
        {reportTarget === profile.id && <form className="auth-form" onSubmit={event => void submitReport(event, profile.id)} style={{marginTop:16,borderTop:"1px solid var(--line, #e5e7eb)",paddingTop:16}}>
          <h3>Signaler ce profil</h3>
          <p className="password-hint">Votre signalement reste confidentiel. N’indiquez pas d’informations sensibles inutiles.</p>
          <label htmlFor={`report-category-${profile.id}`}>Motif du signalement</label>
          <select id={`report-category-${profile.id}`} className="form-control" value={reportCategory} onChange={event => setReportCategory(event.target.value)} required>
            <option value="fake_profile">Faux profil ou usurpation</option>
            <option value="harassment">Harcèlement ou comportement abusif</option>
            <option value="scam">Arnaque ou demande d’argent</option>
            <option value="inappropriate_content">Contenu inapproprié</option>
            <option value="underage_concern">Suspicion de minorité</option>
            <option value="other">Autre motif</option>
          </select>
          <label htmlFor={`report-details-${profile.id}`}>Précisions (facultatif)</label>
          <textarea id={`report-details-${profile.id}`} className="form-control" rows={3} maxLength={3000} value={reportDetails} onChange={event => setReportDetails(event.target.value)} placeholder="Décrivez brièvement ce qui vous préoccupe."/>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <button className="button button-green" type="submit" disabled={submittingReport}>{submittingReport ? "Envoi…" : "Envoyer le signalement"}</button>
            <button className="button button-quiet" type="button" onClick={() => setReportTarget(null)} disabled={submittingReport}>Annuler</button>
          </div>
        </form>}
      </article>)}</div>}
      <p className="auth-switch"><Link href="/profil">Gérer mon profil</Link> · <Link href="/">Accueil</Link></p>
    </section>
  </main>;
}
