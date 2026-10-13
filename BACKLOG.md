# Backlog produit — NIKAHYA

> Objectif : livrer un MVP de rencontre utilisable, sécurisé et responsive.
> Règle de périmètre : toute intégration nécessitant un prestataire externe est reportée en phase 2. Prévoir des interfaces/adaptateurs propres, sans bloquer le MVP.

## Priorités

- **P0 — indispensable au MVP**
- **P1 — important après le parcours principal**
- **P2 — phase 2 / amélioration**
- **REPORTÉ — nécessite un prestataire externe**

## État initial connu

## État de suivi vérifié — 2026-10-12

## Suivi immédiat — 2026-10-13

- [x] **Parcours E2E réel à deux utilisateurs : PASSÉ.** [Run Playwright 38326586838](https://github.com/alilou31/Toto/actions/runs/38326586838), 1 test réussi en 30,1 s ; détails dans [`PRODUCTION_TEST_LOG.md`](./PRODUCTION_TEST_LOG.md).
- [x] Migrations Neon `005_game_sessions.sql` et `007_rencontre_sessions.sql` : déjà vérifiées selon la confirmation de l'utilisateur du 2026-10-13 ; ne pas rouvrir ce point sans anomalie nouvelle.
- [x] Historique du blocage initial conservé dans le registre de production ; il a été levé par l'exécution réussie du workflow ci-dessus.


Ce backlog historique contient encore des cases non cochées qui peuvent correspondre à du code et à des tests ajoutés depuis sa rédaction. Pour éviter les doublons, **ne pas prendre ces cases seules comme état réel** : consulter d'abord [`FEATURES_INVENTORY.md`](./FEATURES_INVENTORY.md) et [`PRODUCTION_TEST_LOG.md`](./PRODUCTION_TEST_LOG.md), puis vérifier le code, les PR et les preuves avant de modifier le statut d'une tâche.

### Audit production — navigation publique (2026-10-13)
- [x] Audit exploratoire en lecture seule : 15 routes ont répondu sans échec HTTP observé ; rapport [TinyFish](https://agent.tinyfish.ai/runs/4159be8a-c14f-40e6-9052-efcc0dbd043f), détails dans [PRODUCTION_TEST_LOG.md](./PRODUCTION_TEST_LOG.md).
- [ ] Vérifier avec tests négatifs que les données/API privées des routes cockpit, découverte, matchs et profil ne sont pas accessibles sans session. Un HTTP 200 sur la page seule ne prouve pas une fuite, mais nécessite un contrôle d'autorisation ciblé.
- [ ] Tester le menu/navigation à viewport mobile explicite (390×844) : l'audit courant n'a pas modifié le viewport, donc ce point reste non vérifié.
- [ ] Évaluer le besoin d'un parcours « mot de passe oublié » ; aucun lien n'a été détecté sur `/connexion`.
- **Limite :** audit navigateur exploratoire, non équivalent à un audit sécurité exhaustif.

### Validation récente — parcours de production à deux utilisateurs (2026-10-13)
- [x] Parcours Playwright à deux utilisateurs validé sur production : [run 38326586838](https://github.com/alilou31/Toto/actions/runs/38326586838), **1 passé en 30,1 s** sur le commit `2ad818574809603043aec912d0ce211eecde21c0`.
- [x] CI générale verte sur le même commit : [run 38325829244](https://github.com/alilou31/Toto/actions/runs/38325829244).
- [x] Déploiement Cloudflare et configuration du secret Neon réussis : [run 38325829240](https://github.com/alilou31/Toto/actions/runs/38325829240).
- [x] Smoke tests post-déploiement réussis : [run 38326406552](https://github.com/alilou31/Toto/actions/runs/38326406552).
- [x] Migrations Neon `005_game_sessions.sql` et `007_rencontre_sessions.sql` déjà vérifiées (confirmation utilisateur du 2026-10-13). Ne pas répéter ce contrôle sans motif concret.
- [ ] Contrôler le menu et la navigation mobile sur la production avec un viewport mobile explicite.
- [ ] Réconcilier les PR ouvertes après comparaison de leurs diffs avec `main`, sans fusion redondante.
- **Détail du scénario et limites :** voir [PRODUCTION_TEST_LOG.md](./PRODUCTION_TEST_LOG.md), entrée `PROD-2026-10-13-01`.

### État confirmé lors du dernier contrôle
- [x] CI verte pour le commit `21f9b27218f77a31200ff9848abb01ea53996013` ([run 38250340762](https://github.com/alilou31/Toto/actions/runs/38250340762)).
- [x] Déploiement Cloudflare du même commit réussi ([run 38250340411](https://github.com/alilou31/Toto/actions/runs/38250340411)).
- [x] Smoke léger post-déploiement réussi : accueil, démo, Neon et protection de l'historique des jeux ([run 38250709449](https://github.com/alilou31/Toto/actions/runs/38250709449)). Le job Playwright de production a été ignoré comme prévu par la configuration anti-doublons.
- [x] Réduction des doublons dans le workflow de smoke production : après déploiement, smoke léger HTTP/Neon uniquement ; Playwright de production quotidien ou manuel. La prochaine exécution post-déploiement doit confirmer le déclenchement effectif.
- [ ] Confirmer que le prochain smoke post-déploiement s'exécute (le run 38249376116 a été ignoré : [preuve](https://github.com/alilou31/Toto/actions/runs/38249376116)).
- [x] CI du HEAD `20e08c6fc7ddebc3b135fc4a14739be9359936d6` : réussie ([workflow 38248707710](https://github.com/alilou31/Toto/actions/runs/38248707710)).
- [x] Smoke tests de production en lecture seule : réussis ([workflow 38248829645](https://github.com/alilou31/Toto/actions/runs/38248829645)); le déploiement de ce HEAD est encore à confirmer ([workflow Cloudflare 38248707672](https://github.com/alilou31/Toto/actions/runs/38248707672)).
- [x] Smoke tests de production en lecture seule passés : [workflow 38248441636](https://github.com/alilou31/Toto/actions/runs/38248441636). Ce test porte sur la version servie au moment du run et ne prouve pas que le dernier commit était déjà déployé.
- [x] CI des quatre nouveaux cas négatifs d'authentification : réussie sur le HEAD `20e08c6fc7ddebc3b135fc4a14739be9359936d6` ([workflow 38248707710](https://github.com/alilou31/Toto/actions/runs/38248707710)). Les runs antérieurs du commit `a3d40b8` ont été annulés par les commits suivants.
- [x] CI sur le commit `0df719579122ceccf8acb20c6696cdd52131b89a` : réussie ([workflow](https://github.com/alilou31/Toto/actions/runs/38247750058)).
- [x] Smoke tests de production en lecture seule : réussis ([workflow 38248030239](https://github.com/alilou31/Toto/actions/runs/38248030239)). **Réserve :** au dernier contrôle, le déploiement Cloudflare du commit `0df71957` était encore en cours/attente ; ce smoke test ne prouve pas que ce SHA était déjà en production.
- [x] CI sur le commit `1bdb5a456994aef3719a9eaad6e64c33c1fa2399` : tests Playwright navigateur, unitaires, lint, build et build Worker réussis ([workflow](https://github.com/alilou31/Toto/actions/runs/38246981835)).
- [x] Déploiement Cloudflare du même commit terminé avec succès ([workflow](https://github.com/alilou31/Toto/actions/runs/38246981763)).
- [x] Smoke tests en lecture seule : accueil, démo, connectivité Neon, protection de l'historique et tests UI passés ([workflow](https://github.com/alilou31/Toto/actions/runs/38247137335)).
- [x] Obtenir une preuve de smoke test après déploiement pour le commit `1bdb5a456994aef3719a9eaad6e64c33c1fa2399` ([workflow 38247451465](https://github.com/alilou31/Toto/actions/runs/38247451465)). À revalider après le déploiement des commits de documentation postérieurs.
- [x] Migrations Neon `005_game_sessions.sql` et `007_rencontre_sessions.sql` déjà vérifiées (confirmation utilisateur du 2026-10-13).
- [x] Vérifier le rapport d'exécution du parcours à deux utilisateurs en production : [run 38326586838](https://github.com/alilou31/Toto/actions/runs/38326586838), 1 test passé ; détails dans [PRODUCTION_TEST_LOG.md](./PRODUCTION_TEST_LOG.md).
- [ ] Réconcilier les PR ouvertes #3, #4, #5, #6 et #8 avec `main` avant toute fusion afin d'éviter les changements redondants.

- [x] Dépôt GitHub et déploiement Cloudflare Workers initialisés
- [x] Base Neon créée
- [x] Tables initiales créées : `profiles`, `profile_photos`, `interests`, `matches`, `conversations`, `messages`, `blocks`, `reports`
- [x] Endpoint `/api/db-check` vérifié en production : connexion Neon confirmée
- [x] Parcours connectés d'authentification, profil et jeux déjà présents ; éviter de les recréer
- [ ] Vérifier les parcours métier de bout en bout avec deux comptes dédiés


### Dernier contrôle de production — 2026-10-12 (commit f70d89b7)
- [x] CI réussie ([run 38257712643](https://github.com/alilou31/Toto/actions/runs/38257712643)).
- [x] Déploiement Cloudflare réussi ([run 38257712468](https://github.com/alilou31/Toto/actions/runs/38257712468)).
- [x] Smoke post-déploiement réussi ([run 38258557694](https://github.com/alilou31/Toto/actions/runs/38258557694)).
- [x] Contrôle navigateur en lecture seule : accueil et /demo chargés, actions d'inscription/connexion visibles ([rapport](https://agent.tinyfish.ai/runs/0b01121f-6f8e-4305-b4e1-bc800fef2c53)).
- [ ] Tester le menu mobile directement sur production avec un viewport mobile explicite; le contrôle navigateur disponible ne prouve pas que la taille mobile a été appliquée.
- [ ] Vérifier les tables Neon des migrations 005 et 007 en lecture seule. **Statut utilisateur : SQL déclaré effectué; contrôle technique non réalisé.**
- [ ] Exécuter le parcours à deux comptes uniquement après confirmation explicite des comptes de test et de l'autorisation d'écrire des données de test en production.

## EPIC 1 — Fondation technique et sécurité

### NIK-001 — Vérifier le socle de déploiement (P0)
- [ ] Vérifier le build et le démarrage en production
- [ ] Vérifier `DATABASE_URL` côté Cloudflare sans jamais afficher sa valeur dans les logs
- [ ] Vérifier les erreurs API et afficher des messages non sensibles
- [ ] Documenter les commandes locales et les variables d'environnement nécessaires

**Critères d'acceptation :** le site démarre, le endpoint de contrôle DB répond sans exposer de secret et les erreurs sont journalisées sans données sensibles.

### NIK-002 — Ajouter une authentification première partie (P0)
- [ ] Créer le modèle utilisateur/identifiants et relier chaque compte à un profil
- [ ] Inscription avec email et mot de passe
- [ ] Stocker uniquement un hash robuste du mot de passe (jamais le mot de passe en clair)
- [ ] Connexion, déconnexion et session sécurisée côté serveur
- [ ] Valider les entrées côté serveur, limiter les tentatives et ne pas révéler si un email existe
- [ ] Protéger les routes et opérations privées
- [ ] Ajouter des tests pour inscription, connexion et accès non autorisé

**Critères d'acceptation :** un utilisateur peut créer un compte, se connecter, conserver une session sécurisée et accéder uniquement à ses propres données.

### NIK-003 — Sécuriser l'accès aux données (P0)
- [ ] Vérifier l'identité et l'autorisation dans chaque route API
- [ ] Empêcher la lecture ou modification des profils/messages d'autres utilisateurs sans autorisation
- [ ] Valider les données et utiliser des requêtes paramétrées
- [ ] Ajouter des contrôles d'accès pour blocs, signalements, intérêts et conversations
- [ ] Ne jamais exposer la connexion SQL ni les secrets au navigateur

**Critères d'acceptation :** les tests négatifs confirment qu'un utilisateur ne peut pas usurper un autre identifiant ni accéder à ses données privées.

## EPIC 2 — Inscription et profil

### NIK-010 — Construire le parcours de création de profil (P0)
- [ ] Étapes : pseudonyme, date de naissance, ville, intention de rencontre, biographie
- [ ] Vérifier l'âge minimum de 18 ans côté serveur
- [ ] Enregistrer le brouillon et permettre de reprendre le parcours
- [ ] Indiquer clairement les champs obligatoires et les erreurs
- [ ] Choisir l'état du profil : masqué, visible ou en pause

**Critères d'acceptation :** le profil est sauvegardé en base, les validations serveur sont appliquées et l'utilisateur peut le modifier.

### NIK-011 — Gérer les photos sans fournisseur externe (P1)
- [ ] Définir un stockage local/de développement pour les tests
- [ ] Préparer une interface de stockage pour pouvoir brancher un service externe plus tard
- [ ] Valider type, taille et nombre de fichiers
- [ ] Prévoir les statuts de modération : en attente, approuvée, refusée
- [ ] Ne pas rendre une photo publique avant validation

**Critères d'acceptation :** les fichiers non valides sont rejetés et les photos en attente ne sont pas visibles dans la découverte.
**Note :** le stockage durable des photos en production nécessitant un fournisseur est reporté en phase 2.

## EPIC 3 — Découverte et interactions

### NIK-020 — Afficher les profils à découvrir (P0)
- [ ] Lister les profils visibles et ayant terminé leur onboarding
- [ ] Exclure le profil courant, les profils bloqués et les utilisateurs déjà traités
- [ ] Afficher les informations publiques autorisées
- [ ] Ajouter pagination et états vide/chargement/erreur
- [ ] Ne jamais renvoyer email, identifiants d'authentification ou champs privés

**Critères d'acceptation :** la liste est obtenue depuis Neon, respecte les règles de visibilité et fonctionne sur mobile comme sur ordinateur.

### NIK-021 — Envoyer et gérer un intérêt (P0)
- [ ] Envoyer un intérêt depuis un profil
- [ ] Éviter les doublons et les auto-intérêts
- [ ] Voir les intérêts reçus et envoyés
- [ ] Accepter ou ignorer un intérêt
- [ ] Gérer les états de chargement et les erreurs

**Critères d'acceptation :** les actions persistent en base et les règles métier sont contrôlées côté serveur.

### NIK-022 — Créer les matchs (P0)
- [ ] Créer un match lorsque l'intérêt réciproque est accepté selon les règles métier
- [ ] Garantir qu'un même duo ne crée pas plusieurs matchs
- [ ] Afficher la liste des matchs
- [ ] Ne créer une conversation que pour un match autorisé

**Critères d'acceptation :** les matchs sont uniques, cohérents et visibles uniquement par les deux personnes concernées.

## EPIC 4 — Messagerie et confiance

### NIK-030 — Messagerie texte simple (P1)
- [ ] Envoyer et afficher les messages d'une conversation autorisée
- [ ] Vérifier que l'expéditeur appartient au match/conversation
- [ ] Limiter la longueur du message et traiter les contenus vides
- [ ] Afficher date, états vide/chargement/erreur
- [ ] Commencer par un rafraîchissement simple ; temps réel en phase ultérieure

**Critères d'acceptation :** seuls les membres de la conversation peuvent lire et envoyer des messages.

### NIK-031 — Bloquer un utilisateur (P0)
- [ ] Ajouter et retirer un blocage
- [ ] Masquer les profils bloqués dans la découverte
- [ ] Empêcher les nouveaux intérêts et messages entre les personnes bloquées
- [ ] Rendre l'action accessible depuis le profil et la conversation

**Critères d'acceptation :** le blocage est appliqué côté serveur à toutes les opérations pertinentes.

### NIK-032 — Signaler un profil ou un message (P0)
- [x] Formulaire de signalement avec catégorie et détails facultatifs sur les profils visibles
- [x] Enregistrer le signalement en base via une route serveur authentifiée
- [x] Limiter les soumissions par compte et éviter les doublons récents de même catégorie
- [x] Confirmer l'envoi sans révéler d'informations sur l'enquête
- [ ] Ajouter une file de traitement et des rôles d'administration protégés

**Critères d'acceptation :** un signalement est stocké et accessible uniquement aux fonctions d'administration autorisées.

### NIK-033 — Outils de modération minimum (P1)
- [ ] Définir un rôle administrateur protégé
- [ ] Consulter les signalements ouverts
- [ ] Marquer un signalement en cours, résolu ou rejeté
- [ ] Tracer les actions de modération
- [ ] Ne pas créer de compte admin par défaut avec un mot de passe connu

**Critères d'acceptation :** seuls les administrateurs autorisés peuvent consulter les signalements et modifier leur statut.

## EPIC 5 — Finition produit et conformité

### NIK-040 — Navigation et interface responsive (P0)
- [ ] Harmoniser les pages avec l'identité NIKAHYA (ivoire, vert émeraude/forêt)
- [ ] Prévoir les états non connecté, connecté, vide, chargement et erreur
- [ ] Tester les parcours sur mobile et ordinateur
- [ ] Ajouter les libellés accessibles et la navigation clavier

### NIK-041 — Paramètres et suppression de compte (P1)
- [ ] Modifier les informations de profil
- [ ] Mettre le profil en pause ou le masquer
- [ ] Demander la suppression du compte
- [ ] Supprimer ou anonymiser les données associées selon une politique documentée

### NIK-042 — Confidentialité et règles d'utilisation (P0 avant ouverture publique)
- [ ] Rédiger les pages de confidentialité, conditions d'utilisation et règles communautaires
- [ ] Expliquer quelles informations sont publiques
- [ ] Définir une durée de conservation des données et une procédure de suppression
- [ ] Vérifier les obligations applicables avant l'ouverture publique

## REPORTÉ — Phase 2 (prestataires externes)

Ces éléments ne doivent pas bloquer le MVP. Prévoir des points d'intégration, sans connecter de fournisseur pour l'instant.

- [ ] Vérification d'email et emails transactionnels (fournisseur d'email)
- [ ] Réinitialisation de mot de passe par email si elle nécessite l'envoi de liens
- [ ] SMS, téléphone ou OTP via fournisseur
- [ ] Authentification sociale ou fournisseur d'identité externe (Google, Apple, etc.)
- [ ] Stockage durable des photos et CDN
- [ ] Modération automatique des photos/contenus par API tierce
- [ ] Notifications push
- [ ] Paiements, abonnements ou options premium
- [ ] Géolocalisation avancée, cartes ou API de distance
- [ ] Analytics/monitoring SaaS externe
- [ ] Messagerie temps réel gérée par un service externe

## Ordre recommandé de réalisation

1. **NIK-001** — vérifier le déploiement et la base
2. **NIK-002 + NIK-003** — authentification et autorisations
3. **NIK-010** — création du profil
4. **NIK-020** — découverte
5. **NIK-021 + NIK-022** — intérêts et matchs
6. **NIK-031 + NIK-032** — blocage et signalement
7. **NIK-030** — messagerie texte
8. **NIK-040 + NIK-042** — finition, confidentialité et préparation à l'ouverture
9. **NIK-033 + NIK-041** — administration et paramètres, avant élargissement du public

## Définition de « terminé »

Une tâche est terminée quand :
- le parcours fonctionne dans l'interface et avec la vraie base Neon ;
- les contrôles d'accès sont côté serveur ;
- les états chargement, succès, erreur et vide sont traités ;
- les tests pertinents passent ;
- aucune clé, chaîne de connexion ou donnée privée n'est exposée ;
- la tâche est vérifiée en préproduction avant déploiement public.


## EPIC 6 — Mini-jeux et défis synchronisés

### NIK-GAME-001 — Catalogue et parties individuelles (P1)
- [x] Rendre les filtres du catalogue interactifs et accessibles
- [x] Proposer quatre questions jouables pour les six formats
- [x] Distinguer les préférences du quiz de personnalité des scores notés
- [x] Enregistrer et afficher l'historique des résultats pour un compte connecté
- [x] Ajouter les tests Playwright des parcours individuels et filtres

### NIK-GAME-002 — Invitation et partie à deux (P1)
- [x] Créer une session serveur avec code d'invitation
- [x] Rejoindre une session avec un code, sans autoriser l'auto-invitation
- [x] Restreindre l'état et les réponses aux deux participants
- [x] Enregistrer une réponse par joueur et question
- [x] Avancer la partie lorsque les deux réponses sont reçues
- [x] Synchroniser l'état côté client sans fournisseur externe
- [x] Afficher les défis récents et les états en attente/en cours/terminé
- [ ] Confirmer l'application de la migration `005_game_sessions.sql` dans Neon
- [ ] Tester le parcours complet avec deux comptes connectés distincts en production via le workflow manuel protégé
- [ ] Ajouter un mécanisme de reprise/expiration des défis abandonnés
- [ ] Concevoir des questions et règles spécifiques par jeu, au-delà du premier lot générique

**Critères d'acceptation :** les invitations et réponses sont autorisées côté serveur uniquement pour les participants, une question ne peut pas être modifiée après validation, les deux joueurs progressent ensemble et une session terminée ne peut pas recevoir de nouvelles réponses.

## État de livraison — 2026-10-12
- [x] Relancer le déploiement Cloudflare après l'erreur transitoire 504 : la tentative relancée a réussi.
- [x] Vérifier le smoke test post-déploiement : accueil, `/demo`, connectivité Neon et protection anonyme de `/api/games/results` validés.
- [ ] Lancer les tests Playwright d'interface de production via le déclenchement manuel prévu, en lecture seule.
- [ ] Confirmer l'application des migrations Neon `005_game_sessions.sql` et `007_rencontre_sessions.sql`.
- [x] Valider le parcours à deux comptes distincts en production via le workflow protégé : [run 38326586838](https://github.com/alilou31/Toto/actions/runs/38326586838).
- **Preuves :** [CI](https://github.com/alilou31/Toto/actions/runs/38255440096), [déploiement](https://github.com/alilou31/Toto/actions/runs/38255439954), [smoke test](https://github.com/alilou31/Toto/actions/runs/38257599484). Détails et limites consignés dans `PRODUCTION_TEST_LOG.md`.



## Vérification anti-doublons et preuves production — 2026-10-12 (mise à jour)

Ce bloc remplace les statuts antérieurs de ce backlog lorsqu'ils se contredisent avec les preuves ci-dessous. Les anciennes entrées sont conservées comme historique ; ne pas reprendre les cases anciennes comme état actuel.

- [x] Vérifier la CI du commit `7b51f4bf27fb1adff424415c57cb345b7e60c3bf` : [run 38266697104](https://github.com/alilou31/Toto/actions/runs/38266697104) — réussie.
- [x] Vérifier le déploiement Cloudflare de ce commit : [run 38266697091](https://github.com/alilou31/Toto/actions/runs/38266697091) — réussi.
- [x] Exécuter Playwright de production après déploiement : [run 38267172805](https://github.com/alilou31/Toto/actions/runs/38267172805) — 18 passés, 0 échoué, 0 ignoré. Fichiers exécutés : `tests/e2e/production-ui.spec.ts` et `tests/e2e/api-json-contract.spec.ts`.
- [x] Contrôler le smoke HTTP/Neon et la protection anonyme de l'API des résultats de jeux dans le même run — réussi.
- [x] Exécuter le parcours métier complet à deux utilisateurs avec des comptes dédiés : [run 38326586838](https://github.com/alilou31/Toto/actions/runs/38326586838), 1 test passé. La preuve est distincte des 18 tests UI/API du run [38267172805](https://github.com/alilou31/Toto/actions/runs/38267172805).
- [ ] Vérifier indépendamment dans Neon l'application des migrations `005_game_sessions.sql` et `007_rencontre_sessions.sql` ; le smoke `/api/db-check` ne confirme que la connectivité.
- [ ] Réconcilier les PR ouvertes #3, #4, #5, #6 et #8 en comparant les différences restantes avec `main` ; éviter toute fusion redondante.
- [ ] Analyser les vulnérabilités npm signalées dans les logs, identifier les paquets et choisir des mises à jour compatibles sans utiliser de mise à jour forcée non évaluée.

**Règle anti-doublon :** avant d'ajouter une page, une API, un test ou une migration, vérifier `FEATURES_INVENTORY.md`, le code existant, les tests E2E et les PR ouvertes. Une fonctionnalité n'est marquée « production validée » que si un rapport récent couvre explicitement le scénario métier visé.


## Authentification sociale — 2026-10-13

- [x] Boutons Google/Facebook avec logos, états de chargement et erreurs explicites sur connexion et inscription.
- [x] Routes OAuth serveur avec état anti-CSRF, PKCE Google, vérification de l’adresse Google et refus de liaison automatique par simple correspondance d’e-mail.
- [x] Tests Playwright d’affichage, consentement 18+/conditions et validation des entrées.
- [ ] Appliquer db/migrations/008_oauth_identities.sql dans Neon avant le premier test OAuth réel.
- [ ] Ajouter les secrets Google/Meta et NEXT_PUBLIC_SITE_URL dans Cloudflare Worker ; enregistrer l’URI de callback dans les consoles fournisseurs.
- [ ] Réaliser les parcours réels Google et Facebook après configuration des identifiants de test.
