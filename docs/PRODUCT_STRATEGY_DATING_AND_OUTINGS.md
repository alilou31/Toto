# NAKAHYA — Stratégie produit : rencontres, sorties et réservation

**Statut :** cadrage stratégique, pas une déclaration de fonctionnalités livrées.  
**Stack :** Next.js 15 / React, TypeScript, Neon PostgreSQL et Cloudflare Workers. Aucun nouveau prestataire ou package n'est ajouté dans cette passe.

## Positionnement

NAKAHYA est d'abord une **application de rencontre sérieuse** pour adultes. Les intentions, les valeurs et les projets de vie sont au centre. Les jeux servent à briser la glace et à ouvrir une conversation ; ils ne sont pas la catégorie principale du produit.

**Promesse proposée :** « Des rencontres qui ont du sens. Des jeux pour briser la glace. Des sorties pour passer du virtuel au réel, à votre rythme. »

Les Bons plans sont aujourd'hui des sélections éditoriales et peuvent contenir des liens affiliés. Ils ne garantissent ni tarif spécial, ni partenariat, ni disponibilité, ni réservation.

## État à ne pas confondre avec la roadmap

- **Code existant :** profils, découverte, intérêts/matchs, conversations, jeux/défis, page éditoriale et carrousel d'idées de sorties.
- **Non confirmé comme disponible :** intention de sortie visible par les membres, recherche par activité/créneau, réservation intégrée, paiement ou confirmation d'un fournisseur.
- Un fichier présent ou un build vert ne prouve pas qu'une fonction est validée en production. Vérifier le code, les tests et le déploiement avant de communiquer sur son statut.

## Parcours cible

1. Créer un profil et découvrir des personnes compatibles.
2. Démarrer une conversation ; proposer un jeu facultatif pour briser la glace.
3. Choisir de rendre visible une intention temporaire : café, restaurant, exposition ou balade.
4. Trouver des membres ayant explicitement rendu cette intention visible.
5. S'accorder en privé sur le lieu et le créneau ; l'invitation ne vaut ni consentement intime ni engagement financier.
6. Réserver d'abord par un lien externe clairement identifié, puis éventuellement par une API de réservation réelle.

## Sécurité et consentement : conditions de conception

Ces points ne sont pas des garanties déjà implémentées.

- **Opt-in :** aucune intention publique par défaut ; préciser ce qui est visible, à qui et pour combien de temps.
- **Révocation/expiration :** retrait immédiat et expiration automatique courte.
- **Localisation :** zone approximative seulement ; jamais d'adresse personnelle ou de GPS précis.
- **Consentement bilatéral :** invitation, acceptation et changement de plan explicites et révocables.
- **Coût :** ne pas présumer que la personne qui invite paie ; clarifier le partage des frais avant réservation.
- **Voyages/week-ends :** à différer après les sorties locales, car les risques liés au transport, à l'hébergement et à la dépendance financière sont plus élevés.
- **Blocage/modération :** les règles existantes doivent s'appliquer à la découverte par activité et aux messages liés. Définir un traitement humain des signalements et limiter les sollicitations répétées.
- **18+ :** aucune fonctionnalité de sortie ne doit contourner les contrôles d'âge.
- **Juridique :** faire valider CGU, confidentialité, conservation des données, affiliation et responsabilités de réservation. Ce document n'est pas un avis juridique.

## Réservation : progression recommandée

### Phase A — éditorial et affiliation

- Identifier clairement les liens externes et affiliés, le fournisseur et les conditions connues.
- Ne pas annoncer de prix ou disponibilité en temps réel sans source vérifiée.
- Mesurer les clics sortants ; ne pas transmettre de données de profil à un affilié sans base appropriée et information claire.

### Phase B — intentions entre membres

- Auditer le schéma existant avant de créer une table afin d'éviter les doublons.
- Champs minimaux envisagés : activité, créneau large, zone approximative, expiration, visibilité, auteur et état.
- Ajouter contraintes, index, contrôles serveur et tests d'accès négatifs.
- N'afficher que les intentions que leur auteur a explicitement choisi de rendre visibles.

### Phase C — réservation intégrée, sans paiement au départ

