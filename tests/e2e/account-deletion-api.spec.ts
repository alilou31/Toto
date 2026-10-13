import { expect, test } from "@playwright/test";

test.describe("Suppression de compte — garde-fous API sans écriture", () => {
  test("refuse un JSON mal formé", async ({ request }) => {
    const response = await request.delete("/api/account", {
      data: "{",
      headers: { "content-type": "application/json" },
    });

    expect(response.status()).toBe(400);
    expect(await response.json()).toMatchObject({ error: "Requête invalide." });
    expect(response.headers()["cache-control"]).toContain("no-store");
  });

  test("exige le mot de passe et la confirmation explicite", async ({ request }) => {
    const response = await request.delete("/api/account", {
      data: { password: "", confirmation: "SUPPRIMER" },
    });

    expect(response.status()).toBe(400);
    expect(await response.json()).toMatchObject({
      error: "Saisissez votre mot de passe et tapez SUPPRIMER pour confirmer.",
    });
  });

  test("refuse une suppression sans session, même si le corps est complet", async ({ request }) => {
    const response = await request.delete("/api/account", {
      data: { password: "mot-de-passe-de-test-non-reel", confirmation: "SUPPRIMER" },
    });

    expect(response.status()).toBe(401);
    expect(await response.json()).toMatchObject({
      error: "Votre session a expiré. Reconnectez-vous.",
    });
    expect(response.headers()["cache-control"]).toContain("no-store");
  });
});
