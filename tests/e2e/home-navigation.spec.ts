import { expect, test } from "@playwright/test";

test("homepage makes sign-in and account creation obvious", async ({ page }) => {
  await page.route("**/api/auth/me", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ user: null }) });
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const header = page.locator("header.site-header");
  await expect(page.getByRole("link", { name: "Créer mon compte" }).first()).toHaveAttribute("href", "/inscription");
  await expect(page.getByRole("link", { name: "Se connecter" }).first()).toHaveAttribute("href", "/connexion");
  await expect(header.getByRole("button", { name: "Ouvrir le menu" })).toBeVisible();
  await header.getByRole("button", { name: "Ouvrir le menu" }).click();
  const menu = page.getByRole("navigation", { name: "Menu mobile" });
  await expect(menu).toBeVisible();
  await expect(menu.getByRole("link", { name: "Se connecter" })).toHaveAttribute("href", "/connexion");
  await expect(menu.getByRole("link", { name: /Créer mon compte/ })).toHaveAttribute("href", "/inscription");
  await menu.getByRole("link", { name: "Se connecter" }).click();
  await expect(page).toHaveURL(/\/connexion$/);
});

test("signed-in users can open the dashboard from the mobile menu", async ({ page }) => {
  await page.route("**/api/auth/me", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ user: { id: "user-1", email: "test@example.fr" } }) });
  });
  await page.route("**/api/profile", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ profile: {
      public_name: "Camille",
      city: "Bordeaux",
      bio: "Présentation de test",
      relationship_intention: "marriage",
      birth_date: "1990-01-01",
      visibility: "hidden",
      onboarding_completed: true
    } }) });
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const header = page.locator("header.site-header");
  await header.getByRole("button", { name: "Ouvrir le menu" }).click();
  const menu = page.getByRole("navigation", { name: "Menu mobile" });
  await expect(menu.getByRole("link", { name: "Mon espace" })).toBeVisible();
  await menu.getByRole("link", { name: "Mon espace" }).click();
  await expect(page).toHaveURL(/\/tableau-de-bord$/);
  await expect(page.getByRole("heading", { name: "Bonjour, Camille." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Mon profil" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: /Découvrir des profils/ })).toBeVisible();
});

test("dashboard redirects visitors to sign-in", async ({ page }) => {
  await page.route("**/api/auth/me", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ user: null }) });
  });
  await page.goto("/tableau-de-bord");
  await expect(page).toHaveURL(/\/connexion\?next=\/tableau-de-bord$/);
});
