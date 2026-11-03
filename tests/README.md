# Tests NAKAHYA

Ce document décrit les familles de tests existantes. Les résultats récents sont consignés avec leurs liens et leur portée dans [PRODUCTION_TEST_LOG.md](../PRODUCTION_TEST_LOG.md).

## Tests unitaires

Depuis la racine du dépôt :

```bash
npm test
```

Les tests utilisent le runner de test Node.js et couvrent les règles de validation (notamment e-mail, âge, inscription et acceptation des conditions). Ils ne nécessitent pas de compte réel ni de connexion à Neon.

## Tests Playwright en local / CI

```bash
npx playwright install chromium
npm run test:e2e
```

La configuration Playwright démarre l'application locale si `PLAYWRIGHT_BASE_URL` n'est pas défini. La CI exécute aussi les contrôles de qualité ; le build Cloudflare est vérifié par le workflow distinct `deploy-cloudflare.yml` (sans déploiement sur PR). Un succès de CI n'est pas à lui seul une preuve de parcours métier en production.

La suite existante `bons-plans-filters.spec.ts` couvre aussi le contexte volontaire de rendez-vous, la réinitialisation, l'indisponibilité des offres, les métadonnées et l'émission minimale du clic uniquement lorsque le serveur annonce la mesure active. Les offres et destinations commerciales de ces tests sont des fixtures interceptées. Le refus par défaut de `/api/affiliate-clicks` est testé sans base de données. Les tests unitaires `affiliate-clicks.test.cjs` vérifient origine, taille, format et validité de l'offre ; ils ne prouvent pas l'écriture réelle dans Neon.

## Playwright de production en lecture seule

La suite `immersive-discovery.spec.ts` de la PR #60 couvre maintenant navigation centrale réelle, Passer sans POST, Liker et attente/réessai, fiche complète et retours, grille responsive, chargement, erreurs, liste vide, fin de liste et refus anonyme. Elle s'exécute à 1280×900 et 390×844 pour les parcours principaux. Les données de membres et tous les appels de présence/intérêts de ces scénarios sont interceptés : aucun intérêt réel n'est créé, y compris en production. Le GET anonyme `/api/discover` est vérifié réellement (401).

Le workflow de smoke exécute cette suite en complément des tests UI/API existants. Cela prouve le comportement de l'interface publiée avec des fixtures, pas le parcours authentifié de deux comptes dans Neon. Pour une validation ciblée : `npx playwright test tests/e2e/immersive-discovery.spec.ts`. Les helpers de retour/photo sont couverts par `tests/discovery-navigation.test.cjs`. Exécution locale lors de la finalisation : `npm test` passe sur sept fichiers ; lint/TypeScript/build/Playwright locaux bloqués par dépendances absentes et proxy indisponible, contrôles reportés sur les checks GitHub de la PR. Le build Next.js vérifie les types et la CI ajoute aussi `npx tsc --noEmit` explicite après build.

Le workflow [Production Smoke Tests](../.github/workflows/production-smoke.yml) exécute après un déploiement Cloudflare réussi, lors du cron ou sur lancement manuel :

```bash
npx playwright test tests/e2e/production-ui.spec.ts tests/e2e/api-json-contract.spec.ts tests/e2e/auth-api.spec.ts tests/e2e/password-reset.spec.ts tests/e2e/account-deletion-api.spec.ts tests/e2e/immersive-discovery.spec.ts
```

Le résultat historique du 12 octobre 2026 est **18 tests réussis, 0 échec, 0 ignoré** ([run 38267172805](https://github.com/alilou31/Toto/actions/runs/38267172805)). Il couvre uniquement `production-ui.spec.ts` et `api-json-contract.spec.ts`, contre la version accessible au moment du run. Sur la base main `95b80e66`, le [smoke 41626359116](https://github.com/alilou31/Toto/actions/runs/41626359116) a réussi avec 41 tests ; il précède la finalisation immersive et ne la valide pas. Le job HTTP distinct vérifie accueil, démo, connectivité Neon et refus anonyme de l'historique des jeux.

Diagnostic de la première CI de finalisation [41635962435](https://github.com/alilou31/Toto/actions/runs/41635962435), SHA `bc82b106` : unité/lint/build/TypeScript réussis ; Worker [41635962159](https://github.com/alilou31/Toto/actions/runs/41635962159) réussi. Playwright : 161 réussis, 2 ignorés préexistants, 3 échecs de sélecteur (les alertes globales incluaient aussi `__next-route-announcer__`). Les assertions ciblent maintenant l'alerte métier précise ; aucun test supprimé ou ignoré. Vérifier le nouveau SHA de la PR pour la réussite de la suite corrigée.

Validation corrigée du SHA `d9caed8e7532210f9a5b2cca4b1238a3616b6d63` : [CI 41636544418](https://github.com/alilou31/Toto/actions/runs/41636544418) réussie (unitaires, ESLint, build Next.js, TypeScript explicite, Playwright **164 réussis / 2 ignorés / 0 échec**) ; [build Worker 41636544469](https://github.com/alilou31/Toto/actions/runs/41636544469) réussi, déploiement PR ignoré. Les deux scénarios ignorés préexistants concernent les invitations Premium live et le parcours à deux comptes non configurés ; ils ne sont pas comptés comme validés. Les changements documentaires ultérieurs restent soumis aux checks du SHA final ; le déploiement et le smoke de main doivent être vérifiés séparément après fusion.

Ces contrôles n'écrivent pas de données métier. Ils ne valident pas le parcours connecté complet ni la persistance des profils, matchs, défis et messages.

## Parcours réel à deux utilisateurs

Voir [docs/testing-two-users.md](../docs/testing-two-users.md) et `tests/e2e/two-user-full-journey.spec.ts`. Le scénario utilise deux contextes indépendants et des comptes existants ; il crée des données métier persistantes. Il est donc distinct des tests de production en lecture seule et ne doit être lancé qu'avec deux comptes de test dédiés et l'autorisation correspondante.

Secrets GitHub Actions requis : `E2E_USER_A_EMAIL`, `E2E_USER_A_PASSWORD`, `E2E_USER_B_EMAIL`, `E2E_USER_B_PASSWORD`, plus la variable `ENABLE_TWO_USER_E2E=true`. Ne jamais placer de mot de passe dans le dépôt ou dans un message.

Sans ces variables, un test ignoré ne doit jamais être rapporté comme une validation réussie du parcours à deux comptes.

## Règles de compte rendu

- Séparer tests unitaires, tests Playwright CI, smoke HTTP/DB, Playwright de production et parcours métier à deux utilisateurs.
- Pour chaque résultat, noter le SHA testé, le lien du workflow, les tests passés/échoués/ignorés et les limites de couverture.
- Ne jamais déduire l'état des migrations Neon de leur simple présence dans `db/migrations/`.


## Régression visuelle Neo Midnight

Le test `tests/e2e/neo-midnight-design-system.spec.ts` contrôle les tokens de marque, le mode sombre, la présence des actions de landing et l'absence de débordement horizontal sur mobile. Exécution ciblée :

```bash
npx playwright test tests/e2e/neo-midnight-design-system.spec.ts
```

La spécification du thème et ses limites sont documentées dans [DESIGN_SYSTEM_NEO_MIDNIGHT.md](../docs/DESIGN_SYSTEM_NEO_MIDNIGHT.md).
