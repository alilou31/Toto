import { expect, test } from "@playwright/test";

test.describe("Mini-jeux NIKAHYA", () => {
  test("l'historique des résultats refuse les requêtes sans session", async ({ request }) => {
    const response = await request.get("/api/games/results");
    expect(response.status()).toBe(401);
    expect(await response.json()).toMatchObject({
      error: "Authentification requise.",
    });
  });

  test("les filtres du catalogue affichent uniquement les jeux correspondants", async ({ page }) => {
    await page.goto("/cockpit/jeux");
    await expect(page.locator(".game-catalog-card")).toHaveCount(6);

    await page.getByRole("button", { name: "Coopération" }).click();
    await expect(page.locator(".game-catalog-card")).toHaveCount(2);
    await expect(page.getByRole("heading", { name: "Mots croisés à deux" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "L'énigme partagée" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Coopération" })).toHaveAttribute("aria-pressed", "true");

    await page.getByRole("button", { name: "Défi 1v1" }).click();
    await expect(page.locator(".game-catalog-card")).toHaveCount(2);
    await expect(page.getByRole("heading", { name: "Défi tête-à-tête" })).toBeVisible();

    await page.getByRole("button", { name: "Partie rapide" }).click();
    await expect(page.locator(".game-catalog-card")).toHaveCount(2);
    await expect(page.getByRole("heading", { name: "Sprint de calcul" })).toBeVisible();

    await page.getByRole("button", { name: "Tous les jeux" }).click();
    await expect(page.locator(".game-catalog-card")).toHaveCount(6);
  });

  test("chaque jeu propose une partie jouable", async ({ page }) => {
    for (const id of ["mots-croises", "enigme", "calcul", "personnalite", "duel", "tournoi"]) {
      await page.goto(`/cockpit/jeux/${id}`);
      await expect(page.getByRole("heading", { name: /Prêt·e à jouer/i })).toBeVisible();
      await page.getByRole("button", { name: /Commencer la partie/i }).click();
      await expect(page.getByText(/QUESTION 1 \/ 4/)).toBeVisible();
      await expect(page.locator(".game-answer-option")).toHaveCount(4);
    }
  });

  test("le jeu de personnalité affiche des préférences, pas un faux score", async ({ page }) => {
    await page.route("**/api/games/results", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 401,
          contentType: "application/json",
          body: JSON.stringify({ error: "Connectez-vous pour enregistrer votre résultat." }),
        });
        return;
      }
      await route.continue();
    });

    await page.goto("/cockpit/jeux/personnalite");
    await page.getByRole("button", { name: /Commencer la partie/i }).click();
    for (let i = 0; i < 4; i++) {
      await page.locator(".game-answer-option").nth(i % 4).click();
      await page.getByRole("button", { name: i === 3 ? /Voir mon résultat/i : /Valider et continuer/i }).click();
    }
    await expect(page.locator(".game-result-score strong")).toHaveText("4");
    await expect(page.locator(".game-result-score")).toContainText(/réponses partagées/i);
    await expect(page.locator(".game-result-score")).not.toContainText("%");
    await expect(page.locator(".game-save-error")).toContainText(/Connectez-vous/i);
  });

  test("une partie peut être terminée sans compte et explique pourquoi le score n'est pas enregistré", async ({ page }) => {
    await page.goto("/cockpit/jeux/enigme");
    await page.getByRole("button", { name: /Commencer la partie/i }).click();
    for (let i = 0; i < 4; i++) {
      await page.locator(".game-answer-option").nth(0).click();
      await page.getByRole("button", { name: i === 3 ? /Voir mon résultat/i : /Valider et continuer/i }).click();
    }
    await expect(page.getByRole("heading", { name: /partie est terminée/i })).toBeVisible();
    await expect(page.locator(".game-save-error")).toContainText(/Connectez-vous|Authentification/i);
  });

  test("les endpoints de défis synchronisés refusent les accès sans session", async ({ request }) => {
    const list = await request.get("/api/games/sessions");
    expect(list.status()).toBe(401);
    expect(await list.json()).toMatchObject({ error: "Authentification requise." });

    const create = await request.post("/api/games/sessions", { data: { gameId: "enigme" } });
    expect(create.status()).toBe(401);
    expect(await create.json()).toMatchObject({ error: "Connectez-vous pour créer un défi." });

    const join = await request.post("/api/games/sessions/join", { data: { code: "AB12CD34" } });
    expect(join.status()).toBe(401);
    expect(await join.json()).toMatchObject({ error: "Connectez-vous pour rejoindre un défi." });
  });

  test("la page défis présente création et accès par code", async ({ page }) => {
    await page.goto("/cockpit/defis");
    await expect(page.getByRole("heading", { name: "Inviter quelqu'un à jouer" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Créer un défi/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Rejoindre/i })).toBeVisible();
  });
});
