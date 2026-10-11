import { expect, test } from "@playwright/test";

test.describe("Session et retour navigateur", () => {
  test("une session active redirige la page connexion vers le tableau de bord", async ({ page }) => {
    await page.route("**/api/auth/me", async route => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ user: { id: "user-1", email: "mike@example.fr" } }) });
    });
    await page.route("**/api/profile", async route => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ profile: { public_name: "Mike", visibility: "visible", onboarding_completed: true, birth_date: "1990-01-01" } }) });
    });
    await page.goto("/connexion");
    await expect(page).toHaveURL(/tableau-de-bord$/);
    await expect(page.getByRole("heading", { name: "Bonjour, Mike." })).toBeVisible();
  });

  test("après connexion, le bouton Retour ne ramène pas au formulaire de connexion", async ({ page }) => {
    let signedIn = false;
    await page.route("**/api/auth/me", async route => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ user: signedIn ? { id: "user-1", email: "mike@example.fr" } : null })
      });
    });
    await page.route("**/api/auth/login", async route => {
      signedIn = true;
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
    });
    await page.route("**/api/profile", async route => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ profile: { public_name: "Mike", visibility: "visible", onboarding_completed: true, birth_date: "1990-01-01" } }) });
    });
    await page.goto("/");
    await page.getByRole("link", { name: "Se connecter" }).first().click();
    await page.getByLabel("Adresse e-mail").fill("mike@example.fr");
    await page.getByLabel("Mot de passe").fill("a-valid-password");
    await page.getByRole("button", { name: /Se connecter/i }).click();
    await expect(page).toHaveURL(/tableau-de-bord$/);
    await page.goBack();
    await expect(page).not.toHaveURL(/connexion/);
  });
});
