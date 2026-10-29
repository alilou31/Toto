# Consolidation sans nouveau service externe — 27 octobre 2026

## Périmètre et non-doublons
Issues #65 à #69 ; référence de départ : main \`730a421\`. Vérifier \`FEATURES_INVENTORY.md\`, \`BACKLOG.md\`, \`PRODUCTION_TEST_LOG.md\` et la PR #60 encore ouverte avant toute autre modification. La PR #64 a déjà corrigé des problèmes de lisibilité : ne pas reproduire ces modifications.
Cette livraison est une **consolidation partielle**, et non une preuve de préparation juridique à la commercialisation.

## Livrables de ce lot
- API de tri des signalements \`/api/moderation/reports\` réservée aux adresses figurant dans \`MODERATION_REVIEWER_EMAILS\` (pas d'administrateur par défaut), lecture par statut et transition de \`open\`/\`reviewing\` vers \`reviewing\`, \`resolved\` ou \`dismissed\`. Réutilise la table \`reports\` existante et ses contraintes : aucune migration requise.
- Refus d'accès anonymes complétés sur des API privées et de modération dans Playwright.
- Sitemap enrichi de la page éditoriale Bons plans ; robots.txt élargi pour les routes privées. Attention : robots.txt n'est **pas** un contrôle d'autorisation.
- Les flux e-mail, Stripe, OAuth, vérification d'identité par prestataire, tracking tiers et réservations intégrées ne sont pas activés.

## Configuration et procédure de modération
La variable serveur \`MODERATION_REVIEWER_EMAILS\` doit contenir une liste explicite d'adresses e-mail de comptes autorisés, séparées par des virgules. Sans cette variable, toute tentative d'accès à la file reçoit HTTP 403. Ne jamais exposer cette variable au navigateur.
1. Examiner les signalements par \`GET /api/moderation/reports?status=open\` avec une session authentifiée autorisée.
2. Passer à \`reviewing\` avec \`PATCH /api/moderation/reports\` et un JSON \`{ "reportId":"uuid", "status":"reviewing" }\`.
3. Examiner les faits et clôturer avec \`resolved\` ou \`dismissed\`. En cas de danger immédiat ou de doute sur la minorité, appliquer la procédure de sécurité de l'éditeur ; ne pas automatiser les sanctions sur la seule déclaration.
4. L'application ne comporte toujours **pas** de tableau d'administration, ni de journal de décision durable et distinct : les transitions sont tracées de façon minimale dans les logs, qui peuvent expirer. Une interface et un audit persistant devront être étudiés avant ouverture large.

## Vérifications restant nécessaires
- CI du SHA exact, build Cloudflare et Playwright avant fusion, puis smoke après déploiement. Ne pas présumer de leur succès.
- Revue en environnement isolé : rôle autorisé, lecture/écriture des signalements, contrôles d'accès croisés, parcours de suppression réelle de deux comptes **de test** et dépendances de données.
- Revue i18n exhaustive FR/EN/ES/IT : la couche de compatibilité actuelle n'est pas exhaustive ; les traductions juridiques exigent une validation humaine.
- Revue UX mobile réelle (390×844), contraste, focus, formulaires, erreurs, performances et consentements.
- Identité de l'éditeur, contacts surveillés, durées de conservation, procédure de signalement et de restauration Neon, validation légale et migrations effectivement présentes en production.
- La présence de code de fournisseur externe n'implique pas que ses secrets ou services soient activés ; ne pas les lancer.

## Contrôles de la CI candidate
- La CI du premier SHA a révélé un export non autorisé par Next.js, corrigé dans le commit amendé.
- Le second SHA a passé lint/build et build Cloudflare, mais un test Playwright a révélé un en-tête Cache-Control manquant sur le refus anonyme des disponibilités.
- Le présent amendement ajoute no-store aux réponses privées de disponibilités et un test PUT anonyme. Les nouveaux résultats CI doivent être vérifiés avant fusion.

## Rollback
Si une régression est confirmée, revenir au dernier commit stable déployé via le workflow Cloudflare prévu. Ne jamais supprimer des données réelles pour tester une restauration.
