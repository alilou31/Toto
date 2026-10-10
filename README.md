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
6. Lancer `npm run dev`, puis ouvrir `http://localhost:3000`.
7. Vérifier la connexion sur `http://localhost:3000/api/db-check`. La route renvoie uniquement un état et l'heure de la base, jamais la chaîne de connexion.

Si la migration 001 a déjà été exécutée, ne la relance pas en cas d'erreur sans lire le message : vérifie d'abord si les tables existent. La migration 002 crée les tables nécessaires à l'authentification.

## Variables d'environnement

- `DATABASE_URL` : secret serveur Neon. Ne jamais le préfixer par `NEXT_PUBLIC_` ni le committer.
- `NEXT_PUBLIC_SITE_URL` : URL publique du site.

Pour le déploiement, ajouter `DATABASE_URL` dans les variables d'environnement du fournisseur d'hébergement (par exemple Vercel), puis redéployer.

## Tests automatisés

- Tests unitaires : `npm test` (Node.js test runner, sans base de données).
- Tests navigateur : `npm run test:e2e` (Playwright + Chromium).
- Qualité locale : `npm run lint` puis `npm run build`.
- La configuration Playwright démarre automatiquement Next.js sur `http://127.0.0.1:3000`, sauf si `PLAYWRIGHT_BASE_URL` est défini.
- Les tests navigateur couvrent la page d'accueil, la navigation, les champs obligatoires des formulaires et l'accessibilité des pages de démo/validation. Ils ne créent pas de compte réel et ne remplacent pas les tests d'intégration avec Neon.

GitHub Actions exécute les tests unitaires, ESLint et le build dans le job `quality`, puis lance les tests Chromium dans le job `playwright` à chaque push sur `main` et à chaque pull request vers `main`. En cas d'échec Playwright, les rapports sont conservés comme artefacts pendant 7 jours.

Pour installer les navigateurs en local après `npm install` : `npx playwright install chromium`.

## État actuel

- [x] Landing page responsive et identité visuelle initiale
- [x] Démonstration locale : profils fictifs, création de profil, likes et matchs simulés
- [x] Page de tests manuels accessible via `/validation`
- [x] Tests unitaires de validation et règles de démonstration (`npm test`)
- [x] GitHub Actions pour lancer les tests sur push et pull request
- [x] Pages d'inscription et de connexion reliées aux API d'authentification
- [x] Client Neon côté serveur et route de diagnostic `/api/db-check`
- [x] Schéma initial des profils, intérêts, matchs, conversations, messages, blocages et signalements
- [x] Tables d'utilisateurs et de sessions pour l'authentification première partie
- [x] Hashage de mot de passe avec scrypt et cookies de session HttpOnly
- [ ] Exécuter la migration `002_authentication.sql` dans Neon avant de tester inscription/connexion
- [ ] Vérifier build, tests et parcours d'authentification en préproduction
- [ ] Ajouter limitation des tentatives et tests de sécurité
- [ ] Créer le parcours de profil relié au compte connecté
- [ ] Enregistrer les profils via des routes serveur authentifiées
- [ ] Gestion des photos avec stockage privé durable et modération
- [ ] Recherche, intérêts et matchs via fonctions serveur sûres
- [ ] Messagerie et contrôles d'autorisation
- [ ] Signalements, blocages et outils d'administration
- [ ] Tests d'intégration navigateur et revue de sécurité/RGPD

## Authentification première partie (MVP)

Les routes disponibles sont :

- `POST /api/auth/register` : créer un compte avec e-mail, mot de passe, confirmation 18+ et acceptation des conditions.
- `POST /api/auth/login` : ouvrir une session.
- `POST /api/auth/logout` : fermer la session.
- `GET /api/auth/me` : vérifier la session courante.

Les mots de passe sont stockés sous forme de hash scrypt ; le cookie de session est HttpOnly, SameSite=Lax et marqué Secure en production. La base ne stocke qu'un hash du jeton de session. Ces protections constituent une première base, pas une validation de sécurité complète.

**Limites actuelles :** la vérification d'e-mail et la récupération de mot de passe par e-mail sont reportées à la phase 2. La limitation de tentatives, la page de profil, les autorisations métier complètes et les tests de sécurité restent à faire. Ne pas ouvrir l'inscription au public avant ces vérifications.

## Démonstration sans base de données

Ouvrir `/demo` pour tester les profils fictifs, enregistrer un profil local, aimer/retirer un like et afficher des matchs simulés. Les données sont stockées dans le localStorage du navigateur uniquement ; ne pas saisir d'informations personnelles réelles. Aucun compte, message ou match réel n'est créé. Ouvrir `/validation` pour les contrôles de formulaire.

## Sécurité importante

- Le schéma SQL est une base de travail, pas une application prête pour la production.
- Ne jamais afficher les mots de passe, hashes, cookies de session ou chaînes de connexion.
- La chaîne `DATABASE_URL` doit rester exclusivement côté serveur. Ne jamais la renvoyer au navigateur, l'ajouter à Git ou la coller dans une conversation.
- Toute lecture/écriture de données privées doit passer par des routes serveur authentifiées et autorisées.
- La majorité doit être validée côté serveur avant toute publication de profil ; une case à cocher ne suffit pas à vérifier l'âge.
- Les pages juridiques sont des brouillons et doivent être complétées puis vérifiées par un professionnel avant commercialisation.
