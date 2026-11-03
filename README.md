# NAKAHYA

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
   - `db/migrations/008_oauth_identities.sql`
   - `db/migrations/009_profile_visits_and_presence.sql`
   - `db/migrations/010_password_reset_tokens.sql`
   - `db/migrations/011_gender_preferences_and_verification.sql`
   - `db/migrations/012_consents_newsletter.sql`
   - `db/migrations/013_automatic_identity_verification.sql`
   Exécuter uniquement les migrations non encore appliquées, dans cet ordre, en vérifiant l'état Neon avant toute relance.
6. Lancer `npm run dev`, puis ouvrir `http://localhost:3000`.
7. Vérifier la connexion sur `http://localhost:3000/api/db-check`. La route renvoie uniquement un état et l'heure de la base, jamais la chaîne de connexion.

Si la migration 001 a déjà été exécutée, ne la relance pas en cas d'erreur sans lire le message : vérifie d'abord si les tables existent. La migration 002 crée les tables nécessaires à l'authentification.

## Variables d'environnement

- `DATABASE_URL` : secret serveur Neon. Ne jamais le préfixer par `NEXT_PUBLIC_` ni le committer.
- `NEXT_PUBLIC_SITE_URL` : `https://nakahya.com` en production, URL locale en développement. Le build et Wrangler déclarent l'origine officielle ; les liens de production ne dépendent plus d'une ancienne variable GitHub.
- `RESEND_API_KEY` et `RESEND_FROM_EMAIL` : envoi des e-mails de confirmation newsletter.
- `STRIPE_SECRET_KEY` et `STRIPE_IDENTITY_WEBHOOK_SECRET` : sessions et webhooks Stripe Identity, côté serveur uniquement.

Pour le déploiement Cloudflare Workers, suivre la section « Déploiement Cloudflare » ci-dessous. `DATABASE_URL` doit rester un secret serveur Cloudflare et ne jamais être exposé au navigateur.

## Déploiement Cloudflare

Le projet utilise OpenNext pour exécuter Next.js App Router sur Cloudflare Workers, tout en conservant Neon PostgreSQL.

1. Créer un bucket R2 nommé `nikahya-next-cache` dans le compte Cloudflare (il sert au cache incrémental/ISR). Le workflow crée/déploie le Worker nommé `nikahya`.
2. Dans GitHub, ajouter les secrets du dépôt ou de l'environnement `production` : `CLOUDFLARE_API_TOKEN` (droits Workers Scripts et R2 requis), `CLOUDFLARE_ACCOUNT_ID` et `DATABASE_URL` (chaîne Neon pooled avec `sslmode=require`). Le workflow et `wrangler.jsonc` déclarent désormais `NEXT_PUBLIC_SITE_URL=https://nakahya.com` ; ne pas remettre l'ancien domaine dans les variables de déploiement.
3. Vérifier que le compte Cloudflare autorise le binding Images utilisé par Wrangler. Si le compte n'utilise pas Cloudflare Images, retirer le binding `images` de `wrangler.jsonc` et configurer la stratégie d'images avant déploiement.
4. Après configuration des secrets et variables, une fusion/poussée sur `main` déclenche le build puis le déploiement Cloudflare. Le workflow peut aussi être lancé manuellement avec `workflow_dispatch`. Il configure le secret `DATABASE_URL` sur le Worker.
5. Vérifier les routes `/`, `/api/db-check`, `/api/auth/me`, l'inscription/connexion et les journaux du Worker avant de faire pointer le domaine de production vers Cloudflare.

En local, copier `.dev.vars.example` vers `.dev.vars`, remplacer les valeurs de démonstration et lancer `npm run preview:worker`. Ne jamais committer `.dev.vars` ni de vrais secrets.

Le workflow déploie automatiquement les commits poussés sur `main` après réussite du build Cloudflare. Les pull requests ne déploient pas en production. Le workflow ne modifie pas le DNS : la configuration du domaine personnalisé reste une opération Cloudflare distincte.

### Domaine officiel — migration du 2026-11-03

