"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Bell, Compass, Gamepad2, Heart, House, LogOut, Sparkles, TicketPercent, X } from "lucide-react";

type NoticeCounts = { interests: number; games: number };
const tips = [
  "Un bon début de conversation ? Une question ouverte, simple et sincère.",
  "Vos centres d’intérêt donnent de belles idées pour lancer un jeu à deux.",
  "Prenez votre temps : une vraie affinité se découvre, elle ne se force pas.",
  "Un profil authentique aide les bonnes personnes à vous reconnaître.",
  "Le respect du rythme de chacun fait partie de la rencontre.",
];

function isConnectedArea(path: string) {
  return ["/tableau-de-bord", "/decouvrir", "/matchs", "/messages", "/cockpit", "/rencontre", "/profil", "/notifications", "/offres", "/membre", "/bons-plans"].some(
    (prefix) => path === prefix || path.startsWith(prefix + "/"),
  );
}

export default function ConnectedAppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [counts, setCounts] = useState<NoticeCounts>({ interests: 0, games: 0 });
  const [tip, setTip] = useState<string | null>(null);
  const [tipDismissed, setTipDismissed] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  const loadCounts = useCallback(async () => {
    try {
      const [interestResponse, gameResponse] = await Promise.all([
        fetch("/api/interests", { cache: "no-store" }),
        fetch("/api/rencontre/sessions", { cache: "no-store" }),
      ]);
      const [interestData, gameData] = await Promise.all([
        interestResponse.ok ? interestResponse.json() : Promise.resolve({ interests: [] }),
        gameResponse.ok ? gameResponse.json() : Promise.resolve({ sessions: [] }),
      ]);
      setCounts({
        interests: Array.isArray(interestData.interests) ? interestData.interests.filter((item: { status?: string }) => item.status === "pending").length : 0,
        games: Array.isArray(gameData.sessions) ? gameData.sessions.filter((item: { status?: string; is_creator?: boolean }) => item.status === "invited" && item.is_creator === false).length : 0,
      });
    } catch {
      // Navigation stays available when a secondary notification service is temporarily unavailable.
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/me", { cache: "no-store" })
      .then(async (response) => response.ok ? response.json() : { user: null })
      .then((data) => { if (active) setAuthenticated(Boolean(data.user)); })
      .catch(() => { if (active) setAuthenticated(false); });
    return () => { active = false; };
  }, [pathname]);

  useEffect(() => {
    if (!authenticated) return;
    void loadCounts();
    const interval = window.setInterval(() => void loadCounts(), 30000);
    return () => window.clearInterval(interval);
  }, [authenticated, loadCounts, pathname]);

  useEffect(() => {
    if (!authenticated || !isConnectedArea(pathname)) return;
    let timer: number;
    let active = true;
    const showTip = () => {
      if (!active) return;
      setTip(tips[Math.floor(Math.random() * tips.length)]);
      setTipDismissed(false);
      timer = window.setTimeout(showTip, 45000 + Math.floor(Math.random() * 45000));
    };
    timer = window.setTimeout(showTip, 9000 + Math.floor(Math.random() * 18000));
    return () => { active = false; window.clearTimeout(timer); };
  }, [authenticated, pathname]);

  useEffect(() => {
    if (!authenticated) return;
    let inFlight = false;
    const heartbeat = async () => {
      if (inFlight || document.visibilityState !== "visible") return;
      inFlight = true;
      try {
        await fetch("/api/presence", { method: "POST", cache: "no-store" });
      } catch {
        // Presence is best-effort; it must never block navigation.
      } finally {
        inFlight = false;
      }
    };
    void heartbeat();
    const interval = window.setInterval(() => void heartbeat(), 45000);
    document.addEventListener("visibilitychange", heartbeat);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", heartbeat);
    };
  }, [authenticated]);
  const handleLogout = useCallback(async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    setLogoutError("");
    try {
      const response = await fetch("/api/auth/logout", { method: "POST", cache: "no-store" });
      if (!response.ok) throw new Error("Déconnexion impossible");
      setAuthenticated(false);
      setTip(null);
      router.replace("/");
      router.refresh();
    } catch {
      setLogoutError("Déconnexion impossible. Vérifiez votre connexion puis réessayez.");
      setLoggingOut(false);
    }
  }, [loggingOut, router]);

  const connected = authenticated && isConnectedArea(pathname);
  const totalAlerts = counts.interests + counts.games;
  const items = [
    { href: "/tableau-de-bord", label: "Accueil", icon: House, active: pathname === "/tableau-de-bord" || pathname === "/cockpit" },
    { href: "/matchs", label: "Affinités", icon: Heart, active: pathname === "/matchs" },
    { href: "/decouvrir", label: "Découvrir", icon: Compass, active: pathname === "/decouvrir", primary: true },
    { href: "/cockpit/jeux", label: "Jouer", icon: Gamepad2, active: pathname.startsWith("/cockpit/jeux") || pathname === "/rencontre" },
    { href: "/bons-plans", label: "Bons plans", icon: TicketPercent, active: pathname === "/bons-plans" || pathname.startsWith("/bons-plans/") },
    { href: "/notifications", label: "Alertes", icon: Bell, active: pathname === "/notifications", badge: totalAlerts },
  ];

  return <>
    {children}
    {connected && <>
      {!tipDismissed && tip && pathname !== "/notifications" && (
        <aside className="nikahya-tip" role="status" aria-live="polite">
          <span className="nikahya-tip-icon"><Sparkles size={16}/></span>
          <p>{tip}</p>
          <button type="button" aria-label="Fermer le conseil" onClick={() => setTipDismissed(true)}><X size={15}/></button>
        </aside>
      )}
      <nav className="connected-bottom-nav" aria-label="Navigation de votre espace">
        {items.map(({ href, label, icon: Icon, active, primary, badge }) => (
          <Link key={href} href={href} aria-current={active ? "page" : undefined} aria-label={label} className={`connected-nav-item${active ? " is-active" : ""}${primary ? " connected-nav-discover" : ""}`}>
            <span className="connected-nav-icon"><Icon size={primary ? 23 : 20} strokeWidth={active ? 2.5 : 2}/>{typeof badge === "number" && badge > 0 && <span className="connected-nav-badge">{badge > 9 ? "9+" : badge}</span>}</span>
            <span>{label}</span>
          </Link>
        ))}
        <button type="button" className="connected-logout-button" onClick={handleLogout} disabled={loggingOut} aria-label="Se déconnecter de NAKAHYA">
          <span className="connected-nav-icon"><LogOut size={19} /></span>
          <span>{loggingOut ? "Sortie…" : "Déconnexion"}</span>
        </button>
      </nav>
      {logoutError && <p className="connected-logout-error" role="alert">{logoutError}</p>}
    </>}
  </>;
}
