import { expect, test } from "@playwright/test";

test("interests API rejects unauthenticated requests", async ({ request }) => {
  const response = await request.post("/api/interests", { data: { recipientId: "00000000-0000-0000-0000-000000000001" } });
  expect(response.status()).toBe(401);
});

test("matches API rejects unauthenticated requests", async ({ request }) => {
  const response = await request.get("/api/matches");
  expect(response.status()).toBe(401);
});
