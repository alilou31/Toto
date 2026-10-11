# Parcours E2E réel à deux utilisateurs

Le test `tests/e2e/two-user-full-journey.spec.ts` utilise deux contextes Playwright séparés et des comptes existants sur l'environnement indiqué par `PLAYWRIGHT_BASE_URL`. Il ne crée pas de comptes et ne supprime aucune donnée.

## Secrets GitHub Actions requis

Configurer dans **Settings → Secrets and variables → Actions → Repository secrets** :

- `E2E_USER_A_EMAIL`
- `E2E_USER_A_PASSWORD`
- `E2E_USER_B_EMAIL`
- `E2E_USER_B_PASSWORD`

Les deux comptes doivent être différents, adultes, avec un profil complété et réglé sur **Visible**. Ils doivent être autorisés à se découvrir mutuellement. Ne jamais placer les mots de passe dans le dépôt ou dans un message.

## Exécution locale ou contre la production

```bash
PLAYWRIGHT_BASE_URL=https://nikahya.rassoul-ali.workers.dev \
E2E_USER_A_EMAIL=... E2E_USER_A_PASSWORD=... \
E2E_USER_B_EMAIL=... E2E_USER_B_PASSWORD=... \
npx playwright test tests/e2e/two-user-full-journey.spec.ts
```

Le scénario vérifie la connexion des deux comptes, la découverte mutuelle, le match et l'identifiant de conversation partagé, l'invitation/rejoint d'un défi d'énigmes, les quatre tours répondus par les deux comptes, puis l'envoi et la relecture persistée de messages dans les deux sens.

Sans les quatre variables d'environnement, le test est volontairement ignoré et **ne doit pas être présenté comme une validation réelle des données Neon**.