- `https://nakahya.com` est l'origine de production pour canonical, Open Graph, données structurées, sitemap, robots, e-mails de récupération/confirmation et retour Stripe Identity. Les liens internes relatifs et les layouts existants sont réutilisés ; aucun manifest PWA n'existait et aucun n'est ajouté.
- Le build fixe cette origine, Wrangler la déclare aussi à l'exécution. `keep_vars=true` préserve les autres variables distantes ; aucune activation d'affiliation ou de prestataire, aucun secret versionné. Le binding de domaine configuré par le propriétaire n'est pas remplacé.
- Le middleware redirige les navigations GET/HEAD HTML de Workers et de www vers le domaine officiel (308, chemin et requête conservés), et HTTP vers HTTPS sur les hôtes connus. Les API de l'ancien hôte restent accessibles sans redirection entre hôtes pour préserver méthodes, webhooks et cookies. Les anciennes API et les routes privées reçoivent `X-Robots-Tag: noindex, nofollow` ; cela ne remplace jamais leur authentification.
- Les cookies de session et OAuth restent HttpOnly, Secure en production et SameSite=Lax, sans Domain partagé. Une reconnexion sur le nouveau domaine est nécessaire ; aucun jeton de session ne circule dans une URL. Les transactions OAuth commencées sur l'ancien domaine peuvent devoir être recommencées.
- Audit réel avant modification : le domaine principal résout vers Cloudflare et sert NAKAHYA en HTTPS ; son sitemap/robots annonçaient encore Workers. `www.nakahya.com` renvoyait NXDOMAIN. Les adresses Cloudflare peuvent changer : ne pas recopier les IP observées dans des enregistrements manuels.
- Contrôles : `scripts/check-domain.mjs` vérifie DNS, certificat TLS et accueil HTTPS depuis GitHub Actions avant déploiement, sans modification DNS ; www est diagnostiqué séparément et n'est pas annoncé fonctionnel s'il reste absent. Le smoke utilise désormais `nakahya.com` et vérifie aussi les redirections et le SEO.

**Opération Cloudflare externe si www reste NXDOMAIN :** Workers & Pages → `nikahya` → Settings → Domains & Routes → Add → Custom Domain → `www.nakahya.com`. Vérifier d'abord l'absence d'enregistrement ou de binding conflictuel, puis laisser Cloudflare créer son DNS et son certificat. Le middleware appliquera ensuite www → apex. Ne pas désactiver `workers.dev`, qui sert la redirection des anciens liens et conserve les API historiques. Si HTTP n'atteint pas le Worker, activer également SSL/TLS → Edge Certificates → Always Use HTTPS et vérifier l'absence de règle de redirection inverse.

**Google Search Console (accès propriétaire nécessaire) :** vérifier la propriété de domaine `nakahya.com` via l'enregistrement DNS demandé par Google, soumettre `https://nakahya.com/sitemap.xml`, puis contrôler l'indexation/canonical. Ne pas publier de jeton de vérification ni prétendre que la propriété est validée sans preuve.

Voir [AUTHENTIFICATION_SOCIALE.md](./AUTHENTIFICATION_SOCIALE.md) pour les opérations Google/Meta. Dans la console Stripe Identity, mettre à jour l'endpoint utilisé vers `https://nakahya.com/api/webhooks/stripe-identity`, conserver les signatures et secrets existants, puis vérifier avec des événements de test dédiés. Aucun endpoint de billing n'est ajouté. Les anciens endpoints API restent servis pour la transition ; aucun webhook réel ni e-mail à un compte réel n'est déclenché par le smoke.

## Tests automatisés

- Tests unitaires : `npm test` (Node.js test runner, sans base de données).
- Tests navigateur : `npm run test:e2e` (Playwright + Chromium).
- Qualité locale : `npm run lint` puis `npm run build`.
- La configuration Playwright démarre automatiquement Next.js sur `http://127.0.0.1:3000`, sauf si `PLAYWRIGHT_BASE_URL` est défini.
- Les tests navigateur couvrent la page d'accueil, la navigation, les champs obligatoires des formulaires et l'accessibilité des pages de démo/validation. Ils ne créent pas de compte réel et ne remplacent pas les tests d'intégration avec Neon.

