import { expect, test } from "@playwright/test";

test.describe("Connexion sociale Google et Facebook", () => {
  test("affiche les deux boutons de connexion sur la page de connexion", async ({ page }) => {
    await page.goto("/connexion");
    await expect(page.getByRole("button", { name: "Google" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Facebook" })).toBeVisible();
  });

  test("demande les consentements avant l’inscription sociale", async ({ page }) => {
    await page.goto("/inscription");
    const google = page.getByRole("button", { name: "Google" });
    const facebook = page.getByRole("button", { name: "Facebook" });
    await expect(google).toBeVisible();
    await expect(facebook).toBeVisible();
    await expect(google).toBeDisabled();
    await expect(facebook).toBeDisabled();
    await page.getByRole("checkbox").nth(0).check();
    await page.getByRole("checkbox").nth(1).check();
    await page.getByRole("checkbox").nth(2).check();
    await expect(google).toBeEnabled();
    await expect(facebook).toBeEnabled();
  });

  test("refuse un fournisseur OAuth inconnu", async ({ request }) => {
    const response = await request.post("/api/auth/oauth/start", { data: { provider: "unknown", mode: "login" } });
    expect(response.status()).toBe(400);
  });

  test("refuse l’inscription sociale sans consentements", async ({ request }) => {
    const response = await request.post("/api/auth/oauth/start", {
      data: { provider: "google", mode: "signup", ageConfirmed: false, acceptedTerms: false, acceptedPrivacy: false },
    });
    expect(response.status()).toBe(400);
  });
});
