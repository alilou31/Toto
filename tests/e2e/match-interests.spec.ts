import { expect, test } from "@playwright/test";

test("Affinités affiche les centres d’intérêt communs et permet de proposer un jeu sur mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route("**/api/matches", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ matches: [{
      match_id: "match-1", conversation_id: "conversation-1", profile_id: "profile-2",
      public_name: "Samira", city: "Lyon", bio: "J’aime découvrir de nouveaux endroits.",
      relationship_intention: "marriage", interests: ["Lecture", "Voyages"],
      favorite_games: ["Énigmes"], hobbies: ["Randonnée"], last_message_at: null, last_message: null
    }] }) });
  });
  await page.route("**/api/profile", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({
      profile: { interests: ["lecture", "Cuisine"], favorite_games: ["Énigmes"], hobbies: ["Randonnée"] }
    }) });
  });
  await page.goto("/matchs");
  const card = page.locator("article.value-card").filter({ has: page.getByRole("heading", { name: "Samira" }) });
  await expect(card.getByRole("heading", { name: "Ce qui vous rapproche" })).toBeVisible();
  await expect(card.getByText("Lecture", { exact: true })).toBeVisible();
  await expect(card.getByText("Énigmes", { exact: true })).toBeVisible();
  await expect(card.getByText("Randonnée", { exact: true })).toBeVisible();
  await expect(card.getByRole("link", { name: /Proposer un jeu/i })).toHaveAttribute("href", "/rencontre");
  const dimensions = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }));
  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport + 1);
});