GitHub Actions exécute les tests unitaires, ESLint et le build Next.js dans le job `quality`, et les tests Chromium dans le job `playwright`, à chaque push sur `main` et à chaque pull request vers `main`. Le workflow distinct `deploy-cloudflare.yml` vérifie le build OpenNext/Cloudflare sur les PR sans les déployer. En cas d'échec Playwright, les rapports sont conservés comme artefacts pendant 7 jours.

Pour installer les navigateurs en local après `npm install` : `npx playwright install chromium`.

## État historique vérifié — 2026-10-12

> Cette photographie est historique et ne décrit pas nécessairement le commit courant. Pour le statut actuel, consulter les checks GitHub du commit et le registre de tests de production.

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

Le catalogue propose six formats de mini-jeux. Les parties individuelles peuvent enregistrer leur résultat pour un compte connecté via `/api/games/results` (migration `004_games.sql`). La page `/cockpit/defis` permet de créer un défi, de partager un lien/code d’invitation, de rejoindre une partie et de répondre chacun à son rythme. Les réponses sont stockées côté serveur et l’avancement se synchronise par interrogation périodique ; aucun fournisseur externe ni WebSocket n’est requis. Appliquer `db/migrations/005_game_sessions.sql` dans le SQL Editor de Neon après la migration 004 avant d’utiliser les défis. Les deux joueurs doivent être connectés à leur compte NAKAHYA. Les questions et règles sont actuellement une première version MVP de quatre questions par partie.

## Authentification première partie (MVP)

Les routes disponibles sont :

- `POST /api/auth/register` : créer un compte avec e-mail, mot de passe, confirmation 18+, acceptation des conditions et accusé de lecture de la politique de confidentialité.
- `POST /api/auth/login` : ouvrir une session.
- `POST /api/auth/logout` : fermer la session.
- `GET /api/auth/me` : vérifier la session courante.

Les mots de passe sont stockés sous forme de hash scrypt ; le cookie de session est HttpOnly, SameSite=Lax et marqué Secure en production. La base ne stocke qu'un hash du jeton de session. Ces protections constituent une première base, pas une validation de sécurité complète.

**Limites actuelles :** la vérification de l'adresse e-mail du compte et le parcours complet de récupération de mot de passe par e-mail ne doivent être considérés comme opérationnels qu'après configuration du fournisseur d'envoi et validation E2E de bout en bout. La limitation de tentatives est implémentée via Neon (migration `003_auth_rate_limits.sql` obligatoire) : 5 tentatives de connexion par e-mail sur 15 minutes, 30 par IP Cloudflare sur 15 minutes, 5 inscriptions par e-mail et 10 par IP sur une heure. Les clés sont stockées sous forme de hash. La page de profil, les autorisations métier complètes et les tests de sécurité restent à faire. Ne pas ouvrir l'inscription au public avant ces vérifications.

## Démonstration sans base de données

Ouvrir `/demo` pour tester les profils fictifs, enregistrer un profil local, aimer/retirer un like et afficher des matchs simulés. Les données sont stockées dans le localStorage du navigateur uniquement ; ne pas saisir d'informations personnelles réelles. Aucun compte, message ou match réel n'est créé. Ouvrir `/validation` pour les contrôles de formulaire.

La newsletter publique enregistre uniquement les inscriptions avec consentement explicite et demande une confirmation par e-mail (double opt-in). Configurer `RESEND_API_KEY` et un expéditeur valide dans Cloudflare avant d'activer les inscriptions. La migration 012 conserve les horodatages d'acceptation des conditions, de lecture de la politique de confidentialité et de confirmation 18+.

## Sécurité importante

