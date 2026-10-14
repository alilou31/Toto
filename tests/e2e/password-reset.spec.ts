import { expect, test } from "@playwright/test";

test.describe("Récupération du mot de passe", () => {
  test.beforeEach(async ({ page }) => {
    await page.setExtraHTTPHeaders({ "Accept-Language": "fr-FR,fr;q=0.9" });
  });
  test("la page propose une demande de lien sécurisée", async ({ page }) => {
    await page.goto("/reinitialiser-mot-de-passe");
    await expect(page.getByRole("heading", { name: /Retrouvons le chemin/i })).toBeVisible();
    await expect(page.getByLabel("Adresse e-mail")).toHaveAttribute("type", "email");
    await expect(page.getByRole("button", { name: /Recevoir un lien sécurisé/i })).toBeVisible();
    await expect(page.getByLabel("Adresse e-mail")).toHaveAttribute("required", "");
  });

  test("le formulaire de nouveau mot de passe exige au moins 12 caractères", async ({ page }) => {
    await page.goto("/reinitialiser-mot-de-passe?token=abcdefghijklmnopqrstuvwxyz_123456");
    await expect(page.getByRole("heading", { name: /Un nouveau départ/i })).toBeVisible();
    await expect(page.getByLabel("Nouveau mot de passe")).toHaveAttribute("minlength", "12");
    await expect(page.getByLabel("Confirmer le mot de passe")).toHaveAttribute("required", "");
    await expect(page.getByRole("button", { name: /Modifier mon mot de passe/i })).toBeVisible();
  });

  test("refuse un e-mail invalide sans demander de lien", async ({ request }) => {
    const response = await request.post("/api/auth/password-reset", { data: { email: "adresse-invalide" } });
    expect(response.status()).toBe(400);
    expect(await response.json()).toMatchObject({ error: "Veuillez saisir une adresse e-mail valide." });
    expect(response.headers()["cache-control"]).toContain("no-store");
  });

  test("refuse un jeton de confirmation mal formé sans accéder à la base", async ({ request }) => {
    const response = await request.post("/api/auth/password-reset/confirm", {
      data: { token: "not-a-valid-token", password: "motdepasseassezlong" },
    });
    expect(response.status()).toBe(400);
    expect(await response.json()).toMatchObject({
      error: "Ce lien est invalide ou a expiré. Demandez un nouveau lien.",
    });
    expect(response.headers()["cache-control"]).toContain("no-store");
  });

  test("refuse un mot de passe trop court avant tout accès à la base", async ({ request }) => {
    const response = await request.post("/api/auth/password-reset/confirm", {
      data: { token: "abcdefghijklmnopqrstuvwxyz_123456", password: "court" },
    });
    expect(response.status()).toBe(400);
    expect(await response.json()).toMatchObject({
      error: "Le mot de passe doit contenir entre 12 et 256 caractères.",
    });
  });
});
