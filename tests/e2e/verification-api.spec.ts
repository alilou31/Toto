import { expect, test } from "@playwright/test";

test.describe("Vérification automatique — protection des routes", () => {
  test("la création d'une session d'identité exige une session utilisateur", async ({ request }) => {
    const response = await request.post("/api/verification/automatic");
    expect(response.status()).toBe(401);
    expect(response.headers()["cache-control"]).toContain("no-store");
  });

  test("le webhook Stripe Identity refuse une signature absente", async ({ request }) => {
    const response = await request.post("/api/webhooks/stripe-identity", {
      data: { type: "identity.verification_session.verified" },
    });
    expect(response.status()).toBe(400);
    expect(await response.json()).toMatchObject({ error: "Webhook non configuré." });
  });
});
