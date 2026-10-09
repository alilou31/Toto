"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Heart, MessageCircle, ShieldCheck, Sparkles, UserRound, RotateCcw, CheckCircle2 } from "lucide-react";

type DemoProfile = {
  id: string; name: string; age: number; city: string; bio: string;
  values: string[]; intention: string; color: string; liked: boolean;
};
const initialProfiles: DemoProfile[] = [
  { id: "sara", name: "Sara", age: 28, city: "Bordeaux", bio: "J’aime les discussions sincères, les balades au bord de l’eau et les projets construits à deux.", values: ["Famille", "Sincérité", "Voyages"], intention: "Relation sérieuse", color: "#e8d7c3", liked: false },
  { id: "adam", name: "Adam", age: 31, city: "Lyon", bio: "Curieux et posé, je crois aux petites attentions et aux grandes conversations.", values: ["Respect", "Famille", "Humour"], intention: "Construire à deux", color: "#d9e4d8", liked: false },
  { id: "ines", name: "Inès", age: 26, city: "Toulouse", bio: "Entre cuisine maison, livres et escapades spontanées, je cherche une relation qui a du sens.", values: ["Foi et valeurs", "Douceur", "Découverte"], intention: "Relation sérieuse", color: "#ead9df", liked: false },
];
const storageKey = "nikahya-demo-v1";
const inputStyle: React.CSSProperties = { width: "100%", padding: "12px 13px", border: "1px solid #e0e4dc", borderRadius: 6, background: "#fff", font: "inherit", color: "#202824" };
const labelStyle: React.CSSProperties = { display: "grid", gap: 7, fontSize: 12, fontWeight: 600, color: "#39433c" };

