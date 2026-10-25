# Bons plans — MVP éditorial et préparation de l'affiliation (2026-10-25)

## Livré dans cette PR
- Extension de la route existante `/bons-plans` (pas de route concurrente).
- Catégories Restaurants, Activités, Week-ends et filtre de budget indicatif.
- État vide explicite et test Playwright des filtres.
- Aucun fournisseur, lien affilié, prix ou réservation inventé ; pas de transmission de données de profil.

## Suite avant monétisation
1. Obtenir les accords partenaires et URLs affiliées autorisées.
2. Ajouter une configuration serveur ou éditoriale des offres (source, expiration, URL, conditions).
3. Identifier chaque lien commercial, ajouter `rel="sponsored noopener noreferrer"`, et suivre uniquement les clics sortants agrégés avec information appropriée.
4. Vérifier CGU, confidentialité, identité de l'éditeur et règles de protection des utilisateurs.
5. Ajouter tests de liens et redirections sans exposer d'identifiants de profils.

## Validation
Tests à exécuter sur la PR : `npm run lint`, `npm test`, `npm run build`, `npx playwright test tests/e2e/bons-plans-mobile.spec.ts tests/e2e/bons-plans-filters.spec.ts`.
Ne pas déclarer la production validée avant CI, fusion, déploiement et smoke post-déploiement.
