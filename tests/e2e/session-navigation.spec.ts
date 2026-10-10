import { expect, test } from "@playwright/test";

test("homepage shows account navigation when a session exists", async ({ page }) => {
  await page.route("**/api/auth/me", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ user: { id: "user-1" } }) });
  });

  await page.goto("/");
  const header = page.locator("header");
  await expect(header.getByRole("link", { name: "Mon profil" })).toBeVisible();
  await expect(header.getByRole("link", { name: "Découvrir", exact: true })).toBeVisible();
  await expect(header.getByRole("button", { name: "Déconnexion" })).toBeVisible();
  await expect(header.getByRole("link", { name: "Connexion" })).toHaveCount(0);
  await expect(header.getByRole("link", { name: "Créer mon profil" })).toHaveCount(0);
});

test("homepage shows registration and login links without a session", async ({ page }) => {
  await page.route("**/api/auth/me", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ user: null }) });
  });

  await page.goto("/");
  const header = page.locator("header");
  await expect(header.getByRole("link", { name: "Connexion" })).toBeVisible();
  await expect(header.getByRole("link", { name: "Créer mon profil" })).toBeVisible();
  await expect(header.getByRole("link", { name: "Mon profil" })).toHaveCount(0);
});

test("saving a profile confirms success without navigating away", async ({ page }) => {
  await page.route("**/api/profile", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ profile: {
          public_name: "Camille",
          city: "Bordeaux",
          bio: "Une présentation initiale.",
          relationship_intention: "marriage",
          birth_date: "1990-01-01",
          visibility: "hidden",
        } }),
      });
      return;
    }
    if (route.request().method() === "PUT") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ profile: { public_name: "Camille", visibility: "hidden" } }),
      });
      return;
    }
    await route.continue();
  });

  await page.goto("/profil");
  await expect(page.getByLabel("Prénom ou nom public")).toHaveValue("Camille");
  await page.getByLabel("Quelques mots sur vous").fill("Présentation mise à jour.");
  await page.getByRole("button", { name: "Enregistrer mon profil" }).click();

  await expect(page).toHaveURL(/\/profil$/);
  await expect(page.getByRole("status")).toContainText("Profil enregistré et masqué.");
});
