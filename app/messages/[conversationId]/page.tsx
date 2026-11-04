"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Gamepad2, Heart, ImagePlus, Mic, Send, Smile, Video, X } from "lucide-react";

type Message = { id: string; sender_id: string; body: string; created_at: string; read_at: string | null; message_type?: "text" | "image" | "video" | "audio"; attachment_mime_type?: string | null; attachment_name?: string | null };
const emojis = ["😀","😃","😊","😍","🥰","😘","😉","😂","🤣","😅","🤗","🤔","🥹","❤️","🧡","💛","💚","💙","💕","💞","🌹","✨","🙏","👍","👏","🎉","☕","🌸","🥳"];

export default function MessagesPage() {
  const params = useParams<{ conversationId: string }>();
  const conversationId = params.conversationId;
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [recording, setRecording] = useState(false);\n  const [viewLimit, setViewLimit] = useState("1");
  const photoInput = useRef<HTMLInputElement>(null);
  const videoInput = useRef<HTMLInputElement>(null);
  const audioInput = useRef<HTMLInputElement>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const stream = useRef<MediaStream | null>(null);

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
  useEffect(() => () => { stream.current?.getTracks().forEach(track => track.stop()); }, []);

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

  async function sendFile(file: File) {
    if (sending) return;
    setSending(true); setError("");
    try {
      const form = new FormData();
      form.append("file", file);\n      if (file.type.startsWith("video/") || file.type.startsWith("audio/")) form.append("viewLimit", viewLimit);
      const response = await fetch("/api/conversations/" + encodeURIComponent(conversationId) + "/attachments", { method: "POST", body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Envoi impossible.");
      setMessages(previous => [...previous, data.message]);
    } catch (e) { setError(e instanceof Error ? e.message : "Envoi impossible."); }
    finally { setSending(false); }
  }

  async function toggleRecording() {
    if (recording && recorder.current) { recorder.current.stop(); setRecording(false); return; }
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError("L'enregistrement audio n'est pas disponible sur cet appareil ou navigateur."); return;
    }
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.current = mediaStream;
      const preferred = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"].find(type => MediaRecorder.isTypeSupported(type));
      const mediaRecorder = new MediaRecorder(mediaStream, preferred ? { mimeType: preferred } : undefined);
      recorder.current = mediaRecorder;
      chunks.current = [];
      mediaRecorder.ondataavailable = event => { if (event.data.size) chunks.current.push(event.data); };
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks.current, { type: mediaRecorder.mimeType || "audio/webm" });
        const file = new File([blob], `message-vocal-${Date.now()}.${blob.type.includes("mp4") ? "m4a" : "webm"}`, { type: blob.type });
        stream.current?.getTracks().forEach(track => track.stop());
        stream.current = null;
        void sendFile(file);
      };
      mediaRecorder.start();
      setRecording(true);
      setError("");
    } catch { setError("Autorisez l'accès au microphone pour enregistrer un message vocal."); }
  }

  const mediaUrl = (id: string) => `/api/conversations/${encodeURIComponent(conversationId)}/attachments?messageId=${encodeURIComponent(id)}`;

  return <main className="auth-page">
    <Link href="/matchs" className="auth-back"><ArrowLeft size={16}/> Retour à mes matchs</Link>
    <section className="auth-card auth-card-wide">
      <Link href="/" className="brand auth-brand"><span className="brand-mark"><Heart size={20}/></span><span className="brand-word">NAKAHYA<span className="brand-dot">.</span></span></Link>
      <div className="section-kicker auth-kicker">MESSAGERIE PRIVÉE</div>
      <h1 className="auth-title">Prenez le temps<br/><em>de vous découvrir.</em></h1>
      <p className="auth-description">Seuls les deux membres de ce match peuvent lire et envoyer des messages dans cette conversation.</p>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}><Link href="/rencontre" className="button button-quiet"><Gamepad2 size={16}/> Proposer un jeu</Link><Link href="/matchs" className="button button-quiet">Voir mes affinités</Link></div>
      {error && <p className="auth-notice" role="alert">{error}</p>}
      <div style={{display:"flex",flexDirection:"column",gap:12,minHeight:160,maxHeight:"55vh",overflowY:"auto",padding:"12px 0"}} aria-live="polite">
        {loading ? <p>Chargement des messages…</p> : messages.length === 0 ? <p>La conversation est vide. Vous pouvez envoyer le premier message.</p> : messages.map(message => {
          const own = message.sender_id === currentUserId;
          const src = mediaUrl(message.id);
          return <div key={message.id} style={{alignSelf:own ? "flex-end" : "flex-start",maxWidth:"min(85%, 420px)",padding:12,borderRadius:14,background:"var(--surface-card, #1c2636)",border:"1px solid var(--border-subtle, #344156)",color:"var(--text-primary, #f5f7fa)"}}>
            {message.message_type === "image" ? <img src={src} alt={message.attachment_name || "Photo envoyée"} loading="lazy" style={{display:"block",maxWidth:"100%",maxHeight:360,borderRadius:9,objectFit:"contain"}}/> :
             message.message_type === "video" ? <video src={src} controls playsInline preload="metadata" style={{display:"block",width:"100%",maxHeight:360,borderRadius:9}}/> :
             message.message_type === "audio" ? <audio src={src} controls preload="metadata" style={{display:"block",maxWidth:"100%"}}/> :
             <p style={{marginBottom:6,whiteSpace:"pre-wrap",overflowWrap:"anywhere"}}>{message.body}</p>}
            {message.message_type && message.message_type !== "text" && <small style={{display:"block",marginTop:6,opacity:.75}}>{message.attachment_name || message.body}</small>}
            <small style={{display:"block",marginTop:6,opacity:.7}}>{new Date(message.created_at).toLocaleString("fr-FR", { dateStyle:"short", timeStyle:"short" })}</small>
          </div>;
        })}
      </div>
      <form className="auth-form" onSubmit={submit}>
        <label htmlFor="messageBody">Votre message</label>
        <textarea id="messageBody" className="form-control" rows={3} maxLength={5000} value={body} onChange={e=>setBody(e.target.value)} placeholder="Écrivez un message respectueux…"/>
        <p className="password-hint">{body.length}/5000 caractères</p>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
          <button className="button button-quiet" type="button" aria-label="Ajouter une photo" disabled={sending} onClick={()=>photoInput.current?.click()}><ImagePlus size={17}/></button>
          <button className="button button-quiet" type="button" aria-label="Ajouter une vidéo" disabled={sending} onClick={()=>videoInput.current?.click()}><Video size={17}/></button>
          <button className="button button-quiet" type="button" aria-label="Ajouter un fichier audio" disabled={sending} onClick={()=>audioInput.current?.click()}><Mic size={17}/></button>
          <button className="button button-quiet" type="button" aria-label="Insérer un emoji" aria-expanded={emojiOpen} onClick={()=>setEmojiOpen(value=>!value)}><Smile size={17}/></button>
          <button className="button button-quiet" type="button" aria-label={recording ? "Arrêter l'enregistrement" : "Enregistrer un message vocal"} disabled={sending} onClick={()=>void toggleRecording()}>{recording ? <X size={17}/> : <Mic size={17}/>} {recording ? "Arrêter" : "Vocal"}</button>
          <button className="button button-green auth-submit" style={{marginLeft:"auto",width:"auto"}} type="submit" disabled={sending || !body.trim()}><Send size={16}/>{sending ? "Envoi…" : "Envoyer"}</button>
        </div>
        {emojiOpen && <div role="group" aria-label="Choisir un emoji" style={{display:"flex",flexWrap:"wrap",gap:5,padding:10,border:"1px solid var(--border-subtle, #344156)",borderRadius:10,background:"var(--surface, #151d2b)"}}>
          {emojis.map(emoji=><button key={emoji} type="button" onClick={()=>setBody(value=>value+emoji)} aria-label={`Ajouter ${emoji}`} style={{fontSize:22,padding:5,background:"transparent",border:0,cursor:"pointer"}}>{emoji}</button>)}
        </div>}
        <input ref={photoInput} type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden onChange={e=>{const file=e.target.files?.[0];if(file)void sendFile(file);e.currentTarget.value="";}}/>
        <input ref={videoInput} type="file" accept="video/mp4,video/webm,video/quicktime" hidden onChange={e=>{const file=e.target.files?.[0];if(file)void sendFile(file);e.currentTarget.value="";}}/>
        <input ref={audioInput} type="file" accept="audio/webm,audio/ogg,audio/mpeg,audio/mp4,audio/wav" hidden onChange={e=>{const file=e.target.files?.[0];if(file)void sendFile(file);e.currentTarget.value="";}}/>
        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}><label htmlFor="mediaViews">Lectures vidéo/audio :</label><select id="mediaViews" className="form-control" value={viewLimit} onChange={e=>setViewLimit(e.target.value)} style={{width:"auto"}}><option value="1">1 consultation</option><option value="2">2 consultations</option></select></div>\n        <p className="password-hint">Photos : 10 Mo max · Vidéos : 25 Mo max · Audio : 10 Mo max. Vidéos et audios : 1 ou 2 consultations, puis suppression (expiration après 7 jours).</p>
      </form>
    </section>
  </main>;
}
