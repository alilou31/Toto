# Inventaire fonctionnel — NIKAHYA

> **Objectif : éviter les doublons de développement.** Avant de créer une fonctionnalité, une page, une API ou un test, consulter ce document et rechercher dans le dépôt. Mettre cet inventaire à jour lorsqu'une fonctionnalité est ajoutée, modifiée, fusionnée ou retirée.
>
> Application : https://nikahya.rassoul-ali.workers.dev/  
> Dépôt : https://github.com/alilou31/Toto  
> Hébergement cible : Cloudflare Workers ; base de données : Neon.

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

## Correctifs et couverture — 2026-10-13

- Les tests API anonymes sont centralisés dans `tests/e2e/auth-api.spec.ts`; ils couvrent lectures privées et écritures sans session. Leur statut est **à valider par CI** tant que le run du commit candidat n’est pas terminé.
- Le test mobile de la landing et du menu est déjà présent dans `tests/e2e/production-ui.spec.ts` à 390×844 ; le test `connected-mobile-experience.spec.ts` couvre aussi l’espace mobile en mode anonyme. Ne pas dupliquer ces scénarios.
- Les pages `/mentions-legales`, `/confidentialite` et `/conditions` sont accessibles, explicitement marquées comme documents de travail et exclues de l’indexation tant que l’identité réelle et le contenu définitif ne sont pas renseignés.
- La récupération de mot de passe n’est pas implémentée : fournisseur d’e-mail et paramètres de livraison non configurés. À ne pas marquer comme terminée avant un test de bout en bout du message, du jeton et de l’invalidation.

## Inventaire actuel

## Point de contrôle dépôt — 2026-10-12 (vérification Playwright production)

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
| Socle DB | `app/api/db-check/route.ts`, migrations `db/migrations/001` à `007` | Smoke tests de production référencés dans `PRODUCTION_TEST_LOG.md` | Code présent ; l'état réel des migrations dans Neon doit être confirmé indépendamment. |

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
