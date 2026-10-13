"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Eye } from "lucide-react";

type ProfileVisit = {
  visitor_id: string;
  public_name: string;
  city: string | null;
  visited_at: string;
  is_online: boolean;
};

export default function VisitsList() {
  const [visits, setVisits] = useState<ProfileVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/profile-visits", { cache: "no-store" })
      .then(async response => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Impossible de charger les visites.");
        if (active) setVisits(Array.isArray(data.visits) ? data.visits : []);
      })
      .catch(cause => {
        if (active) setError(cause instanceof Error ? cause.message : "Service temporairement indisponible.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <section className="profile-visits-panel" aria-label="Visites récentes de votre profil">
      {loading ? <p role="status">Chargement des visites…</p> :
        error ? <div className="profile-visits-empty" role="alert"><Eye size={25}/><p>{error}</p><Link href="/connexion?next=/cockpit/visites">Se connecter <ArrowRight size={15}/></Link></div> :
        visits.length === 0 ? <div className="profile-visits-empty"><span className="profile-visits-empty-icon"><Eye size={25}/></span><h2>Vos prochaines visites apparaîtront ici</h2><p>Lorsqu’un membre connecté ouvrira votre profil visible, vous retrouverez sa visite dans cette liste. Aucun visiteur fictif n’est affiché.</p><Link href="/decouvrir">Découvrir des profils <ArrowRight size={15}/></Link></div> :
        <div className="profile-visits-list">{visits.map(visit => <article className="profile-visit-row" key={visit.visitor_id}>
          <Link href={"/membre/" + encodeURIComponent(visit.visitor_id)} className="profile-visit-avatar" aria-label={"Voir le profil de " + visit.public_name}>
            {visit.public_name.trim().slice(0, 1).toLocaleUpperCase()}
            {visit.is_online && <span className="profile-online-dot" aria-label="En ligne" title="En ligne"/>}
          </Link>
          <div className="profile-visit-details">
            <Link href={"/membre/" + encodeURIComponent(visit.visitor_id)} className="profile-visit-name">{visit.public_name}</Link>
            <span>{visit.city || "Membre NAKAHYA"} · {visit.is_online ? "En ligne" : "Hors ligne"}</span>
          </div>
          <time dateTime={visit.visited_at}>{new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Paris" }).format(new Date(visit.visited_at))}</time>
          <Link href={"/membre/" + encodeURIComponent(visit.visitor_id)} className="profile-visit-open" aria-label={"Ouvrir le profil de " + visit.public_name}><ArrowRight size={17}/></Link>
        </article>)}</div>}
    </section>
  );
}
