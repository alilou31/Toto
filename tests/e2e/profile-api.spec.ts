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
