# Inventaire fonctionnel — NAKAHYA

> **Objectif : éviter les doublons de développement.** Avant de créer une fonctionnalité, une page, une API ou un test, consulter ce document et rechercher dans le dépôt. Mettre cet inventaire à jour lorsqu'une fonctionnalité est ajoutée, modifiée, fusionnée ou retirée.
>
> Application : https://nikahya.rassoul-ali.workers.dev/  
> Dépôt : https://github.com/alilou31/Toto  
> Hébergement cible : Cloudflare Workers ; base de données : Neon.
>
> **Lecture des statuts :** ce fichier conserve un historique de contrôles datés. Les sections du 12 octobre sont des instantanés historiques et ne décrivent pas l'état courant du dépôt. Pour l'état le plus récent, utiliser les entrées datées les plus récentes et vérifier le SHA, la PR et les checks GitHub correspondants. Les migrations présentes dans le dépôt ne prouvent pas qu'elles sont appliquées dans Neon.

## Règles anti-doublons

1. **Chercher avant de créer** : vérifier cette liste, les routes sous `app/`, les tests sous `tests/`, les migrations sous `db/migrations/` et les PR ouvertes.
2. Une fonctionnalité peut être déjà **présente dans le code** sans être terminée, déployée ou validée en production. Ne pas confondre ces états.
3. Utiliser ces statuts :
   - **CODE PRÉSENT** : page/API/composant identifié dans le dépôt.
   - **TEST AUTOMATISÉ PRÉSENT** : un test correspondant existe.
   - **PRODUCTION VALIDÉE** : exécution récente avec preuve dans [PRODUCTION_TEST_LOG.md](./PRODUCTION_TEST_LOG.md).
   - **À VÉRIFIER** : couverture, règles métier, déploiement ou résultat non confirmé.
   - **À DÉVELOPPER** : fonctionnalité absente ou insuffisante après inspection du code.
4. Avant de coder, expliquer si le besoin est déjà couvert, s'il faut corriger l'existant ou s'il s'agit d'une vraie nouvelle capacité. Préférer une extension de l'implémentation existante à une deuxième implémentation parallèle.
5. Avant d'ajouter un test, rechercher les tests existants et compléter le test pertinent plutôt que créer un doublon. Un test doit avoir un objectif distinct et un nom explicite.
6. Après fusion/déploiement, mettre à jour cet inventaire et ajouter le résultat vérifié au registre de production. Ne jamais marquer « production validée » sur la seule base de la présence du code ou d'un build vert.
7. Ne jamais mettre de secrets, identifiants réels ou données privées dans ce fichier.

## Audit anti-doublons et derniers points de contrôle — 2026-10-13

