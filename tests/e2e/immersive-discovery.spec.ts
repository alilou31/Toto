import { expect, test } from "@playwright/test";

test.describe("Découverte immersive depuis la navigation", () => {
  test("le bouton central ouvre les profils grand format et Passer ne like pas", async ({ page }) => {
    let interestCalls = 0;
    await page.route("**/api/discover**", route => route.fulfill({
      status: 200, contentType: "application/json",
      body: JSON.stringify({ profiles: [
        { id: "amina", public_name: "Amina", city: "Lyon", bio: "J’aime les énigmes et les voyages.", relationship_intention: "serious", photo_url: "https://example.com/amina.jpg" },
        { id: "sarah", public_name: "Sarah", city: "Bordeaux", bio: "Je cherche une relation sincère.", relationship_intention: "marriage" }
      ] })
    }));
    await page.route("**/api/interests", route => {
      interestCalls += 1;
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ matched: false }) });
    });

    await page.goto("/decouvrir/immersif");
    await expect(page.getByRole("heading", { name: /Une personne à la fois/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Amina" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Passer ce profil" })).toBeVisible();
    await page.getByRole("button", { name: "Passer ce profil" }).click();
    await expect(page.getByRole("heading", { name: "Sarah" })).toBeVisible();
    expect(interestCalls).toBe(0);
  });

  test("le lien grille permet de revenir à la découverte historique", async ({ page }) => {
    await page.route("**/api/discover**", route => route.fulfill({
      status: 200, contentType: "application/json",
      body: JSON.stringify({ profiles: [{ id: "amina", public_name: "Amina", city: "Lyon", bio: "Une bio.", relationship_intention: "serious" }] })
    }));
    await page.goto("/decouvrir/immersif");
    await page.getByRole("link", { name: /Vue profils|Grille des profils/i }).first().click();
    await expect(page).toHaveURL(/\/decouvrir$/);
    await expect(page.locator(".discovery-card")).toHaveCount(1);
  });
});
