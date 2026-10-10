import { test, expect } from "@playwright/test";

test("discovery API rejects requests without a session", async ({ request }) => {
  const response = await request.get("/api/discover");
  expect(response.status()).toBe(401);
  expect(await response.json()).toMatchObject({ error: "Authentification requise." });
});
