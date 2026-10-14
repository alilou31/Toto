"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Bike, Coffee, Compass, CreditCard, Eye, Gamepad2, Heart, LayoutDashboard, LockKeyhole, Search, ShieldCheck, Sparkles, TicketPercent, UserRound, Trophy, CalendarDays } from "lucide-react";

type Profile = {
  public_name?: string | null;
  city?: string | null;
  bio?: string | null;
  birth_date?: string | null;
  relationship_intention?: string | null;
  visibility?: "hidden" | "visible" | "paused" | null;
  onboarding_completed?: boolean;
};
type User = { email?: string | null } | null;

const intentionLabels: Record<string, string> = {
  marriage: "Mariage",
  serious: "Relation sérieuse",
  friendship: "Faire connaissance",
  unspecified: "À discuter",
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const offersCarouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const sessionResponse = await fetch("/api/auth/me", { cache: "no-store" });
        const sessionData = await sessionResponse.json();
        if (!sessionResponse.ok || !sessionData.user) {
          router.replace("/connexion?next=/tableau-de-bord");
          return;
        }
        const profileResponse = await fetch("/api/profile", { cache: "no-store" });
        const profileData = await profileResponse.json();
        if (!profileResponse.ok) throw new Error(profileData.error || "Impossible de charger votre profil.");
        if (active) {
          setUser(sessionData.user);
          setProfile(profileData.profile ?? null);
        }
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : "Service indisponible. Réessayez.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [router]);

  const visibilityLabel = profile?.visibility === "visible" ? "Visible dans la découverte" : profile?.visibility === "paused" ? "En pause" : "Masqué";
  const profileComplete = Boolean(profile?.public_name && profile?.birth_date && profile?.onboarding_completed);

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <Link href="/tableau-de-bord" className="brand" aria-label="NAKAHYA, mon espace"><span className="brand-mark"><Heart size={20}/></span><span className="brand-word">NAKAHYA<span className="brand-dot">.</span></span></Link>
        <nav aria-label="Navigation de l'espace personnel">
          <Link href="/tableau-de-bord" aria-current="page"><LayoutDashboard size={16}/> Mon espace</Link>
          <Link href="/profil"><UserRound size={16}/> Mon profil</Link>
          <Link href="/decouvrir"><Search size={16}/> Découvrir</Link>
          <Link href="/cockpit/jeux"><Gamepad2 size={16}/> Jouer</Link>
          <Link href="/offres"><CreditCard size={16}/> Offres</Link>
        </nav>
        <Link href="/profil" className="button button-dark button-small">Modifier mon profil <ArrowRight size={15}/></Link>
      </header>

      <section className="dashboard-content">
        <div className="section-kicker"><span>VOTRE ESPACE PERSONNEL</span> / NAKAHYA</div>
        {loading ? <p className="dashboard-status" role="status">Chargement de votre espace…</p> : error ? <p className="dashboard-error" role="alert">{error}</p> : (
          <>
            <div className="dashboard-welcome">
              <div><p className="dashboard-overline">RAVI DE VOUS RETROUVER</p><h1>Bonjour{profile?.public_name ? `, ${profile.public_name}` : ""}<em>.</em></h1><p>Votre espace pour avancer à votre rythme vers une rencontre qui vous ressemble.</p></div>
              <div className="dashboard-welcome-icon"><Heart size={33}/></div>
            </div>

            {!profileComplete && <div className="dashboard-onboarding"><div className="dashboard-onboarding-icon"><Sparkles size={22}/></div><div><strong>Faites le premier pas : complétez votre profil</strong><p>Quelques informations permettent aux autres de mieux vous connaître. Votre profil reste masqué tant que vous ne choisissez pas de le rendre visible.</p></div><Link href="/profil" className="button button-green">Compléter mon profil <ArrowRight size={16}/></Link></div>}

            <div className="dashboard-section-heading"><h2>Votre espace</h2><span>Tout au même endroit</span></div>
            <div className="dashboard-cards">
              <Link href="/decouvrir" className="dashboard-card"><span className="dashboard-card-icon"><Search size={22}/></span><span className="dashboard-card-title">Découvrir</span><span className="dashboard-card-description">Rencontrez des personnes et découvrez vos centres d’intérêt communs.</span><span className="dashboard-card-link">Découvrir des profils <ArrowRight size={15}/></span></Link>
              <Link href="/profil" className="dashboard-card"><span className="dashboard-card-icon"><UserRound size={22}/></span><span className="dashboard-card-title">Mon profil</span><span className="dashboard-card-description">Mettez à jour votre présentation, votre ville et vos intentions.</span><span className="dashboard-card-link">{profileComplete ? "Voir et modifier" : "Compléter mon profil"} <ArrowRight size={15}/></span></Link>
              <Link href="/cockpit/visites" className="dashboard-card"><span className="dashboard-card-icon"><Eye size={22}/></span><span className="dashboard-card-title">Visites de profil</span><span className="dashboard-card-description">Voyez les membres qui ont consulté votre profil visible.</span><span className="dashboard-card-link">Voir mes visites <ArrowRight size={15}/></span></Link>
              <Link href="/matchs" className="dashboard-card"><span className="dashboard-card-icon"><Heart size={22}/></span><span className="dashboard-card-title">Affinités</span><span className="dashboard-card-description">Retrouvez vos affinités et les connexions créées sur NAKAHYA.</span><span className="dashboard-card-link">Voir mes affinités <ArrowRight size={15}/></span></Link>
              <Link href="/rencontre" className="dashboard-card"><span className="dashboard-card-icon"><Sparkles size={22}/></span><span className="dashboard-card-title">Alchimie</span><span className="dashboard-card-description">Proposez un jeu ou un défi à un match existant, à votre rythme.</span><span className="dashboard-card-link">Découvrir Alchimie <ArrowRight size={15}/></span></Link>
              <Link href="/disponibilites" className="dashboard-card"><span className="dashboard-card-icon"><CalendarDays size={22}/></span><span className="dashboard-card-title">Mes disponibilités</span><span className="dashboard-card-description">Proposez un resto, un jeu, un week-end ou un voyage.</span><span className="dashboard-card-link">Indiquer mes disponibilités <ArrowRight size={15}/></span></Link>
              <Link href="/classement" className="dashboard-card"><span className="dashboard-card-icon"><Trophy size={22}/></span><span className="dashboard-card-title">Classements</span><span className="dashboard-card-description">Suivez les scores par ville, pays, week-end et voyage.</span><span className="dashboard-card-link">Voir les classements <ArrowRight size={15}/></span></Link>
              <Link href="/offres" className="dashboard-card dashboard-offers-card"><span className="dashboard-card-icon"><CreditCard size={22}/></span><span className="dashboard-card-title">Les offres NAKAHYA</span><span className="dashboard-card-description">Découvrez les formules prévues, leurs avantages et le tarif sans surprise.</span><span className="dashboard-card-link">Comparer les offres <ArrowRight size={15}/></span></Link>
            </div>

            <section className="dashboard-offers-carousel" aria-labelledby="dashboard-offers-title">
              <div className="dashboard-offers-heading">
                <div>
                  <p className="dashboard-offers-eyebrow"><TicketPercent size={15}/> POUR VOS PROCHAINES RENCONTRES</p>
                  <h2 id="dashboard-offers-title">Les bons plans du moment</h2>
                  <p>Des idées simples pour créer de vrais souvenirs à deux.</p>
                </div>
                <div className="dashboard-offers-actions">
                  <button type="button" aria-label="Idée précédente" onClick={() => offersCarouselRef.current?.scrollBy({ left: -300, behavior: "smooth" })}><ArrowLeft size={18}/></button>
                  <button type="button" aria-label="Idée suivante" onClick={() => offersCarouselRef.current?.scrollBy({ left: 300, behavior: "smooth" })}><ArrowRight size={18}/></button>
                  <Link href="/bons-plans" className="dashboard-offers-all">Toutes les offres <ArrowRight size={15}/></Link>
                </div>
              </div>
              <div className="dashboard-offers-track" ref={offersCarouselRef} aria-label="Idées de sorties à faire à deux">
                <article className="dashboard-offer-slide offer-lilac"><span className="dashboard-offer-icon"><Coffee size={22}/></span><span className="dashboard-offer-tag">Simple & chaleureux</span><h3>Un café qui rapproche</h3><p>Un café calme ou un salon de thé pour discuter sans pression.</p><Link href="/bons-plans">Découvrir l’idée <ArrowRight size={14}/></Link></article>
                <article className="dashboard-offer-slide offer-coral"><span className="dashboard-offer-icon"><Compass size={22}/></span><span className="dashboard-offer-tag">Culture</span><h3>Une sortie découverte</h3><p>Exposition, musée ou visite locale : la curiosité se partage.</p><Link href="/bons-plans">Découvrir l’idée <ArrowRight size={14}/></Link></article>
                <article className="dashboard-offer-slide offer-cream"><span className="dashboard-offer-icon"><Bike size={22}/></span><span className="dashboard-offer-tag">Complicité</span><h3>Une activité à deux</h3><p>Jeu de piste, mini-golf ou activité pour rire ensemble.</p><Link href="/bons-plans">Découvrir l’idée <ArrowRight size={14}/></Link></article>
                <article className="dashboard-offer-slide offer-mint"><span className="dashboard-offer-icon"><Sparkles size={22}/></span><span className="dashboard-offer-tag">Petit budget</span><h3>Une balade en plein air</h3><p>Parc, marché ou jardin : une rencontre à votre rythme.</p><Link href="/bons-plans">Découvrir l’idée <ArrowRight size={14}/></Link></article>
              </div>
              <p className="dashboard-offers-note">Suggestions d’activités, pas encore des promotions commerciales partenaires vérifiées.</p>
            </section>

            <div className="dashboard-lower-grid">
              <section className="dashboard-info-card"><div className="dashboard-info-title"><ShieldCheck size={20}/><h3>État de votre profil</h3></div><div className="dashboard-info-row"><span>Présentation</span><strong>{profileComplete ? "Complétée" : "À compléter"}</strong></div><div className="dashboard-info-row"><span>Intention</span><strong>{intentionLabels[profile?.relationship_intention ?? ""] ?? "Non renseignée"}</strong></div><div className="dashboard-info-row"><span>Visibilité</span><strong>{visibilityLabel}</strong></div><Link href="/profil" className="dashboard-text-link">Gérer ma visibilité <ArrowRight size={15}/></Link></section>
              <section className="dashboard-info-card dashboard-privacy-card"><div className="dashboard-info-title"><LockKeyhole size={20}/><h3>Vous gardez le contrôle</h3></div><p>Votre date de naissance et votre adresse e-mail ne sont pas affichées sur votre profil public. Vous choisissez quand rendre votre profil visible.</p><Link href="/confidentialite" className="dashboard-text-link">Confidentialité et données <ArrowRight size={15}/></Link></section>
            </div>
          </>
        )}
        <p className="dashboard-account">{user?.email ? `Connecté avec ${user.email}` : ""} <Link href="/parametres/securite">Sécurité et suppression du compte</Link></p>
      </section>
    </main>
  );
}
