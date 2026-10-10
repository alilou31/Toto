# NIKAHYA

**La rencontre qui change tout.**

Application de rencontre sérieuse pour adultes (18+) — France et pays francophones.

## Stack

- Next.js App Router, React, TypeScript strict
- Tailwind CSS v4
- Neon PostgreSQL pour la base de données
- Zod pour la validation
- Stripe envisagé pour les abonnements

## Démarrage local

1. Installer une version LTS de Node.js compatible avec Next.js.
2. Installer les dépendances : `npm install`.
3. Copier `.env.example` vers `.env.local`.
4. Dans la console Neon, copier la chaîne de connexion PostgreSQL (de préférence la chaîne pooled) et la placer dans `DATABASE_URL` dans `.env.local`. Garder `sslmode=require` et ne jamais publier cette valeur.
5. Dans le SQL Editor de Neon, exécuter `db/migrations/001_nikahya_initial.sql` sur une base de développement.
6. Lancer `npm run dev`, puis ouvrir `http://localhost:3000`.
7. Vérifier la connexion sur `http://localhost:3000/api/db-check`. La route renvoie uniquement un état et l'heure de la base, jamais la chaîne de connexion.

## Variables d'environnement

- `DATABASE_URL` : secret serveur Neon. Ne jamais le préfixer par `NEXT_PUBLIC_` ni le committer.
- `NEXT_PUBLIC_SITE_URL` : URL publique du site.

Pour le déploiement, ajouter `DATABASE_URL` dans les variables d'environnement du fournisseur d'hébergement (par exemple Vercel), puis redéployer.

## État actuel

- [x] Landing page responsive et identité visuelle initiale
- [x] Démonstration locale : profils fictifs, création de profil, likes et matchs simulés
- [x] Page de tests manuels accessible via `/validation`
- [x] Tests unitaires de validation et règles de démonstration (`npm test`)
- [x] GitHub Actions pour lancer les tests sur push et pull request
- [x] Pages d'inscription et de connexion (interface uniquement)
- [x] Pages d'information confidentialité et conditions (brouillons à revoir)
- [x] Client Neon côté serveur et route de diagnostic `/api/db-check`
- [x] Migration SQL initiale compatible avec PostgreSQL/Neon
- [ ] Renseigner `DATABASE_URL` dans l'environnement d'exécution et confirmer un test réel
- [ ] Relier une solution d'authentification et vérifier les e-mails
- [ ] Enregistrer les profils via des routes serveur authentifiées
- [ ] Gestion des photos avec stockage privé et modération
- [ ] Recherche, intérêts et matchs via fonctions serveur sûres
- [ ] Messagerie et contrôles d'autorisation
- [ ] Signalements, blocages et outils d'administration
- [ ] Stripe, webhooks et gestion des abonnements
- [ ] Tests d'intégration navigateur et revue de sécurité/RGPD

## Démonstration sans base de données

Ouvrir `/demo` pour tester les profils fictifs, enregistrer un profil local, aimer/retirer un like et afficher des matchs simulés. Les données sont stockées dans le localStorage du navigateur uniquement ; ne pas saisir d'informations personnelles réelles. Aucun compte, message ou match réel n'est créé. Ouvrir `/validation` pour les contrôles de formulaire.

## Sécurité importante

- Le schéma SQL est une base de travail, pas une application prête pour la production.
- L'authentification n'est pas encore branchée : ne pas accepter d'identifiants réels comme si le compte était créé.
- La chaîne `DATABASE_URL` doit rester exclusivement côté serveur. Ne jamais la renvoyer au navigateur, l'ajouter à Git ou la coller dans une conversation.
- Toute lecture/écriture de données privées doit passer par des routes serveur authentifiées et autorisées.
- Le contrôle de majorité doit être effectué côté serveur avant toute publication de profil.
- Les pages juridiques sont des brouillons et doivent être complétées puis vérifiées par un professionnel avant commercialisation.
