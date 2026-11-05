import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import HomeHeader from "@/app/components/home-header";
import { ArrowLeft, ArrowRight } from "lucide-react";

const articles = {
  "rencontre-serieuse-ou-commencer": {
    title: "Rencontre sérieuse : par où commencer ?",
    description: "Clarifier ses intentions et avancer sereinement pour construire une relation durable.",
    category: "PREMIERS PAS", reading: "4 min",
    intro: "Chercher une relation sérieuse ne signifie pas devoir tout décider dès le premier échange. Cela signifie surtout être honnête sur ses intentions et laisser le temps nécessaire à une vraie découverte.",
    sections: [
      ["1. Clarifier ce que vous recherchez", "Prenez un moment pour identifier ce qui est important pour vous : une relation engagée, un projet de vie partagé, une envie de construire une famille ou simplement une relation qui avance avec sincérité. Il n'existe pas de réponse universelle ; l'essentiel est de pouvoir exprimer la vôtre sans pression."],
      ["2. Parler de ses intentions avec simplicité", "Vous n'avez pas besoin de réciter une liste de critères. Une phrase claire sur ce que vous espérez construire suffit souvent à ouvrir un échange. Laissez aussi à l'autre personne la possibilité de préciser son propre rythme et ses attentes."],
      ["3. Observer les actes autant que les mots", "La cohérence se découvre avec le temps : respect des limites, qualité de l'écoute, fiabilité et capacité à dialoguer. Une compatibilité réelle ne se confirme pas en une seule conversation."],
      ["4. Préserver un rythme qui vous convient", "Ne partagez que les informations que vous souhaitez communiquer. Pour une première rencontre en personne, privilégiez un lieu public, prévenez une personne de confiance et gardez la liberté d'écourter le rendez-vous."]
    ],
    conclusion: "Une rencontre sérieuse commence moins par une checklist que par deux personnes capables de parler franchement, de s'écouter et de respecter leur rythme."
  },
  "questions-pour-faire-connaissance": {
    title: "15 questions pour vraiment faire connaissance",
    description: "Des questions ouvertes pour lancer une conversation naturelle et découvrir l'autre sans pression.",
    category: "CONVERSATION", reading: "5 min",
    intro: "Les meilleures questions ne cherchent pas à piéger l'autre : elles donnent envie de raconter, d'écouter et de rebondir. Choisissez-en quelques-unes selon le contexte, et partagez aussi vos propres réponses.",
    sections: [
      ["Le quotidien et les petits plaisirs", "1. Qu'est-ce qui rend une journée réussie pour toi ? 2. Quel moment de la semaine préfères-tu ? 3. Quelle activité te fait perdre la notion du temps ? 4. Quel endroit aimerais-tu faire découvrir à quelqu'un ? 5. Qu'est-ce qui te fait rire à coup sûr ?"],
      ["Les valeurs et la façon de vivre", "6. Quelle qualité apprécies-tu le plus chez les autres ? 7. Qu'est-ce qui te donne confiance dans une relation ? 8. Comment préfères-tu résoudre un désaccord ? 9. Quelle place accordes-tu à la famille et aux proches ? 10. Qu'est-ce que le respect signifie concrètement pour toi ?"],
      ["Les envies et les projets", "11. Y a-t-il quelque chose que tu aimerais apprendre ? 12. À quoi aimerais-tu consacrer davantage de temps ? 13. Quel projet te motive en ce moment ? 14. Quelle place souhaites-tu donner aux voyages ou aux découvertes ? 15. Qu'aimerais-tu construire à deux, si la relation évolue ?"],
      ["Laisser la conversation respirer", "Ne posez pas les quinze questions à la suite. Une conversation agréable est un échange, pas un questionnaire. Rebondissez sur une réponse, racontez une expérience personnelle et acceptez qu'un sujet puisse attendre."]
    ],
    conclusion: "La curiosité sincère fait souvent plus pour une rencontre qu'une question parfaite. Écoutez la réponse et laissez la conversation prendre sa direction."
  },
  "valeurs-compatibilite-couple": {
    title: "Valeurs et compatibilité : comment en parler ?",
    description: "Aborder les valeurs et les projets de vie avec tact, sans réduire une relation à un score.",
    category: "AFFINITÉS", reading: "5 min",
    intro: "Partager des valeurs ne veut pas dire être identiques. Il s'agit plutôt de comprendre ce qui guide chacun, ce qui est négociable et ce qui ne l'est pas dans une relation.",
    sections: [
      ["Distinguer valeurs et préférences", "Une préférence concerne souvent un goût ou une habitude : loisirs, musique ou rythme du week-end. Une valeur touche davantage à la manière de vivre : honnêteté, engagement, famille, autonomie, spiritualité, solidarité ou respect. Les deux peuvent compter, mais ne se discutent pas de la même façon."],
      ["Parler de situations concrètes", "Au lieu de demander seulement « quelles sont tes valeurs ? », échangez sur des situations : comment prendre une décision importante, gérer un désaccord, organiser le temps à deux ou soutenir l'autre dans une période difficile. Les exemples rendent les réponses plus nuancées."],
      ["Accepter les différences", "Deux personnes peuvent avoir des opinions différentes et construire une relation respectueuse. L'important est de pouvoir en parler sans mépris, de comprendre les limites de chacun et de repérer les incompatibilités qui auraient un impact réel sur le quotidien."],
      ["Ne pas transformer la compatibilité en score", "Un profil, un questionnaire ou un jeu peut suggérer des sujets de discussion, mais ne peut pas prédire à lui seul la réussite d'une relation. La confiance, les actes, le dialogue et le consentement se construisent dans la durée."]
    ],
    conclusion: "La compatibilité n'est pas une note à atteindre. C'est une conversation continue sur la manière dont deux personnes souhaitent avancer ensemble."
  }
} as const;

