/* eslint-disable react/no-unescaped-entities */
"use client";
import { useState } from "react";
import Link from "next/link";

type Question = { prompt: string; options: string[]; answer: number; note: string };
type Game = { id: string; title: string };
const QUESTIONS: Record<string, Question[]> = {
 "mots-croises":[
  {prompt:"Ce qui permet de se comprendre en échangeant ?",options:["Silence","Dialogue","Hasard","Distance"],answer:1,note:"Le dialogue ouvre la voie à la découverte."},
  {prompt:"Sentiment de sécurité entre deux personnes.",options:["Confiance","Surprise","Vitesse","Mystère"],answer:0,note:"La confiance se construit avec le temps."},
  {prompt:"Qualité de celui qui sait entendre l'autre.",options:["Patience","Écoute","Vitesse","Mystère"],answer:1,note:"L'écoute compte autant que les mots."},
  {prompt:"Un lien se construit…",options:["En un instant","Pas à pas","Sans parler","En gagnant"],answer:1,note:"Les liens grandissent avec les échanges."}],
 "enigme":[
  {prompt:"Plus on en partage, plus on en a. Qu'est-ce que c'est ?",options:["Silence","Souvenirs","Temps","Secrets"],answer:1,note:"Les bons souvenirs se multiplient quand on les partage."},
  {prompt:"Je peux être rompue sans être touchée. Qui suis-je ?",options:["Une promesse","Une corde","Une fenêtre","Une vague"],answer:0,note:"Une promesse se respecte et se discute."},
  {prompt:"Je grandis quand on me nourrit de questions.",options:["Curiosité","Fatigue","Distance","Routine"],answer:0,note:"La curiosité donne envie de découvrir l'autre."},
  {prompt:"Deux personnes me construisent en se parlant.",options:["Un mur","Un malentendu","Un dialogue","Un silence"],answer:2,note:"Le dialogue rapproche les points de vue."}],
 "calcul":[
  {prompt:"Vous avez 3 indices et en découvrez 4 autres. Combien en avez-vous ?",options:["6","7","8","12"],answer:1,note:"3 + 4 = 7."},
  {prompt:"Une partie dure 3 minutes. Deux parties durent…",options:["5 min","6 min","9 min","10 min"],answer:1,note:"2 × 3 = 6 minutes."},
  {prompt:"Vous trouvez 8 réponses sur 10. Quel est le pourcentage ?",options:["60 %","70 %","80 %","90 %"],answer:2,note:"8 sur 10, c'est 80 %."},
  {prompt:"12 questions en 3 manches égales : combien par manche ?",options:["3","4","6","9"],answer:1,note:"12 ÷ 3 = 4 questions."}],
 "personnalite":[
  {prompt:"Pour apprendre à connaître quelqu'un, vous préférez…",options:["Une conversation","Une activité à deux","Des petites questions","Laisser faire le temps"],answer:-1,note:"Il n'y a pas de bonne réponse : le plus important est d'en parler."},
  {prompt:"Votre moment idéal pour discuter ?",options:["Une balade","Autour d'un repas","Pendant un jeu","Un appel tranquille"],answer:-1,note:"Les préférences différentes sont une occasion d'échanger."},
  {prompt:"Qu'appréciez-vous le plus chez quelqu'un ?",options:["L'humour","L'écoute","La curiosité","La sincérité"],answer:-1,note:"Chacun a ses priorités."},
  {prompt:"Pour organiser une sortie, vous êtes plutôt…",options:["Tout prévoir","Improviser","Décider ensemble","Voir selon l'envie"],answer:-1,note:"Partager sa façon de faire aide à se connaître."}],
 "duel":[
  {prompt:"Quel comportement aide à résoudre un désaccord ?",options:["Couper la parole","Écouter l'autre","Changer de sujet","Vouloir gagner"],answer:1,note:"Écouter aide à se comprendre."},
  {prompt:"Le meilleur moyen de clarifier un malentendu ?",options:["Supposer","Attendre toujours","Poser une question","Ignorer"],answer:2,note:"Une question bienveillante évite les suppositions."},
  {prompt:"Un bon défi à deux devrait surtout être…",options:["Amusant","Stressant","Secret","Imprévisible"],answer:0,note:"Le jeu doit rester un plaisir partagé."},
  {prompt:"Quand quelqu'un partage une passion, vous pouvez…",options:["La minimiser","Poser des questions","Changer de sujet","Comparer les scores"],answer:1,note:"La curiosité sincère montre de l'intérêt."}],
 "tournoi":[
  {prompt:"Quel mot signifie comprendre ce que l'autre ressent ?",options:["Empathie","Rivalité","Hésitation","Routine"],answer:0,note:"L'empathie aide à considérer un autre point de vue."},
  {prompt:"Quel élément est essentiel à une équipe ?",options:["Un seul décide","La communication","Le secret","La vitesse seule"],answer:1,note:"Une bonne communication facilite la coopération."},
  {prompt:"Qu'est-ce qui fait progresser après une partie ?",options:["Se comparer","Apprendre de l'expérience","Éviter les questions","Ignorer le résultat"],answer:1,note:"Chaque partie peut être l'occasion d'apprendre."},
  {prompt:"Une compétition amicale devrait valoriser…",options:["Le respect","La pression","La moquerie","Le hasard seul"],answer:0,note:"Le respect permet à chacun de profiter du jeu."}]
};
export function GamePlay({game}:{game:Game}) {
 const questions=QUESTIONS[game.id]??QUESTIONS.enigme, personality=game.id==="personnalite";
 const [started,setStarted]=useState(false),[index,setIndex]=useState(0),[choice,setChoice]=useState<number|null>(null),[answers,setAnswers]=useState<number[]>([]),[startedAt,setStartedAt]=useState(0),[finished,setFinished]=useState(false),[saving,setSaving]=useState(false),[saved,setSaved]=useState(false),[saveError,setSaveError]=useState("");
 const count=(list:number[])=>list.reduce((sum,a,i)=>sum+(questions[i].answer===-1||questions[i].answer===a?1:0),0);
 const score=Math.round(count(answers)/questions.length*100);
 async function finish(list:number[]) {
  setFinished(true);setSaving(true);setSaveError("");
  try {
   const response=await fetch("/api/games/results",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({gameId:game.id,score:Math.round(count(list)/questions.length*100),correctAnswers:count(list),totalQuestions:questions.length,durationSeconds:Math.max(0,Math.round((Date.now()-startedAt)/1000))})});
   const data=await response.json().catch(()=>({}));
   if(!response.ok) throw new Error(data.error||"Enregistrement impossible.");
   setSaved(true);
  } catch(e) {setSaveError(e instanceof Error?e.message:"Enregistrement impossible.");}
  finally {setSaving(false);}
 }
 function next() { if(choice===null)return;const list=[...answers,choice];setAnswers(list);setChoice(null);if(index+1>=questions.length)void finish(list);else setIndex(index+1); }
 function restart(){setStarted(false);setIndex(0);setChoice(null);setAnswers([]);setStartedAt(0);setFinished(false);setSaving(false);setSaved(false);setSaveError("");}
 return <section className="game-panel game-panel-wide game-play-panel" aria-live="polite">
  {!started&&!finished&&<div className="game-play-intro"><p className="game-eyebrow">PARTIE INDIVIDUELLE · 4 QUESTIONS</p><h2>Prêt·e à jouer ?</h2><p>Une première version jouable : répondez à quatre questions, découvrez votre résultat et enregistrez votre partie en étant connecté·e.</p><button type="button" className="game-button game-button-primary" onClick={()=>{setStartedAt(Date.now());setStarted(true);}}>Commencer la partie →</button></div>}
  {started&&!finished&&<div><div className="game-play-progress"><span>QUESTION {index+1} / {questions.length}</span><span>{Math.round(index/questions.length*100)} %</span></div><div className="game-progress"><i style={{width:((index+1)/questions.length*100)+"%"}}/></div><h2 className="game-play-question">{questions[index].prompt}</h2><div className="game-answer-list">{questions[index].options.map((option,i)=><button type="button" key={option} className={"game-answer-option"+(choice===i?" selected":"")} aria-pressed={choice===i} onClick={()=>setChoice(i)}><span className="game-answer-letter">{String.fromCharCode(65+i)}</span><span>{option}</span></button>)}</div><p className="game-play-hint">{personality?"Choisissez la réponse qui vous ressemble : il n'y a pas de mauvais choix.":"Choisissez une réponse, puis validez pour continuer."}</p><button type="button" className="game-button game-button-primary" disabled={choice===null} onClick={next}>{index+1===questions.length?"Voir mon résultat":"Valider et continuer"} →</button></div>}
  {finished&&<div className="game-play-result"><p className="game-eyebrow">PARTIE TERMINÉE</p><h2>{personality?"Merci d'avoir partagé vos préférences !":"Bien joué, la partie est terminée !"}</h2><div className="game-result-score"><strong>{score}%</strong><span>{count(answers)} réponse(s) validée(s) sur {questions.length}</span></div><p>{questions[questions.length-1].note}</p>{saving&&<p role="status">Enregistrement du résultat…</p>}{saved&&<p role="status" className="game-save-success">Résultat enregistré dans votre historique.</p>}{saveError&&<p role="alert" className="game-save-error">{saveError} Cette partie n'a pas été enregistrée. Vous pouvez rejouer.</p>}<div className="game-detail-actions"><button type="button" className="game-button game-button-secondary" onClick={restart}>Rejouer</button><Link href="/cockpit/historique" className="game-button game-button-primary">Voir mon historique →</Link></div></div>}
 </section>;
}
