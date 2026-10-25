import { expect, test } from "@playwright/test";

test.describe("Bons plans mobile connecté", () => {
  test("le carrousel remplace le lien de menu et permet d’ouvrir toutes les offres", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.route("**/api/auth/me", async (route) => route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ user: { email: "camille@example.test" } }),
    }));
    await page.route("**/api/profile", async (route) => route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ profile: { public_name: "Camille", birth_date: "1995-05-10", onboarding_completed: true, visibility: "visible" } }),
    }));
    await page.route("**/api/interests", async (route) => route.fulfill({
      status: 200, contentType: "application/json", body: JSON.stringify({ interests: [] }),
    }));
    await page.route("**/api/rencontre/sessions", async (route) => route.fulfill({
      status: 200, contentType: "application/json", body: JSON.stringify({ sessions: [] }),
    }));
    await page.route("**/api/presence", async (route) => route.fulfill({ status: 200, contentType: "application/json", body: "{}" }));

    await page.goto("/tableau-de-bord");
    await expect(page.getByRole("heading", { name: /Bonjour, Camille/i })).toBeVisible();

    const mobileNavigation = page.getByRole("navigation", { name: "Navigation de votre espace" });
    await expect(mobileNavigation.getByRole("link", { name: "Bons plans" })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Les bons plans du moment" })).toBeVisible();
    const allOffersLink = page.getByRole("link", { name: /Toutes les offres/i });
    await expect(allOffersLink).toBeVisible();
    await allOffersLink.click();

    await expect(page).toHaveURL(/\/bons-plans$/);
    await expect(page.getByRole("heading", { name: /Les bons plans pour se rapprocher/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Un café pour faire connaissance/i })).toBeVisible();
    await expect(page.getByText(/aucun partenariat, tarif, disponibilité ou réservation n’est garanti/i)).toBeVisible();
  });
});
