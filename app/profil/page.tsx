"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Heart, Save } from "lucide-react";

type Profile = { public_name?: string; city?: string | null; bio?: string; relationship_intention?: string; birth_date?: string; visibility?: "hidden" | "visible" | "paused" };

export default function ProfilePage() {
  const [publicName, setPublicName] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [intention, setIntention] = useState("marriage");
  const [visibility, setVisibility] = useState<"hidden" | "visible" | "paused">("hidden");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/profile", { cache: "no-store" }).then(async response => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Connectez-vous pour continuer.");
      return data.profile as Profile | null;
    }).then(profile => {
      if (!active || !profile) return;
      setPublicName(profile.public_name ?? ""); setCity(profile.city ?? ""); setBio(profile.bio ?? "");
      setBirthDate(profile.birth_date ? String(profile.birth_date).slice(0, 10) : "");
      setIntention(profile.relationship_intention ?? "marriage"); setVisibility(profile.visibility ?? "hidden");
    }).catch(error => { if (active) setMessage(error instanceof Error ? error.message : "Impossible de charger le profil."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setMessage("");
    try {
      const response = await fetch("/api/profile", { method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicName, city, bio, birthDate, relationshipIntention: intention, visibility }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Enregistrement impossible.");
      setMessage(visibility === "visible" ? "Profil enregistré et visible dans la découverte." : visibility === "paused" ? "Profil enregistré et mis en pause." : "Profil enregistré et masqué.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Service indisponible."); }
    finally { setSaving(false); }
  }

  return <main className="auth-page">
    <Link href="/" className="auth-back"><ArrowLeft size={16}/> Retour à l’accueil</Link>
    <section className="auth-card auth-card-wide">
      <Link href="/" className="brand auth-brand"><span className="brand-mark"><Heart size={20}/></span><span className="brand-word">NIKAHYA<span className="brand-dot">.</span></span></Link>
      <div className="section-kicker auth-kicker">ÉTAPE 02 / 03</div>
      <h1 className="auth-title">Votre profil,<br/><em>à votre image.</em></h1>
      <p className="auth-description">Présentez-vous et indiquez votre intention. Votre date de naissance reste privée.</p>
      {loading ? <p role="status">Chargement de votre profil…</p> : <form className="auth-form" onSubmit={submit}>
        <label htmlFor="publicName">Prénom ou nom public</label>
        <input id="publicName" className="form-control" required minLength={2} maxLength={40} value={publicName} onChange={e=>setPublicName(e.target.value)} autoComplete="nickname"/>
        <label htmlFor="birthDate">Date de naissance (18 ans minimum)</label>
        <input id="birthDate" className="form-control" type="date" required value={birthDate} onChange={e=>setBirthDate(e.target.value)} autoComplete="bday"/>
        <label htmlFor="city">Ville (facultatif)</label>
        <input id="city" className="form-control" maxLength={100} value={city} onChange={e=>setCity(e.target.value)} autoComplete="address-level2" placeholder="Ex. Bordeaux"/>
        <label htmlFor="intention">Votre intention</label>
        <select id="intention" className="form-control" value={intention} onChange={e=>setIntention(e.target.value)}>
          <option value="marriage">Mariage</option><option value="serious">Relation sérieuse</option>
          <option value="friendship">Faire connaissance</option><option value="unspecified">Je préfère en discuter</option>
        </select>
        <label htmlFor="visibility">Visibilité de mon profil</label>
        <select id="visibility" className="form-control" value={visibility} onChange={e=>setVisibility(e.target.value as "hidden" | "visible" | "paused")}>
          <option value="hidden">Masqué — je ne suis pas visible</option><option value="paused">En pause</option><option value="visible">Visible dans la découverte</option>
        </select>
        <p className="password-hint">Seuls votre prénom public, ville, présentation et intention sont partagés. Votre e-mail et votre date de naissance ne sont jamais affichés.</p>
        <label htmlFor="bio">Quelques mots sur vous</label>
        <textarea id="bio" className="form-control" rows={5} maxLength={1000} value={bio} onChange={e=>setBio(e.target.value)} placeholder="Vos valeurs, vos centres d’intérêt, ce qui compte pour vous…"/>
        <p className="password-hint">{bio.length}/1000 caractères. Votre profil reste masqué pendant cette première étape.</p>
        <button className="button button-green auth-submit" type="submit" disabled={saving}><Save size={17}/>{saving ? "Enregistrement…" : "Enregistrer mon profil"}</button>
        {message && <p className="auth-notice" role="status">{message}</p>}
      </form>}
      <p className="auth-switch"><Link href="/decouvrir">Découvrir les profils visibles</Link> · <Link href="/connexion">Retour à la connexion</Link></p>
    </section>
  </main>;
}
