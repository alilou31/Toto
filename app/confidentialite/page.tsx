import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Politique de confidentialité — projet à finaliser",
  robots: { index: false, follow: true },
};

export default function Confidentialite() {
  return (
    <main className="legal-page">
      <Link href="/" className="text-link">← Retour à l’accueil</Link>
      <p className="section-kicker">NIKAHYA / TRANSPARENCE</p>
      <h1>Politique de confidentialité</h1>
      <aside className="legal-draft-notice" role="note">
        <strong>Document de travail — non définitif</strong>
        <p>Le nom « NIKAHYA Studio » est une identité fictive de travail, pas une société déclarée. Cette page ne constitue pas encore une information juridique suffisante pour l’ouverture commerciale. Les éléments manquants doivent être complétés et vérifiés avant l’ouverture publique.</p>
      </aside>

      <h2>Qui est responsable du service ?</h2>
      <p>Responsable de traitement : à confirmer par l’éditeur réel du service. Nom de travail utilisé dans le projet : « NIKAHYA Studio » (fictif et non contractuel). Adresse postale, adresse de contact dédiée et coordonnées du responsable : à renseigner avant lancement. Ne transmettez pas de demande juridique à une coordonnée fictive.</p>

      <h2>Quelles données le service peut-il traiter ?</h2>
      <p>Selon les fonctionnalités utilisées, NIKAHYA peut traiter l’adresse e-mail et les données d’authentification, les informations de profil renseignées par la personne, ses centres d’intérêt, ses intentions de rencontre, ses interactions (intérêts, matchs, messages et jeux partagés), ainsi que les signalements et blocages nécessaires à la sécurité. Les données techniques de fonctionnement peuvent aussi apparaître dans les journaux du fournisseur d’hébergement.</p>
      <p>Ne saisissez pas dans un profil ou un message des informations que vous ne souhaitez pas partager. Les données relatives aux convictions ou à d’autres catégories particulières nécessitent une analyse juridique spécifique et des garanties renforcées ; leur traitement ne doit pas être activé sans cette validation.</p>

      <h2>Pourquoi et sur quelle base ?</h2>
      <ul>
        <li>Créer et gérer le compte, le profil et les interactions demandées : base légale à confirmer selon les fonctionnalités et les conditions applicables.</li>
        <li>Protéger les membres, appliquer les blocages et traiter les signalements : intérêt légitime et/ou autre base appropriée à documenter.</li>
        <li>Respecter les obligations légales applicables : obligation légale lorsque celle-ci existe.</li>
        <li>Mesure d’audience et traceurs : outils réellement activés et base légale/consentement à confirmer avant toute mise en production.</li>
      </ul>

      <h2>Prestataires et hébergement</h2>
      <p>Le projet utilise Cloudflare Workers pour l’hébergement applicatif et Neon pour la base de données. Les éventuels fournisseurs d’e-mail, d’authentification sociale, d’analytique, de modération ou de paiement doivent être listés uniquement après vérification de leur activation réelle, de leurs rôles et des éventuels transferts de données.</p>

      <h2>Conservation et sécurité</h2>
      <p>Les durées de conservation par catégorie de données doivent être définies et publiées avant lancement. Les mesures prévues comprennent le contrôle d’accès, la limitation des données renvoyées par les API, la protection des sessions et des mécanismes de blocage/signalement ; elles ne constituent pas une garantie de sécurité absolue ni un audit indépendant.</p>

      <h2>Vos droits et contact</h2>
      <p>Selon la réglementation applicable, vous pouvez notamment disposer de droits d’accès, rectification, effacement, limitation, opposition et portabilité. Pour les exercer, l’adresse de contact du responsable doit être renseignée ici avant l’ouverture publique. Vous pouvez également introduire une réclamation auprès de l’autorité de contrôle compétente, notamment la CNIL en France.</p>

      <h2>Avant publication</h2>
      <p>Compléter l’identité réelle du responsable, les bases légales exactes, les durées de conservation, les destinataires, les transferts éventuels, la gestion des cookies, le contact droits et les procédures de suppression/export ; puis faire relire le document par un professionnel compétent.</p>
      <p><Link href="/mentions-legales" className="text-link">Consulter les mentions légales de travail</Link> · <Link href="/conditions" className="text-link">Conditions d’utilisation de travail</Link></p>
    </main>
  );
}
