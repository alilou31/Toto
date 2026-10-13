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

La configuration Playwright démarre l'application locale si `PLAYWRIGHT_BASE_URL` n'est pas défini. La CI exécute aussi les contrôles de qualité et le build Cloudflare ; un succès de CI n'est pas à lui seul une preuve de parcours métier en production.

## Playwright de production en lecture seule

Le workflow [Production Smoke Tests](../.github/workflows/production-smoke.yml) exécute après un déploiement Cloudflare réussi, lors du cron ou sur lancement manuel :

```bash
npx playwright test tests/e2e/production-ui.spec.ts tests/e2e/api-json-contract.spec.ts
```

Le dernier résultat vérifié le 12 octobre 2026 est **18 tests réussis, 0 échec, 0 ignoré** ([run 38267172805](https://github.com/alilou31/Toto/actions/runs/38267172805)). Il couvre uniquement les deux fichiers listés ci-dessus, contre la version de production accessible au moment du run. Le job de smoke distinct vérifie aussi l'accueil, `/demo`, la connectivité Neon via `/api/db-check` et l'accès anonyme à `/api/games/results`.

Ces contrôles n'écrivent pas de données métier. Ils ne valident pas le parcours connecté complet ni la persistance des profils, matchs, défis et messages.

## Parcours réel à deux utilisateurs

Voir [docs/testing-two-users.md](../docs/testing-two-users.md) et `tests/e2e/two-user-full-journey.spec.ts`. Le scénario utilise deux contextes indépendants et des comptes existants ; il crée des données métier persistantes. Il est donc distinct des tests de production en lecture seule et ne doit être lancé qu'avec deux comptes de test dédiés et l'autorisation correspondante.

Secrets GitHub Actions requis : `E2E_USER_A_EMAIL`, `E2E_USER_A_PASSWORD`, `E2E_USER_B_EMAIL`, `E2E_USER_B_PASSWORD`, plus la variable `ENABLE_TWO_USER_E2E=true`. Ne jamais placer de mot de passe dans le dépôt ou dans un message.

Sans ces variables, un test ignoré ne doit jamais être rapporté comme une validation réussie du parcours à deux comptes.

## Règles de compte rendu

- Séparer tests unitaires, tests Playwright CI, smoke HTTP/DB, Playwright de production et parcours métier à deux utilisateurs.
- Pour chaque résultat, noter le SHA testé, le lien du workflow, les tests passés/échoués/ignorés et les limites de couverture.
- Ne jamais déduire l'état des migrations Neon de leur simple présence dans `db/migrations/`.
