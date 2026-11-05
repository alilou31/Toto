# Parcours E2E réel à deux utilisateurs

Le test `tests/e2e/two-user-full-journey.spec.ts` utilise deux contextes Playwright séparés et des comptes existants sur l'environnement indiqué par `PLAYWRIGHT_BASE_URL`. Il ne crée pas de comptes et ne supprime aucune donnée.

## Secrets GitHub Actions requis

Configurer dans **Settings → Secrets and variables → Actions → Repository secrets** :

- `E2E_USER_A_EMAIL`
- `E2E_USER_A_PASSWORD`
- `E2E_USER_B_EMAIL`
- `E2E_USER_B_PASSWORD`

Dans **Settings → Secrets and variables → Actions → Variables**, ajouter aussi `ENABLE_TWO_USER_E2E` avec la valeur `true`. Ensuite, lancer manuellement le workflow **NAKAHYA CI** via **Actions → NAKAHYA CI → Run workflow** pour démarrer le parcours réel sur Cloudflare. Le job échoue explicitement si un des quatre secrets manque.

Les deux comptes doivent être différents, adultes, avec un profil complété et réglé sur **Visible**. Ils doivent être autorisés à se découvrir mutuellement. Ne jamais placer les mots de passe dans le dépôt ou dans un message.

## Exécution locale ou contre la production

```bash
PLAYWRIGHT_BASE_URL=https://nakahya.com \
E2E_USER_A_EMAIL=... E2E_USER_A_PASSWORD=... \
E2E_USER_B_EMAIL=... E2E_USER_B_PASSWORD=... \
npx playwright test tests/e2e/two-user-full-journey.spec.ts
```

Le scénario vérifie la connexion des deux comptes, la découverte mutuelle, le match et l'identifiant de conversation partagé, l'invitation/rejoint d'un défi d'énigmes, les quatre tours répondus par les deux comptes, puis l'envoi et la relecture persistée de messages dans les deux sens.

Sans les quatre variables d'environnement, le test est volontairement ignoré et **ne doit pas être présenté comme une validation réelle des données Neon**.



## Découverte par genre — 2026-11-05

- Chaque profil doit sélectionner obligatoirement Homme (`man`) ou Femme (`woman`). Les anciennes valeurs non conformes sont remises à `NULL` par la migration 022 afin que le membre choisisse lui-même ; aucune valeur n'est attribuée automatiquement.
- L'API `/api/discover` calcule côté serveur le genre opposé à partir du profil connecté. Un profil sans genre valide reçoit HTTP 409 et doit compléter `/profil`.
- Les cartes affichent l'âge calculé à partir de la date de naissance ; la date complète n'est jamais affichée.
- Le bouton central « Découvrir » ouvre la grille `/decouvrir`, pas la vue immersive d'un seul profil.
- Après déploiement, appliquer `db/migrations/022_binary_gender_opposite_discovery.sql` dans Neon, puis vérifier avec deux comptes de genres opposés et un compte sans genre choisi.
