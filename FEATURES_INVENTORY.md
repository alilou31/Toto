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

## Inventaire actuel

## Point de contrôle dépôt — 2026-10-12

- **HEAD de `main` au dernier contrôle :** `a3d40b8a4d33b2382a2a5f32934a37a08749a59d` (ajout de quatre tests négatifs API auth dans le test existant, sans créer de fichier de test doublon).
- **CI du HEAD courant :** en cours lors de cette mise à jour — [NIKAHYA CI](https://github.com/alilou31/Toto/actions/runs/38248482584). Quatre cas négatifs d'authentification ont été ajoutés à `tests/e2e/auth-api.spec.ts` ; résultat CI à confirmer avant de considérer les tests validés.
- **Déploiement Cloudflare du HEAD courant :** en attente — [run Cloudflare](https://github.com/alilou31/Toto/actions/runs/38248482726). Ne pas déclarer ce SHA déployé avant la fin du workflow.
- **Smoke tests de production les plus récents :** passés en lecture seule — [run 38248441636](https://github.com/alilou31/Toto/actions/runs/38248441636) : accueil, démo, connectivité Neon, protection de l'historique des jeux et tests UI Playwright. Ce run valide la production servie au moment du test, pas le HEAD courant.
- **PR ouvertes à réconcilier avant toute fusion :** [#3 Mode Rencontre](https://github.com/alilou31/Toto/pull/3), [#4 navigation après sauvegarde du profil](https://github.com/alilou31/Toto/pull/4), [#5 sélecteur Snake](https://github.com/alilou31/Toto/pull/5), [#6 sélecteurs Playwright navigation](https://github.com/alilou31/Toto/pull/6), [#8 tests négatifs auth](https://github.com/alilou31/Toto/pull/8). Les branches ont été créées avant les derniers commits de `main`; ne pas fusionner sans vérifier si leurs changements sont déjà intégrés et si la CI de la branche reste utile. Les PR #3 et #5 touchent notamment au Mode Rencontre/backlog ; #4 et #6 ajoutent le même composant d'en-tête dans leurs branches, donc leur fusion sans comparaison provoquerait potentiellement des conflits ou doublons.
- **Limites non levées :** les fichiers de migration `005_game_sessions.sql` et `007_rencontre_sessions.sql` existent dans le dépôt, mais leur application effective dans Neon n'est pas prouvée par le simple contrôle de connectivité. Le test E2E à deux utilisateurs n'a pas été relancé, car il peut écrire des données de production.

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
