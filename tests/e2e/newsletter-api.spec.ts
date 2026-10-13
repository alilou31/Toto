import { expect, test } from "@playwright/test";

test.describe("API newsletter — consentement et validation", () => {
  test("refuse une inscription sans consentement explicite", async ({ request }) => {
    const response = await request.post("/api/newsletter", {
      data: { email: "newsletter@example.fr", consent: false, website: "" },
    });
    expect(response.status()).toBe(400);
    expect(await response.json()).toMatchObject({
      error: "Votre accord est nécessaire pour recevoir la newsletter.",
    });
  });

  test("refuse une adresse e-mail invalide", async ({ request }) => {
    const response = await request.post("/api/newsletter", {
      data: { email: "pas-une-adresse", consent: true, website: "" },
    });
    expect(response.status()).toBe(400);
    expect(await response.json()).toMatchObject({
      error: "Veuillez saisir une adresse e-mail valide.",
    });
  });

  test("le honeypot répond sans révéler le traitement anti-spam", async ({ request }) => {
    const response = await request.post("/api/newsletter", {
      data: { email: "bot@example.fr", consent: true, website: "rempli-par-un-bot" },
    });
    expect(response.status()).toBe(200);
    expect(await response.json()).toMatchObject({ ok: true });
  });
});
