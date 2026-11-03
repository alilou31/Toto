# Bons plans — MVP éditorial et préparation de l'affiliation (2026-10-25)

## Livré dans cette PR
- Extension de la route existante `/bons-plans` (pas de route concurrente).
- Catégories Restaurants, Activités, Week-ends et filtre de budget indicatif.
- État vide explicite et test Playwright des filtres.
- Aucun fournisseur, lien affilié, prix ou réservation inventé ; pas de transmission de données de profil.

## Suite avant monétisation
1. Obtenir les accords partenaires et URLs affiliées autorisées.
2. Réutiliser la configuration serveur des offres maintenant présente (approbation, expiration, URL et allowlist), sans ajouter de second catalogue.
3. Conserver les mentions commerciales et `rel="sponsored noopener noreferrer"` existants ; activer éventuellement la mesure agrégée préparée ci-dessous, après validation opérationnelle.
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
- **Validation serveur testée :** activation explicite, champs publics uniquement, dates calendaires réelles (y compris années bissextiles), expiration, approbation, doublons, JSON invalide et allowlist. Les domaines réservés des fixtures restent exclusivement dans les tests.

## Diagnostic CI de la PR #76

Run `41496247700` : qualité (tests unitaires, lint, build) réussie ; Playwright : 142 réussis, 2 ignorés, 1 échec répété. `bons-plans-mobile.spec.ts:37` attendait l'ancienne mention « aucun partenariat, tarif… » supprimée dans cette PR, alors que le test des filtres attend déjà « aucun tarif… ». Conserver l'assertion de transparence, l'aligner et vérifier également l'absence de lien sponsorisé par défaut ; ne pas ignorer le test ni augmenter ses délais.

Validation locale des corrections : Playwright complet, 143 réussis / 0 échec / 2 ignorés (invitations Premium live et parcours réel à deux comptes, non configurés). `npm test` et lint réussis, avec 12 avertissements ESLint préexistants hors périmètre. Les six cas du validateur passent également sous Node 22 ; l'import TypeScript natif des tests nécessite Node 22.18+ (CI Node 22). Les résultats locaux ne prouvent pas le déploiement ; vérifier les contrôles sur le SHA poussé puis les workflows de déploiement et smoke sur le SHA fusionné.

## MCP officiel Awin — préparation, sans connexion active

