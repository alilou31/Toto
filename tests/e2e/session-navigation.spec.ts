import { expect, test } from "@playwright/test";

test.describe("Session et retour navigateur", () => {
  test("un visiteur non connecté doit se connecter avant de modifier son profil", async ({ page }) => {
    await page.route("**/api/profile", async route => {
      await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: "Authentification requise." }) });
    });
    await page.goto("/profil");
    await expect(page.getByRole("heading", { name: "Connectez-vous pour continuer" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Se connecter/i })).toHaveAttribute("href", "/connexion?next=%2Fprofil");
    await expect(page.locator("form.personalize-form")).toHaveCount(0);
    await expect(page.locator(".personalize-aside")).toHaveCount(0);
    await expect(page.getByText("APERÇU DE VOTRE PROFIL")).toHaveCount(0);
  });

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
    await expect(page).toHaveURL(/\/connexion$/);

    // Wait for the login page's client effect to run before typing. Otherwise
    // Playwright can fill controlled inputs before hydration and React can reset them.
    await page.waitForResponse(response => {
      if (!response.url().endsWith("/api/auth/me") || response.request().method() !== "GET") return false;
      const referer = response.request().headers()["referer"] ?? "";
      return new URL(referer).pathname === "/connexion";
    });

    const emailInput = page.getByLabel("Adresse e-mail");
    const passwordInput = page.getByLabel("Mot de passe");
    await emailInput.fill("mike@example.fr");
    await passwordInput.fill("a-valid-password");
    await expect(emailInput).toHaveValue("mike@example.fr");
    await expect(passwordInput).toHaveValue("a-valid-password");
    await page.getByRole("button", { name: /Se connecter/i }).click();
    await expect(page).toHaveURL(/tableau-de-bord$/);
    await page.goBack();
    await expect(page).not.toHaveURL(/connexion/);
  });
});
