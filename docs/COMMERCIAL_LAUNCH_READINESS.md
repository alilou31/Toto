# Préparation au lancement commercial — NAKAHYA

Dernière mise à jour : 2026-10-13  
Production cible : https://nikahya.rassoul-ali.workers.dev/  
Hébergement : Cloudflare Workers · Base : Neon · Dépôt : https://github.com/alilou31/Toto

Ce document est une liste de contrôle de lancement, pas une certification de conformité ou de sécurité. Une case ne peut être cochée qu'avec une preuve récente. Les anciennes réussites CI ou E2E ne valident pas automatiquement les commits suivants.

## Décision de lancement

**Statut recommandé : pilote fermé uniquement, pas encore d'ouverture commerciale publique.**

Les pages légales présentes dans le dépôt indiquent explicitement qu'elles sont des brouillons. Il ne faut pas les présenter comme des documents contractuels définitifs. Les informations qui dépendent de l'identité réelle de l'éditeur, des fournisseurs effectivement activés et des choix commerciaux doivent être fournies par le responsable du service, pas inventées dans le code.

## P0 — Bloquants avant une ouverture au public

### Identité, informations légales et contrats
- [ ] Fournir la raison sociale ou identité légale de l'éditeur, l'adresse de contact professionnelle et les coordonnées requises pour les mentions légales.
- [ ] Publier des mentions légales complètes et cohérentes avec l'éditeur réel, l'hébergeur et les services effectivement utilisés.
- [ ] Faire valider la politique de confidentialité : catégories de données, finalités, bases légales, destinataires/sous-traitants, transferts éventuels, durées de conservation, droits, contact et modalités de réclamation.
- [ ] Déterminer si des données sensibles ou liées aux convictions sont collectées/affichées, réduire la collecte au strict nécessaire et faire valider la base légale et les mesures adaptées avant activation.
- [ ] Faire valider les conditions d'utilisation : âge minimum, règles communautaires, modération, signalements, blocages, suspension, recours, responsabilité, résiliation et médiation si applicable.
- [ ] Si une offre payante est activée : publier les conditions de vente, prix TTC, renouvellement/résiliation, rétractation lorsqu'applicable, facturation et coordonnées du médiateur compétent si requis.
- [ ] Définir la politique cookies/traceurs et le mécanisme de consentement si des traceurs non essentiels sont utilisés.
- [ ] Ne pas remplacer les cases ci-dessus par une formule générique ou une identité supposée. Faire relire les documents par un professionnel compétent.

### Sécurité et protection des données
- [ ] Vérifier que toutes les API privées imposent une session et que les opérations sur profil, conversation, match, jeu, blocage et signalement vérifient l'appartenance/les permissions côté serveur.
- [ ] Vérifier les protections contre l'énumération de comptes, l'abus de connexion/inscription, le spam de messages/intérêts/signalements et les accès par identifiants devinés.
- [ ] Vérifier que les secrets Cloudflare/Neon ne sont jamais exposés côté client, dans les logs, artefacts ou dépôts.
- [ ] Tester le parcours de suppression de compte et la suppression/anonymisation des données liées ; documenter les exceptions légales de conservation.
- [ ] Définir un contact de support et un processus opérationnel de traitement des signalements, notamment les signalements de mineurs, harcèlement et arnaque.
- [ ] Définir la surveillance des erreurs, les alertes, la rétention des journaux, les sauvegardes Neon et un test de restauration.

