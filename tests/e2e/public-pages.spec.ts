import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  // Keep this French-language suite deterministic while locale negotiation is enabled.
  await page.setExtraHTTPHeaders({ "Accept-Language": "fr-FR,fr;q=0.9" });
});

test.describe("Pages publiques NAKAHYA", () => {
  test("la page d'accueil affiche la marque et les accès principaux", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/NAKAHYA/i);
    await expect(page.getByRole("link", { name: /NAKAHYA/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Créer mon (compte|profil)/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Voir comment ça marche/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Voir comment ça marche/i })).toHaveAttribute("href", "/demo");
  });

  test("la navigation mène au formulaire de connexion", async ({ page }) => {
    await page.goto("/");
    await page.locator("header").getByRole("link", { name: /Se connecter|Connexion/i }).first().click();
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
    await expect(page.getByRole("checkbox")).toHaveCount(3);
    await email.fill("test@example.fr");
    await password.fill("motdepasse123");
    await page.getByRole("checkbox").nth(0).check();
    await page.getByRole("checkbox").nth(1).check();
    await page.getByRole("checkbox").nth(2).check();
    await expect(email).toHaveAttribute("required", "");
    await expect(password).toHaveAttribute("required", "");
    await expect(page.getByRole("checkbox").nth(0)).toHaveAttribute("required", "");
    await expect(page.getByRole("checkbox").nth(1)).toHaveAttribute("required", "");
    await expect(page.getByRole("checkbox").nth(2)).toHaveAttribute("required", "");
    await expect(page.getByRole("button", { name: /Créer mon compte/i })).toBeEnabled();
  });

  test("le formulaire de connexion impose l'adresse e-mail et le mot de passe", async ({ page }) => {
    await page.goto("/connexion");
    await expect(page.getByLabel("Adresse e-mail")).toHaveAttribute("required", "");
    await expect(page.getByLabel("Mot de passe")).toHaveAttribute("required", "");
    await expect(page.getByRole("button", { name: /Se connecter/i })).toBeVisible();
  });

  test("la démo possède ses propres métadonnées SEO et son URL canonique", async ({ page }) => {
    await page.goto("/demo");
    await expect(page).toHaveTitle("Démo NAKAHYA — Découvrez les rencontres en jouant");
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /profils fictifs/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/demo$/);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", /\/demo$/);
  });

  test("le sitemap public exclut les espaces privés et inclut Bons plans", async ({ request }) => {
    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).toContain("/bons-plans");
    expect(sitemap).not.toContain("/messages/");
    expect(sitemap).not.toContain("/cockpit/");
  });

  test("la démo et la page de validation sont accessibles", async ({ page }) => {
    await page.goto("/demo");
    await expect(page.locator("body")).not.toContainText("404");
    await page.goto("/validation");
    await expect(page.locator("body")).not.toContainText("404");
  });
});
