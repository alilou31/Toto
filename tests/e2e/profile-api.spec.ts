import { expect, test } from "@playwright/test";

test("profile API refuses unauthenticated reads", async ({ request }) => {
  const response = await request.get("/api/profile");
  expect(response.status()).toBe(401);
  expect(await response.json()).toMatchObject({ error: "Authentification requise." });
});

test("profile API refuses unauthenticated updates", async ({ request }) => {
  const response = await request.put("/api/profile", {
    data: {
      publicName: "Test",
      city: "Bordeaux",
      bio: "Profil de test",
      birthDate: "1990-01-01",
      relationshipIntention: "marriage",
    },
  });
  expect(response.status()).toBe(401);
});


test("le profil propose uniquement Homme ou Femme et impose un choix", async ({ page }) => {
  await page.route("**/api/profile", route => route.fulfill({ json: { profile: null } }));
  await page.goto("/profil");
  const gender = page.locator("label").filter({ hasText: "Votre genre" }).locator("select");
  await expect(gender).toBeVisible();
  await expect(gender).toHaveValue("");
  await expect(gender.locator("option")).toHaveText(["Sélectionnez votre genre", "Homme", "Femme"]);
  await expect(gender).toHaveAttribute("required", "");
});