- Piloter un seul domaine : restaurant ou activité locale.
- Évaluer couverture en France, API de disponibilité, création/annulation, coûts, support, commissions et exigences contractuelles.
- Créer un adaptateur serveur par fournisseur ; conserver les secrets côté serveur Cloudflare.
- États explicites : « à confirmer », « en cours », « confirmée par le fournisseur », « annulée », « échec ».
- Prévoir idempotence, timeouts, erreurs, reprise, doublons, fuseaux horaires, annulation et notifications.
- Une réservation n'est confirmée qu'après retour vérifié du fournisseur.

### Phase D — paiement séparé

Le paiement intégré est une décision ultérieure. Valider auparavant encaissement, commissions, remboursements, annulations, litiges, facturation, fraude, support et fiscalité. Aucune intégration Stripe ou autre n'est présumée nécessaire ici.

## Roadmap

### Jours 0–7 — clarifier et mesurer
- Aligner landing page, SEO et FAQ sur « rencontre d'abord ».
- Préciser l'affiliation et l'absence de réservation intégrée.
- Mesurer visite → inscription → profil complété → découverte → match → premier message → jeu → retour à 7 jours.
- Auditer blocage, signalement, suppression de compte et accès privés.
- Faire valider l'identité de l'éditeur et les documents juridiques avant ouverture commerciale.

### Jours 8–30 — tester sans marketplace
- Interroger les utilisateurs et prototyper l'intention de sortie, sa visibilité et son expiration.
- Tester manuellement les idées éditoriales sans prétendre qu'une réservation a été faite dans l'app.
- Définir permissions et tests négatifs après l'audit anti-doublons.
- Évaluer les fournisseurs sur leur documentation officielle et leurs conditions actuelles.

### Jours 31–90 — MVP de sorties contrôlées
- Implémenter l'intention facultative/expirante et les filtres seulement si le prototype justifie l'investissement.
- Piloter dans une zone limitée avec modération, signalement, limites de fréquence et procédure de retrait.
- Tester les liens sortants avant une intégration API.
- Ne lancer la réservation intégrée que si demande, faisabilité et support sont confirmés.

### Mois 3–12 — réservation puis éventuel paiement
- Piloter une API d'un seul domaine, sans paiement initialement.
- Suivre confirmations réelles, annulations, erreurs, support et commissions.
- Décider du paiement après validation du modèle économique et contractuel.
- Étendre aux autres activités ensuite ; traiter les voyages comme un projet séparé.

## KPI et expériences

Cibles initiales à tester, pas résultats observés ni benchmarks garantis :

| KPI | Hypothèse | Garde-fou |
| --- | --- | --- |
| Visite → inscription | +10 % relatif vs baseline | Compréhension de la promesse |
| Profil complété | +10 % relatif | Qualité du parcours |
| Premier message dans les 7 jours après match | +15 % relatif chez les utilisateurs exposés aux jeux | Ne pas forcer le jeu |
| Clic sur idées de sorties | 5–10 % des vues de section | Un clic n'est pas une réservation |
| Intentions de sortie acceptées | Établir d'abord une baseline | Respect des refus |
| Signalements liés aux sorties | Pas de hausse significative vs baseline | Toute hausse déclenche une revue |
| Réservations confirmées | Seulement après intégration vérifiée | Ne pas compter les clics sortants |

Tester d'abord le message de landing page, le moment de proposition d'un jeu, les catégories de sorties et un prototype opt-in. Segmenter mobile/desktop en minimisant les données personnelles.

## Architecture Cloudflare + Neon

- Réutiliser profils, conversations, blocages et signalements après inspection du code et du schéma.
- Préférer des migrations additives avec contraintes, index et tests Playwright négatifs.
- Garder les clés fournisseurs côté serveur, jamais dans des variables publiques.
- Isoler chaque fournisseur derrière un adaptateur serveur avec timeout, idempotence, logs minimaux et tests de contrat.
- Éviter le GPS précis au lancement ; une zone saisie manuellement peut suffire.
- Ne pas ajouter de service externe tant que besoin, coût, contrat et secrets ne sont pas validés.

## Critères bloquants avant lancement

Ne pas ouvrir les sorties entre membres ni la réservation au public tant que les permissions sont testées, que blocage/signalement sont cohérents, que les intentions expirent, que la localisation est minimisée, que la modération fonctionne, que les documents légaux sont validés et que le support des réservations est défini.

**Décision :** clarifier et mesurer l'expérience de rencontre ; tester ensuite les sorties avec un consentement fort ; construire la réservation progressivement, avec confirmation réelle du fournisseur et sans paiement avant validation opérationnelle.