### Qualité de production
- [ ] Vérifier que le commit de main est celui réellement déployé sur Cloudflare et que le smoke test post-déploiement est vert.
- [ ] Exécuter CI, lint, tests unitaires, Playwright navigateur et build Worker sur le commit candidat.
- [ ] Exécuter les tests E2E à deux comptes de test dédiés uniquement avec autorisation et garde-fous ; ne pas créer de données de production avec des comptes réels.
- [ ] Vérifier explicitement le site sur mobile (390×844 au minimum) : landing, menu/navigation, inscription, connexion, retour navigateur en session, profil, découverte, jeux, matchs et messagerie.
- [ ] Confirmer que les migrations requises sont appliquées et que le test de connectivité Neon passe. Les migrations 005 et 007 ont déjà été déclarées vérifiées par le responsable ; ne pas les rejouer sans motif.
- [ ] Tester les chemins de panne : base indisponible, requêtes invalides, session expirée, profil bloqué et API non autorisée.

## P1 — À terminer avant une acquisition payante importante
- [ ] Vérifier titre/meta, canonical, sitemap, robots, Open Graph, favicon, données structurées et pages 404/erreur.
- [ ] Mesurer les performances mobile et l'accessibilité clavier/lecteurs d'écran ; corriger les débordements et les contrastes insuffisants.
- [ ] Mettre en place des métriques respectueuses de la vie privée : visites landing, démarrage/fin d'inscription, profil complété, premier intérêt, premier match, première partie et première conversation.
- [ ] Établir le coût d'exploitation Cloudflare/Neon, les seuils d'alerte, le budget mensuel et une procédure de rollback.
- [ ] Documenter support, incidents, modération et réponse aux demandes de droits RGPD.

## P2 — Décisions produit/commerciales
- [ ] Décider si le lancement est gratuit, freemium ou payant ; reporter les paiements tant que les obligations commerciales associées ne sont pas prêtes.
- [ ] Définir les limites de lancement : nombre d'invitations, zone géographique, support et capacité de modération.
- [ ] Démarrer par un pilote fermé, mesurer la qualité des profils et la sécurité, puis augmenter progressivement l'accès.

## État du dépôt après le correctif du 2026-10-13

- Le test d’autorisation des API privées est inclus dans `tests/e2e/auth-api.spec.ts`. Une première exécution de ce test a révélé une erreur de syntaxe dans le fichier de test ; le correctif doit être validé par la CI du commit suivant. Ne pas considérer cette couverture comme validée tant que la CI n’est pas verte.
- Le contrôle du menu mobile à 390×844 existe déjà dans `tests/e2e/production-ui.spec.ts` ; ne pas créer un second test équivalent. L’exécution de ce test doit être vérifiée sur le commit candidat.
- Les pages légales utilisent le nom fictif de travail « NAKAHYA Studio », affichent un avertissement explicite et sont `noindex` jusqu’à leur finalisation. Les informations réelles de l’éditeur, la revue juridique et l’adresse de support restent à fournir.
- Le flux « mot de passe oublié » reste bloqué par l’absence d’un fournisseur de livraison d’e-mails configuré et vérifié. Ne pas ajouter un faux formulaire ou exposer des jetons de récupération dans les logs. Pour le terminer, configurer un fournisseur d’e-mails et les secrets associés, puis implémenter et tester le cycle complet de jeton à durée limitée.

## Capacités déjà présentes à ne pas dupliquer

- Authentification par e-mail/mot de passe et limitation de tentatives.
- Profil, découverte, intérêts, matchs, conversations, jeux partagés, blocage, signalement et suppression de compte.
- Tests E2E existants, dont le parcours à deux utilisateurs et les tests de contrats API.
- Pages /confidentialite et /conditions existent mais leur contenu est explicitement provisoire.
- Aucun lien « mot de passe oublié » n'a été détecté sur /connexion. Ne pas ajouter un faux formulaire : le vrai parcours nécessite une stratégie de jeton à durée limitée, une livraison fiable du message et un mécanisme de consommation/invalidation du jeton.

## Prochaine porte de sortie

Le lancement public ne doit être autorisé que lorsque tous les points P0 sont validés avec des preuves et que les pages légales ne signalent plus qu'elles sont des brouillons. Les validations juridiques, l'identité de l'éditeur, la configuration réelle des prestataires et la décision tarifaire requièrent des informations du responsable du service.
