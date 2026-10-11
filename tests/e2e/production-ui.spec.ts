import { expect, test } from "@playwright/test";

test.describe("Interface NIKAHYA en production", () => {
  test("la page d'accueil s'affiche et propose les actions principales", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status(), "La page d'accueil doit répondre en HTTP 200").toBe(200);
    await expect(page).toHaveTitle(/NIKAHYA/i);
    await expect(page.locator("main h1").first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Créer mon (compte|profil)/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Se connecter/i }).first()).toBeVisible();
  });

  test("la navigation vers la connexion fonctionne", async ({ page }) => {
    await page.goto("/");
    await page.locator("header").getByRole("link", { name: /Se connecter|Connexion/i }).first().click();
    await expect(page).toHaveURL(/\/connexion$/);
    await expect(page.getByRole("heading", { name: /Votre histoire/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Se connecter/i })).toBeVisible();
  });

  test("le formulaire d'inscription expose ses validations sans créer de compte", async ({ page }) => {
    const response = await page.goto("/inscription");
    expect(response?.status()).toBe(200);
    const email = page.getByLabel("Votre adresse e-mail");
    const password = page.getByLabel("Choisissez un mot de passe");
    await expect(email).toBeVisible();
    await expect(email).toHaveAttribute("required", "");
    await expect(password).toHaveAttribute("required", "");
    await expect(password).toHaveAttribute("minlength", "12");
    await expect(page.getByRole("checkbox")).toHaveCount(2);
    await expect(page.getByRole("checkbox").nth(0)).toHaveAttribute("required", "");
    await expect(page.getByRole("checkbox").nth(1)).toHaveAttribute("required", "");
    // Intentionally do not submit: production data remains untouched.
  });

  test("la page de connexion affiche les champs requis", async ({ page }) => {
    const response = await page.goto("/connexion");
    expect(response?.status()).toBe(200);
    await expect(page.getByLabel("Adresse e-mail")).toHaveAttribute("required", "");
    await expect(page.getByLabel("Mot de passe")).toHaveAttribute("required", "");
    await expect(page.getByRole("button", { name: /Se connecter/i })).toBeVisible();
  });

  test("la démo est accessible", async ({ page }) => {
    const response = await page.goto("/demo");
    expect(response?.status()).toBe(200);
    await expect(page.locator("body")).not.toContainText("404");
  });

  test("la page d'accueil reste utilisable sur un écran mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await expect(page.locator("main h1").first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Créer mon (compte|profil)/i }).first()).toBeVisible();
    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }));
    expect(dimensions.content, "La page ne doit pas déborder horizontalement sur mobile").toBeLessThanOrEqual(dimensions.viewport + 1);
  });
});
