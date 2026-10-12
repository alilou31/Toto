# Registre des tests de production — NIKAHYA

> **Référence obligatoire pour les futurs tests de production.** Consulter ce fichier avant un test, puis ajouter une entrée datée après chaque exécution, qu'elle réussisse ou échoue.
>
> Application de production : https://nikahya.rassoul-ali.workers.dev/  
> Dépôt : https://github.com/alilou31/Toto  
> Hébergement attendu : Cloudflare Workers ; base : Neon.

## Règles de tenue du registre

1. **Ne jamais remplacer l'historique** : ajouter les nouveaux résultats en tête de la section « Historique des exécutions ».
2. Distinguer clairement **PASSÉ**, **ÉCHEC**, **BLOQUÉ**, **NON EXÉCUTÉ** et **DÉCLARÉ PAR L'UTILISATEUR**.
3. Ne déclarer un test passé que si une exécution et son résultat sont effectivement consultables. Une CI verte ne prouve pas qu'un scénario manuel a été joué.
4. Pour chaque exécution, noter au minimum : date/heure (UTC si possible), commit SHA, environnement/URL, scénario, résultat, preuve/lien, anomalies et suite à donner.
5. Ne jamais consigner de mots de passe, cookies, jetons, chaînes de connexion, données personnelles réelles ou autres secrets. Utiliser des identifiants de test anonymisés (Utilisateur A/B).
6. Ne pas lancer de tests qui créent/modifient des données de production, ni de parcours E2E avec comptes dédiés, sans autorisation explicite préalable. Respecter les garde-fous des workflows.
7. Après chaque changement déployé, vérifier d'abord le commit réellement en production, puis les smoke tests et les scénarios concernés. En cas d'échec, enregistrer l'échec avant de corriger et ajouter ensuite une nouvelle entrée.
8. Quand une preuve n'est plus accessible, conserver le lien historique mais indiquer que la preuve n'a pas été revalidée.

## État de référence connu

- Dernier commit de `main` connu lors de la création de ce registre : `41039868292e4d6152ed6c43de9bc994685b9f7e`.
- URL de production attendue : https://nikahya.rassoul-ali.workers.dev/
- Le parcours Playwright à deux utilisateurs existe dans `tests/e2e/two-user-full-journey.spec.ts`. Son exécution dépend de quatre secrets de comptes de test (`E2E_USER_A_EMAIL`, `E2E_USER_A_PASSWORD`, `E2E_USER_B_EMAIL`, `E2E_USER_B_PASSWORD`). Ne pas exposer leurs valeurs.
- Le workflow manuel `.github/workflows/connected-user-journey.yml` est protégé : branche `main`, confirmation `confirm_production_test=yes` et comptes dédiés. Il peut créer des données en production ; ne pas le déclencher sans accord explicite.
- La présence de migrations SQL dans le dépôt ne confirme pas qu'elles ont été appliquées à Neon. Notamment, la confirmation en base des migrations `005_game_sessions.sql` et `007_rencontre_sessions.sql` reste à obtenir.
- L'historique ci-dessous ne prétend pas certifier des tests dont les journaux complets n'ont pas été inspectés. Les statuts « rapporté » sont volontairement séparés des résultats d'exécution vérifiés.

## Historique des exécutions

### PROD-2026-10-12-01 — Statut CI / déploiement / smoke tests connu
- **Date de référence :** 2026-10-12 (heure exacte non disponible)
- **Commit :** `41039868292e4d6152ed6c43de9bc994685b9f7e`
- **Environnement :** GitHub Actions / déploiement Cloudflare Workers
- **Résultat rapporté dans l'audit précédent :** PASSÉ
- **Preuves :**
  - CI : https://github.com/alilou31/Toto/actions/runs/38242970527
  - Déploiement Cloudflare : https://github.com/alilou31/Toto/actions/runs/38242970595
  - Smoke tests production : https://github.com/alilou31/Toto/actions/runs/38243438739
- **Portée :** statuts de workflows signalés comme verts pour ce commit.
- **Limite :** les journaux détaillés n'ont pas été réinspectés lors de la création de ce registre ; cette entrée conserve le constat antérieur, sans élargir sa portée.
- **Suite :** consulter les journaux avant de s'appuyer sur le détail des assertions.

