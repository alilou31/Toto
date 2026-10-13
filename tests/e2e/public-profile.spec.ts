import { expect, test } from "@playwright/test";

test.describe("Fiche publique membre", () => {
  test("la fiche affiche le profil public sans date de naissance ni e-mail", async ({ page }) => {
    await page.route("**/api/profiles/member-2", async route => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ profile: {
        id: "member-2", public_name: "Mike", city: "Bordeaux", bio: "J’aime les énigmes et les échanges sincères.",
        relationship_intention: "marriage", visibility: "visible",
        played_games: [{ game_id: "enigme", games_played: 3 }, { game_id: "calcul", games_played: 1 }]
      } }) });
    });
    await page.goto("/membre/member-2");
    await expect(page.getByRole("heading", { name: "Mike." })).toBeVisible();
    await expect(page.getByText("Bordeaux")).toBeVisible();
    await expect(page.getByText(/échanges sincères/i)).toBeVisible();
    await expect(page.getByText(/1990-01-01|mike@example/i)).toHaveCount(0);
    await expect(page.getByRole("heading", { name: /Jeux auxquels cette personne a joué/i })).toBeVisible();
    await expect(page.getByText("Énigmes")).toBeVisible();
    await expect(page.getByText("3 parties")).toBeVisible();
    await expect(page.getByText("Défis de calcul")).toBeVisible();
  });

  test("un profil indisponible affiche un message clair", async ({ page }) => {
    await page.route("**/api/profiles/hidden-member", async route => {
      await route.fulfill({ status: 404, contentType: "application/json", body: JSON.stringify({ error: "Ce profil n’est pas disponible." }) });
    });
    await page.goto("/membre/hidden-member");
    await expect(page.locator(".auth-notice")).toContainText("Ce profil n’est pas disponible.");
    await expect(page.getByRole("link", { name: "Revenir à la découverte" })).toBeVisible();
  });

  test("la fiche profil publique exige une session", async ({ request }) => {
    const response = await request.get("/api/profiles/member-2");
    expect(response.status()).toBe(401);
  });
});
