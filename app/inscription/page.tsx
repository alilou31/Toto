"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, ArrowLeft, ArrowRight, Mail, LockKeyhole, UserRound } from "lucide-react";

export default function InscriptionPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, ageConfirmed, acceptedTerms: accepted }),
      });
      const result = await response.json();
      if (!response.ok) {
        setMessage(result.error ?? "La création du compte a échoué.");
        return;
      }
      router.replace("/profil");
      router.refresh();
    } catch {
      setMessage("Service indisponible. Vérifiez votre connexion puis réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return <main className="auth-page"><Link href="/" className="auth-back"><ArrowLeft size={16}/> Retour à l’accueil</Link><section className="auth-card auth-card-wide"><Link href="/" className="brand auth-brand"><span className="brand-mark"><Heart size={20}/></span><span className="brand-word">NIKAHYA<span className="brand-dot">.</span></span></Link><div className="onboarding-progress"><span>ÉTAPE 01 / 03</span><div><i/></div></div><div className="section-kicker auth-kicker">LE PREMIER PAS VERS UNE BELLE HISTOIRE</div><h1 className="auth-title">Commençons par<br/><em>faire connaissance.</em></h1><p className="auth-description">Créez votre accès personnel. Vos informations privées ne seront pas affichées sur votre profil public.</p><form onSubmit={submit} className="auth-form"><label htmlFor="email">Votre adresse e-mail</label><div className="input-wrap"><Mail size={17}/><input id="email" type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="vous@exemple.fr" maxLength={254}/></div><label htmlFor="password">Choisissez un mot de passe</label><div className="input-wrap"><LockKeyhole size={17}/><input id="password" type="password" autoComplete="new-password" required minLength={12} maxLength={256} value={password} onChange={e=>setPassword(e.target.value)} placeholder="12 caractères minimum"/></div><p className="password-hint">Utilisez un mot de passe long et unique, que vous n’utilisez pas ailleurs.</p><label className="check-row"><input type="checkbox" required checked={ageConfirmed} onChange={e=>setAgeConfirmed(e.target.checked)}/><span>Je confirme avoir <strong>18 ans ou plus</strong>.</span></label><label className="check-row"><input type="checkbox" required checked={accepted} onChange={e=>setAccepted(e.target.checked)}/><span>J’accepte les <Link href="/conditions">conditions d’utilisation</Link> et reconnais avoir lu la <Link href="/confidentialite">politique de confidentialité</Link>.</span></label><button className="button button-green auth-submit" type="submit" disabled={loading}>{loading ? "Création en cours…" : "Créer mon compte"} <ArrowRight size={17}/></button>{message&&<p className="auth-notice" role="status">{message}</p>}</form><p className="auth-switch">Déjà membre&nbsp;? <Link href="/connexion">Se connecter</Link></p><p className="auth-legal"><UserRound size={13}/> Un espace respectueux, réservé aux adultes.</p></section></main>;
}