### PROD-2026-10-12-02 — Parcours Playwright à deux utilisateurs
- **Date :** 2026-10-12 (heure exacte non disponible)
- **Environnement :** parcours E2E de production, à confirmer
- **Résultat :** **DÉCLARÉ PAR L'UTILISATEUR** — l'utilisateur indique que le contrôle à deux comptes est fait via Playwright.
- **Scénario couvert par le test présent dans le dépôt :** deux sessions indépendantes, profils visibles, intérêt réciproque, match/conversation, défi et messagerie.
- **Preuve du scénario :** `tests/e2e/two-user-full-journey.spec.ts`
- **Limite :** l'exécution effective, le commit exécuté et son rapport Playwright n'ont pas été vérifiés indépendamment lors de la création de ce registre. Ne pas requalifier cette entrée en « PASSÉ vérifié » sans consulter le rapport.
- **Suite :** à la prochaine exécution autorisée, consigner le lien vers le rapport Playwright et le commit testé.

## Scénarios de production à suivre

| ID | Scénario | Fréquence / déclencheur | État de référence |
| --- | --- | --- | --- |
| PROD-SMOKE | Accueil et réponse HTTP de l'application | Après chaque déploiement | Dernier statut vert signalé dans PROD-2026-10-12-01 ; à revalider |
| PROD-DB | Contrôle de disponibilité DB via `/api/db-check`, sans exposer de secret | Après changement DB/configuration | Connexion Neon déjà signalée comme vérifiée historiquement ; à revalider |
| PROD-AUTH | Inscription/connexion/déconnexion et protection des routes privées | Après changement auth | Implémentation présente ; dernier résultat production à consigner |
| PROD-PROFILE | Sauvegarde du profil, intérêts et visibilité | Après changement profil | Dernier résultat production à consigner |
| PROD-DISCOVERY | Découverte : profils visibles/adultes, exclusion de soi et des profils bloqués | Après changement découverte | Dernier résultat production à consigner |
| PROD-MATCH | Intérêt réciproque et unicité du match/conversation | Après changement interactions | Parcours à deux comptes déclaré fait par l'utilisateur ; rapport à rattacher |
| PROD-MSG | Lecture/envoi de messages et refus d'accès hors conversation | Après changement messagerie/sécurité | Dernier résultat production à consigner |
| PROD-BLOCK-REPORT | Blocage et signalement | Après changement confiance/sécurité | Dernier résultat production à consigner |
| PROD-GAMES | Catalogue, session/invitation, participation et réponses | Après changement jeux | Vérifier également l'état des migrations Neon requises |
| PROD-RENCONTRE | Défi partagé réservé aux membres d'un match et sans blocage | Après changement mode Rencontre | Dernier résultat production à consigner |
| PROD-NAV-MOBILE | Menu mobile, retour navigateur, liens tableau de bord/profil | Après changement navigation/UI | Dernier résultat production à consigner |
| PROD-ACCOUNT | Suppression/anonymisation du compte et données associées | Avant ouverture publique et après changement compte | À vérifier ; ne pas exécuter destructivement sans compte de test dédié et autorisation |

## Modèle à copier pour chaque nouveau test

### PROD-AAAA-MM-JJ-NN — Nom du test
- **Date/heure (UTC) :**
- **Commit SHA réellement testé :**
- **URL/environnement :**
- **Déclencheur :** (déploiement, correction, contrôle périodique…)
- **Scénario et préconditions :**
- **Résultat :** PASSÉ / ÉCHEC / BLOQUÉ / NON EXÉCUTÉ / DÉCLARÉ PAR L'UTILISATEUR
- **Preuve :** lien vers le workflow, rapport Playwright ou preuve non sensible
- **Anomalies constatées :**
- **Correctif / ticket / commit lié :**
- **Prochaine action :**

## Journal des anomalies ouvertes à la création

- Confirmer l'état réel des migrations `005_game_sessions.sql` et `007_rencontre_sessions.sql` dans Neon.
- Inspecter les rapports détaillés des workflows référencés plus haut avant d'affirmer la couverture exacte des assertions.
- Vérifier les autorisations négatives sur les routes API et le parcours complet de suppression/anonymisation du compte.
- Le stockage durable et la modération des photos en production ne sont pas considérés comme validés par ce registre.
