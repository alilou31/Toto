# NIKAHYA

**La rencontre qui change tout.**

Application de rencontre sérieuse pour adultes (18+) — France et pays francophones.

## Stack

- Next.js App Router, React, TypeScript strict
- Tailwind CSS v4
- Neon PostgreSQL pour la base de données
- Zod pour la validation
- Stripe envisagé pour les abonnements (phase ultérieure)

## Démarrage local

1. Installer une version LTS de Node.js compatible avec Next.js.
2. Installer les dépendances : `npm install`.
3. Copier `.env.example` vers `.env.local`.
4. Dans la console Neon, copier la chaîne de connexion PostgreSQL (de préférence la chaîne pooled) et la placer dans `DATABASE_URL` dans `.env.local`. Garder `sslmode=require` et ne jamais publier cette valeur.
5. Dans le SQL Editor de Neon, exécuter dans l'ordre :
   - `db/migrations/001_nikahya_initial.sql`
   - `db/migrations/002_authentication.sql`
   - `db/migrations/003_auth_rate_limits.sql`
   - `db/migrations/004_games.sql`
   - `db/migrations/005_game_sessions.sql`
   - `db/migrations/006_shared_interests.sql`
   - `db/migrations/007_rencontre_sessions.sql` (si non déjà appliquée ; vérifier l'état avant exécution)
6. Lancer `npm run dev`, puis ouvrir `http://localhost:3000`.
7. Vérifier la connexion sur `http://localhost:3000/api/db-check`. La route renvoie uniquement un état et l'heure de la base, jamais la chaîne de connexion.

Si la migration 001 a déjà été exécutée, ne la relance pas en cas d'erreur sans lire le message : vérifie d'abord si les tables existent. La migration 002 crée les tables nécessaires à l'authentification.

## Variables d'environnement

- `DATABASE_URL` : secret serveur Neon. Ne jamais le préfixer par `NEXT_PUBLIC_` ni le committer.
- `NEXT_PUBLIC_SITE_URL` : URL publique du site.

Pour le déploiement Cloudflare Workers, suivre la section « Déploiement Cloudflare » ci-dessous. `DATABASE_URL` doit rester un secret serveur Cloudflare et ne jamais être exposé au navigateur.

## Déploiement Cloudflare

Le projet utilise OpenNext pour exécuter Next.js App Router sur Cloudflare Workers, tout en conservant Neon PostgreSQL.

1. Créer un bucket R2 nommé `nikahya-next-cache` dans le compte Cloudflare (il sert au cache incrémental/ISR). Le workflow crée/déploie le Worker nommé `nikahya`.
2. Dans GitHub, ajouter les secrets du dépôt ou de l'environnement `production` : `CLOUDFLARE_API_TOKEN` (droits Workers Scripts et R2 requis), `CLOUDFLARE_ACCOUNT_ID` et `DATABASE_URL` (chaîne Neon pooled avec `sslmode=require`). Ajouter la variable d'environnement `NEXT_PUBLIC_SITE_URL` avec l'URL publique prévue.
3. Vérifier que le compte Cloudflare autorise le binding Images utilisé par Wrangler. Si le compte n'utilise pas Cloudflare Images, retirer le binding `images` de `wrangler.jsonc` et configurer la stratégie d'images avant déploiement.
4. Après configuration des secrets et variables, une fusion/poussée sur `main` déclenche le build puis le déploiement Cloudflare. Le workflow peut aussi être lancé manuellement avec `workflow_dispatch`. Il configure le secret `DATABASE_URL` sur le Worker.
5. Vérifier les routes `/`, `/api/db-check`, `/api/auth/me`, l'inscription/connexion et les journaux du Worker avant de faire pointer le domaine de production vers Cloudflare.

En local, copier `.dev.vars.example` vers `.dev.vars`, remplacer les valeurs de démonstration et lancer `npm run preview:worker`. Ne jamais committer `.dev.vars` ni de vrais secrets.

Le workflow déploie automatiquement les commits poussés sur `main` après réussite du build Cloudflare. Les pull requests ne déploient pas en production. Le workflow ne modifie pas le DNS : la configuration du domaine personnalisé reste une opération Cloudflare distincte.

## Tests automatisés

- Tests unitaires : `npm test` (Node.js test runner, sans base de données).
- Tests navigateur : `npm run test:e2e` (Playwright + Chromium).
- Qualité locale : `npm run lint` puis `npm run build`.
- La configuration Playwright démarre automatiquement Next.js sur `http://127.0.0.1:3000`, sauf si `PLAYWRIGHT_BASE_URL` est défini.
- Les tests navigateur couvrent la page d'accueil, la navigation, les champs obligatoires des formulaires et l'accessibilité des pages de démo/validation. Ils ne créent pas de compte réel et ne remplacent pas les tests d'intégration avec Neon.

GitHub Actions exécute les tests unitaires, ESLint, le build Next.js et le build OpenNext/Cloudflare dans le job `quality`, puis lance les tests Chromium dans le job `playwright` à chaque push sur `main` et à chaque pull request vers `main`. En cas d'échec Playwright, les rapports sont conservés comme artefacts pendant 7 jours.

Pour installer les navigateurs en local après `npm install` : `npx playwright install chromium`.

## État vérifié — 2026-10-12

Le suivi ci-dessous remplace les anciennes cases à cocher historiques de ce README. Pour éviter les doublons, consulter d'abord [FEATURES_INVENTORY.md](./FEATURES_INVENTORY.md) et [BACKLOG.md](./BACKLOG.md).

- **Commit contrôlé :** `7b51f4bf27fb1adff424415c57cb345b7e60c3bf` — `ci: run production Playwright after successful deploy`.
- **Hébergement officiel :** Cloudflare Workers ; base de données : Neon PostgreSQL. Vercel n'est pas la cible de déploiement.
- **CI GitHub Actions :** réussie — [run 38266697104](https://github.com/alilou31/Toto/actions/runs/38266697104).
- **Déploiement Cloudflare :** réussi — [run 38266697091](https://github.com/alilou31/Toto/actions/runs/38266697091).
- **Playwright de production en lecture seule :** 18 tests réussis, 0 échoué, 0 ignoré dans le run — [run 38267172805](https://github.com/alilou31/Toto/actions/runs/38267172805). Les tests exécutés sont `production-ui.spec.ts` et `api-json-contract.spec.ts` uniquement.
- **Smoke de production :** accueil, `/demo`, connexion Neon via `/api/db-check` et refus d'accès anonyme à `/api/games/results` confirmés par les logs.
- **Non couvert par ce run :** parcours connecté complet, scénario à deux utilisateurs, persistance réelle profil/match/jeu/messages et statut des migrations dans Neon.
- **Deux comptes E2E :** voir [docs/testing-two-users.md](./docs/testing-two-users.md). Les quatre secrets sont requis ; ne jamais fournir les mots de passe dans le dépôt ou une conversation. Ne lancer le scénario écrivant des données qu'avec des comptes de test dédiés et une autorisation adaptée.
- **Règle de preuve :** un fichier présent ou un build vert ne prouve pas une fonctionnalité validée en production. Enregistrer les résultats datés dans [PRODUCTION_TEST_LOG.md](./PRODUCTION_TEST_LOG.md).

Les sections de ce README qui décrivent les fonctionnalités et les limites restent des notes d'architecture ; en cas de divergence sur le statut de réalisation, utiliser l'inventaire et le registre de tests datés ci-dessus plutôt que les anciennes cases historiques.

## Profils et affinités

Les profils peuvent renseigner des jeux favoris, des hobbies, des centres d’intérêt et un métier afin de faciliter les conversations et de mettre en avant les points communs. Religion/spiritualité et origine/ethnicité sont facultatives et ne sont visibles sur les profils publics qu’après consentement explicite. Appliquer `db/migrations/006_shared_interests.sql` dans Neon après les migrations précédentes.

## Jeux et défis synchronisés

Le catalogue propose six formats de mini-jeux. Les parties individuelles peuvent enregistrer leur résultat pour un compte connecté via `/api/games/results` (migration `004_games.sql`). La page `/cockpit/defis` permet de créer un défi, de partager un lien/code d’invitation, de rejoindre une partie et de répondre chacun à son rythme. Les réponses sont stockées côté serveur et l’avancement se synchronise par interrogation périodique ; aucun fournisseur externe ni WebSocket n’est requis. Appliquer `db/migrations/005_game_sessions.sql` dans le SQL Editor de Neon après la migration 004 avant d’utiliser les défis. Les deux joueurs doivent être connectés à leur compte NIKAHYA. Les questions et règles sont actuellement une première version MVP de quatre questions par partie.

## Authentification première partie (MVP)

Les routes disponibles sont :

- `POST /api/auth/register` : créer un compte avec e-mail, mot de passe, confirmation 18+ et acceptation des conditions.
- `POST /api/auth/login` : ouvrir une session.
- `POST /api/auth/logout` : fermer la session.
- `GET /api/auth/me` : vérifier la session courante.

Les mots de passe sont stockés sous forme de hash scrypt ; le cookie de session est HttpOnly, SameSite=Lax et marqué Secure en production. La base ne stocke qu'un hash du jeton de session. Ces protections constituent une première base, pas une validation de sécurité complète.

**Limites actuelles :** la vérification d'e-mail et la récupération de mot de passe par e-mail sont reportées à la phase 2. La limitation de tentatives est implémentée via Neon (migration `003_auth_rate_limits.sql` obligatoire) : 5 tentatives de connexion par e-mail sur 15 minutes, 30 par IP Cloudflare sur 15 minutes, 5 inscriptions par e-mail et 10 par IP sur une heure. Les clés sont stockées sous forme de hash. La page de profil, les autorisations métier complètes et les tests de sécurité restent à faire. Ne pas ouvrir l'inscription au public avant ces vérifications.

## Démonstration sans base de données

Ouvrir `/demo` pour tester les profils fictifs, enregistrer un profil local, aimer/retirer un like et afficher des matchs simulés. Les données sont stockées dans le localStorage du navigateur uniquement ; ne pas saisir d'informations personnelles réelles. Aucun compte, message ou match réel n'est créé. Ouvrir `/validation` pour les contrôles de formulaire.

## Sécurité importante

- Le schéma SQL est une base de travail, pas une application prête pour la production.
- Ne jamais afficher les mots de passe, hashes, cookies de session ou chaînes de connexion.
- La chaîne `DATABASE_URL` doit rester exclusivement côté serveur. Ne jamais la renvoyer au navigateur, l'ajouter à Git ou la coller dans une conversation.
- Toute lecture/écriture de données privées doit passer par des routes serveur authentifiées et autorisées.
- La majorité doit être validée côté serveur avant toute publication de profil ; une case à cocher ne suffit pas à vérifier l'âge.
- Les signalements peuvent être envoyés depuis la découverte et sont enregistrés en base ; aucun tableau de modération administrateur n’est encore disponible. Les pages juridiques sont des brouillons et doivent être complétées puis vérifiées par un professionnel avant commercialisation.


## Préférences de découverte et vérification de profil

Avant d'utiliser les nouveaux champs de genre et le workflow de badge, appliquer db/migrations/011_gender_preferences_and_verification.sql dans Neon après la migration 010. La découverte propose le genre opposé par défaut lorsque le genre du membre est renseigné comme homme ou femme, avec un filtre modifiable Femmes/Hommes/Tous.

L'inscription et la réinitialisation exigent au moins 12 caractères, une minuscule, une majuscule, un chiffre et un caractère spécial.

La demande de badge accepte une photo ou une courte vidéo (8 Mo maximum) et nécessite un consentement explicite. La décision est humaine : configurez VERIFICATION_REVIEWER_EMAILS sur Cloudflare avec les adresses autorisées. Le badge ne doit être activé qu'après contrôle des 18 ans déclarés et de la cohérence de la preuve avec la photo du profil. Les preuves privées sont supprimées au moment de la décision. Aucune reconnaissance faciale automatisée n'est activée.

Le sélecteur de langue supporte le français, l'anglais, l'espagnol et l'italien au niveau de l'infrastructure de langue. Les traductions intégrales de toutes les pages et de tous les messages d'erreur API restent à terminer avant de présenter le produit comme entièrement internationalisé.
