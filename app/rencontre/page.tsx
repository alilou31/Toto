"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Brain, CheckCircle2, Gamepad2, Languages, RefreshCw, Users, Zap, Play, Trophy, X } from "lucide-react";

type Match = { match_id: string; public_name: string; city: string | null };
type Session = {
  id: string;
  match_id: string;
  game_key: string;
  status: "invited" | "active" | "completed" | "cancelled";
  state: Record<string, unknown>;
  created_at: string;
  partner_name: string;
  created_by?: string;
  is_creator?: boolean;
};
const games = [
  { key: "logic", title: "Défi logique", description: "Des énigmes courtes pour découvrir la façon de réfléchir de l’autre.", icon: Brain, tag: "Réflexion" },
  { key: "english", title: "Duo langues", description: "Des questions légères pour pratiquer l’anglais ensemble.", icon: Languages, tag: "Conversation" },
  { key: "snake", title: "Snake challenge", description: "Un jeu arcade : guidez le serpent, mangez les fruits et évitez les collisions.", icon: Zap, tag: "Arcade" },
  { key: "cooperative", title: "Défi coopératif", description: "Réalisez ensemble une série de petits défis.", icon: Users, tag: "En équipe" },
] as const;
const gameLabels: Record<string, string> = { logic: "Défi logique", english: "Duo langues", snake: "Snake challenge", cooperative: "Défi coopératif" };
const statusLabels: Record<Session["status"], string> = { invited: "En attente", active: "En cours", completed: "Terminée", cancelled: "Annulée" };
const logicQuestions = [
  { prompt: "Quel nombre complète la suite : 2, 4, 8, 16, … ?", options: ["18", "24", "32"], answer: "32", explanation: "On multiplie chaque nombre par 2." },
  { prompt: "Tu as 3 pommes et tu en prends 2. Combien en as-tu ?", options: ["1", "2", "3"], answer: "2", explanation: "Tu as pris deux pommes." },
  { prompt: "Quel mot est différent des autres ?", options: ["Rose", "Tulipe", "Carotte"], answer: "Carotte", explanation: "La carotte est un légume." },
];
const englishQuestions = [
  { prompt: "How do you say « apprendre à se connaître »?", options: ["Get to know each other", "Know to learn", "Meet to study"], answer: "Get to know each other" },
  { prompt: "Choose the correct answer: « What do you enjoy doing? »", options: ["I enjoy reading.", "I enjoy to read.", "I reading enjoy."], answer: "I enjoy reading." },
  { prompt: "What does « thoughtful » mean?", options: ["Attentionné", "Fatigué", "Pressé"], answer: "Attentionné" },
];
const coopChallenges = [
  "Chacun partage une chose qui lui donne le sourire.",
  "Trouvez trois centres d’intérêt que vous avez en commun.",
  "Posez-vous chacun une question que vous n’osez pas souvent poser.",
  "Imaginez une sortie idéale avec un budget limité.",
  "Chacun cite une valeur importante dans une relation.",
];

type Cell = { x: number; y: number };
type SnakeDirection = "up" | "down" | "left" | "right";