- Le schéma SQL est une base de travail, pas une application prête pour la production.
- Ne jamais afficher les mots de passe, hashes, cookies de session ou chaînes de connexion.
- La chaîne `DATABASE_URL` doit rester exclusivement côté serveur. Ne jamais la renvoyer au navigateur, l'ajouter à Git ou la coller dans une conversation.
- Toute lecture/écriture de données privées doit passer par des routes serveur authentifiées et autorisées.
- La majorité doit être validée côté serveur avant toute publication de profil ; une case à cocher ne suffit pas à vérifier l'âge.
- Les signalements peuvent être envoyés depuis la découverte et sont enregistrés en base ; aucun tableau de modération administrateur n’est encore disponible. Les pages juridiques sont des brouillons et doivent être complétées puis vérifiées par un professionnel avant commercialisation.


## Préférences de découverte, consentements, newsletter et vérification de profil

Avant d'utiliser les nouveaux champs de genre et le workflow de badge, appliquer db/migrations/011_gender_preferences_and_verification.sql dans Neon après la migration 010. La découverte propose le genre opposé par défaut lorsque le genre du membre est renseigné comme homme ou femme, avec un filtre modifiable Femmes/Hommes/Tous.

L'inscription et la réinitialisation exigent au moins 12 caractères, une minuscule, une majuscule, un chiffre et un caractère spécial.

La vérification automatique est proposée via Stripe Identity : document officiel, contrôle selfie si disponible, puis webhook signé côté serveur. Le badge est accordé uniquement si le prestataire confirme le contrôle, que la personne est majeure et que la date de naissance vérifiée correspond à celle du profil. Configurer `STRIPE_SECRET_KEY` et `STRIPE_IDENTITY_WEBHOOK_SECRET` dans Cloudflare et enregistrer `/api/webhooks/stripe-identity` comme endpoint Stripe Identity. La voie manuelle reste disponible en secours et requiert `VERIFICATION_REVIEWER_EMAILS`. Les preuves manuelles sont supprimées à la décision ; les documents gérés par Stripe suivent la politique de conservation du prestataire et doivent être décrits dans la politique de confidentialité.

Le sélecteur de langue supporte le français, l'anglais, l'espagnol et l'italien au niveau de l'infrastructure de langue. Les traductions intégrales de toutes les pages et de tous les messages d'erreur API restent à terminer avant de présenter le produit comme entièrement internationalisé.


 
## Design system

La direction visuelle candidate est documentée dans [docs/DESIGN_SYSTEM_NEO_MIDNIGHT.md](./docs/DESIGN_SYSTEM_NEO_MIDNIGHT.md). Les tokens sont centralisés dans `app/product-design-system.css`. Le thème ne doit pas modifier le backend, les routes ou les contrats API. Le test visuel ciblé est `npx playwright test tests/e2e/neo-midnight-design-system.spec.ts`. Tant que la branche de refonte n'est pas fusionnée et déployée, ce thème ne doit pas être considéré comme actif en production.

### Fiabilité des installations GitHub Actions — 2026-11-03

Les jobs de CI, build/déploiement, smoke Playwright et parcours connecté réutilisent le cache `~/.npm` (clé dérivée de `package.json`) et le script `scripts/ci-install.sh`. Le script réessaie uniquement les erreurs réseau npm temporaires, dont `EIDLETIMEOUT`, et échoue immédiatement pour les erreurs de dépendances réelles. Tests de comportement : `tests/ci-install.test.cjs` (succès, timeout récupéré, erreur définitive).

**Limite de reproductibilité :** le dépôt ne comporte pas de `package-lock.json` versionné ; les jobs utilisent donc toujours `npm install` et non `npm ci`. Le cache ne remplace pas un lockfile. La création et l'examen d'un lockfile reproductible sont une amélioration ultérieure distincte, à valider sans modifier silencieusement les versions des dépendances.

## Emails et confirmation de compte — livraison contrôlée du 3 novembre 2026

La récupération de mot de passe et la newsletter sont déjà présentes. Le même transport Resend est désormais partagé via `lib/resend.ts`. L'envoi de confirmations de compte est **opt-in** ; ne pas le déclarer activé en production sans preuve.

