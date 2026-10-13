import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Conditions d’utilisation — projet à finaliser",
  robots: { index: false, follow: true },
};

export default function Conditions() {
  return (
    <main className="legal-page">
      <Link href="/" className="text-link">← Retour à l’accueil</Link>
      <p className="section-kicker">NAKAHYA / CADRE DE CONFIANCE</p>
      <h1>Conditions d’utilisation</h1>
      <aside className="legal-draft-notice" role="note">
        <strong>Document de travail — non contractuel</strong>
        <p>« NAKAHYA Studio » est un nom fictif de travail et ne désigne pas une société immatriculée. Ces conditions sont un cadre de préparation, à compléter et faire valider avant ouverture commerciale. Elles ne remplacent pas un avis juridique.</p>
      </aside>

      <h2>1. Objet et accès</h2>
      <p>NAKAHYA est un projet de service de rencontre destiné aux adultes de 18 ans et plus qui souhaitent faire connaissance au moyen de profils, d’affinités, de jeux et de conversations. L’accès public et les fonctionnalités disponibles peuvent évoluer pendant la phase pilote.</p>

      <h2>2. Compte et informations</h2>
      <ul>
        <li>Fournissez des informations sincères et n’usurpez pas l’identité d’une autre personne.</li>
        <li>Protégez vos identifiants et signalez toute utilisation non autorisée de votre compte.</li>
        <li>N’utilisez pas le service si vous avez moins de 18 ans.</li>
        <li>Ne publiez pas de contenu illicite, menaçant, discriminatoire, harcelant, frauduleux ou portant atteinte aux droits d’autrui.</li>
      </ul>

      <h2>3. Respect, blocage et signalement</h2>
      <p>Respectez les limites et le consentement des autres membres. Les outils de blocage et de signalement peuvent être utilisés pour signaler une conduite problématique. Le responsable doit définir avant lancement les modalités de revue, les délais de traitement, les mesures possibles, les voies de recours et la conservation des preuves.</p>

      <h2>4. Jeux et affinités</h2>
      <p>Les jeux sont des supports de conversation et ne garantissent ni compatibilité amoureuse ni résultat relationnel. Les scores ou réponses ne doivent pas être interprétés comme une évaluation scientifique d’une personne.</p>

      <h2>5. Disponibilité et suspension</h2>
      <p>Le service est fourni en l’état pendant la phase pilote. Les règles de disponibilité, de maintenance, de suspension, de clôture de compte et de recours doivent être finalisées par l’éditeur réel avant lancement. Aucune limitation des droits impératifs des consommateurs ou utilisateurs n’est voulue par ce document de travail.</p>

      <h2>6. Prix, résiliation et médiation</h2>
      <p>Aucun prix, abonnement, renouvellement ou moyen de paiement n’est défini par cette page. Si des offres payantes sont lancées, les conditions commerciales, le prix TTC, la facturation, les règles de résiliation, le droit de rétractation lorsqu’il s’applique et les coordonnées du médiateur compétent devront être publiés avant la souscription.</p>

      <h2>7. Éditeur et contact</h2>
      <p>Identité légale, adresse, contact et informations d’immatriculation : à renseigner par l’éditeur réel. « NAKAHYA Studio » est un nom fictif de travail et ne doit pas être utilisé comme identité légale.</p>

      <p><Link href="/mentions-legales" className="text-link">Mentions légales de travail</Link> · <Link href="/confidentialite" className="text-link">Politique de confidentialité de travail</Link></p>
    </main>
  );
}
