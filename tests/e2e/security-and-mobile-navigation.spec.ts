import { expect, test } from "@playwright/test";

test.describe("Protection des API privées sans session", () => {
  const privateReads = [
    { path: "/api/discover", label: "découverte" },
    { path: "/api/profile", label: "profil personnel" },
    { path: "/api/matches", label: "affinités et conversations" },
    { path: "/api/interests", label: "intérêts reçus" },
    { path: "/api/games/results", label: "historique des jeux" },
    { path: "/api/rencontre/sessions", label: "sessions Alchimie" },
  ];

  for (const endpoint of privateReads) {
    test(`refuse la lecture anonyme de l’API ${endpoint.label}`, async ({ request }) => {
      const response = await request.get(endpoint.path);
      expect(response.status(), endpoint.path).toBe(401);
      expect(response.headers()["cache-control"] ?? "").toContain("no-store");
      expect(await response.json()).toMatchObject({ error: expect.any(String) });
    });
  }

  test("refuse la création anonyme d’un intérêt", async ({ request }) => {
    const response = await request.post("/api/interests", {
      data: { recipientId: "profile-for-authorization-test" },
    });
    expect(response.status()).toBe(401);
    expect(await response.json()).toMatchObject({ error: "Authentification requise." });
  });

  test("refuse l’enregistrement anonyme d’un résultat de jeu", async ({ request }) => {
    const response = await request.post("/api/games/results", {
      data: {
        gameId: "enigme",
        score: 1,
        correctAnswers: 1,
        totalQuestions: 1,
        durationSeconds: 10,
      },
    });
    expect(response.status()).toBe(401);
  });

  test("refuse la création anonyme d’une session Alchimie", async ({ request }) => {
    const response = await request.post("/api/rencontre/sessions", {
      data: {
        matchId: "123e4567-e89b-42d3-a456-426614174000",
        gameKey: "logic",
      },
    });
    expect(response.status()).toBe(401);
  });
});

test.describe("Navigation mobile de l’accueil", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
  });

  test("ouvre et ferme le menu avec un état accessible", async ({ page }) => {
    const trigger = page.getByRole("button", { name: "Ouvrir le menu" });
    const navigation = page.getByRole("navigation", { name: "Menu mobile" });

    await expect(trigger).toBeVisible();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(navigation).toBeHidden();

    await trigger.click();
    await expect(page.getByRole("button", { name: "Fermer le menu" })).toHaveAttribute("aria-expanded", "true");
    await expect(navigation).toBeVisible();
    await expect(navigation.getByRole("link", { name: /Le concept/i })).toBeVisible();

    await page.getByRole("button", { name: "Fermer le menu" }).click();
    await expect(navigation).toBeHidden();
    await expect(page.getByRole("button", { name: "Ouvrir le menu" })).toHaveAttribute("aria-expanded", "false");
  });

  test("le menu se ferme avec Échap", async ({ page }) => {
    await page.getByRole("button", { name: "Ouvrir le menu" }).click();
    const navigation = page.getByRole("navigation", { name: "Menu mobile" });
    await expect(navigation).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(navigation).toBeHidden();
    await expect(page.getByRole("button", { name: "Ouvrir le menu" })).toHaveAttribute("aria-expanded", "false");
  });

  test("un lien du menu mobile navigue et referme le menu", async ({ page }) => {
    await page.getByRole("button", { name: "Ouvrir le menu" }).click();
    const navigation = page.getByRole("navigation", { name: "Menu mobile" });
    await navigation.locator('a[href="/connexion"]').click();

    await expect(page).toHaveURL(/\/connexion$/);
    await expect(navigation).toBeHidden();
  });
});
