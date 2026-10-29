import { expect, test } from "@playwright/test";

test.describe("File de modération — refus sans privilèges", () => {
  test("la file de signalements n'est jamais lisible anonymement", async ({ request }) => {
    for (const status of ["open", "reviewing", "resolved", "dismissed"]) {
      const response = await request.get("/api/moderation/reports?status=" + status);
      expect(response.status()).toBe(403);
      expect(response.headers()["cache-control"]).toContain("no-store");
    }
  });
  test("impossible de modifier anonymement un signalement", async ({ request }) => {
    const response = await request.patch("/api/moderation/reports", {
      data: { reportId: "123e4567-e89b-42d3-a456-426614174000", status: "resolved" },
    });
    expect(response.status()).toBe(403);
    expect(response.headers()["cache-control"]).toContain("no-store");
  });
});
