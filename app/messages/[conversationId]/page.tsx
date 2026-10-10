"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { ArrowLeft, Heart, Send } from "lucide-react";

type Message = { id: string; sender_id: string; body: string; created_at: string; read_at: string | null };

export default function MessagesPage() {
  const params = useParams<{ conversationId: string }>();
  const conversationId = params.conversationId;
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/conversations/" + encodeURIComponent(conversationId) + "/messages", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(response.status === 401 ? "Connectez-vous pour accéder à cette conversation." : data.error || "Conversation inaccessible.");
      setMessages(Array.isArray(data.messages) ? data.messages : []);
      setCurrentUserId(data.currentUserId || "");
      setError("");
    } catch (e) { setError(e instanceof Error ? e.message : "Impossible de charger les messages."); }
    finally { setLoading(false); }
  }, [conversationId]);

  useEffect(() => { void load(); }, [load]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = body.trim();
    if (!trimmed || sending) return;
    setSending(true); setError("");
    try {
      const response = await fetch("/api/conversations/" + encodeURIComponent(conversationId) + "/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body: trimmed }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Envoi impossible.");
      setMessages(previous => [...previous, data.message]);
      setBody("");
    } catch (e) { setError(e instanceof Error ? e.message : "Envoi impossible."); }
    finally { setSending(false); }
  }

  return <main className="auth-page">
    <Link href="/matchs" className="auth-back"><ArrowLeft size={16}/> Retour à mes matchs</Link>
    <section className="auth-card auth-card-wide">
      <Link href="/" className="brand auth-brand"><span className="brand-mark"><Heart size={20}/></span><span className="brand-word">NIKAHYA<span className="brand-dot">.</span></span></Link>
      <div className="section-kicker auth-kicker">MESSAGERIE PRIVÉE</div>
      <h1 className="auth-title">Prenez le temps<br/><em>de vous découvrir.</em></h1>
      <p className="auth-description">Seuls les deux membres de ce match peuvent lire et envoyer des messages dans cette conversation.</p>
      {error && <p className="auth-notice" role="alert">{error}</p>}
      <div style={{display:"flex",flexDirection:"column",gap:12,minHeight:160,maxHeight:"55vh",overflowY:"auto",padding:"12px 0"}} aria-live="polite">
        {loading ? <p>Chargement des messages…</p> : messages.length === 0 ? <p>La conversation est vide. Vous pouvez envoyer le premier message.</p> : messages.map(message => <div key={message.id} style={{alignSelf:message.sender_id === currentUserId ? "flex-end" : "flex-start",maxWidth:"85%",padding:"12px 15px",borderRadius:12,background:message.sender_id === currentUserId ? "#e4efe8" : "#fff",border:"1px solid #e5e8e1"}}><p style={{marginBottom:6,whiteSpace:"pre-wrap",overflowWrap:"anywhere"}}>{message.body}</p><small style={{color:"#68716b"}}>{new Date(message.created_at).toLocaleString("fr-FR", { dateStyle:"short", timeStyle:"short" })}</small></div>)}
      </div>
      <form className="auth-form" onSubmit={submit}>
        <label htmlFor="messageBody">Votre message</label>
        <textarea id="messageBody" className="form-control" rows={3} maxLength={5000} required value={body} onChange={e=>setBody(e.target.value)} placeholder="Écrivez un message respectueux…"/>
        <p className="password-hint">{body.length}/5000 caractères</p>
        <button className="button button-green auth-submit" type="submit" disabled={sending || !body.trim()}><Send size={16}/>{sending ? "Envoi…" : "Envoyer le message"}</button>
      </form>
    </section>
  </main>;
}
