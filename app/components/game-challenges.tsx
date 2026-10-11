"use client";

import type { FormEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Clipboard, Copy, Gamepad2, RefreshCw, Swords, Users } from "lucide-react";

type GameId = "mots-croises" | "enigme" | "calcul" | "personnalite" | "duel" | "tournoi";
type Session = { id: string; invite_code: string; game_id: GameId; status: "waiting" | "active" | "completed" | "cancelled"; current_question: number; is_host: boolean; has_opponent: boolean; created_at: string };
type LiveState = { session: Session; question: number | null; myAnswer: number | null; opponentAnswered: boolean; bothAnswered: boolean; answers: { isMe: boolean; answerIndex: number }[] };
const GAMES: { id: GameId; label: string }[] = [
  { id: "mots-croises", label: "Mots croisés à deux" }, { id: "enigme", label: "L'énigme partagée" },
  { id: "calcul", label: "Sprint de calcul" }, { id: "personnalite", label: "Qui me connaît ?" },
  { id: "duel", label: "Défi tête-à-tête" }, { id: "tournoi", label: "Tournoi amical" },
];
const QUESTIONS: Record<GameId, { prompt: string; options: string[] }[]> = {
  "mots-croises": [
    { prompt: "Qu'est-ce qui aide deux personnes à se comprendre ?", options: ["Le dialogue", "Le silence", "La vitesse", "Le hasard"] },
    { prompt: "Quel ingrédient fait grandir la confiance ?", options: ["La patience", "La pression", "La compétition", "Le mystère"] },
    { prompt: "Quelle qualité aide à mieux écouter ?", options: ["La curiosité", "L'impatience", "La distraction", "La précipitation"] },
    { prompt: "Un lien solide se construit…", options: ["Pas à pas", "En un instant", "Sans échange", "En gagnant"] },
  ],
  enigme: [
    { prompt: "Plus on les partage, plus on en crée. Que sont-ils ?", options: ["Les souvenirs", "Les secrets", "Les silences", "Les retards"] },
    { prompt: "On peut la rompre sans la toucher. Qu'est-ce que c'est ?", options: ["Une promesse", "Une corde", "Une fenêtre", "Une vague"] },
    { prompt: "Elle grandit quand on pose des questions.", options: ["La curiosité", "La distance", "La routine", "La fatigue"] },
    { prompt: "Deux personnes la construisent en se parlant.", options: ["Un dialogue", "Un mur", "Un détour", "Un silence"] },
  ],
  calcul: [
    { prompt: "3 indices plus 4 indices, cela fait…", options: ["6", "7", "8", "12"] },
    { prompt: "Une manche dure 3 minutes. Deux manches durent…", options: ["5 min", "6 min", "9 min", "10 min"] },
    { prompt: "8 bonnes réponses sur 10 représentent…", options: ["60 %", "70 %", "80 %", "90 %"] },
    { prompt: "12 questions réparties en 3 manches égales : combien par manche ?", options: ["3", "4", "6", "9"] },
  ],
  personnalite: [
    { prompt: "Pour apprendre à connaître quelqu'un, vous préférez…", options: ["Une conversation", "Une activité à deux", "Des petites questions", "Laisser faire le temps"] },
    { prompt: "Votre moment idéal pour discuter ?", options: ["Une balade", "Autour d'un repas", "Pendant un jeu", "Un appel tranquille"] },
    { prompt: "Qu'appréciez-vous le plus chez quelqu'un ?", options: ["L'humour", "L'écoute", "La curiosité", "La sincérité"] },
    { prompt: "Pour organiser une sortie, vous êtes plutôt…", options: ["Tout prévoir", "Improviser", "Décider ensemble", "Voir selon l'envie"] },
  ],
  duel: [
    { prompt: "Quel comportement aide à résoudre un désaccord ?", options: ["Écouter l'autre", "Couper la parole", "Ignorer", "Vouloir gagner"] },
    { prompt: "Pour clarifier un malentendu, le mieux est de…", options: ["Poser une question", "Supposer", "Attendre toujours", "Changer de sujet"] },
    { prompt: "Un bon défi à deux devrait surtout être…", options: ["Amusant", "Stressant", "Secret", "Imprévisible"] },
    { prompt: "Quand quelqu'un partage une passion, vous pouvez…", options: ["Poser des questions", "La minimiser", "Changer de sujet", "Comparer"] },
  ],
  tournoi: [
    { prompt: "Comprendre ce que l'autre ressent, c'est…", options: ["L'empathie", "La rivalité", "La routine", "L'hésitation"] },
    { prompt: "Quel élément est essentiel à une équipe ?", options: ["La communication", "Un seul décide", "Le secret", "La vitesse seule"] },
    { prompt: "Qu'est-ce qui aide à progresser après une partie ?", options: ["Apprendre de l'expérience", "Ignorer le résultat", "Éviter les questions", "Se comparer"] },
    { prompt: "Une compétition amicale doit valoriser…", options: ["Le respect", "La pression", "La moquerie", "La domination"] },
  ],
};
const titleFor = (id: string) => GAMES.find((game) => game.id === id)?.label ?? id;
const messageFor = (error: unknown) => error instanceof Error ? error.message : "Une erreur est survenue.";