- **Baseline vérifiée :** `main` au commit `9e2d4929c8de5bc2afedd4d994827d64a7249ff9`; CI, déploiement Cloudflare Workers et smoke tests post-déploiement sont réussis. Les liens de preuve sont dans GitHub Actions : [CI](https://github.com/alilou31/Toto/actions/runs/38407898846), [déploiement](https://github.com/alilou31/Toto/actions/runs/38407899482), [smoke tests](https://github.com/alilou31/Toto/actions/runs/38408379915).
- **SEO de la démo :** le layout dédié et le test des métadonnées (title, description, canonical et Open Graph) sont ajoutés ensemble ; la réussite sera confirmée par la CI de cette modification et le smoke après déploiement.
- **Menu mobile :** les tests existent déjà dans `tests/e2e/security-and-mobile-navigation.spec.ts` à 390×844 (ouverture/fermeture, Échap et navigation). Ne pas ajouter un deuxième jeu de tests identiques ; corriger uniquement en cas d'échec.
- **Parcours à deux utilisateurs :** `tests/e2e/two-user-full-journey.spec.ts` existe déjà. Le workflow qui écrit en production nécessite les comptes de test dédiés et une autorisation explicite ; ne pas le déclencher automatiquement dans cette consolidation.
- **Récupération de mot de passe :** la branche `feat/resend-password-reset` et la migration 010 ne constituent pas une fonctionnalité terminée. Ne pas fusionner cette branche ni exécuter la migration avant que le parcours complet (demande, livraison e-mail, jeton expirant à usage unique, confirmation et invalidation) soit implémenté et testé.
- **Lancement public :** les pages légales restent des brouillons et nécessitent l'identité réelle de l'éditeur ainsi qu'une validation humaine/juridique. Aucun code ne peut inventer ces informations ; le statut reste bloquant avant ouverture commerciale.
- **Branches historiques :** plusieurs branches de fonctionnalités sont fortement en retard sur `main`. Ne pas les fusionner telles quelles ; comparer les diffs et ne reprendre que des changements encore absents, afin d'éviter les régressions et doublons.

## Correctifs et couverture — 2026-10-13

- Les tests API anonymes sont centralisés dans `tests/e2e/auth-api.spec.ts`; ils couvrent lectures privées et écritures sans session. Leur statut est **à valider par CI** tant que le run du commit candidat n’est pas terminé.
- Le test mobile de la landing et du menu est déjà présent dans `tests/e2e/production-ui.spec.ts` à 390×844 ; le test `connected-mobile-experience.spec.ts` couvre aussi l’espace mobile en mode anonyme. Ne pas dupliquer ces scénarios.
- Les pages `/mentions-legales`, `/confidentialite` et `/conditions` sont accessibles, explicitement marquées comme documents de travail et exclues de l’indexation tant que l’identité réelle et le contenu définitif ne sont pas renseignés.
- La récupération de mot de passe n’est pas implémentée : fournisseur d’e-mail et paramètres de livraison non configurés. À ne pas marquer comme terminée avant un test de bout en bout du message, du jeton et de l’invalidation.

## Inventaire actuel

## Instantané historique — 2026-10-12 (vérification Playwright production)

- **HEAD de `main` :** `7b51f4bf27fb1adff424415c57cb345b7e60c3bf`.
- **CI :** réussie, [run 38266697104](https://github.com/alilou31/Toto/actions/runs/38266697104).
- **Déploiement Cloudflare Workers :** réussi, [run 38266697091](https://github.com/alilou31/Toto/actions/runs/38266697091).
- **Playwright production en lecture seule :** **18 passés, 0 échec, 0 ignoré** dans [run 38267172805](https://github.com/alilou31/Toto/actions/runs/38267172805). Les fichiers exécutés sont uniquement `tests/e2e/production-ui.spec.ts` et `tests/e2e/api-json-contract.spec.ts`.
- **Smoke production complémentaire :** accueil et `/demo` accessibles ; `/api/db-check` confirme `ok=true` et `status=connected` ; `/api/games/results` refuse une requête anonyme avec HTTP 401 et le JSON attendu.
- **Parcours à deux utilisateurs : NON VALIDÉ par ce run.** Il n'est pas inclus dans le workflow Playwright de production en lecture seule. Une exécution autorisée nécessite deux comptes de test dédiés et les secrets/variable documentés dans `docs/testing-two-users.md`.
- **État Neon :** le smoke confirme la connectivité, pas l'application des migrations `005_game_sessions.sql` ou `007_rencontre_sessions.sql`.
- **PR ouvertes à réconcilier :** #3, #4, #5, #6 et #8. Aucun changement ne doit être fusionné sans comparaison du diff avec `main`.

Les chemins ci-dessous ont été repérés dans l'arborescence de `main`. **La présence d'un chemin est une preuve d'implémentation dans le dépôt, pas une preuve de validation fonctionnelle en production.**

| Domaine | Capacités / emplacement repéré | Tests repérés | État actuel / garde-fou anti-doublon |
| --- | --- | --- | --- |
| Authentification | Inscription, connexion, déconnexion, session : `app/api/auth/` | `tests/e2e/auth-api.spec.ts` | CODE PRÉSENT ; vérifier les cas négatifs et les résultats de production avant d'ajouter un nouveau flux d'authentification. |
| Profil | Lecture et sauvegarde : `app/api/profile/route.ts`, `app/api/profiles/[profileId]/route.ts`, pages `app/profil/` | `tests/e2e/profile-api.spec.ts`, `tests/e2e/public-profile.spec.ts` | CODE PRÉSENT ; vérifier les champs et la navigation existants avant de créer une nouvelle page de profil. |
| Découverte | `app/api/discover/route.ts`, pages de découverte dans `app/` | `tests/e2e/discover-api.spec.ts`, `tests/e2e/discovery-interests.spec.ts` | CODE PRÉSENT ; contrôler visibilité, majorité, exclusion de soi et blocages. |
| Intérêts / likes | `app/api/interests/route.ts`, `app/cockpit/likes/` | `tests/e2e/discovery-interests.spec.ts`, `tests/e2e/match-interests.spec.ts` | CODE PRÉSENT ; réutiliser les états d'intérêt existants. |
| Matchs | `app/api/matches/route.ts` | `tests/e2e/matching-api.spec.ts`, `tests/e2e/match-interests.spec.ts` | CODE PRÉSENT ; ne pas ajouter un second mécanisme de match sans vérifier les règles actuelles. |
| Messagerie | `app/messages/[conversationId]/page.tsx`, `app/api/conversations/[conversationId]/messages/route.ts` | Parcours à deux utilisateurs dans `tests/e2e/two-user-full-journey.spec.ts` ; tests API à compléter selon besoin | CODE PRÉSENT ; valider l'appartenance à la conversation, le blocage et les accès non autorisés. |
| Blocage | `app/api/blocks/route.ts` | Couverture dédiée à confirmer | CODE PRÉSENT ; les règles doivent s'appliquer aux profils, intérêts, matchs et messages. |
| Signalements | `app/api/reports/route.ts` | Couverture dédiée à confirmer | CODE PRÉSENT ; la file de modération et les rôles admin restent à vérifier. |
| Catalogue de jeux | `app/cockpit/jeux/page.tsx`, `app/cockpit/jeux/[id]/page.tsx` | `tests/e2e/games.spec.ts` | CODE PRÉSENT ; compléter les jeux existants avant d'en créer un autre. |
| Sessions de jeux | `app/api/games/sessions/` | `tests/e2e/games.spec.ts` | CODE PRÉSENT ; confirmer migrations Neon `005_game_sessions.sql` et les contrôles d'accès. |
| Mode Rencontre / défis partagés | `app/rencontre/page.tsx`, `app/api/rencontre/sessions/route.ts`, `app/cockpit/defis/` | Parcours à deux utilisateurs : `tests/e2e/two-user-full-journey.spec.ts` | CODE PRÉSENT ; le défi partagé doit rester conditionné à un match autorisé et à l'absence de blocage. Confirmer la migration `007_rencontre_sessions.sql`. |
| Historique / visites | `app/cockpit/historique/`, `app/cockpit/visites/` | Couverture dédiée à confirmer | CODE PRÉSENT côté pages ; confirmer la persistance et les règles métier avant extension. |
| Tableau de bord | `app/tableau-de-bord/page.tsx`, `app/cockpit/page.tsx` | `tests/e2e/home-navigation.spec.ts`, `tests/e2e/session-navigation.spec.ts` | CODE PRÉSENT ; vérifier les liens et les retours arrière avant de créer un nouveau dashboard. |
| Paramètres de sécurité | `app/parametres/securite/page.tsx` | Couverture dédiée à confirmer | CODE PRÉSENT ; vérifier les actions réelles derrière chaque réglage. |
| Suppression de compte | `app/api/account/route.ts` | Couverture complète à confirmer | CODE PRÉSENT côté route ; ne pas déclarer le cycle de suppression/anonymisation terminé sans vérifier toutes les données liées. |
| Pages légales | `app/conditions/page.tsx`, `app/confidentialite/page.tsx` | `tests/e2e/public-pages.spec.ts` | CODE PRÉSENT ; contenu, conservation et obligations légales à revoir avant ouverture publique. |
| Navigation et responsive | Pages et composants sous `app/` | `tests/e2e/home-navigation.spec.ts`, `tests/e2e/session-navigation.spec.ts`, `tests/e2e/production-ui.spec.ts`, `tests/e2e/ux-redesign.spec.ts` | CODE ET TESTS PRÉSENTS ; vérifier les tests existants avant d'en ajouter un nouveau. |
| Contrats API / validation | Routes API sous `app/api/` | `tests/e2e/api-json-contract.spec.ts`, `tests/validation.test.cjs` | COUVERTURE PARTIELLE À CONFIRMER ; compléter les tests existants plutôt que dupliquer les assertions. |
| Socle DB | `app/api/db-check/route.ts`, migrations `db/migrations/001` à `013` présentes dans l'historique du dépôt | Smoke tests de production référencés dans `PRODUCTION_TEST_LOG.md` | Code présent ; ne pas inférer l'état réel des migrations Neon à partir des seuls fichiers. Vérifier la séquence et l'état de la base avant exécution. |

## Tests E2E repérés

- `tests/e2e/api-json-contract.spec.ts`
- `tests/e2e/auth-api.spec.ts`
- `tests/e2e/discover-api.spec.ts`
- `tests/e2e/discovery-interests.spec.ts`
- `tests/e2e/games.spec.ts`
- `tests/e2e/home-navigation.spec.ts`
- `tests/e2e/match-interests.spec.ts`
- `tests/e2e/matching-api.spec.ts`
- `tests/e2e/profile-api.spec.ts`
- `tests/e2e/production-ui.spec.ts`
- `tests/e2e/public-pages.spec.ts`
- `tests/e2e/public-profile.spec.ts`
- `tests/e2e/session-navigation.spec.ts`
- `tests/e2e/two-user-full-journey.spec.ts`
- `tests/e2e/ux-redesign.spec.ts`

Voir aussi `tests/README.md` et `PRODUCTION_TEST_LOG.md`. Avant d'affirmer qu'un test a réussi, retrouver son rapport d'exécution et le commit correspondant.

## Points à vérifier avant d'étendre le produit

- Couverture exacte des autorisations négatives pour les API de profils, intérêts, matchs, conversations, sessions de jeux et défis.
- Résultat et rapport le plus récent du parcours Playwright à deux comptes.
- État réel des migrations `005_game_sessions.sql` et `007_rencontre_sessions.sql` dans Neon.
- Cycle complet de suppression/anonymisation de compte.
- Modération des photos et traitement des signalements par un rôle admin.
- Fonctionnalités UI dont le code est présent mais dont l'action réelle n'a pas encore été validée en production.

## Modèle pour toute nouvelle fonctionnalité

### FEATURE-NNN — Nom de la fonctionnalité
- **Besoin utilisateur :**
- **Existence vérifiée :** oui / partielle / non
- **Pages / composants existants :**
- **API / schéma / migrations existants :**
- **Tests existants :**
- **Écart réel à combler :**
- **Changement retenu :** réutiliser / corriger / étendre / créer
- **Critères d'acceptation :**
- **Tests exécutés et preuve :**
- **Statut après déploiement :**

## Liens de référence

- [Registre des tests de production](./PRODUCTION_TEST_LOG.md)
- [Backlog produit](./BACKLOG.md)
- [Dépôt GitHub](https://github.com/alilou31/Toto)
- [Application de production](https://nikahya.rassoul-ali.workers.dev/)


## Mise à jour produit — Découverte, fiche membre et offres (2026-10-13)

- **Découverte compacte : CODE PRÉSENT sur la branche** `feat/discovery-dashboard-membership` : grille responsive multi-profils, intérêts communs résumés, accès à la fiche, intérêt, blocage et signalement conservés.
- **Fiche membre enrichie : CODE PRÉSENT sur la branche** : résumé des jeux réellement enregistrés (types et nombre de parties, sans score ni réponses privées) ; l’API continue d’exclure les profils invisibles, mineurs, soi-même et les relations bloquées.
- **Tableau de bord : CODE PRÉSENT sur la branche** : navigation plus adaptée au mobile et accès direct aux offres.
- **Offres : CODE PRÉSENT sur la branche** : page `/offres` avec Gratuit et Premium (prix proposés 9,99 €/mois ou 79,99 €/an). Les boutons de paiement restent désactivés : Stripe et les contrôles d’entitlement ne sont pas configurés ; ne pas présenter le paiement comme fonctionnel.
- **Tests ajoutés/modifiés** : `tests/e2e/discovery-dashboard-pricing.spec.ts` et `tests/e2e/public-profile.spec.ts`. La validation CI et la production restent à confirmer après PR et déploiement.


## Récupération du mot de passe — chantier Resend (2026-10-13)

- **Code sur la branche** `feat/resend-password-reset-complete` : demande de lien, e-mail HTML/texte, formulaire de réinitialisation et confirmation sécurisée.
- **Sécurité implémentée dans le code candidat** : réponses génériques pour comptes inconnus, limitation des demandes, jeton aléatoire dont seul le SHA-256 est stocké, expiration après 60 minutes, usage unique et révocation des sessions après changement du mot de passe.
- **Migration** : `db/migrations/010_password_reset_tokens.sql`. L’utilisateur a confirmé le succès de son exécution dans Neon le 2026-10-13 ; l’état de la base n’a pas été vérifié directement par cette CI.
- **Tests Playwright ajoutés** : `tests/e2e/password-reset.spec.ts` pour l'interface et les validations des entrées. Le parcours de livraison e-mail et la consommation réelle du jeton restent à valider avec une configuration Resend autorisée.
- **Configuration attendue** : `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `NEXT_PUBLIC_SITE_URL`. Aucun secret n'est stocké dans Git.
- **Blocage fournisseur** : aucun domaine expéditeur n'est configuré dans Resend au dernier contrôle. `onboarding@resend.dev` est uniquement une solution de test soumise aux restrictions Resend ; ne pas considérer la livraison à tous les membres comme opérationnelle avant vérification d'un domaine expéditeur.
- **Statut global** : EN COURS — code candidat présent ; migration exécutée selon confirmation utilisateur ; CI à relancer après le dernier correctif ; livraison réelle non testée (test volontairement reporté) ; pas encore déployé en production.

## Consolidation pré-lancement — 2026-10-13 (référence après fusion #50)

- **HEAD de référence :** `0706d26eb3ada57ad84bc95bfa29bce9b41c6f12` — récupération du mot de passe fusionnée dans `main`; CI, déploiement Cloudflare Workers et smoke tests ont réussi sur ce SHA :
  - [CI #289](https://github.com/alilou31/Toto/actions/runs/38448491934)
  - [Déploiement Cloudflare #198](https://github.com/alilou31/Toto/actions/runs/38448491949)
  - [Smoke tests de production #98](https://github.com/alilou31/Toto/actions/runs/38448990089)
- **Sécurité API sans session : TESTS PRÉSENTS.** `tests/e2e/security-and-mobile-navigation.spec.ts` couvre déjà les lectures/écritures anonymes de plusieurs API privées. Les contrôles doivent rester dans la CI à chaque changement.
- **Navigation mobile : TESTS PRÉSENTS.** Les tests à viewport explicite 390×844 couvrent l'ouverture, la fermeture, Échap et un lien du menu. Ne pas ajouter un second jeu de tests identiques.
- **Suppression de compte : CODE PRÉSENT.** `DELETE /api/account` demande une session, le mot de passe et la confirmation `SUPPRIMER`. La couverture non destructive de ses validations et du refus sans session est ajoutée dans `tests/e2e/account-deletion-api.spec.ts`.
- **Récupération du mot de passe : CODE FUSIONNÉ, livraison réelle NON VALIDÉE.** Les tests de formulaire et de validation existent. Le test réel d'envoi et de consommation du jeton est reporté à la demande de l'utilisateur ; ne pas envoyer d'e-mail ni déclencher ce scénario sans accord et configuration Resend appropriée.
- **Documents juridiques : À COMPLÉTER PAR L'ÉDITEUR.** Les pages restent explicitement provisoires et en `noindex`. Il faut les informations réelles de l'éditeur, le contact de signalement et une revue juridique ; ne jamais inventer d'identité, d'adresse ou de numéro d'immatriculation.
- **Paiements : REPORTÉS.** La page d'offres est présente, mais Stripe et les contrôles d'accès Premium ne sont pas configurés. Ne pas activer ou présenter un paiement comme fonctionnel.
- **Tests de production avec écritures : AUTORISATION REQUISE.** Le parcours à deux comptes peut créer des données. Le workflow manuel reste protégé ; ne pas le déclencher automatiquement dans le cadre d'une simple consolidation.
- **État de lancement : NON CERTIFIÉ.** Les workflows verts attestent les contrôles qu'ils exécutent, pas la livraison d'e-mails, la conformité juridique, la facturation ni une revue de sécurité exhaustive.


## Préférences, vérification et internationalisation — 2026-10-13

- Complexité du mot de passe : inscription avec au moins 12 caractères, minuscule, majuscule, chiffre et caractère spécial. La confirmation de réinitialisation applique la même politique.
- Préférences de genre : migration 011, champs genre/préférence dans le profil et filtre Découvrir. Le choix par défaut est le genre opposé pour les profils renseignés comme homme/femme ; les filtres Femmes/Hommes/Tous restent disponibles.
- Présence : migration 009 et heartbeat existaient déjà. Découvrir affiche un libellé approximatif (« en ligne », « vu récemment », « vu aujourd'hui »), sans exposer d'horodatage précis.
- Badge Vérifié : demande avec photo/vidéo privée, consentement, file de revue protégée par VERIFICATION_REVIEWER_EMAILS, décision humaine et suppression de la preuve après décision. Le badge public n'est activé qu'après approbation. Aucune estimation automatique de l'âge ou reconnaissance faciale n'est effectuée.
- Limite importante : la vérification humaine doit comparer la preuve à une photo de profil effectivement disponible et examiner la date de naissance déclarée. La gestion actuelle des photos de profil doit être vérifiée/complétée avant de promettre une comparaison automatisée. Une revue juridique et une politique de conservation restent nécessaires.
- Internationalisation : infrastructure existante `lib/i18n.ts`, sélecteur `app/components/locale-switcher.tsx` et négociation serveur `Accept-Language` réutilisés. `app/components/locale-compatibility-translator.tsx` et `lib/ui-translations.ts` apportent une couche de traduction partagée aux libellés source déjà recensés (navigation, parcours principaux, jeux, offres, erreurs et attributs accessibles), sans créer un second sélecteur. **À NE PAS considérer comme traduction exhaustive** : tout texte non répertorié reste dans sa langue source ; les contenus juridiques, les métadonnées SEO par langue et les libellés uniques de toutes les pages doivent encore être migrés/relus. Tests existants de détection conservés ; suites Playwright françaises explicitent désormais `Accept-Language: fr`.
- Déploiement : appliquer db/migrations/011_gender_preferences_and_verification.sql dans Neon avant d'activer les nouveaux écrans/API. Ajouter VERIFICATION_REVIEWER_EMAILS sur Cloudflare avec une liste d'adresses de réviseurs autorisés. Ne jamais ajouter de secrets dans Git.


## Positionnement produit et sorties — 2026-10-14

- **Positionnement :** NAKAHYA est d'abord une application de rencontre sérieuse pour adultes. Les jeux servent à briser la glace et à soutenir la conversation.
- **Code présent :** page éditoriale /bons-plans et carrousel d'idées de sorties sur le tableau de bord. Ce contenu n'est pas une garantie de partenariat, de prix, de disponibilité ou de réservation.
- **Non implémenté / ne pas promettre :** intention de sortie visible par les membres, recherche par activité/créneau, réservation intégrée, paiement ou confirmation fournisseur.
- **Plan stratégique :** [docs/PRODUCT_STRATEGY_DATING_AND_OUTINGS.md](./docs/PRODUCT_STRATEGY_DATING_AND_OUTINGS.md). Il s'agit d'une roadmap, pas d'une preuve de fonctionnalité livrée.
- **Prérequis sorties :** consentement explicite et révocable, visibilité contrôlée, expiration, blocage/signalement cohérents, localisation approximative et garde-fous spécifiques aux voyages.
- **Réservation :** commencer par des liens externes/affiliés transparents, puis évaluer les API. Ne jamais afficher une réservation comme confirmée sans retour réel du fournisseur.


## Consolidation identité de marque — 2026-10-14

- **CODE PRÉSENT :** section « L’esprit NAKAHYA » intégrée à la landing page, avec promesse, sincérité/complicité/respect et panneau glassmorphism responsive.
- **NAVIGATION :** accès vers `/#identite` dans la navigation desktop et le menu mobile.
- **TESTS AJOUTÉS :** Playwright vérifie la section et les trois engagements ; un test mobile vérifie l'ancre et la fermeture du menu. Résultats CI à contrôler sur le nouveau SHA avant de déclarer le changement validé.
- **PR #56 :** son intention utile est reprise sur `main` ; sa branche ancienne ne doit pas être fusionnée en bloc.
- **RESTE HORS CODE LOCAL :** données réelles de l'éditeur et revue juridique ; configuration/test des prestataires e-mail, paiement, OAuth et éventuelle vérification ; exécution contrôlée des scénarios de production qui écrivent en base.
- **SORTIES ET PAIEMENTS :** la réservation intégrée, la confirmation fournisseur, les intentions de sortie entre membres et les paiements restent non implémentés et ne doivent pas être annoncés comme actifs.


 
## Identité visuelle Neo Midnight — branche candidate

- [x] Centraliser les tokens sombres, lime, menthe et corail dans `app/product-design-system.css`.
- [x] Remplacer la couche visuelle plum/lilas par des surfaces nuit et accents neutres ; violet exclu de la palette de marque.
- [x] Appliquer les règles partagées à landing, auth, dashboard, découverte, profils, discussions et jeux via les composants existants.
- [x] Documenter couleurs, typographie, composants, accessibilité et performances dans `docs/DESIGN_SYSTEM_NEO_MIDNIGHT.md`.
- [x] Ajouter un test Playwright dédié : `tests/e2e/neo-midnight-design-system.spec.ts`.
- [ ] Confirmer CI, lint, tests unitaires, Playwright et build Cloudflare sur la branche candidate.
- [ ] Vérifier le rendu réel des routes connectées en environnement de test ; ne pas conclure sur la production avant déploiement.
- **Branche :** `feat/neo-midnight-design-system`. **Statut :** en attente de validation CI ; aucune modification du backend ou de la base n'est prévue.
## Bons plans — évolution proposée le 2026-10-25

- CODE PROPOSÉ EN PR : filtres de catégorie et budget sur la page existante `/bons-plans`, sans réservation ni liens affiliés fictifs.
- TEST PROPOSÉ : `tests/e2e/bons-plans-filters.spec.ts` ; conserver le test mobile existant.
- À VÉRIFIER : CI, tests Playwright, déploiement et smoke production. Détails : `docs/BONS_PLANS_AFFILIATION_MVP.md`.

## Consolidation technique sans prestataire — branche du 2026-10-27 (non validée en production)

- **À valider sur la PR :** API de modération protégée par allowlist d'e-mails serveur, tests de refus anonymes complémentaires, sitemap/robots pour les routes privées ; voir [notes de livraison](./docs/RELEASE_NO_EXTERNAL_SERVICES_2026-10-27.md).
- **Encore à traiter :** audit complet i18n, revue mobile connectée, autorisations croisées, suppression/anonymisation E2E, interface admin et audit durable, validation humaine/juridique du lancement. Aucun prestataire externe activé.
- **Ne pas confondre :** code ajouté, CI réussie, déploiement et preuve de fonctionnement réel.