type ArticleSlug = keyof typeof articles;
export function generateStaticParams() { return Object.keys(articles).map((slug) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  if (!(slug in articles)) return {};
  const article = articles[slug as ArticleSlug];
  return { title: article.title, description: article.description, alternates: { canonical: `/conseils/${slug}` }, openGraph: { title: article.title, description: article.description, url: `/conseils/${slug}`, type: "article", locale: "fr_FR", siteName: "NAKAHYA" } };
}
export default async function AdviceArticle({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!(slug in articles)) notFound();
  const article = articles[slug as ArticleSlug];
  const url = `https://nakahya.com/conseils/${slug}`;
  const structuredData = { "@context": "https://schema.org", "@type": "Article", headline: article.title, description: article.description, inLanguage: "fr-FR", mainEntityOfPage: url, author: { "@type": "Organization", name: "NAKAHYA", url: "https://nakahya.com" }, publisher: { "@type": "Organization", name: "NAKAHYA", url: "https://nakahya.com" } };
  return <main className="landing-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
    <HomeHeader locale="fr"/>
    <article className="section-pad" style={{ maxWidth: 1040, margin: "0 auto", background: "var(--ivory)" }}>
      <Link href="/conseils" className="text-link"><ArrowLeft size={15}/> Tous les conseils</Link>
      <p className="section-kicker" style={{ marginTop: 38 }}>{article.category} · {article.reading.toUpperCase()} DE LECTURE</p>
      <h1 style={{ maxWidth: 850 }}>{article.title}</h1>
      <p style={{ fontSize: 18, lineHeight: 1.85, color: "var(--muted)", maxWidth: 780 }}>{article.intro}</p>
      <div style={{ maxWidth: 780, marginTop: 42 }}>
        {article.sections.map(([heading, body]) => <section key={heading} style={{ marginBottom: 34 }}>
          <h2 style={{ fontSize: 27, letterSpacing: "-.4px", marginBottom: 13 }}>{heading}</h2>
          <p style={{ fontSize: 15, lineHeight: 1.95, color: "var(--ink)" }}>{body}</p>
        </section>)}
        <p style={{ fontSize: 16, lineHeight: 1.9, fontWeight: 600 }}>{article.conclusion}</p>
      </div>
      <aside style={{ marginTop: 50, padding: 30, borderRadius: 8, background: "#075b4b", color: "#fff" }}>
        <h2 style={{ color: "#fff", fontSize: 30 }}>Faire connaissance autrement</h2>
        <p style={{ lineHeight: 1.8, color: "#e0ebe4" }}>Sur NAKAHYA, la rencontre sérieuse reste au centre. Les jeux servent à lancer des conversations et à découvrir les affinités à votre rythme.</p>
        <Link href="/inscription" className="button button-light">Créer mon profil <ArrowRight size={16}/></Link>
      </aside>
      <p style={{ marginTop: 35, fontSize: 12, lineHeight: 1.8, color: "var(--muted)" }}>Ces conseils sont des repères généraux et ne remplacent pas votre jugement. Respectez toujours vos limites et celles de l&apos;autre personne.</p>
    </article>
  </main>;
}