export function GameChallenges() {
  const [gameId, setGameId] = useState<GameId>("enigme");
  const [code, setCode] = useState("");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeId, setActiveId] = useState("");
  const [live, setLive] = useState<LiveState | null>(null);
  const [choice, setChoice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [copied, setCopied] = useState(false);

  const activeSession = useMemo(() => sessions.find((item) => item.id === activeId) ?? live?.session ?? null, [sessions, activeId, live]);
  const questions = live ? QUESTIONS[live.session.game_id] : QUESTIONS.enigme;
  const questionIndex = live?.question ?? live?.session.current_question ?? 0;

  const refreshSessions = useCallback(async () => {
    const response = await fetch("/api/games/sessions", { cache: "no-store" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Impossible de charger vos défis.");
    setSessions(data.sessions ?? []);
  }, []);

  const refreshLive = useCallback(async (id: string) => {
    const response = await fetch("/api/games/sessions/" + encodeURIComponent(id), { cache: "no-store" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Impossible de charger cette partie.");
    setLive(data as LiveState);
    setChoice(null);
    return data as LiveState;
  }, []);

  useEffect(() => {
    let mounted = true;
    fetch("/api/games/sessions", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Connectez-vous pour retrouver vos défis.");
        return data.sessions as Session[];
      })
      .then((items) => { if (mounted) setSessions(items ?? []); })
      .catch((e) => { if (mounted) setError(messageFor(e)); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const invite = params.get("code");
    if (invite && /^[A-Za-z0-9]{8}$/.test(invite)) setCode(invite.toUpperCase());
  }, []);

  useEffect(() => {
    if (!activeId) { setLive(null); return; }
    let mounted = true;
    const poll = async () => {
      try {
        const response = await fetch("/api/games/sessions/" + encodeURIComponent(activeId), { cache: "no-store" });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Impossible de synchroniser la partie.");
        if (mounted) {
          setLive((previous) => {
            const next = data as LiveState;
            if (!previous || previous.session.current_question !== next.session.current_question || previous.session.status !== next.session.status || previous.myAnswer !== next.myAnswer) setChoice(null);
            return next;
          });
        }
      } catch (e) {
        if (mounted) setError(messageFor(e));
      }
    };
    void poll();
    const interval = window.setInterval(() => void poll(), 2500);
    return () => { mounted = false; window.clearInterval(interval); };
  }, [activeId]);

  async function createChallenge() {
    setWorking(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/games/sessions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ gameId }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Impossible de créer le défi.");
      const session = data.session as Session;
      setActiveId(session.id);
      setSessions((previous) => [session, ...previous.filter((item) => item.id !== session.id)]);
      setNotice("Défi créé. Partagez le code avec l'autre joueur.");
    } catch (e) { setError(messageFor(e)); }
    finally { setWorking(false); }
  }

  async function joinChallenge(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setWorking(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/games/sessions/join", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Impossible de rejoindre le défi.");
      const session = data.session as Session;
      setActiveId(session.id);
      setSessions((previous) => [session, ...previous.filter((item) => item.id !== session.id)]);
      setNotice("Vous avez rejoint le défi. Les réponses se synchronisent automatiquement.");
    } catch (e) { setError(messageFor(e)); }
    finally { setWorking(false); }
  }

  async function submitAnswer() {
    if (!live || choice === null || live.question === null || live.myAnswer !== null || live.session.status !== "active") return;
    setWorking(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/games/sessions/" + encodeURIComponent(live.session.id) + "/answers", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionIndex: live.question, answerIndex: choice }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Réponse non enregistrée.");
      await refreshLive(live.session.id);
      await refreshSessions();
      setNotice("Réponse enregistrée. En attente de l'autre joueur si nécessaire…");
    } catch (e) { setError(messageFor(e)); }
    finally { setWorking(false); }
  }

  async function copyInvite() {
    if (!live?.session.invite_code) return;
    const url = window.location.origin + "/cockpit/defis?code=" + live.session.invite_code;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true); setNotice("Lien d'invitation copié.");
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCode(live.session.invite_code);
      setNotice("Copiez le code d'invitation affiché ci-dessous et envoyez-le à l'autre joueur.");
    }
  }

  return <div className="game-challenges-layout">
    <section className="game-panel game-panel-wide">
      <div className="game-section-title"><div><p className="game-eyebrow">DÉFIS SYNCHRONISÉS</p><h2>Inviter quelqu'un à jouer</h2></div><Users size={21}/></div>
      <p>Créez une partie, partagez le lien ou le code à 8 caractères. Quand l'autre personne rejoint, chaque question avance après les deux réponses.</p>
      <div className="game-challenge-create-row">
        <label className="game-challenge-field"><span>Choisir un jeu</span><select value={gameId} onChange={(event) => setGameId(event.target.value as GameId)}>{GAMES.map((game) => <option key={game.id} value={game.id}>{game.label}</option>)}</select></label>
        <button type="button" className="game-button game-button-primary" disabled={working} onClick={() => void createChallenge()}><Swords size={16}/> Créer un défi</button>
      </div>
      <form className="game-challenge-create-row" onSubmit={joinChallenge}>
        <label className="game-challenge-field"><span>J'ai reçu un code</span><input value={code} onChange={(event) => setCode(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8))} placeholder="AB12CD34" maxLength={8} autoComplete="off" /></label>
        <button type="submit" className="game-button game-button-secondary" disabled={working || code.length !== 8}><ArrowRight size={16}/> Rejoindre</button>
      </form>
      {error && <p className="game-save-error" role="alert">{error}</p>}
      {notice && <p className="game-save-success" role="status">{notice}</p>}
    </section>

    {activeSession && live && <section className="game-panel game-panel-wide game-challenge-live">
      <div className="game-section-title"><div><p className="game-eyebrow">{live.session.status === "waiting" ? "EN ATTENTE D'UN JOUEUR" : live.session.status === "completed" ? "PARTIE TERMINÉE" : "PARTIE EN COURS"}</p><h2>{titleFor(live.session.game_id)}</h2></div><Gamepad2 size={21}/></div>
      {live.session.status === "waiting" && <div className="game-invite-card"><p>Partagez ce lien avec votre partenaire pour démarrer la partie.</p><strong>{live.session.invite_code}</strong><button type="button" className="game-button game-button-secondary" onClick={() => void copyInvite()}>{copied ? <Check size={16}/> : <Copy size={16}/>} {copied ? "Lien copié" : "Copier le lien d'invitation"}</button><p className="game-challenge-link">{typeof window !== "undefined" ? window.location.origin + "/cockpit/defis?code=" + live.session.invite_code : ""}</p></div>}
      {live.session.status === "active" && live.question !== null && <div>
        <div className="game-play-progress"><span>QUESTION {live.question + 1} / 4</span><span>{Math.round((live.question + 1) / 4 * 100)} %</span></div>
        <div className="game-progress"><i style={{ width: ((live.question + 1) / 4 * 100) + "%" }}/></div>
        <h3 className="game-play-question">{questions[live.question].prompt}</h3>
        <div className="game-answer-list">{questions[live.question].options.map((option, index) => <button type="button" key={option} className={"game-answer-option" + (choice === index ? " selected" : "")} aria-pressed={choice === index} disabled={live.myAnswer !== null || working} onClick={() => setChoice(index)}><span className="game-answer-letter">{String.fromCharCode(65 + index)}</span><span>{option}</span></button>)}</div>
        {live.myAnswer !== null ? <p role="status">{live.opponentAnswered ? "Les deux réponses sont reçues, synchronisation en cours…" : "Votre réponse est enregistrée. En attente de l'autre joueur…"}</p> : <button type="button" className="game-button game-button-primary" disabled={choice === null || working} onClick={() => void submitAnswer()}>{working ? "Envoi…" : "Valider ma réponse →"}</button>}
      </div>}
      {live.session.status === "completed" && <div className="game-play-result"><h3>Bien joué, vous avez terminé ensemble !</h3><p>Les quatre questions ont été complétées par les deux joueurs. Vous pouvez relancer un défi pour comparer d'autres réponses.</p><button type="button" className="game-button game-button-primary" onClick={() => { setActiveId(""); setLive(null); setNotice(""); }}>Créer une autre partie</button></div>}
      {live.session.status === "active" && <p className="game-challenge-sync"><RefreshCw size={14}/> Synchronisation automatique toutes les 2,5 secondes.</p>}
    </section>}

    <section className="game-panel game-panel-wide">
      <div className="game-section-title"><div><p className="game-eyebrow">VOTRE HISTORIQUE</p><h2>Défis récents</h2></div><Clipboard size={20}/></div>
      {loading ? <p role="status">Chargement de vos défis…</p> : sessions.length === 0 ? <p>Vous n'avez pas encore de défi. Créez-en un ou rejoignez quelqu'un avec son code.</p> : <div className="game-challenge-session-list">{sessions.map((session) => <button type="button" key={session.id} className={"game-challenge-session" + (activeId === session.id ? " selected" : "")} onClick={() => { setActiveId(session.id); setError(""); }}><span><strong>{titleFor(session.game_id)}</strong><small>{session.is_host ? "Créé par vous" : "Invitation reçue"} · {session.invite_code}</small></span><span className={"game-challenge-status " + session.status}>{session.status === "waiting" ? "En attente" : session.status === "active" ? "En cours" : session.status === "completed" ? "Terminée" : "Annulée"}</span></button>)}</div>}
    </section>
    <p className="game-disclaimer">Les défis utilisent votre session NIKAHYA et la base Neon. Si le serveur signale que la migration 005 manque, elle doit être appliquée une fois dans Neon avant de pouvoir créer ou rejoindre des parties.</p>
    <p><Link href="/cockpit/jeux" className="game-back-link">← Retour au catalogue des jeux</Link></p>
  </div>;
}
