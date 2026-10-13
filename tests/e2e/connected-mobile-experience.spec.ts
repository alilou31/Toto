import { expect, test } from "@playwright/test";

test.describe("Expérience mobile connectée", () => {
  test("les alertes sont accessibles sans exposer de données privées en mode anonyme", async ({ page, request }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/notifications");
    await expect(page.getByRole("heading", { name: /Vos alertes/i })).toBeVisible();
    const response = await request.get("/api/interests");
    expect(response.status()).toBe(401);
  });

  test("la navigation mobile garde Découvrir comme action centrale", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/notifications");
    // Anonymous visitors do not get the connected-only persistent app navigation.
    await expect(page.getByRole("navigation", { name: "Navigation de votre espace" })).toHaveCount(0);
  });
});
