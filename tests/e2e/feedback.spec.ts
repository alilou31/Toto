import { expect, test } from "@playwright/test";

test.describe("Voice of Customer", () => {
  test("présente un formulaire de retour accessible", async ({ page }) => {
    await page.goto("/avis");
    await expect(page.getByRole("heading", { name: /Une meilleure rencontre commence aussi par vous écouter/i })).toBeVisible();
    await expect(page.getByLabel("Quel sujet souhaitez-vous partager ?")).toBeVisible();
    await expect(page.getByLabel("Votre retour")).toBeVisible();
    await expect(page.getByRole("button", { name: /Envoyer mon retour/i })).toBeDisabled();
  });

  test("refuse un retour sans consentement ou avec un contenu trop court", async ({ request }) => {
    const noConsent = await request.post("/api/feedback", {
      data: { category: "experience", message: "Un retour suffisamment long", consent: false },
    });
    expect(noConsent.status()).toBe(400);
    expect(noConsent.headers()["cache-control"]).toContain("no-store");

    const tooShort = await request.post("/api/feedback", {
      data: { category: "experience", message: "court", consent: true },
    });
    expect(tooShort.status()).toBe(400);
  });

  test("le honeypot absorbe les soumissions automatisées sans écriture", async ({ request }) => {
    const response = await request.post("/api/feedback", {
      data: { category: "experience", message: "contenu bot", consent: true, website: "https://spam.example" },
    });
    expect(response.status()).toBe(202);
    expect(await response.json()).toEqual({ ok: true });
  });

  test("le tableau de bord refuse les visiteurs non authentifiés", async ({ request }) => {
    const response = await request.get("/api/feedback/admin");
    expect(response.status()).toBe(403);
    expect(response.headers()["cache-control"]).toContain("no-store");
  });
});
