import { expect, test } from "@playwright/test";

test.describe("Découverte compacte et offres", () => {
  test("affiche plusieurs profils compacts et permet d’ouvrir une fiche complète", async ({ page }) => {
    await page.route("**/api/discover", async route => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ profiles: [
          { id: "amina", public_name: "Amina", city: "Lyon", bio: "J’aime les énigmes et les voyages.", relationship_intention: "serious", interests: ["Voyages", "Cuisine"], favorite_games: ["Énigmes"], hobbies: ["Lecture"] },
          { id: "sarah", public_name: "Sarah", city: "Bordeaux", bio: "Je cherche une relation sincère.", relationship_intention: "marriage", interests: ["Lecture"], favorite_games: ["Calcul"], hobbies: ["Randonnée"] }
        ] }),
      });
    });
    await page.route("**/api/profile", async route => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ profile: { interests: ["Lecture"], favorite_games: ["Énigmes"], hobbies: [] } }),
      });
    });
    await page.route("**/api/profiles/amina", async route => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ profile: {
          id: "amina", public_name: "Amina", city: "Lyon", bio: "J’aime les énigmes et les voyages.",
          relationship_intention: "serious", interests: ["Voyages", "Cuisine"], favorite_games: ["Énigmes"],
          hobbies: ["Lecture"], played_games: [{ game_id: "enigme", games_played: 3 }]
        } }),
      });
    });

    await page.goto("/decouvrir");
    await expect(page.locator(".discovery-card")).toHaveCount(2);
    await expect(page.locator(".discovery-card h2").filter({ hasText: "Amina" })).toBeVisible();
    await expect(page.locator(".discovery-card h2").filter({ hasText: "Sarah" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Bloquer Amina" })).toBeVisible();
    await page.getByRole("link", { name: "Voir la fiche de Amina" }).click();
    await expect(page).toHaveURL(/\/membre\/amina$/);
    await expect(page.getByRole("heading", { name: /Jeux auxquels cette personne a joué/i })).toBeVisible();
    await expect(page.getByText("3 parties")).toBeVisible();
  });

  test("présente les formules sans simuler un paiement non configuré", async ({ page }) => {
    await page.goto("/offres");
    await expect(page.getByRole("heading", { name: "Essentiel" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Premium" })).toBeVisible();
    await expect(page.getByText("9,99 €")).toBeVisible();
    await expect(page.getByText("79,99 € / an")).toBeVisible();
    await expect(page.getByRole("button", { name: "Paiement bientôt disponible" })).toBeDisabled();
    await expect(page.getByText(/aucun prélèvement n’est possible/i)).toBeVisible();
  });
});