Sources officielles consultées le 2026-11-02 : [accès](https://help.awin.com/developers/docs/getting-access-to-awin-mcp), [outils](https://help.awin.com/developers/docs/tools-available-in-awin-mcp), [sécurité](https://help.awin.com/developers/docs/awin-mcp-overview).

Connexion : serveur `https://mcp.awin.com`, OAuth sur Awin, sans jeton dans le dépôt ou le chat. Le propriétaire doit vérifier « Connect to AI tools » sur le compte éditeur et autoriser le connecteur dans son assistant. Aucun outil Awin n'est exposé dans la session actuelle : capacités documentées, pas encore testées sur le compte NAKAHYA.

| Besoin | Outil documenté | Limite |
| --- | --- | --- |
| Choisir le compte | `awin_list_accounts` | Accès du compte connecté |
| Consulter les programmes | `awin_list_programmes`, `awin_get_programme_details` | Consultation des relations ; aucune adhésion automatique documentée |
| Statistiques éditeur | `awin_get_advertiser_performance` | Fenêtres de 31 jours maximum, pagination à vérifier |
| Créer des liens | `awin_create_links` | Programmes déjà rejoints, 100 liens maximum par requête ; prévisualiser et confirmer avant création |

Après connexion, lire les schémas réellement exposés, choisir le compte éditeur, consulter les programmes et leurs conditions, puis demander les statistiques sur une période courte. Garder ces opérations dans l'outillage de gestion : aucun accès MCP depuis le navigateur public. Aucune publication automatique dans `AFFILIATION_OFFERS_JSON` ; chaque URL doit passer la revue humaine, l'expiration et l'allowlist existantes. Ne transmettre aucune donnée de membre dans les références de clic.

Restent externes : compte Awin autorisé, consentement OAuth, adhésion annonceurs, contrôle des destinations, revue juridique et preuve d'attribution réelle. La consultation MCP ne vaut pas validation commerciale ni validation de production.

## Évolution ciblée — 2026-11-03

### Recommandations éditoriales et SEO

Les six cartes, filtres et carrousel sont réutilisés. Le choix volontaire « Premier rendez-vous » propose café/promenade ; « Partager une activité » propose culture/activité/promenade. Les filtres de budget et catégorie s'appliquent ensuite, avec état vide et remise à zéro. Aucune préférence de profil n'est déduite, aucun algorithme de matching n'est modifié et aucun choix n'est persisté. Les métadonnées propres à `/bons-plans` utilisent un canonical stable et le sitemap existant.

### Compteur de clics préparé, désactivé par défaut

- `BON_PLANS_METRICS_ENABLED` absent, `false` ou différent de `true` : pas d'annonce de mesure dans l'API, aucun appel du navigateur et POST `/api/affiliate-clicks` refusé avec 404.
- Si activé manuellement : mention visible avant utilisation ; clic direct vers l'URL approuvée inchangé, envoi asynchrone `{ "ideaId": "cafe" }`, sans cookie de session (`credentials: omit`). Une panne de mesure ne bloque pas le lien.
- L'endpoint exige la même origine, JSON, 512 octets maximum, un unique champ `ideaId` et une offre actuellement approuvée par le validateur existant. Les données de membre et URL fournies par le client sont refusées.
- Migration additive `016_affiliate_click_metrics.sql` : une ligne par jour UTC/idée avec compteur ; aucune IP, identité, URL, événement individuel ou cookie dans la table. Aucun endpoint public de lecture des statistiques.
- Conservation prévue : 90 jours calendaires UTC incluant aujourd'hui. Nettoyage opportuniste des anciennes lignes à chaque écriture. En cas d'arrêt de la collecte, prévoir une tâche opérationnelle de purge : `delete from public.affiliate_click_metrics where day < (now() at time zone 'UTC')::date - 89;`.
- Ce sont des clics reçus, pas des visiteurs uniques : rechargements, clics répétés et automatisation peuvent gonfler le compteur. Ne pas utiliser pour facturer, attribuer une commission ou prouver une conversion. Aucun identifiant supplémentaire n'est introduit pour dédupliquer ; renforcer le contrôle d'abus avant un usage commercial.
- Attribution réelle des ventes/commissions Awin, taux de conversion commercial, confirmations fournisseur et tableau de reporting restent à développer.

### Activation et contrôle

Ce travail n'applique aucune migration et ne modifie aucune variable Cloudflare. Avant activation : appliquer uniquement la migration 016 non encore appliquée dans l'environnement de test, vérifier les compteurs et la purge, informer les utilisateurs, puis définir manuellement `BON_PLANS_METRICS_ENABLED=true`. L'affiliation conserve ses propres conditions d'activation et d'approbation ; cette variable n'active aucun lien. Pour arrêter les mesures, retirer la variable ou la mettre à `false` et purger les anciennes lignes selon la politique retenue.

Les tests unitaires s'exécutent sans Neon. Playwright utilise des offres et destinations interceptées, teste l'absence d'émission par défaut et un payload minimal lorsque la mesure est simulée active. Ils ne prouvent ni l'application de la migration ni une attribution Awin.

### Preuves et limites de validation

Base auditée `31c34623c64a32ed6a8cb5b9b22c117753dd3a39` : CI [41523701029](https://github.com/alilou31/Toto/actions/runs/41523701029), déploiement [41523700757](https://github.com/alilou31/Toto/actions/runs/41523700757), smoke [41524215188](https://github.com/alilou31/Toto/actions/runs/41524215188) réussis. Ces preuves ne couvrent pas le nouveau code.

Tests unitaires locaux de l'évolution exécutés sous Node 24.19.0 : six fichiers passent. Installation npm, lint, builds et Playwright locaux indisponibles à cause du proxy réseau et des dépendances absentes ; les contrôles distants du SHA de la PR doivent être vérifiés avant livraison. Aucun test métier ni migration exécuté contre Neon de production.

