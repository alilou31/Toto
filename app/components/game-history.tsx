/* eslint-disable react/no-unescaped-entities */
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BarChart3, Clock3, History, Trophy } from "lucide-react";

type Result = { id:string; game_id:string; score:number; correct_answers:number; total_questions:number; duration_seconds:number; completed_at:string };
const titles:Record<string,string>={"mots-croises":"Mots croisés à deux",enigme:"L'énigme partagée",calcul:"Sprint de calcul",personnalite:"Qui me connaît ?",duel:"Défi tête-à-tête",tournoi:"Tournoi amical"};
export function GameHistory() {
 const [results,setResults]=useState<Result[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState("");
 useEffect(()=>{let active=true;fetch("/api/games/results",{cache:"no-store"}).then(async r=>{const data=await r.json().catch(()=>({}));if(!r.ok)throw new Error(data.error||"Historique indisponible.");return data.results as Result[];}).then(rows=>{if(active)setResults(rows||[]);}).catch(e=>{if(active)setError(e instanceof Error?e.message:"Historique indisponible.");}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[]);
 const scoredResults=results.filter(r=>r.game_id!=="personnalite");
 const average=results.length?Math.round(results.reduce((n,r)=>n+r.duration_seconds,0)/results.length/60*10)/10:0;
 const averageScore=scoredResults.length?Math.round(scoredResults.reduce((n,r)=>n+r.score,0)/scoredResults.length):null;
 return <>
  <div className="game-stats-grid history-stats">
   <article className="game-stat-card"><span className="game-stat-icon purple"><History size={18}/></span><span className="game-stat-label">PARTIES JOUÉES</span><strong>{loading?"—":results.length}</strong><span className="game-stat-foot">Parties enregistrées sur votre compte</span></article>
   <article className="game-stat-card"><span className="game-stat-icon mint"><Trophy size={18}/></span><span className="game-stat-label">SCORE MOYEN</span><strong>{loading?"—":averageScore===null?"—":averageScore+"%"}</strong><span className="game-stat-foot">Hors jeux de préférences, sans bonne ou mauvaise réponse</span></article>
   <article className="game-stat-card"><span className="game-stat-icon pink"><Clock3 size={18}/></span><span className="game-stat-label">TEMPS MOYEN</span><strong>{loading?"—":results.length?average:"—"} <small>min</small></strong><span className="game-stat-foot">Durée moyenne d'une partie</span></article>
  </div>
  {loading&&<div className="game-empty-state compact-empty"><p role="status">Chargement de votre historique…</p></div>}
  {!loading&&error&&<div className="game-empty-state compact-empty"><span className="game-empty-icon"><BarChart3 size={28}/></span><h2>Votre historique n'est pas disponible</h2><p>{error}</p><Link href="/connexion?next=/cockpit/historique" className="game-button game-button-primary">Me connecter <ArrowRight size={16}/></Link></div>}
  {!loading&&!error&&results.length===0&&<div className="game-empty-state compact-empty"><span className="game-empty-icon"><BarChart3 size={28}/></span><h2>Votre histoire de jeu commence ici.</h2><p>Les résultats et statistiques restent vides tant qu'aucune partie n'a été enregistrée.</p><Link href="/cockpit/jeux" className="game-button game-button-primary">Jouer ma première partie <ArrowRight size={16}/></Link></div>}
  {!loading&&!error&&results.length>0&&<section className="game-panel game-panel-wide game-history-list"><div className="game-section-title"><div><p className="game-eyebrow">VOS PARTIES</p><h2>Vos derniers résultats</h2></div><History size={20}/></div><div className="game-history-rows">{results.map(r=><article className="game-history-row" key={r.id}><div><strong>{titles[r.game_id]||r.game_id}</strong><span>{new Date(r.completed_at).toLocaleString("fr-FR",{dateStyle:"medium",timeStyle:"short"})} · {Math.round(r.duration_seconds/60*10)/10} min</span></div><div className="game-history-result"><strong>{r.game_id==="personnalite"?"Préférences partagées":r.score+"%"}</strong><span>{r.correct_answers}/{r.total_questions} réponses</span></div></article>)}</div><Link href="/cockpit/jeux" className="game-button game-button-secondary">Jouer à nouveau →</Link></section>}
 </>;
}