**Opérations à réaliser dans cet ordre avant d'activer l'inscription vérifiée :**

1. Dans Resend, confirmer que **`nakahya.com`** est `Verified` et que les enregistrements DNS SPF/DKIM/DMARC sont correctement configurés. Le sender par défaut déclaré dans `wrangler.jsonc` est `NAKAHYA <notifications@nakahya.com>` ; une adresse d'envoi ne nécessite pas de boîte entrante.
2. Confirmer que `RESEND_API_KEY` existe dans les secrets du Worker `nikahya` et/ou dans les **GitHub Actions Repository/Environment Secrets**. Le déploiement `41677622724` indiquait **RESEND_API_KEY absent dans GitHub Actions** ; un secret configuré uniquement dans Cloudflare peut subsister grâce à `keep_vars=true`, sans que ce fait prouve la livraison.
3. **Appliquer une seule fois** la migration `db/migrations/017_email_verification.sql` depuis le SQL Editor de Neon (après avoir vérifié les migrations précédentes). La migration crée `pending_email_registrations`, n’altère pas `auth_users`, et conserve donc les comptes et sessions préexistants. Elle est idempotente pour une exécution répétée, mais l'état réel de Neon doit être contrôlé.
4. Seulement après ces vérifications, configurer **`EMAIL_VERIFICATION_ENABLED=true` dans Cloudflare Workers → nikahya → Variables and Secrets**, variable serveur (ne jamais préfixer `NEXT_PUBLIC_`). Le drapeau reste **false en l'absence de configuration** ; il n'est volontairement pas forcé dans `wrangler.jsonc` pour ne pas écraser l'activation réalisée par l'exploitant au prochain déploiement.
5. Avec une **adresse dédiée explicitement autorisée**, exécuter un test réel : inscription, réception Resend, ouverture de `/confirmer-email?token=...`, clic explicite sur « Confirmer mon adresse », création de session, accès au tableau de bord, puis nouvelle connexion. Tester aussi un jeton expiré, une seconde utilisation et le renvoi par nouvelle inscription. Ne jamais tester la livraison vers des membres réels sans autorisation.
6. Surveiller les échecs Resend sans journaliser ni afficher de token, adresse email, mot de passe ou clé API ; supprimer périodiquement les inscriptions expirées (voir le commentaire de migration 017).

**Comportement activé :** `POST /api/auth/register` enregistre uniquement un mot de passe haché et un jeton de confirmation SHA-256 dans la table temporaire, puis demande un envoi Resend. Il répond HTTP 202 **sans cookie de session** et de façon indistinguable pour les comptes déjà inscrits. Un échec de livraison supprime le jeton temporaire créé. `POST /api/auth/confirm-email` consomme le jeton valide **une seule fois** et crée atomiquement le compte, puis émet la session sécurisée. Les liens expirent au bout de 24 heures. Une nouvelle inscription sur la même adresse renouvelle le lien avec limitation anti-abus ; l'ancien lien devient inutilisable. La page de confirmation n'est pas indexée et efface le jeton de la barre d'adresse dès son chargement ; seule l'action explicite du visiteur consomme le jeton, afin d'éviter les préchargements des systèmes anti-spam.

**Compatibilité :** `EMAIL_VERIFICATION_ENABLED=false` conserve le parcours existant pour les inscriptions par e-mail et ne nécessite pas la migration 017. Les comptes déjà créés, les sessions actives et l'authentification OAuth ne sont pas modifiés. Ce lot n'affirme pas que l'adresse fournie par Google/Facebook a été vérifiée au même titre qu'un compte e-mail/mot de passe. La confirmation d'adresse n'est pas une preuve d'âge.

**Tests :** `tests/e2e/email-verification.spec.ts` teste le rendu, le formulaire, les jetons invalides et les transitions avec APIs interceptées, sans écrire dans Neon ni appeler Resend. La suite de production ajoute uniquement ces scénarios sûrs en lecture seule. L'E2E réel avec Resend reste une validation opérationnelle distincte et ne doit pas être marqué comme réussi sans preuve.
