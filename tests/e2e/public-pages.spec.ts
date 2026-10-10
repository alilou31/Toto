import { expect, test } from "@playwright/test";

test.describe("Pages publiques NIKAHYA", () => {
  test("la page d'accueil affiche la marque et les accès principaux", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/NIKAHYA/i);
    await expect(page.getByRole("link", { name: /Créer mon profil/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Essayer la démo/i }).first()).toBeVisible();
  });

  test("la navigation mène au formulaire de connexion", async ({ page }) => {
    await page.goto("/");
    await page.locator("header").getByRole("link", { name: "Connexion" }).click();
    await expect(page).toHaveURL(/\/connexion$/);
    await expect(page.getByRole("heading", { name: /Votre histoire/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Se connecter/i })).toBeVisible();
  });

  test("le formulaire d'inscription impose les champs requis et un mot de passe long", async ({ page }) => {
    await page.goto("/inscription");
    const email = page.getByLabel("Votre adresse e-mail");
    const password = page.getByLabel("Choisissez un mot de passe");

    await expect(email).toBeVisible();
    await expect(password).toBeVisible();
    await expect(password).toHaveAttribute("minlength", "12");
    await expect(page.getByRole("checkbox")).toHaveCount(2);
    await email.fill("test@example.fr");
    await password.fill("motdepasse123");
    await page.getByRole("checkbox").nth(0).check();
    await page.getByRole("checkbox").nth(1).check();
    await expect(email).toHaveAttribute("required", "");
    await expect(password).toHaveAttribute("required", "");
    await expect(page.getByRole("checkbox").nth(0)).toHaveAttribute("required", "");
    await expect(page.getByRole("checkbox").nth(1)).toHaveAttribute("required", "");
    await expect(page.getByRole("button", { name: /Créer mon compte/i })).toBeEnabled();
  });

  test("le formulaire de connexion impose l'adresse e-mail et le mot de passe", async ({ page }) => {
    await page.goto("/connexion");
    await expect(page.getByLabel("Adresse e-mail")).toHaveAttribute("required", "");
    await expect(page.getByLabel("Mot de passe")).toHaveAttribute("required", "");
    await expect(page.getByRole("button", { name: /Se connecter/i })).toBeVisible();
  });

  test("la démo et la page de validation sont accessibles", async ({ page }) => {
    await page.goto("/demo");
    await expect(page.locator("body")).not.toContainText("404");
    await page.goto("/validation");
    await expect(page.locator("body")).not.toContainText("404");
  });
});