function SnakeGame({ disabled, onPoint }: { disabled: boolean; onPoint: (score: number, moves: number) => void }) {
  const [snake, setSnake] = useState<Cell[]>([{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }]);
  const [food, setFood] = useState<Cell>({ x: 8, y: 5 });
  const [direction, setDirection] = useState<SnakeDirection>("right");
  const [running, setRunning] = useState(false);
  const [ended, setEnded] = useState(false);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const snakeRef = useRef(snake);
  const foodRef = useRef(food);
  const directionRef = useRef(direction);
  const endedRef = useRef(ended);
  const onPointRef = useRef(onPoint);

  useEffect(() => { snakeRef.current = snake; foodRef.current = food; directionRef.current = direction; endedRef.current = ended; onPointRef.current = onPoint; }, [snake, food, direction, running, ended, onPoint]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const map: Record<string, SnakeDirection> = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right", w: "up", s: "down", a: "left", d: "right" };
      const next = map[event.key];
      if (!next) return;
      event.preventDefault();
      const current = directionRef.current;
      if ((current === "up" && next !== "down") || (current === "down" && next !== "up") || (current === "left" && next !== "right") || (current === "right" && next !== "left")) {
        directionRef.current = next;
        setDirection(next);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!running || ended) return;
    const timer = window.setInterval(() => {
      const currentSnake = snakeRef.current;
      const currentFood = foodRef.current;
      const dir = directionRef.current;
      const head = currentSnake[0];
      const nextHead = { x: head.x + (dir === "right" ? 1 : dir === "left" ? -1 : 0), y: head.y + (dir === "down" ? 1 : dir === "up" ? -1 : 0) };
      const ate = nextHead.x === currentFood.x && nextHead.y === currentFood.y;
      const body = ate ? currentSnake : currentSnake.slice(0, -1);
      if (nextHead.x < 0 || nextHead.x >= 12 || nextHead.y < 0 || nextHead.y >= 12 || body.some((part) => part.x === nextHead.x && part.y === nextHead.y)) {
        endedRef.current = true; setEnded(true); setRunning(false); return;
      }
      const nextSnake = [nextHead, ...currentSnake.slice(0, ate ? undefined : -1)];
      snakeRef.current = nextSnake; setSnake(nextSnake);
      const nextMoves = movesRef.current + 1; movesRef.current = nextMoves; setMoves(nextMoves);
      if (ate) {
        const nextScore = scoreRef.current + 1; scoreRef.current = nextScore; setScore(nextScore);
        let nextFood: Cell;
        do { nextFood = { x: Math.floor(Math.random() * 12), y: Math.floor(Math.random() * 12) }; }
        while (nextSnake.some((part) => part.x === nextFood.x && part.y === nextFood.y));
        foodRef.current = nextFood; setFood(nextFood);
        onPointRef.current(nextScore, nextMoves);
      }
    }, 220);
    return () => window.clearInterval(timer);
  }, [running, ended]);

  const scoreRef = useRef(score);
  const movesRef = useRef(moves);
  useEffect(() => { scoreRef.current = score; movesRef.current = moves; }, [score, moves]);

  function restart() {
    const initial = [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }];
    snakeRef.current = initial; setSnake(initial);
    const initialFood = { x: 8, y: 5 }; foodRef.current = initialFood; setFood(initialFood);
    directionRef.current = "right"; setDirection("right");
    scoreRef.current = 0; setScore(0); movesRef.current = 0; setMoves(0);
    endedRef.current = false; setEnded(false); setRunning(true);
  }

  const cells = Array.from({ length: 144 }, (_, index) => ({ x: index % 12, y: Math.floor(index / 12) }));
  return <div className="value-card" style={{ marginTop: 18, background: "#f7f8f3" }}>
    <div className="value-top"><span className="card-number">SNAKE CLASSIQUE</span><span className="card-number">SCORE : {score}</span></div>
    <p>Utilisez les flèches du clavier ou les boutons directionnels. Mangez les fruits, évitez les murs et votre propre corps.</p>
    <div role="img" aria-label={`Plateau Snake, score ${score}, ${ended ? "partie terminée" : running ? "partie en cours" : "prêt à jouer"}`} style={{ display: "grid", gridTemplateColumns: "repeat(12, minmax(0, 1fr))", gap: 2, width: "100%", maxWidth: 360, aspectRatio: "1", padding: 6, background: "#dce6d8", border: "2px solid #6d896d", borderRadius: 8, margin: "12px auto" }}>
      {cells.map((cell) => {
        const isHead = snake[0]?.x === cell.x && snake[0]?.y === cell.y;
        const isBody = snake.some((part, index) => index > 0 && part.x === cell.x && part.y === cell.y);
        const isFood = food.x === cell.x && food.y === cell.y;
        return <span key={cell.y * 12 + cell.x} style={{ borderRadius: 3, background: isHead ? "#234b35" : isBody ? "#4f805c" : isFood ? "#c4473a" : "rgba(255,255,255,.38)" }} />;
      })}
    </div>
    <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
      <button type="button" className="button button-quiet" disabled={disabled || !running} onClick={() => { if (directionRef.current !== "down") { directionRef.current = "up"; setDirection("up"); } }}>↑ Haut</button>
      <button type="button" className="button button-quiet" disabled={disabled || !running} onClick={() => { if (directionRef.current !== "right") { directionRef.current = "left"; setDirection("left"); } }}>← Gauche</button>
      <button type="button" className="button button-quiet" disabled={disabled || !running} onClick={() => { if (directionRef.current !== "left") { directionRef.current = "right"; setDirection("right"); } }}>Droite →</button>
      <button type="button" className="button button-quiet" disabled={disabled || !running} onClick={() => { if (directionRef.current !== "up") { directionRef.current = "down"; setDirection("down"); } }}>↓ Bas</button>
    </div>
    {ended && <p role="status">Partie terminée. Score : {score}. Vous pouvez recommencer.</p>}
    <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
      <button type="button" className="button button-green" disabled={disabled} onClick={restart}><Play size={16} /> {ended ? "Rejouer" : running ? "Recommencer" : "Démarrer"}</button>
    </div>
  </div>;
}

