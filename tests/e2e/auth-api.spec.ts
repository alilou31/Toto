import { expect, test } from "@playwright/test";

test.describe("API d'authentification — validations sans compte réel", () => {
  test("refuse une inscription avec un e-mail invalide", async ({ request }) => {
    const response = await request.post("/api/auth/register", {
      data: {
        email: "pas-une-adresse",
        password: "MotdepasseLong123!",
        ageConfirmed: true,
        acceptedTerms: true,
      },
    });
    expect(response.status()).toBe(400);
    expect(await response.json()).toMatchObject({
      error: "Veuillez saisir une adresse e-mail valide.",
    });
  });

  test("refuse un mot de passe trop court", async ({ request }) => {
    const response = await request.post("/api/auth/register", {
      data: {
        email: "test@example.fr",
        password: "court",
        ageConfirmed: true,
        acceptedTerms: true,
      },
    });
    expect(response.status()).toBe(400);
    expect(await response.json()).toMatchObject({
      error: "Le mot de passe doit contenir entre 12 et 256 caractères.",
    });
  });

  test("refuse une inscription sans confirmations obligatoires", async ({ request }) => {
    const response = await request.post("/api/auth/register", {
      data: {
        email: "test@example.fr",
        password: "MotdepasseLong123!",
        ageConfirmed: false,
        acceptedTerms: true,
      },
    });
    expect(response.status()).toBe(400);
    expect(await response.json()).toMatchObject({
      error: "Confirmez votre majorité, acceptez les conditions et confirmez la lecture de la politique de confidentialité pour continuer.",
    });
  });

  test("refuse une inscription sans acceptation de la confidentialité", async ({ request }) => {
    const response = await request.post("/api/auth/register", {
      data: { email: "test@example.fr", password: "MotdepasseLong123!", ageConfirmed: true, acceptedTerms: true, acceptedPrivacy: false },
    });
    expect(response.status()).toBe(400);
    expect(await response.json()).toMatchObject({ error: "Confirmez votre majorité, acceptez les conditions et confirmez la lecture de la politique de confidentialité pour continuer." });
  });

  test("refuse un e-mail mal formé à la connexion sans interroger la base", async ({ request }) => {
    const response = await request.post("/api/auth/login", {
      data: { email: "invalide", password: "un-mot-de-passe" },
    });
    expect(response.status()).toBe(401);
    expect(await response.json()).toMatchObject({
      error: "Adresse e-mail ou mot de passe incorrect.",
    });
  });

  test("une session absente est renvoyée comme utilisateur non connecté", async ({ request }) => {
    const response = await request.get("/api/auth/me");
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ user: null });
  });
  
  test("refuse un JSON mal formé à l'inscription", async ({ request }) => {
    const response = await request.post("/api/auth/register", {
      data: "{",
      headers: { "content-type": "application/json" },
    });
    expect(response.status()).toBe(400);
    expect(await response.json()).toMatchObject({ error: "Requête invalide." });
  });

  test("refuse un corps JSON qui n'est pas un objet", async ({ request }) => {
    const response = await request.post("/api/auth/register", {
      data: null,
      headers: { "content-type": "application/json" },
    });
    expect(response.status()).toBe(400);
    expect(await response.json()).toMatchObject({ error: "Requête invalide." });
  });

  test("refuse les champs de connexion d'un type incorrect", async ({ request }) => {
    const response = await request.post("/api/auth/login", {
      data: { email: "test@example.fr", password: 123456789012 },
    });
    expect(response.status()).toBe(401);
    expect(await response.json()).toMatchObject({
      error: "Adresse e-mail ou mot de passe incorrect.",
    });
  });

  test("la réponse de session ne met pas en cache les données utilisateur", async ({ request }) => {
    const response = await request.get("/api/auth/me");
    expect(response.status()).toBe(200);
    expect(response.headers()["cache-control"]).toContain("no-store");
    expect(await response.json()).toEqual({ user: null });
  });

});

test.describe("Autorisation des API privées — sans session", () => {
  test("les lectures privées exigent une session et ne sont pas mises en cache", async ({ request }) => {
    const paths = [
      "/api/profile",
      "/api/matches",
      "/api/interests",
      "/api/blocks",
      "/api/games/sessions",
      "/api/profile-visits",
      "/api/conversations/00000000-0000-0000-0000-000000000000/messages",
    ];

    for (const path of paths) {
      const response = await request.get(path);
      expect(response.status(), "GET " + path + " doit exiger une session").toBe(401);
      expect(response.headers()["cache-control"], "GET " + path + " doit interdire le cache").toContain("no-store");
    }
  });

  test("les écritures privées exigent une session et ne sont pas mises en cache", async ({ request }) => {
    const checks = [
      { method: "post", path: "/api/reports", data: { reportedUserId: "anonymous-test-user", category: "other", details: "" } },
      { method: "post", path: "/api/blocks", data: { blockedUserId: "anonymous-test-user" } },
      { method: "post", path: "/api/interests", data: { recipientId: "anonymous-test-user" } },
      { method: "post", path: "/api/games/sessions", data: { gameId: "mots-croises" } },
      { method: "post", path: "/api/conversations/00000000-0000-0000-0000-000000000000/messages", data: { body: "message de test sans session" } },
      { method: "delete", path: "/api/account", data: { password: "not-a-real-password", confirmation: "SUPPRIMER" } },
    ] as const;

    for (const check of checks) {
      const response = check.method === "delete"
        ? await request.delete(check.path, { data: check.data })
        : await request.post(check.path, { data: check.data });
      expect(response.status(), check.method.toUpperCase() + " " + check.path + " doit exiger une session").toBe(401);
      expect(response.headers()["cache-control"], check.method.toUpperCase() + " " + check.path + " doit interdire le cache").toContain("no-store");
    }
  });
});
