"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Ban, Gamepad2, Heart, MessageCircle, RefreshCw, UserRound } from "lucide-react";

type Match = { match_id: string; conversation_id: string; profile_id: string; public_name: string; city: string | null; bio: string; relationship_intention: string; hobbies?: string[] | null; favorite_games?: string[] | null; interests?: string[] | null; last_message_at: string | null; last_message: string | null };

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [blocking, setBlocking] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  async function load() {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/matches", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(response.status === 401 ? "Connectez-vous pour consulter vos matchs." : data.error || "Impossible de charger les matchs.");
      setMatches(Array.isArray(data.matches) ? data.matches : []);
    } catch (e) { setError(e instanceof Error ? e.message : "Service indisponible."); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);

  async function blockMatch(match: Match) {
    if (!window.confirm(`Bloquer ${match.public_name} ? Le match et la conversation ne seront plus accessibles.`)) return;
    setBlocking(match.profile_id); setNotice("");
    try {
      const response = await fetch("/api/blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blockedUserId: match.profile_id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Impossible de bloquer ce profil.");
      setMatches(current => current.filter(item => item.profile_id !== match.profile_id));
      setNotice(`${match.public_name} a été bloqué. Le match et la conversation sont masqués.`);
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Service indisponible.");
    } finally {
      setBlocking(null);
    }
  }

  return <main className="auth-page">
    <Link href="/decouvrir" className="auth-back"><ArrowLeft size={16}/> Retour à la découverte</Link>
    <section className="auth-card auth-card-wide">
      <Link href="/" className="brand auth-brand"><span className="brand-mark"><Heart size={20}/></span><span className="brand-word">NIKAHYA<span className="brand-dot">.</span></span></Link>
      <div className="section-kicker auth-kicker">UNE RENCONTRE RÉCIPROQUE</div>
      <h1 className="auth-title">Vos matchs,<br/><em>vos prochaines histoires.</em></h1>
      <div style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:20}}><button className="button button-quiet" onClick={() => void load()} disabled={loading}><RefreshCw size={16}/> Actualiser</button><Link href="/decouvrir" className="button button-green">Découvrir des profils</Link></div>
      {notice && <p className="auth-notice" role="status">{notice}</p>}
      {loading ? <p role="status">Chargement de vos matchs…</p> : error ? <><p className="auth-notice" role="alert">{error}</p><Link href="/connexion" className="button button-green">Se connecter</Link></> : matches.length === 0 ? <div className="value-card"><Heart size={28}/><h2>Vos rencontres commencent ici</h2><p>Quand deux personnes s’envoient un intérêt, leur match apparaîtra ici et elles pourront échanger.</p><Link href="/decouvrir" className="button button-green">Découvrir les profils</Link></div> : <div className="value-grid">{matches.map(match => <article className="value-card" key={match.match_id}><div className="value-top"><span className="value-icon"><UserRound size={22}/></span><span className="card-number">Match</span></div><h2>{match.public_name}</h2>{match.city && <p>{match.city}</p>}<p>{match.last_message || match.bio || "Votre conversation peut commencer."}</p><p><strong>Ses centres d’intérêt :</strong> {[...(match.interests ?? []), ...(match.favorite_games ?? []), ...(match.hobbies ?? [])].slice(0, 6).join(", ") || "À découvrir ensemble"}</p><div style={{display:"flex",gap:8,flexWrap:"wrap"}}><Link href={"/messages/" + match.conversation_id} className="button button-green"><MessageCircle size={16}/> Ouvrir la conversation</Link><Link href="/rencontre" className="button button-quiet"><Gamepad2 size={16}/> Proposer un jeu</Link><button className="button button-quiet" type="button" onClick={() => void blockMatch(match)} disabled={blocking !== null} aria-label={`Bloquer ${match.public_name}`}><Ban size={16}/>{blocking === match.profile_id ? "Blocage…" : "Bloquer"}</button></div></article>)}</div>}
      <p className="auth-switch"><Link href="/profil">Gérer mon profil</Link> · <Link href="/">Accueil</Link></p>
    </section>
  </main>;
}
