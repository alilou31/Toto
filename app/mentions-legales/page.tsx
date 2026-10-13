import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mentions légales — informations à compléter",
  robots: { index: false, follow: true },
};

export default function MentionsLegales() {
  return (
    <main className="legal-page">
      <Link href="/" className="text-link">← Retour à l’accueil</Link>
      <p className="section-kicker">NAKAHYA / INFORMATIONS</p>
      <h1>Mentions légales</h1>
      <aside className="legal-draft-notice" role="note">
        <strong>Maquette juridique — ne pas considérer comme des mentions légales définitives</strong>
        <p>Le nom fictif « NAKAHYA Studio » est utilisé uniquement comme repère temporaire. Il ne correspond pas à une entité juridique vérifiée. Les champs d’identité ci-dessous doivent être remplacés par les informations réelles avant toute ouverture publique.</p>
      </aside>
      <h2>Éditeur du service</h2>
      <ul>
        <li>Nom de projet temporaire : NAKAHYA Studio (fictif, non contractuel).</li>
        <li>Nom ou raison sociale réel(le) : À renseigner.</li>
        <li>Forme juridique et capital social, le cas échéant : À renseigner si applicable.</li>
        <li>Adresse du siège ou adresse professionnelle requise : À renseigner.</li>
        <li>Numéro d’immatriculation (SIREN/RCS ou équivalent), si applicable : À renseigner — aucun numéro fictif n’est fourni.</li>
        <li>Adresse de contact de l’éditeur : À renseigner.</li>
        <li>Directeur ou directrice de publication : À confirmer.</li>
      </ul>
      <h2>Hébergement et infrastructure</h2>
      <p>Application hébergée sur Cloudflare Workers ; base de données hébergée par Neon. Les dénominations légales et coordonnées réglementaires des prestataires doivent être vérifiées dans les contrats et pages officielles en vigueur avant publication définitive.</p>
      <h2>Propriété intellectuelle et signalements</h2>
      <p>Les droits portant sur la marque, les contenus, le code et les éléments graphiques doivent être clarifiés par le responsable du projet. Pour signaler un contenu illicite ou une atteinte aux droits, une adresse de contact surveillée doit être publiée ici avant ouverture publique.</p>
      <h2 id="contact">Contact éditeur</h2>
      <p>Coordonnées de contact : à renseigner avant lancement. Aucune adresse de contact fictive n’est publiée dans cette maquette.</p>
      <h2>État de publication</h2>
      <p>Cette page est une base de travail. Elle ne doit pas être considérée comme conforme ou complète tant que l’identité réelle de l’éditeur, les coordonnées, les informations d’hébergement vérifiées et les contacts requis n’ont pas été renseignés et validés.</p>
      <p><Link href="/conditions" className="text-link">Conditions d’utilisation</Link> · <Link href="/confidentialite" className="text-link">Politique de confidentialité</Link></p>
    </main>
  );
}
