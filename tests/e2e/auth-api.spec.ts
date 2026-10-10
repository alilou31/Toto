import { expect, test } from "@playwright/test";

test.describe("API d'authentification — validations sans compte réel", () => {
  test("refuse une inscription avec un e-mail invalide", async ({ request }) => {
    const response = await request.post("/api/auth/register", {
      data: {
        email: "pas-une-adresse",
        password: "MotdepasseLong123",
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
        password: "MotdepasseLong123",
        ageConfirmed: false,
        acceptedTerms: true,
      },
    });
    expect(response.status()).toBe(400);
    expect(await response.json()).toMatchObject({
      error: "Confirmez votre majorité et acceptez les conditions pour continuer.",
    });
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
});