export default function RencontrePage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedMatch, setSelectedMatch] = useState("");
  const [selectedGame, setSelectedGame] = useState<string>("logic");
  const [activeSessionId, setActiveSessionId] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [busyAction, setBusyAction] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadData = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError("");
    try {
      const [matchesResponse, sessionsResponse] = await Promise.all([
        fetch("/api/matches", { cache: "no-store" }),
        fetch("/api/rencontre/sessions", { cache: "no-store" }),
      ]);
      const matchesData = await matchesResponse.json();
      const sessionsData = await sessionsResponse.json();
      if (matchesResponse.status === 401 || sessionsResponse.status === 401) throw new Error("Connectez-vous pour utiliser le Mode Rencontre.");
      if (!matchesResponse.ok) throw new Error(matchesData.error || "Impossible de charger vos matchs.");
      if (!sessionsResponse.ok) throw new Error(sessionsData.error || "Impossible de charger vos activités.");
      const nextMatches = Array.isArray(matchesData.matches) ? matchesData.matches as Match[] : [];
      const nextSessions = Array.isArray(sessionsData.sessions) ? sessionsData.sessions as Session[] : [];
      setMatches(nextMatches);
      setSessions(nextSessions);
      setSelectedMatch((current) => current && nextMatches.some((item) => item.match_id === current) ? current : nextMatches[0]?.match_id ?? "");
      setActiveSessionId((current) => current && nextSessions.some((item) => item.id === current && item.status === "active") ? current : nextSessions.find((item) => item.status === "active")?.id ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Service indisponible.");
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
    const timer = window.setInterval(() => void loadData(false), 5000);
    return () => window.clearInterval(timer);
  }, [loadData]);

  async function createSession() {
    if (!selectedMatch || !selectedGame) return;
    setCreating(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/rencontre/sessions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ matchId: selectedMatch, gameKey: selectedGame }) });
      const data = await response.json();
      if (response.status === 401) throw new Error("Connectez-vous pour proposer une activité.");
      if (!response.ok) throw new Error(data.error || "Impossible de créer l’activité.");
      setNotice("Invitation enregistrée. L’autre membre du match peut maintenant l’accepter.");
      await loadData();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Service indisponible.");
    } finally { setCreating(false); }
  }

  async function sessionAction(sessionId: string, action: "accept" | "complete" | "cancel", progress?: Record<string, unknown>) {
    setBusyAction(sessionId + action); setError(""); setNotice("");
    try {
      const response = await fetch("/api/rencontre/sessions", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId, action, ...(progress ? { progress } : {}) }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Impossible de mettre à jour l’activité.");
      setNotice(action === "accept" ? "Invitation acceptée : vous pouvez jouer ensemble." : action === "complete" ? "Bravo, activité terminée !" : "Activité annulée.");
      await loadData(false);
      if (action === "accept") setActiveSessionId(sessionId);
      if (action === "complete" || action === "cancel") setActiveSessionId((current) => current === sessionId ? "" : current);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Service indisponible.");
    } finally { setBusyAction(""); }
  }

  async function saveProgress(session: Session, progress: Record<string, unknown>) {
    setBusyAction(session.id + "progress"); setError("");
    try {
      const response = await fetch("/api/rencontre/sessions", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId: session.id, action: "progress", progress }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Impossible d’enregistrer la progression.");
      await loadData(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Service indisponible.");
    } finally { setBusyAction(""); }
  }

  const activeSession = sessions.find((session) => session.id === activeSessionId && session.status === "active");
  const disabled = !!busyAction;

  function playPanel(session: Session) {
    const state = session.state ?? {};
    const round = typeof state.round === "number" ? state.round : 0;
    const score = typeof state.score === "number" ? state.score : 0;
    const answers = Array.isArray(state.answers) ? state.answers as string[] : [];
    const challengeCount = typeof state.completedChallenges === "number" ? state.completedChallenges : 0;
    const answerQuestion = (answer: string, questionAnswer: string, explanation?: string) => {
      if (answers.length > round) return;
      const correct = answer === questionAnswer;
      void saveProgress(session, { round: round + 1, score: score + (correct ? 1 : 0), answers: [...answers, answer], lastPrompt: explanation ?? (correct ? "Bonne réponse !" : "Pas tout à fait, essayez la suivante.") });
    };

    if (session.game_key === "logic" || session.game_key === "english") {
      const questions = session.game_key === "logic" ? logicQuestions : englishQuestions;
      const question = questions[round % questions.length];
      const done = round >= questions.length;
      return <div className="value-card" style={{ marginTop: 18, background: "#f7f8f3" }}>
        <div className="value-top"><span className="card-number">MANCHE {Math.min(round + 1, questions.length)} / {questions.length}</span><span className="card-number">SCORE PARTAGÉ : {score}</span></div>
        {done ? <><h3>Défi terminé !</h3><p>Score enregistré : {score} / {questions.length}. Vous pouvez terminer l’activité ou continuer à discuter.</p></> : <>
          <h3>{question.prompt}</h3>
          <div style={{ display: "grid", gap: 8 }}>{question.options.map((option) => <button key={option} className="button button-quiet" type="button" disabled={disabled || answers.length > round} onClick={() => answerQuestion(option, question.answer, "Réponse : " + question.answer + ("explanation" in question ? " — " + question.explanation : ""))}>{option}</button>)}</div>
          {typeof state.lastPrompt === "string" && <p role="status">{state.lastPrompt}</p>}
        </>}
      </div>;
    }
    if (session.game_key === "cooperative") {
      const challenge = coopChallenges[challengeCount];
      return <div className="value-card" style={{ marginTop: 18, background: "#f7f8f3" }}>
        <div className="value-top"><span className="card-number">DÉFI COOPÉRATIF</span><span className="card-number">{challengeCount} / {coopChallenges.length}</span></div>
        {challenge ? <><h3>{challenge}</h3><p>Faites le défi ensemble, puis l’un de vous valide pour passer au suivant.</p><button className="button button-green" disabled={disabled} onClick={() => void saveProgress(session, { completedChallenges: challengeCount + 1, round: challengeCount + 1, lastPrompt: challenge })}>Défi réalisé <CheckCircle2 size={16} /></button></> : <><h3>Tous les défis sont accomplis !</h3><p>Vous avez complété les {coopChallenges.length} défis ensemble.</p></>}
      </div>;
    }
    return <SnakeGame disabled={disabled} onPoint={(localScore, localMoves) => {
      const storedScore = typeof session.state?.score === "number" ? session.state.score : 0;
      const storedMoves = typeof session.state?.moves === "number" ? session.state.moves : 0;
      void saveProgress(session, { score: storedScore + 1, moves: storedMoves + 1 });
    }} />;
  }

  return (
    <main className="auth-page">
      <Link href="/" className="auth-back"><ArrowLeft size={16} /> Retour à l’accueil</Link>
      <section className="auth-card auth-card-wide">
        <Link href="/" className="brand auth-brand"><span className="brand-mark"><Gamepad2 size={20} /></span><span className="brand-word">NIKAHYA<span className="brand-dot">.</span></span></Link>
        <div className="section-kicker auth-kicker">APPRENDRE À SE CONNAÎTRE AUTREMENT</div>
        <h1 className="auth-title">Le Mode <em>Rencontre.</em></h1>
        <p className="auth-description">Proposez une activité à une personne avec qui vous avez déjà un match. Les invitations et la progression sont partagées entre les deux membres du match.</p>

        <div className="value-grid" style={{ marginBottom: 28 }}>
          {games.map((game) => {
            const Icon = game.icon; const active = selectedGame === game.key;
            return <button key={game.key} type="button" className="value-card" aria-pressed={active} onClick={() => setSelectedGame(game.key)} style={{ textAlign: "left", color: "inherit", background: active ? "#edf4ee" : "#fff", border: active ? "2px solid var(--green)" : "1px solid #e9ece5", cursor: "pointer", minHeight: 180 }}>
              <div className="value-top"><span className="value-icon"><Icon size={22} /></span><span className="card-number">{active ? "SÉLECTIONNÉ" : game.tag.toUpperCase()}</span></div>
              <h2 style={{ fontFamily: "var(--sans)", fontSize: 16, fontWeight: 700, letterSpacing: 0 }}>{game.title}</h2><p>{game.description}</p>
            </button>;
          })}
        </div>

        <div className="value-card" style={{ marginBottom: 24 }}>
          <div className="value-top"><span className="value-icon"><Users size={22} /></span><span className="card-number">POUR UN MATCH EXISTANT</span></div>
          <h2 style={{ fontFamily: "var(--sans)", fontSize: 17, fontWeight: 700, letterSpacing: 0 }}>À qui proposer cette activité ?</h2>
          {loading ? <p role="status">Chargement de vos matchs…</p> : matches.length === 0 ? <p>Vous n’avez pas encore de match disponible. Découvrez des profils et créez un match réciproque avant de proposer une activité.</p> : <>
            <label htmlFor="rencontre-match" className="auth-label">Choisir un match</label>
            <select id="rencontre-match" className="auth-input" value={selectedMatch} onChange={(event) => setSelectedMatch(event.target.value)}>{matches.map((match) => <option key={match.match_id} value={match.match_id}>{match.public_name}{match.city ? " · " + match.city : ""}</option>)}</select>
            <button type="button" className="button button-green" onClick={() => void createSession()} disabled={creating || !selectedMatch}><Gamepad2 size={16} /> {creating ? "Enregistrement…" : "Proposer cette activité"}</button>
          </>}
        </div>

        {notice && <p className="auth-notice" role="status"><CheckCircle2 size={16} style={{ display: "inline", verticalAlign: "-3px" }} /> {notice}</p>}
        {error && <p className="auth-notice" role="alert">{error} {error.includes("Connectez-vous") && <Link href="/connexion">Se connecter</Link>}</p>}

        {activeSession && <section aria-label="Activité en cours"><div className="value-top"><h2 style={{ fontFamily: "var(--sans)", fontSize: 20 }}>Jouer : {gameLabels[activeSession.game_key]}</h2><button type="button" className="button button-quiet" onClick={() => setActiveSessionId("")}>Fermer</button></div><p>Avec {activeSession.partner_name}. Les mises à jour apparaissent automatiquement toutes les 5 secondes.</p>{playPanel(activeSession)}<button type="button" className="button button-green" style={{ marginTop: 14 }} disabled={disabled} onClick={() => void sessionAction(activeSession.id, "complete")}><Trophy size={16} /> Terminer l’activité</button></section>}

        <div className="value-card">
          <div className="value-top"><span className="value-icon"><Gamepad2 size={22} /></span><span className="card-number">VOS ACTIVITÉS</span><button className="button button-quiet" type="button" onClick={() => void loadData()} disabled={loading}><RefreshCw size={14} /> Actualiser</button></div>
          {loading ? <p role="status">Chargement des activités…</p> : sessions.length === 0 ? <p>Aucune activité pour le moment. Choisissez un jeu et proposez-le à un match.</p> : <div style={{ display: "grid", gap: 14 }}>
            {sessions.map((session) => <article key={session.id} style={{ borderTop: "1px solid var(--line)", paddingTop: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                <div><strong>{gameLabels[session.game_key] ?? "Activité"}</strong><p style={{ margin: "5px 0 0", color: "var(--muted)" }}>Avec {session.partner_name} · {new Date(session.created_at).toLocaleDateString("fr-FR")}</p><span className="card-number">{statusLabels[session.status]}</span></div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {session.status === "invited" && !session.is_creator && <button className="button button-green" disabled={disabled} onClick={() => void sessionAction(session.id, "accept")}><Play size={15} /> Accepter</button>}
                  {session.status === "active" && <button className="button button-green" onClick={() => setActiveSessionId(session.id)}><Gamepad2 size={15} /> Jouer / reprendre</button>}
                  {(session.status === "invited" || session.status === "active") && <button className="button button-quiet" disabled={disabled} onClick={() => void sessionAction(session.id, "cancel")}><X size={15} /> Annuler</button>}
                </div>
              </div>
              {session.status === "active" && <p style={{ marginTop: 8, color: "var(--muted)" }}>Progression partagée : score {typeof session.state?.score === "number" ? session.state.score : 0} · défis réalisés {typeof session.state?.completedChallenges === "number" ? session.state.completedChallenges : 0}</p>}
            </article>)}
          </div>}
        </div>
        <p className="auth-switch"><Link href="/matchs">Mes matchs</Link> · <Link href="/">Accueil</Link></p>
      </section>
    </main>
  );
}
