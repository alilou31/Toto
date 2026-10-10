"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Brain, CheckCircle2, Gamepad2, Languages, RefreshCw, Users, Zap } from "lucide-react";

type Match = {
  match_id: string;
  public_name: string;
  city: string | null;
};

type Session = {
  id: string;
  match_id: string;
  game_key: string;
  status: "invited" | "active" | "completed" | "cancelled";
  created_at: string;
  partner_name: string;
};

const games = [
  { key: "logic", title: "Défi logique", description: "Des petites énigmes pour découvrir la façon de réfléchir de l’autre.", icon: Brain, tag: "Réflexion" },
  { key: "english", title: "Duo langues", description: "Des questions légères pour pratiquer l’anglais et apprendre ensemble.", icon: Languages, tag: "Conversation" },
  { key: "snake", title: "Snake challenge", description: "Un mini-défi arcade pour comparer vos scores et vous challenger.", icon: Zap, tag: "Rapide" },
  { key: "cooperative", title: "Défi coopératif", description: "Choisissez un objectif commun et faites équipe pour le réussir.", icon: Users, tag: "En équipe" },
] as const;

const gameLabels: Record<string, string> = {
  logic: "Défi logique",
  english: "Duo langues",
  snake: "Snake challenge",
  cooperative: "Défi coopératif",
};
const statusLabels: Record<Session["status"], string> = {
  invited: "Proposée",
  active: "En cours",
  completed: "Terminée",
  cancelled: "Annulée",
};

