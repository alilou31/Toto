"use client";

import { useEffect, useState } from "react";
import { ExternalLink, RefreshCw, Send } from "lucide-react";

type Feedback = { id: string; category: string; rating: number | null; message: string; created_at: string };
type Insight = { id: string; source: string; subreddit: string | null; external_url: string; theme: string; sentiment: string; summary: string; created_at: string };
type Data = { feedback: Feedback[]; insights: Insight[]; metrics: { total_feedback: number; last_7_days: number; average_rating: number | null } };

const categoryLabels: Record<string,string> = { experience:"Expérience", discovery:"Découverte", games:"Jeux", trust_safety:"Confiance & sécurité", pricing:"Tarifs", other:"Autre" };
const sentimentLabels: Record<string,string> = { pain_point:"Frustration", request:"Demande", positive:"Retour positif", objection:"Objection", opportunity:"Opportunité" };

export default function FeedbackAdminDashboard() {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState("reddit");
  const [subreddit, setSubreddit] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [theme, setTheme] = useState("Expérience de rencontre");
  const [sentiment, setSentiment] = useState("pain_point");
  const [summary, setSummary] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/feedback/admin", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Chargement impossible.");
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chargement impossible.");
    } finally { setLoading(false); }
  }
  useEffect(() => { void refresh(); }, []);

  async function saveInsight(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true); setNotice("");
    try {
      const response = await fetch("/api/feedback/admin", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({source,subreddit,externalUrl,theme,sentiment,summary}) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Enregistrement impossible.");
      setSummary(""); setNotice("Insight enregistré."); await refresh();
    } catch (e) { setNotice(e instanceof Error ? e.message : "Enregistrement impossible."); }
    finally { setSaving(false); }
  }

  return <main className="voc-admin">
    <header className="voc-admin-header"><div><span className="voc-eyebrow">NAKAHYA · PRODUCT INTELLIGENCE</span><h1>Voice of Customer</h1><p>Retours directs et signaux du marché, réunis au même endroit.</p></div><button type="button" onClick={() => void refresh()}><RefreshCw size={16}/> Actualiser</button></header>
    {error && <p className="voc-admin-error" role="alert">{error}</p>}
    {loading && !data ? <p>Chargement des retours…</p> : data && <>
      <section className="voc-metrics">
        <article><span>Retours reçus</span><strong>{data.metrics.total_feedback}</strong></article>
        <article><span>Sur les 7 derniers jours</span><strong>{data.metrics.last_7_days}</strong></article>
        <article><span>Note moyenne</span><strong>{data.metrics.average_rating ?? "—"}<small>/5</small></strong></article>
      </section>
      <section className="voc-admin-columns">
        <div className="voc-admin-card"><div className="voc-admin-section-heading"><div><span className="voc-eyebrow">VOIX UTILISATEURS</span><h2>Derniers retours</h2></div><span>{data.feedback.length} affichés</span></div>
          {data.feedback.length ? <div className="voc-feedback-list">{data.feedback.map(item=><article key={item.id}><div><span className="voc-tag">{categoryLabels[item.category] ?? item.category}</span><time>{new Date(item.created_at).toLocaleString("fr-FR")}</time></div>{item.rating && <p className="voc-rating">Note : {item.rating}/5</p>}<p>{item.message}</p></article>)}</div> : <p className="voc-empty">Aucun retour reçu pour le moment.</p>}
        </div>
        <div className="voc-admin-card"><div className="voc-admin-section-heading"><div><span className="voc-eyebrow">VEILLE MARCHÉ</span><h2>Ajouter un insight Reddit</h2></div></div>
          <p className="voc-admin-hint">Enregistre un lien public et une synthèse courte, sans recopier de données personnelles ni automatiser de publication. La collecte automatique attend l’autorisation officielle de Reddit.</p>
          <form className="voc-insight-form" onSubmit={saveInsight}>
            <label>Source<select value={source} onChange={e=>setSource(e.target.value)}><option value="reddit">Reddit</option><option value="other">Autre source</option></select></label>
            {source === "reddit" && <label>Communauté<input value={subreddit} onChange={e=>setSubreddit(e.target.value)} placeholder="r/OnlineDating" required maxLength={80}/></label>}
            <label>Lien public<input type="url" value={externalUrl} onChange={e=>setExternalUrl(e.target.value)} placeholder="https://www.reddit.com/r/..." required maxLength={2048}/></label>
            <label>Thème<input value={theme} onChange={e=>setTheme(e.target.value)} required minLength={2} maxLength={80}/></label>
            <label>Type de signal<select value={sentiment} onChange={e=>setSentiment(e.target.value)}>{Object.entries(sentimentLabels).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
            <label>Synthèse / besoin observé<textarea value={summary} onChange={e=>setSummary(e.target.value)} required minLength={10} maxLength={1500} rows={4} placeholder="Résumez le besoin exprimé avec vos mots…"/></label>
            <button type="submit" disabled={saving}>{saving ? "Enregistrement…" : "Enregistrer l’insight"} <Send size={15}/></button>
            {notice && <p role="status">{notice}</p>}
          </form>
        </div>
      </section>
      <section className="voc-admin-card"><div className="voc-admin-section-heading"><div><span className="voc-eyebrow">SIGNaux DU MARCHÉ</span><h2>Insights enregistrés</h2></div><span>{data.insights.length} affichés</span></div>
        {data.insights.length ? <div className="voc-insight-list">{data.insights.map(item=><article key={item.id}><div><span className="voc-tag">{item.source === "reddit" ? "Reddit" : "Autre"}</span><span className="voc-tag">{sentimentLabels[item.sentiment] ?? item.sentiment}</span><time>{new Date(item.created_at).toLocaleDateString("fr-FR")}</time></div><h3>{item.theme}{item.subreddit ? " · r/"+item.subreddit : ""}</h3><p>{item.summary}</p><a href={item.external_url} target="_blank" rel="noreferrer">Ouvrir la discussion <ExternalLink size={14}/></a></article>)}</div> : <p className="voc-empty">Aucun insight enregistré.</p>}
      </section>
    </>}
  </main>;
}