export default function DemoPage() {
  const [profiles, setProfiles] = useState<DemoProfile[]>(initialProfiles);
  const [myProfile, setMyProfile] = useState({ name: "", age: "28", city: "Bordeaux", bio: "", intention: "Relation sérieuse", values: ["Sincérité", "Famille"] });
  const [activeTab, setActiveTab] = useState<"discover" | "profile" | "matches">("discover");
  const [notice, setNotice] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const saved = JSON.parse(raw);
        if (Array.isArray(saved.profiles)) setProfiles(saved.profiles);
        if (saved.myProfile) setMyProfile(saved.myProfile);
      }
    } catch { /* Les données de démonstration peuvent être réinitialisées. */ }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try { window.localStorage.setItem(storageKey, JSON.stringify({ profiles, myProfile })); }
    catch { setNotice("Le navigateur ne permet pas de conserver les données de démonstration."); }
  }, [profiles, myProfile, loaded]);

  const likedProfiles = useMemo(() => profiles.filter((p) => p.liked), [profiles]);
  const matches = useMemo(() => likedProfiles.filter((p) => p.id === "sara" || p.id === "ines"), [likedProfiles]);

  function toggleLike(id: string) {
    const target = profiles.find((p) => p.id === id);
    if (!target) return;
    const nextLiked = !target.liked;
    setProfiles((current) => current.map((p) => p.id === id ? { ...p, liked: nextLiked } : p));
    setNotice(nextLiked && (id === "sara" || id === "ines")
      ? "C’est un match de démonstration ! Aucun message réel n’a été envoyé."
      : nextLiked ? "Like enregistré localement pour cette démonstration." : "Like retiré.");
  }

  function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = myProfile.name.trim();
    const age = Number(myProfile.age);
    if (name.length < 2 || !Number.isInteger(age) || age < 18 || age > 100 || myProfile.bio.trim().length < 10) {
      setNotice("Vérifiez votre prénom, votre âge (18 ans minimum) et votre présentation (10 caractères minimum).");
      return;
    }
    setMyProfile({ ...myProfile, name });
    setNotice("Profil de démonstration enregistré sur cet appareil uniquement.");
  }

  function resetDemo() {
    setProfiles(initialProfiles);
    setMyProfile({ name: "", age: "28", city: "Bordeaux", bio: "", intention: "Relation sérieuse", values: ["Sincérité", "Famille"] });
    try { window.localStorage.removeItem(storageKey); } catch { /* Ignoré */ }
    setNotice("Démonstration réinitialisée.");
    setActiveTab("discover");
  }

  return (
    <main style={{ minHeight: "100vh", background: "#faf8f2", color: "#202824" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px clamp(18px, 5vw, 72px)", borderBottom: "1px solid #e5e8e1", background: "#fff" }}>
        <Link href="/" style={{ display: "flex", gap: 9, alignItems: "center", color: "#075b4b", fontWeight: 800, letterSpacing: 2 }}><Heart size={20}/> NIKAHYA<span style={{ color: "#c6a76b" }}>.</span></Link>
        <Link href="/" style={{ fontSize: 12, color: "#59645c" }}>Retour à l’accueil</Link>
      </header>
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "34px 18px 70px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 16, alignItems: "end", marginBottom: 24 }}>
          <div><p style={{ fontSize: 10, letterSpacing: 2, color: "#075b4b", fontWeight: 700, marginBottom: 10 }}>ESPACE DE DÉMONSTRATION</p><h1 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 500, margin: "0 0 10px" }}>Les rencontres commencent ici.</h1><p style={{ color: "#68716b", lineHeight: 1.7, maxWidth: 650 }}>Explorez les premiers parcours de NIKAHYA. Tous les profils sont fictifs ; vos actions restent enregistrées dans le stockage local de ce navigateur.</p></div>
          <button onClick={resetDemo} type="button" style={{ display: "inline-flex", gap: 8, alignItems: "center", padding: "11px 14px", background: "#fff", border: "1px solid #dfe4dc", borderRadius: 6, cursor: "pointer" }}><RotateCcw size={15}/> Réinitialiser la démo</button>
        </div>
        <div style={{ padding: "13px 15px", display: "flex", alignItems: "start", gap: 10, background: "#edf4ee", border: "1px solid #d8e6d9", borderRadius: 7, color: "#315d43", fontSize: 12, lineHeight: 1.6, marginBottom: 24 }}><ShieldCheck size={18} style={{ flexShrink: 0, marginTop: 1 }}/><span><strong>Mode test — aucune base connectée.</strong> Aucun compte n’est créé, aucun message n’est envoyé et aucune donnée ne quitte ce navigateur par cette page. Ne saisissez pas de données personnelles réelles.</span></div>
        <nav aria-label="Sections de démonstration" style={{ display: "flex", gap: 8, flexWrap: "wrap", borderBottom: "1px solid #e5e8e1", marginBottom: 24 }}>
          {([{ id: "discover", label: "Découvrir" }, { id: "profile", label: "Mon profil" }, { id: "matches", label: `Mes likes & matchs (${likedProfiles.length})` }] as const).map((tab) => <button key={tab.id} onClick={() => setActiveTab(tab.id)} type="button" style={{ padding: "13px 16px", border: 0, borderBottom: activeTab === tab.id ? "2px solid #075b4b" : "2px solid transparent", background: "transparent", color: activeTab === tab.id ? "#075b4b" : "#68716b", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>{tab.label}</button>)}
        </nav>
        {notice && <div role="status" aria-live="polite" style={{ display: "flex", gap: 9, alignItems: "start", padding: "12px 14px", borderRadius: 6, background: "#fff", border: "1px solid #e5e8e1", marginBottom: 20, fontSize: 13 }}><CheckCircle2 size={17} color="#075b4b" style={{ flexShrink: 0 }}/>{notice}</div>}
        {activeTab === "discover" && <><div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", marginBottom: 16 }}><h2 style={{ fontFamily: "Georgia, serif", fontWeight: 500, fontSize: 26, margin: 0 }}>Des profils à découvrir</h2><span style={{ fontSize: 11, color: "#68716b" }}>3 profils fictifs</span></div><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 18 }}>{profiles.map((p) => <article key={p.id} style={{ overflow: "hidden", background: "#fff", border: "1px solid #e5e8e1", borderRadius: 9 }}><div style={{ minHeight: 130, background: p.color, display: "grid", placeItems: "center", position: "relative" }}><div style={{ width: 76, height: 76, borderRadius: "50%", display: "grid", placeItems: "center", background: "#ffffffb8", color: "#075b4b", fontFamily: "Georgia, serif", fontSize: 30 }}>{p.name[0]}</div><span style={{ position: "absolute", top: 13, left: 13, background: "#ffffffdc", borderRadius: 4, padding: "6px 8px", fontSize: 9, fontWeight: 700, letterSpacing: 1 }}>PROFIL FICTIF</span></div><div style={{ padding: 19 }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 8 }}><div><h3 style={{ fontFamily: "Georgia, serif", fontSize: 24, fontWeight: 500, margin: "0 0 6px" }}>{p.name}, {p.age}</h3><p style={{ color: "#68716b", fontSize: 12, margin: 0 }}>{p.city} · {p.intention}</p></div><Sparkles size={18} color="#c6a76b"/></div><p style={{ lineHeight: 1.75, color: "#535e56", fontSize: 13, margin: "17px 0" }}>{p.bio}</p><div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 18 }}>{p.values.map((v) => <span key={v} style={{ padding: "6px 8px", background: "#f3f5f0", borderRadius: 4, color: "#46534a", fontSize: 10 }}>{v}</span>)}</div><button onClick={() => toggleLike(p.id)} type="button" aria-pressed={p.liked} style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", gap: 9, padding: 13, border: "1px solid #075b4b", borderRadius: 5, background: p.liked ? "#075b4b" : "#fff", color: p.liked ? "#fff" : "#075b4b", cursor: "pointer", fontWeight: 700 }}><Heart size={17} fill={p.liked ? "currentColor" : "none"}/>{p.liked ? "Aimé · retirer le like" : "Envoyer un like (démo)"}</button></div></article>)}</div></>}
        {activeTab === "profile" && <section style={{ maxWidth: 650, background: "#fff", border: "1px solid #e5e8e1", borderRadius: 9, padding: "clamp(18px, 4vw, 32px)" }}><div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}><UserRound size={25} color="#075b4b"/><div><h2 style={{ fontFamily: "Georgia, serif", fontSize: 26, fontWeight: 500, margin: 0 }}>Créer mon profil de démo</h2><p style={{ color: "#68716b", fontSize: 12, margin: "6px 0 0" }}>Les champs restent sur cet appareil.</p></div></div><form onSubmit={saveProfile} style={{ display: "grid", gap: 17 }}><label style={labelStyle}>Prénom<input style={inputStyle} value={myProfile.name} onChange={(e) => setMyProfile({ ...myProfile, name: e.target.value })} required minLength={2} maxLength={50} placeholder="Ex. Amira"/></label><label style={labelStyle}>Âge<input style={inputStyle} type="number" min={18} max={100} value={myProfile.age} onChange={(e) => setMyProfile({ ...myProfile, age: e.target.value })} required/><span style={{ color: "#68716b", fontWeight: 400 }}>18 ans minimum — vérification de démonstration uniquement.</span></label><label style={labelStyle}>Ville<input style={inputStyle} value={myProfile.city} onChange={(e) => setMyProfile({ ...myProfile, city: e.target.value })} maxLength={80} required/></label><label style={labelStyle}>Mon intention<select style={inputStyle} value={myProfile.intention} onChange={(e) => setMyProfile({ ...myProfile, intention: e.target.value })}><option>Relation sérieuse</option><option>Construire à deux</option><option>Faire connaissance avec sérieux</option></select></label><label style={labelStyle}>Quelques mots sur moi<textarea style={{ ...inputStyle, minHeight: 110, resize: "vertical" }} value={myProfile.bio} onChange={(e) => setMyProfile({ ...myProfile, bio: e.target.value })} required minLength={10} maxLength={400} placeholder="Ce qui compte pour moi, ce que j’aime…"/></label><p style={{ color: "#68716b", fontSize: 11, margin: 0 }}>Valeurs proposées : {myProfile.values.join(" · ")}</p><button type="submit" className="button button-green">Enregistrer le profil de démo</button></form>{myProfile.name && <div style={{ borderTop: "1px solid #e5e8e1", marginTop: 24, paddingTop: 20 }}><p style={{ color: "#075b4b", fontWeight: 700, fontSize: 10, letterSpacing: 1 }}>APERÇU DE MON PROFIL</p><h3 style={{ fontFamily: "Georgia, serif", fontSize: 24, fontWeight: 500 }}>{myProfile.name}, {myProfile.age}</h3><p>{myProfile.city} · {myProfile.intention}</p><p style={{ lineHeight: 1.7, color: "#68716b" }}>{myProfile.bio || "Votre présentation apparaîtra ici."}</p></div>}</section>}
        {activeTab === "matches" && <section><h2 style={{ fontFamily: "Georgia, serif", fontWeight: 500, fontSize: 28 }}>Vos likes de démonstration</h2><p style={{ color: "#68716b", lineHeight: 1.7 }}>Les likes sont simulés. Sara et Inès sont configurées comme exemples de match réciproque pour tester l’écran ; ce n’est pas un vrai intérêt de leur part.</p>{likedProfiles.length === 0 ? <div style={{ padding: 28, background: "#fff", border: "1px dashed #d9dfd6", borderRadius: 8, textAlign: "center" }}><Heart size={24} color="#075b4b"/><h3 style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 500 }}>Pas encore de likes</h3><p style={{ color: "#68716b" }}>Retournez dans Découvrir et appuyez sur « Envoyer un like ».</p><button className="button button-green" onClick={() => setActiveTab("discover")} type="button">Découvrir les profils</button></div> : <div style={{ display: "grid", gap: 12 }}>{likedProfiles.map((p) => <article key={p.id} style={{ display: "flex", gap: 14, alignItems: "center", padding: 16, background: "#fff", border: "1px solid #e5e8e1", borderRadius: 8 }}><div style={{ width: 52, height: 52, flexShrink: 0, borderRadius: "50%", background: p.color, display: "grid", placeItems: "center", fontSize: 22, fontFamily: "Georgia, serif" }}>{p.name[0]}</div><div style={{ flex: 1 }}><strong>{p.name}, {p.age}</strong><p style={{ margin: "5px 0 0", fontSize: 12, color: "#68716b" }}>{matches.some((m) => m.id === p.id) ? "✨ Match de démonstration — messagerie non activée" : "Like enregistré localement"}</p></div><button onClick={() => toggleLike(p.id)} type="button" aria-label={`Retirer le like de ${p.name}`} style={{ border: "1px solid #e5e8e1", background: "#fff", borderRadius: 5, padding: 10, cursor: "pointer" }}><Heart size={17} fill="#075b4b" color="#075b4b"/></button></article>)}</div>}<div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 22, color: "#68716b", fontSize: 12 }}><MessageCircle size={16}/> La messagerie sera ajoutée après la connexion à une base de données.</div></section>}
        <footer style={{ marginTop: 44, borderTop: "1px solid #e5e8e1", paddingTop: 20, display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "space-between", color: "#68716b", fontSize: 11 }}><span>© NIKAHYA · Prototype interactif non connecté</span><span><Link href="/conditions">Conditions</Link> · <Link href="/confidentialite">Confidentialité</Link> · <Link href="/validation">Tests de validation</Link></span></footer>
      </div>
    </main>
  );
}
