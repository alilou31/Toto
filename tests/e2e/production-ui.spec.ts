import { expect, test } from "@playwright/test";

test.describe("Interface NIKAHYA en production", () => {
  test("la page d'accueil s'affiche et propose les actions principales", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status(), "La page d'accueil doit répondre en HTTP 200").toBe(200);
    await expect(page).toHaveTitle(/NIKAHYA/i);
    await expect(page.locator("main h1").first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Créer mon (compte|profil)/i }).first()).toBeVisible();
    await expect(page.locator('a[href="/connexion"]').first()).toBeVisible();
  });

  test("la navigation vers la connexion fonctionne", async ({ page }) => {
    await page.goto("/");
    // The homepage hero exposes a visible login link even when header actions
    // are hidden by responsive CSS. Select the first visible login link anywhere.
    const visibleLoginLink = page.locator('a[href="/connexion"]:visible').first();
    await expect(visibleLoginLink).toBeVisible();
    await visibleLoginLink.click();
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
    await expect(page.getByRole("checkbox")).toHaveCount(3);
    await expect(page.getByRole("checkbox").nth(0)).toHaveAttribute("required", "");
    await expect(page.getByRole("checkbox").nth(1)).toHaveAttribute("required", "");
    await expect(page.getByRole("checkbox").nth(2)).toHaveAttribute("required", "");
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

  test("la page d'accueil et le menu hamburger restent utilisables sur mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await expect(page.locator("main h1").first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Créer mon (compte|profil)/i }).first()).toBeVisible();

    const menuButton = page.getByRole("button", { name: "Ouvrir le menu" });
    await expect(menuButton).toBeVisible();
    await menuButton.click();
    const mobileNavigation = page.getByRole("navigation", { name: "Menu mobile" });
    await expect(mobileNavigation).toBeVisible();
    await expect(mobileNavigation.getByRole("link", { name: "Le concept" })).toBeVisible();
    await mobileNavigation.getByRole("link", { name: "Le concept" }).click();
    await expect(page).toHaveURL(/#concept$/);
    await expect(page.getByRole("button", { name: "Ouvrir le menu" })).toBeVisible();
    await page.getByRole("button", { name: "Ouvrir le menu" }).click();
    await expect(page.getByRole("navigation", { name: "Menu mobile" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("navigation", { name: "Menu mobile" })).toBeHidden();

    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }));
    expect(dimensions.content, "La page ne doit pas déborder horizontalement sur mobile").toBeLessThanOrEqual(dimensions.viewport + 1);
  });

  test("l'API de signalement valide les données et exige une session", async ({ request }) => {
    const invalid = await request.post("/api/reports", {
      data: { reportedUserId: "", category: "unknown", details: "" },
    });
    expect(invalid.status()).toBe(400);

    const unauthenticated = await request.post("/api/reports", {
      data: { reportedUserId: "profile-id", category: "other", details: "" },
    });
    expect(unauthenticated.status()).toBe(401);
  });
});


test("les pages légales sont accessibles mais exclues de l'index tant qu'elles sont provisoires", async ({ page }) => {
  for (const path of ["/mentions-legales", "/confidentialite", "/conditions"]) {
    const response = await page.goto(path);
    expect(response?.status(), path + " doit répondre en HTTP 200").toBe(200);
    await expect(page.getByRole("note")).toContainText(/document de travail|maquette juridique/i);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  }
});
