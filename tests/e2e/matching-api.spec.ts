import { expect, test } from "@playwright/test";

test("blocks API rejects unauthenticated reads", async ({ request }) => {
  const response = await request.get("/api/blocks");
  expect(response.status()).toBe(401);
});

test("blocks API rejects unauthenticated writes", async ({ request }) => {
  const response = await request.post("/api/blocks", { data: { blockedUserId: "00000000-0000-0000-0000-000000000001" } });
  expect(response.status()).toBe(401);
});

test("blocks API rejects unauthenticated deletes", async ({ request }) => {
  const response = await request.delete("/api/blocks", { data: { blockedUserId: "00000000-0000-0000-0000-000000000001" } });
  expect(response.status()).toBe(401);
});

test("interests API rejects unauthenticated requests", async ({ request }) => {
  const response = await request.post("/api/interests", { data: { recipientId: "00000000-0000-0000-0000-000000000001" } });
  expect(response.status()).toBe(401);
});

test("matches API rejects unauthenticated requests", async ({ request }) => {
  const response = await request.get("/api/matches");
  expect(response.status()).toBe(401);
});
