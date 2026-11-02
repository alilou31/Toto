import { expect, test, type Page } from "@playwright/test";

const a = { email: process.env.E2E_USER_A_EMAIL, password: process.env.E2E_USER_A_PASSWORD };
const b = { email: process.env.E2E_USER_B_EMAIL, password: process.env.E2E_USER_B_PASSWORD };
const live = process.env.ENABLE_OUTINGS_LIVE_E2E === "true";

async function login(page: Page, user: typeof a) {
  await page.goto("/connexion");
  await page.getByLabel("Adresse e-mail").fill(user.email!);
  await page.getByLabel("Mot de passe").fill(user.password!);
  await page.getByRole("button", { name: /Se connecter/i }).click();
  await expect(page).toHaveURL(/tableau-de-bord$/, { timeout: 20_000 });
}
async function profileId(page: Page): Promise<string> {
  const response = await page.request.get("/api/profile");
  expect(response.status()).toBe(200);
  return (await response.json()).profile.id as string;
}
async function invitations(page: Page) {
  const response = await page.request.get("/api/outings");
  expect(response.status()).toBe(200);
  return response.json() as Promise<{ premium: boolean; invitations: Array<{ id: string; status: string }> }>;
}
async function send(page: Page, recipientId: string, suffix: string) {
  return page.request.post("/api/outings", {
    data: { recipientId, kind: "cafe", city: "Paris", note: "Test E2E " + suffix,
      proposedAt: new Date(Date.now() + 48 * 3600000).toISOString() },
  });
}

test("invitations Premium : deux sessions, permissions et transitions persistées", async ({ browser }) => {
  test.skip(!live, "Test live volontaire : ENABLE_OUTINGS_LIVE_E2E=true uniquement après déploiement et habilitation Premium.");
  test.skip(!a.email || !a.password || !b.email || !b.password, "Deux comptes E2E sont requis.");
  test.setTimeout(180_000);
  const ca = await browser.newContext();
  const cb = await browser.newContext();
  try {
    const pa = await ca.newPage(), pb = await cb.newPage();
    await Promise.all([login(pa, a), login(pb, b)]);
    const [idA, idB] = await Promise.all([profileId(pa), profileId(pb)]);
    expect(idA).not.toBe(idB);
    const [stateA, stateB] = await Promise.all([invitations(pa), invitations(pb)]);
    expect(stateA.premium, "Activer Premium manuellement pour A avant ce test").toBe(true);
    expect(Array.isArray(stateB.invitations)).toBe(true);

    const invalid = await send(pa, idA, "self");
    expect(invalid.status()).toBe(400);

    for (const status of ["accepted", "declined", "cancelled"] as const) {
      const response = await send(pa, idB, status + "-" + Date.now());
      expect(response.status(), "Les comptes doivent déjà avoir un match réciproque et aucune invitation en attente").toBe(201);
      const created = (await response.json()).invitation as { id: string };
      const id = created.id;
      const unauthorized = await pa.request.patch("/api/outings", { data: { id, status: "accepted" } });
      expect(unauthorized.status()).toBe(404);
      const wrongActor = await pb.request.patch("/api/outings", { data: { id, status: "cancelled" } });
      expect(wrongActor.status()).toBe(404);
      const duplicate = await send(pa, idB, "duplicate");
      expect(duplicate.status()).toBe(409);
      const actor = status === "cancelled" ? pa : pb;
      const change = await actor.request.patch("/api/outings", { data: { id, status } });
      expect(change.status()).toBe(200);
      const replay = await actor.request.patch("/api/outings", { data: { id, status } });
      expect(replay.status()).toBe(404);
      for (const page of [pa, pb]) {
        const saved = await invitations(page);
        expect(saved.invitations.find(i => i.id === id)?.status).toBe(status);
      }
    }
  } finally {
    await Promise.all([ca.close(), cb.close()]);
  }
});