export default function RencontrePage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedMatch, setSelectedMatch] = useState("");
  const [selectedGame, setSelectedGame] = useState<string>("logic");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [matchesResponse, sessionsResponse] = await Promise.all([
        fetch("/api/matches", { cache: "no-store" }),
        fetch("/api/rencontre/sessions", { cache: "no-store" }),
      ]);
      const matchesData = await matchesResponse.json();
      const sessionsData = await sessionsResponse.json();
      if (matchesResponse.status === 401 || sessionsResponse.status === 401) {
        throw new Error("Connectez-vous pour utiliser le Mode Rencontre.");
      }
      if (!matchesResponse.ok) throw new Error(matchesData.error || "Impossible de charger vos matchs.");
      if (!sessionsResponse.ok) throw new Error(sessionsData.error || "Impossible de charger vos activités.");
      const nextMatches = Array.isArray(matchesData.matches) ? matchesData.matches as Match[] : [];
      setMatches(nextMatches);
      setSessions(Array.isArray(sessionsData.sessions) ? sessionsData.sessions as Session[] : []);
      setSelectedMatch((current) => current && nextMatches.some((item) => item.match_id === current) ? current : nextMatches[0]?.match_id ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Service indisponible.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadData(); }, [loadData]);

  async function createSession() {
    if (!selectedMatch || !selectedGame) return;
    setCreating(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/rencontre/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId: selectedMatch, gameKey: selectedGame }),
      });
      const data = await response.json();
      if (response.status === 401) throw new Error("Connectez-vous pour proposer une activité.");
      if (!response.ok) throw new Error(data.error || "Impossible de créer l’activité.");
      setNotice("Votre proposition est enregistrée. Elle apparaît dans la liste des activités liées à ce match.");
      await loadData();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Service indisponible.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <main className="auth-page">
      <Link href="/" className="auth-back"><ArrowLeft size={16} /> Retour à l’accueil</Link>
      <section className="auth-card auth-card-wide">
        <Link href="/" className="brand auth-brand">
          <span className="brand-mark"><Gamepad2 size={20} /></span>
          <span className="brand-word">NIKAHYA<span className="brand-dot">.</span></span>
        </Link>
        <div className="section-kicker auth-kicker">APPRENDRE À SE CONNAÎTRE AUTREMENT</div>
        <h1 className="auth-title">Le Mode <em>Rencontre.</em></h1>
        <p className="auth-description">Proposez une activité à une personne avec qui vous avez déjà un match. Un jeu, une énigme ou un défi partagé peut lancer une conversation plus naturellement.</p>

        <div className="value-grid" style={{ marginBottom: 28 }}>
          {games.map((game) => {
            const Icon = game.icon;
            const active = selectedGame === game.key;
            return (
              <button
                key={game.key}
                type="button"
                className="value-card"
                aria-pressed={active}
                onClick={() => setSelectedGame(game.key)}
                style={{
                  textAlign: "left",
                  color: "inherit",
                  background: active ? "#edf4ee" : "#fff",
                  border: active ? "2px solid var(--green)" : "1px solid #e9ece5",
                  cursor: "pointer",
                  minHeight: 190,
                }}
              >
                <div className="value-top">
                  <span className="value-icon"><Icon size={22} /></span>
                  <span className="card-number">{active ? "SÉLECTIONNÉ" : game.tag.toUpperCase()}</span>
                </div>
                <h2 style={{ fontFamily: "var(--sans)", fontSize: 16, fontWeight: 700, letterSpacing: 0 }}>{game.title}</h2>
                <p>{game.description}</p>
              </button>
            );
          })}
        </div>

        <div className="value-card" style={{ marginBottom: 24 }}>
          <div className="value-top">
            <span className="value-icon"><Users size={22} /></span>
            <span className="card-number">POUR UN MATCH EXISTANT</span>
          </div>
          <h2 style={{ fontFamily: "var(--sans)", fontSize: 17, fontWeight: 700, letterSpacing: 0 }}>À qui proposer cette activité ?</h2>
          {loading ? <p role="status">Chargement de vos matchs…</p> : matches.length === 0 ? (
            <p>Vous n’avez pas encore de match disponible. Découvrez des profils et créez un match réciproque avant de proposer une activité.</p>
          ) : (
            <>
              <label htmlFor="rencontre-match" className="auth-label">Choisir un match</label>
              <select id="rencontre-match" className="auth-input" value={selectedMatch} onChange={(event) => setSelectedMatch(event.target.value)}>
                {matches.map((match) => <option key={match.match_id} value={match.match_id}>{match.public_name}{match.city ? ` · ${match.city}` : ""}</option>)}
              </select>
              <button type="button" className="button button-green" onClick={() => void createSession()} disabled={creating || !selectedMatch}>
                <Gamepad2 size={16} /> {creating ? "Enregistrement…" : "Proposer cette activité"}
              </button>
            </>
          )}
        </div>

        {notice && <p className="auth-notice" role="status"><CheckCircle2 size={16} style={{ display: "inline", verticalAlign: "-3px" }} /> {notice}</p>}
        {error && <p className="auth-notice" role="alert">{error} {error.includes("Connectez-vous") && <Link href="/connexion">Se connecter</Link>}</p>}

        <div className="value-card">
          <div className="value-top">
            <span className="value-icon"><Gamepad2 size={22} /></span>
            <span className="card-number">VOS ACTIVITÉS</span>
            <button className="button button-quiet" type="button" onClick={() => void loadData()} disabled={loading}><RefreshCw size={14} /> Actualiser</button>
          </div>
          {loading ? <p role="status">Chargement des activités…</p> : sessions.length === 0 ? (
            <p>Aucune activité pour le moment. Choisissez un jeu et proposez-le à un match.</p>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {sessions.map((session) => (
                <article key={session.id} style={{ borderTop: "1px solid var(--line)", paddingTop: 14, display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                  <div>
                    <strong>{gameLabels[session.game_key] ?? "Activité"}</strong>
                    <p style={{ margin: "5px 0 0", color: "var(--muted)" }}>Avec {session.partner_name} · {new Date(session.created_at).toLocaleDateString("fr-FR")}</p>
                  </div>
                  <span className="card-number">{statusLabels[session.status] ?? session.status}</span>
                </article>
              ))}
            </div>
          )}
        </div>
        <p className="auth-switch"><Link href="/matchs">Mes matchs</Link> · <Link href="/matchs">Mes matchs</Link> · <Link href="/">Accueil</Link></p>
      </section>
    </main>
  );
}
