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

## Préparation technique Awin — 2026-11-02

- **Désactivé par défaut :** `AFFILIATION_ENABLED` absent ou différent de `true` => aucun lien affilié.
- **Configuration serveur :** `AFFILIATION_OFFERS_JSON` contient un tableau d'objets `{ "ideaId": "cafe", "partner": "Nom partenaire", "url": "https://tracking.partenaire.example/offre", "label": "Voir l'offre", "approved": true, "expiresAt": "2027-01-31" }`.
- **Domaines autorisés :** `AFFILIATION_ALLOWED_HOSTS=tracking.partenaire.example` (liste exacte séparée par virgules). Utiliser exclusivement les domaines approuvés par chaque réseau ; les redirections doivent également être contrôlées lors de la validation humaine.
- **Identifiants de carte :** `cafe`, `dinner`, `culture`, `activity`, `walk`, `getaway`. Une seule offre par idée ; les doublons et entrées expirées ou non approuvées sont ignorés.
- **API publique :** `GET /api/affiliate-offers` ne renvoie que les champs nécessaires aux cartes et n'expose aucun profil, e-mail, identifiant de membre ou secret.
- **Sécurité :** HTTPS obligatoire, nom d'hôte dans l'allowlist exacte, interdiction de localhost/IP, URL avec authentification ou port personnalisé. Pas de redirection serveur, pas de suivi des utilisateurs, pas de cookies ajoutés.
- **Transparence :** « Lien affilié » et nom du partenaire avant le clic ; `rel=sponsored noopener noreferrer`, `target=_blank`, `referrerPolicy=no-referrer`. Le paiement et la réservation restent externes.
- **Activation manuelle :** attendre l'approbation d'Awin **et** des annonceurs, vérifier les URL et mentions légales, puis définir les variables Cloudflare. Ne jamais activer avec des URLs fictives ou avant revue juridique.
- **Tests :** filtres existants, absence de lien par défaut, lien sponsorisé simulé via interception Playwright. Les tests ne démontrent pas l'attribution réelle de commissions Awin.
