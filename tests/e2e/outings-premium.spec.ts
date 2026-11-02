import { expect, test } from "@playwright/test";

test.describe("Sorties Premium — contrôles d'accès", () => {
  test("un visiteur ne peut ni lire ni modifier des invitations", async ({ request }) => {
    const checks = [
      await request.get("/api/outings"),
      await request.post("/api/outings", { data: { recipientId: "test", kind: "cafe", city: "Paris", proposedAt: new Date(Date.now() + 86400000).toISOString() } }),
      await request.patch("/api/outings", { data: { id: "00000000-0000-0000-0000-000000000000", status: "accepted" } }),
    ];
    for (const response of checks) {
      expect(response.status()).toBe(401);
      expect(response.headers()["cache-control"]).toContain("no-store");
    }
  });

  test("la page de présentation Premium présente les invitations sans promettre une activation payante", async ({ page }) => {
    await page.goto("/sorties");
    await expect(page.getByRole("heading", { name: "Sorties & invitations" })).toBeVisible();
    await expect(page.getByText("Aucun paiement n’est activé actuellement.")).toBeVisible();
  });
});
