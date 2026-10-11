import { expect, test } from "@playwright/test";

test.describe("Mini-jeux NIKAHYA", () => {
  test("l'historique des résultats refuse les requêtes sans session", async ({ request }) => {
    const response = await request.get("/api/games/results");
    expect(response.status()).toBe(401);
    expect(await response.json()).toMatchObject({
      error: "Authentification requise.",
    });
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
});
