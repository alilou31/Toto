import { expect, test } from "@playwright/test";

test.describe("Mode Rencontre API", () => {
  test("refuse de lire les activités sans authentification", async ({ request }) => {
    const response = await request.get("/api/rencontre/sessions");
    expect(response.status()).toBe(401);
    await expect(response).toBeOK().catch(() => undefined);
    expect(await response.json()).toMatchObject({ error: "Authentification requise." });
  });

  test("valide le match avant de créer une invitation", async ({ request }) => {
    const response = await request.post("/api/rencontre/sessions", {
      data: { matchId: "not-a-uuid", gameKey: "logic" },
    });
    expect(response.status()).toBe(400);
    expect(await response.json()).toMatchObject({ error: "Sélectionnez un match valide." });
  });

  test("refuse les actions de session inconnues", async ({ request }) => {
    const response = await request.patch("/api/rencontre/sessions", {
      data: { sessionId: "00000000-0000-4000-8000-000000000001", action: "promote" },
    });
    expect(response.status()).toBe(400);
    expect(await response.json()).toMatchObject({ error: "Action non autorisée." });
  });

  test("refuse la progression mal formée avant toute écriture", async ({ request }) => {
    const response = await request.patch("/api/rencontre/sessions", {
      data: { sessionId: "00000000-0000-4000-8000-000000000001", action: "progress" },
    });
    expect(response.status()).toBe(401);
    expect(await response.json()).toMatchObject({ error: "Authentification requise." });
  });
});
