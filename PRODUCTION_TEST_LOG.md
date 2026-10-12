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

### PROD-2026-10-12-08 — Smoke post-déploiement ignoré et réduction des doublons
- **Date/heure :** 2026-10-12, workflow terminé à 12:29:45 UTC.
- **Commit concerné :** `b9c61d9b6839fa402eeaede435d700d8eadd1629`.
- **Déploiement Cloudflare :** **PASSÉ** — [run 38249302872](https://github.com/alilou31/Toto/actions/runs/38249302872).
- **Smoke post-déploiement :** **NON EXÉCUTÉ** — [run 38249376116](https://github.com/alilou31/Toto/actions/runs/38249376116), les deux jobs ont été ignorés. La cause exacte de cette condition ignorée n'est pas établie par les métadonnées consultées ; ne pas interpréter ce run comme un test passé.
- **Correction appliquée dans le workflow :** après un déploiement, conserver le smoke test léger (accueil, démo, Neon et refus d'accès anonyme). Le Playwright de production ne se relance plus à chaque déploiement ; il reste planifié quotidiennement et disponible manuellement. La CI continue d'exécuter les tests Playwright sur le code.
- **Écritures en production :** aucune ; ces contrôles sont en lecture seule.
- **Suite :** vérifier le prochain run déclenché par le déploiement de cette correction et confirmer que le job smoke s'exécute. Le test UI de production reste couvert par le run quotidien/manuellement déclenché.

### PROD-2026-10-12-07 — Smoke tests après les mises à jour de suivi
- **Date/heure :** 2026-10-12, workflow terminé à 12:25:46 UTC.
- **Commit testé par la CI et les smoke tests :** `20e08c6fc7ddebc3b135fc4a14739be9359936d6`.
- **CI :** **PASSÉE** — [run 38248707710](https://github.com/alilou31/Toto/actions/runs/38248707710). Cette CI couvre notamment les quatre nouveaux cas négatifs ajoutés à `tests/e2e/auth-api.spec.ts`.
- **Smoke tests production :** **PASSÉS** — [run 38248829645](https://github.com/alilou31/Toto/actions/runs/38248829645), en lecture seule.
- **Déploiement Cloudflare de ce commit :** **EN COURS au dernier contrôle** — [run 38248707672](https://github.com/alilou31/Toto/actions/runs/38248707672). Les smoke tests attestent le comportement de l'instance de production testée, mais ne prouvent pas que ce commit était déjà déployé.
- **Runs intermédiaires annulés :** la CI et le déploiement du commit `a3d40b8` ont été annulés à cause des commits suivants ; ne pas les traiter comme des échecs de test. Le commit plus récent `20e08c6` a une CI verte.
- **Aucune écriture métier en production** n'a été déclenchée.
- **Suite :** vérifier le résultat du déploiement `38248707672`; après succès, vérifier un smoke post-déploiement. Le parcours E2E à deux comptes et l'état des migrations Neon `005`/`007` restent non confirmés.

### PROD-2026-10-12-06 — Nouveau smoke test de production en lecture seule
- **Date/heure :** 2026-10-12, workflow démarré à 12:20:41 UTC et terminé à 12:21:54 UTC.
- **Preuve :** [smoke tests 38248441636](https://github.com/alilou31/Toto/actions/runs/38248441636).
- **Résultat :** **PASSÉ** — les deux jobs ont réussi : accueil Cloudflare, page de démo, connectivité Neon, contrôle d'authentification de l'historique des jeux et tests Playwright UI en lecture seule.
- **Limite :** ce workflow a vérifié la production servie au moment de l'exécution. Le déploiement du commit de documentation `b1221d6` n'était pas confirmé comme terminé au moment du contrôle ; ne pas attribuer ce résultat au nouveau commit de tests `a3d40b8`.
- **Aucune écriture métier en production** n'a été déclenchée.
- **Suite :** attendre la CI et le déploiement du commit de tests `a3d40b8`, puis vérifier un smoke test post-déploiement. Le parcours à deux comptes et les migrations Neon `005`/`007` restent non validés indépendamment.

### PROD-2026-10-12-05 — Smoke tests en lecture seule pendant le déploiement du commit de documentation
- **Date/heure :** 2026-10-12, workflow démarré à 12:16:44 UTC et terminé à 12:18:01 UTC.
- **Commit de `main` à ce moment :** `0df719579122ceccf8acb20c6696cdd52131b89a` (mise à jour du backlog avec la preuve smoke précédente).
- **Preuve :** [smoke tests 38248030239](https://github.com/alilou31/Toto/actions/runs/38248030239).
- **Résultat :** **PASSÉ** — les contrôles en lecture seule ont réussi : accueil Cloudflare, page de démo, connectivité Neon, historique des jeux protégé et tests UI Playwright.
- **Limite de rattachement :** au moment de ce contrôle, le workflow de déploiement du commit `0df71957` ([run 38247749566](https://github.com/alilou31/Toto/actions/runs/38247749566)) n'était pas terminé. Ce résultat valide les assertions sur la production effectivement servie à cet instant, mais ne prouve pas que le commit `0df71957` était déjà déployé.
- **CI sur ce commit :** **PASSÉE** — [run 38247750058](https://github.com/alilou31/Toto/actions/runs/38247750058).
- **Aucune écriture métier en production** n'a été déclenchée.
- **Suite :** vérifier la fin du déploiement, puis exécuter/consulter un smoke test post-déploiement avant d'affirmer que `0df71957` est en production. Garder les migrations Neon et le parcours E2E à deux comptes comme points ouverts.

### PROD-2026-10-12-04 — Smoke tests confirmés après le déploiement Cloudflare
- **Date/heure :** 2026-10-12 à 12:11:17 UTC (démarrage du workflow)
- **Commit déployé testé :** `1bdb5a456994aef3719a9eaad6e64c33c1fa2399`
- **Déploiement préalable :** [run 38246981763](https://github.com/alilou31/Toto/actions/runs/38246981763) terminé avec succès à 12:11:15 UTC.
- **Résultat :** **PASSÉ** — [smoke tests 38247451465](https://github.com/alilou31/Toto/actions/runs/38247451465). Les étapes vérifiées ont toutes réussi : accueil, démo, connectivité Neon, protection de l'historique des jeux et tests UI Playwright en lecture seule.
- **Portée :** confirme les vérifications non destructives de la version déployée sur ce commit ; ne valide pas le parcours E2E à deux utilisateurs ni l'application des migrations `005` et `007` dans Neon.
- **Suite :** surveiller le déploiement des commits de documentation postérieurs et garder les limites ci-dessus ouvertes.

### PROD-2026-10-12-03 — CI, déploiement Cloudflare et smoke tests après documentation
- **Date/heure de référence :** 2026-10-12, entre 12:06 et 12:11 UTC
- **Commit :** `1bdb5a456994aef3719a9eaad6e64c33c1fa2399`
- **Environnement :** GitHub Actions / Cloudflare Workers / Neon
- **CI :** **PASSÉ** — [run 38246981835](https://github.com/alilou31/Toto/actions/runs/38246981835) ; tests Playwright navigateur, tests unitaires, lint, build Next.js et build Worker réussis.
- **Déploiement :** **PASSÉ** — [run 38246981763](https://github.com/alilou31/Toto/actions/runs/38246981763), terminé avec succès à 12:11 UTC.
- **Smoke tests production :** **PASSÉ pour les assertions exécutées** — [run 38247137335](https://github.com/alilou31/Toto/actions/runs/38247137335) : accueil, page de démonstration, connectivité Neon, protection de l'historique des jeux et tests UI Playwright en lecture seule.
- **Réserve importante :** ce run a démarré avant la fin du déploiement ; cette limite a ensuite été levée pour le commit `1bdb5a456994aef3719a9eaad6e64c33c1fa2399` par l'entrée `PROD-2026-10-12-04` ci-dessus.
- **Aucune écriture métier en production n'a été déclenchée** par ces vérifications.
- **Suite :** confirmer la version réellement servie après le déploiement, puis valider les migrations Neon et le parcours à deux comptes seulement avec le garde-fou d'autorisation requis.

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
