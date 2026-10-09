# NIKAHYA

**La rencontre qui change tout.**

Application de rencontre sérieuse pour adultes (18+) — France et pays francophones.

## Stack

- Next.js App Router, React, TypeScript strict
- Tailwind CSS v4
- Supabase prévu pour PostgreSQL, Auth, Storage et Realtime
- Zod pour la validation
- Stripe prévu pour les abonnements

## Démarrage local

1. Installer Node.js LTS compatible avec Next.js.
2. Installer les dépendances : `npm install`.
3. Copier `.env.example` vers `.env.local`.
4. Créer un projet Supabase et configurer les variables.
5. Appliquer la migration `supabase/migrations/202610090001_initial_schema.sql` dans un projet de test après revue.
6. Lancer `npm run dev`, puis ouvrir `http://localhost:3000`.

## État actuel

- [x] Landing page responsive et identité visuelle initiale
- [x] Pages d'entrée inscription et connexion (UI seulement)
- [x] Pages d'information confidentialité et conditions (brouillons à revoir)
- [x] Schéma SQL initial et politiques RLS de départ
- [x] Métadonnées de base et en-têtes HTTP
- [ ] Authentification Supabase réellement connectée et vérification e-mail
- [ ] Onboarding persistant et validation serveur des 18 ans
- [ ] Gestion des photos avec stockage privé et modération
- [ ] Recherche, intérêts et matchs via fonctions serveur sûres
- [ ] Messagerie temps réel et contrôles d'autorisation
- [ ] Signalements, blocages et outils d'administration
- [ ] Stripe, webhooks et gestion des abonnements
- [ ] Tests automatisés, CI/CD et revue de sécurité/RGPD

Les formulaires actuels ne créent pas encore de comptes : ils indiquent explicitement que Supabase doit être configuré. Aucun faux membre, témoignage ou chiffre d'audience n'est affiché. L'application n'est pas prête pour la production.

## Sécurité importante

- Les dates de naissance et détails privés sont séparés des profils publics dans le schéma initial.
- Les règles d'âge doivent être appliquées côté serveur avant publication d'un profil; ne jamais se fier uniquement à une case à cocher.
- Ne jamais exposer la clé de service Supabase ni les secrets Stripe au navigateur.
- Les créations de matchs, changements de rôle, décisions de vérification et écritures de paiement doivent passer par du code serveur de confiance.
- Vérifier les politiques RLS avec des tests positifs et négatifs avant tout lancement.
- Les données relatives aux convictions sont particulièrement sensibles : ne pas les collecter sans nécessité, base juridique et consentement validés.
- Les pages juridiques sont des brouillons et doivent être complétées puis vérifiées par un professionnel avant commercialisation.

## Prochaines étapes

1. Configurer Supabase Auth et les cookies serveur via `@supabase/ssr`.
2. Écrire des tests d'accès RLS, notamment contre l'accès aux conversations et données privées d'autrui.
3. Ajouter l'onboarding et le contrôle d'âge côté serveur.
4. Développer intérêts/matchs, puis messagerie et modération.
5. N'activer les paiements qu'après sécurisation et test des webhooks.
