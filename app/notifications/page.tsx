"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Bell, Check, Clock3, Gamepad2, Heart, RefreshCw, Sparkles, UserRound } from "lucide-react";

type Interest = { id: string; sender_id: string; public_name: string; city: string | null; status: "pending" | "accepted"; created_at: string };
type GameInvite = { id: string; game_key: string; status: string; created_at: string; partner_name: string; is_creator: boolean };
type AlertItem = { id: string; kind: "interest" | "game"; title: string; description: string; createdAt: string; href?: string; interest?: Interest; game?: GameInvite };

const gameLabels: Record<string, string> = { logic: "Défi de logique", english: "Défi d’anglais", snake: "Jeu Snake", cooperative: "Défi coopératif" };

function timeLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Récemment";
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export default function NotificationsPage() {
  const [items, setItems] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [interestResponse, gameResponse] = await Promise.all([
        fetch("/api/interests", { cache: "no-store" }),
        fetch("/api/rencontre/sessions", { cache: "no-store" }),
      ]);
      if (interestResponse.status === 401 || gameResponse.status === 401) throw new Error("Connectez-vous pour consulter vos alertes.");
      const [interestData, gameData] = await Promise.all([interestResponse.json(), gameResponse.json()]);
      if (!interestResponse.ok) throw new Error(interestData.error || "Impossible de charger les affinités.");
      if (!gameResponse.ok) throw new Error(gameData.error || "Impossible de charger les invitations de jeu.");
      const interests: AlertItem[] = (Array.isArray(interestData.interests) ? interestData.interests : [])
        .filter((item: Interest) => item.status === "pending")
        .map((item: Interest) => ({ id: "interest-" + item.id, kind: "interest", title: "Une nouvelle affinité potentielle", description: item.public_name + (item.city ? " · " + item.city : "") + " souhaite faire connaissance.", createdAt: item.created_at, href: "/membre/" + item.sender_id, interest: item }));
      const games: AlertItem[] = (Array.isArray(gameData.sessions) ? gameData.sessions : [])
        .filter((item: GameInvite) => item.status === "invited" && item.is_creator === false)
        .map((item: GameInvite) => ({ id: "game-" + item.id, kind: "game", title: "Une invitation à jouer", description: (item.partner_name || "Une affinité") + " vous propose : " + (gameLabels[item.game_key] || "un jeu à deux") + ".", createdAt: item.created_at, game: item }));
      setItems([...interests, ...games].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Service indisponible. Réessayez.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function acceptInvite(item: AlertItem) {
    if (!item.game) return;
    setWorkingId(item.id); setNotice("");
    try {
      const response = await fetch("/api/rencontre/sessions", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId: item.game.id, action: "accept" }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Impossible d’accepter cette invitation.");
      setNotice("Invitation acceptée. Votre défi est prêt à commencer.");
      await load();
    } catch (cause) {
      setNotice(cause instanceof Error ? cause.message : "Service indisponible.");
    } finally {
      setWorkingId(null);
    }
  }

  return <main className="notifications-page">
    <header className="notifications-header">
      <Link href="/tableau-de-bord" className="brand" aria-label="NAKAHYA, accueil"><span className="brand-mark"><Heart size={19}/></span><span className="brand-word">NAKAHYA<span className="brand-dot">.</span></span></Link>
      <Link href="/parametres/securite" className="notifications-preferences">Confidentialité & sécurité</Link>
    </header>
    <section className="notifications-content">
      <div className="notifications-eyebrow"><Sparkles size={15}/> VOTRE ESPACE PERSONNEL</div>
      <div className="notifications-title-row"><div><h1>Vos alertes,<br/><em>au même endroit.</em></h1><p>Les nouvelles affinités et invitations à jouer sont réunies ici.</p></div><span className="notifications-title-icon"><Bell size={25}/></span></div>
      <div className="notifications-toolbar"><div><strong>{items.length}</strong> {items.length === 1 ? "notification" : "notifications"} en attente</div><button type="button" onClick={() => void load()} disabled={loading}><RefreshCw size={15}/> Actualiser</button></div>
      {notice && <p className="notifications-notice" role="status">{notice}</p>}
      {loading ? <p className="notifications-state" role="status">Récupération de vos alertes…</p> : error ? <div className="notifications-state notifications-error" role="alert">{error}<p><Link href="/connexion">Se connecter</Link></p></div> : items.length === 0 ? <div className="notifications-empty"><span><Bell size={25}/></span><h2>Vous êtes à jour</h2><p>Quand une affinité se manifeste ou qu’une invitation de jeu arrive, vous la retrouverez ici.</p><Link href="/decouvrir">Continuer à découvrir <Sparkles size={15}/></Link></div> : <div className="notifications-list">{items.map(item => <article className="notification-card" key={item.id}><span className={`notification-kind-icon ${item.kind === "interest" ? "is-interest" : "is-game"}`}>{item.kind === "interest" ? <Heart size={20}/> : <Gamepad2 size={20}/>}</span><div className="notification-copy"><span className="notification-kind">{item.kind === "interest" ? "AFFINITÉ" : "INVITATION DE JEU"}</span><h2>{item.title}</h2><p>{item.description}</p><time dateTime={item.createdAt}><Clock3 size={13}/>{timeLabel(item.createdAt)}</time></div>{item.kind === "interest" ? <Link className="notification-action" href={item.href || "/matchs"}><UserRound size={15}/> Voir le profil</Link> : <button className="notification-action" type="button" onClick={() => void acceptInvite(item)} disabled={workingId === item.id}>{workingId === item.id ? "Acceptation…" : <><Check size={15}/> Accepter</>}</button>}</article>)}</div>}
    </section>
  </main>;
}
