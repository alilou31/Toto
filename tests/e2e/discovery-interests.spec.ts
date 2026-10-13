import { expect, test } from "@playwright/test";

test("discovery cards show shared and non-shared interests", async ({ page }) => {
  await page.route("**/api/discover", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        profiles: [{
          id: "profile-2",
          public_name: "Sam",
          city: "Lyon",
          bio: "J’aime les conversations qui ont du sens.",
          relationship_intention: "serious",
          interests: ["Randonnée", "Cuisine"],
          favorite_games: ["Échecs"],
          hobbies: ["Lecture"],
          occupation: "Enseignant"
        }]
      })
    });
  });
  await page.route("**/api/profile", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        profile: {
          interests: ["Cuisine"],
          favorite_games: ["Sudoku"],
          hobbies: ["Lecture"]
        }
      })
    });
  });

  await page.goto("/decouvrir");

  await expect(page.getByRole("heading", { name: /La bonne rencontre.*commence par un détail/i })).toBeVisible();
  await expect(page.locator(".discovery-shared")).toContainText("2 points en commun");
  await expect(page.locator(".discovery-tags span.is-shared").filter({ hasText: "Cuisine" })).toBeVisible();
  await expect(page.locator(".discovery-tags span.is-shared").filter({ hasText: "Lecture" })).toBeVisible();
  await expect(page.locator(".discovery-tags span").filter({ hasText: "Randonnée" })).toBeVisible();
  await expect(page.locator(".discovery-tags span").filter({ hasText: "Échecs" })).toBeVisible();
});
