# Activer Google et Facebook sur NIKAHYA

Les boutons et les routes OAuth sont intégrés, mais l’authentification réelle reste inactive tant que les fournisseurs et la migration Neon ne sont pas configurés.

## 1. Appliquer la migration Neon

Dans Neon SQL Editor, exécuter le contenu de db/migrations/008_oauth_identities.sql. Cette migration crée la table de liaison des identités sociales et conserve les horodatages de consentement des inscriptions sociales. Ne pas marquer la migration comme appliquée avant son exécution effective.

## 2. Configurer Google

Dans Google Cloud Console :
1. Créer ou sélectionner un projet et configurer l’écran de consentement OAuth.
2. Créer un identifiant OAuth de type Application Web.
3. Ajouter l’URI de redirection autorisée : https://nikahya.rassoul-ali.workers.dev/api/auth/oauth/callback.
4. Récupérer l’identifiant client et le secret client.

Variables côté serveur : GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET.

## 3. Configurer Facebook

Dans Meta for Developers :
1. Créer ou sélectionner l’application et ajouter le produit Facebook Login pour le Web.
2. Déclarer l’URI OAuth valide : https://nikahya.rassoul-ali.workers.dev/api/auth/oauth/callback.
3. Vérifier les domaines autorisés et le mode Live avant d’ouvrir l’accès aux utilisateurs.

Variables côté serveur : FACEBOOK_APP_ID, FACEBOOK_APP_SECRET et éventuellement FACEBOOK_GRAPH_API_VERSION (par défaut v26.0).

## 4. Variables Cloudflare

Dans les variables d’environnement/secrets du Worker, définir :
- NEXT_PUBLIC_SITE_URL=https://nikahya.rassoul-ali.workers.dev
- les identifiants Google et Facebook ci-dessus.

Les secrets doivent être ajoutés dans Cloudflare, jamais dans GitHub, dans le code ou dans un fichier .env versionné. Aucun secret ne doit utiliser le préfixe NEXT_PUBLIC_.

Pour le développement local, utiliser http://localhost:3000/api/auth/oauth/callback dans les consoles fournisseurs et NEXT_PUBLIC_SITE_URL=http://localhost:3000 dans .env.local.

## 5. Comportement de sécurité

- Google utilise OpenID Connect, PKCE, une vérification de l’adresse e-mail et un état OAuth aléatoire.
- Les deux fournisseurs utilisent un état aléatoire lié à un cookie HttpOnly, SameSite=Lax et de courte durée.
- L’inscription sociale exige une confirmation 18+ et l’acceptation des conditions avant la redirection.
- Une identité sociale n’est jamais automatiquement liée à un compte existant partageant la même adresse e-mail. L’utilisateur doit se connecter avec sa méthode actuelle ; la liaison explicite reste une fonctionnalité distincte.
- Les jetons OAuth ne sont pas renvoyés au navigateur ni enregistrés en base.
- Les tests automatisés valident l’interface et les contrôles d’entrée ; un parcours réel exige des identifiants de test Google et Meta.
