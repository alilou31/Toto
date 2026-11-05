import { expect, test, type Page } from "@playwright/test";

const baseUrl = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";
const userA = { email: process.env.E2E_USER_A_EMAIL, password: process.env.E2E_USER_A_PASSWORD };
const userB = { email: process.env.E2E_USER_B_EMAIL, password: process.env.E2E_USER_B_PASSWORD };

async function signIn(page: Page, user: { email?: string; password?: string }) {
  await page.goto("/connexion");
  await page.getByLabel("Adresse e-mail").fill(user.email!);
  await page.getByLabel("Mot de passe").fill(user.password!);
  await page.getByRole("button", { name: /Se connecter/i }).click();
  await expect(page).toHaveURL(/tableau-de-bord$/, { timeout: 20_000 });
  await expect(page.getByRole("heading", { name: /Bonjour/ })).toBeVisible();
}

async function ownProfileId(page: Page): Promise<string> {
  const response = await page.request.get("/api/profile");
  expect(response.status(), "Le profil connecté doit être accessible").toBe(200);
  const data = await response.json();
  expect(data.profile?.id, "Le profil doit être créé avant le test").toBeTruthy();
  expect(data.profile?.visibility, "Le profil doit être visible pour faire le parcours de rencontre").toBe("visible");
  expect(data.profile?.onboarding_completed, "Le profil doit avoir terminé son onboarding").toBe(true);
  return data.profile.id as string;
}

async function sendInterest(page: Page, targetId: string) {
  await page.goto("/decouvrir");
  const targetCard = page.locator("article.discovery-card").filter({
    has: page.locator(`a[href="/membre/${targetId}"]`),
  });
  await expect(targetCard, `Le profil ${targetId} doit apparaître dans Découvrir`).toBeVisible({ timeout: 15_000 });
  await targetCard.getByRole("button", { name: /Liker/ }).click();
  await expect(page.getByRole("status")).toContainText(/Like envoyé|réciproque|nouveau match/i, { timeout: 15_000 });
}

async function matchConversationId(page: Page, otherProfileId: string): Promise<{ conversationId: string; chatUnlocked: boolean }> {
  const response = await page.request.get("/api/matches");
  expect(response.status()).toBe(200);
  const data = await response.json();
  const match = (data.matches ?? []).find((item: { profile_id: string }) => item.profile_id === otherProfileId);
  expect(match, "Le match réciproque doit exister").toBeTruthy();
  expect(match.conversation_id, "Le match doit avoir une conversation").toBeTruthy();
  expect(typeof match.chat_unlocked, "L'API doit exposer l'état d'accès à la messagerie").toBe("boolean");
  return { conversationId: match.conversation_id as string, chatUnlocked: match.chat_unlocked as boolean };
}

test("parcours complet à deux comptes : découverte, match, défi à 4 questions et messagerie", async ({ browser }) => {
  test.skip(
    !userA.email || !userA.password || !userB.email || !userB.password,
    "Configurez E2E_USER_A_EMAIL, E2E_USER_A_PASSWORD, E2E_USER_B_EMAIL et E2E_USER_B_PASSWORD pour exécuter le parcours réel avec deux comptes.",
  );
  test.skip(userA.email?.toLowerCase() === userB.email?.toLowerCase(), "Les deux comptes E2E doivent être distincts.");
  test.setTimeout(240_000);

  const contextA = await browser.newContext({ baseURL: baseUrl });
  const contextB = await browser.newContext({ baseURL: baseUrl });
  const pageA = await contextA.newPage();
  const pageB = await contextB.newPage();

  try {
    // Two independent browser contexts mean independent cookies and genuine separate sessions.
    await Promise.all([signIn(pageA, userA), signIn(pageB, userB)]);
    const [idA, idB] = await Promise.all([ownProfileId(pageA), ownProfileId(pageB)]);
    expect(idA).not.toBe(idB);

    // Direct profile URLs must obey the same opposite-gender rule as discovery.
    const [profileA, profileB] = await Promise.all([pageA.request.get("/api/profile"), pageB.request.get("/api/profile")]);
    const [dataA, dataB] = await Promise.all([profileA.json(), profileB.json()]);
    expect(["man", "woman"]).toContain(dataA.profile?.gender);
    expect(["man", "woman"]).toContain(dataB.profile?.gender);
    expect(dataA.profile.gender).not.toBe(dataB.profile.gender);
    const directProfileA = await pageB.request.get(`/api/profiles/${idA}`);
    const directProfileB = await pageA.request.get(`/api/profiles/${idB}`);
    expect(directProfileA.status(), "B doit pouvoir consulter le profil opposé de A").toBe(200);
    expect(directProfileB.status(), "A doit pouvoir consulter le profil opposé de B").toBe(200);
    const publicProfile = (await directProfileA.json()).profile;
    expect(publicProfile).not.toHaveProperty("birth_date");
    expect(publicProfile).not.toHaveProperty("birthDate");

    // Mutual interest must create a real persisted match and a conversation.
    await sendInterest(pageA, idB);
    await sendInterest(pageB, idA);
    const [conversationA, conversationB] = await Promise.all([
      matchConversationId(pageA, idB),
      matchConversationId(pageB, idA),
    ]);
    expect(conversationA.conversationId).toBe(conversationB.conversationId);
    expect(conversationA.chatUnlocked).toBe(conversationB.chatUnlocked);

    // A creates a real Neon-backed challenge; B joins using its invitation code.
    await pageA.goto("/cockpit/defis");
    await expect(pageA.getByRole("heading", { name: /Inviter quelqu'un à jouer/i })).toBeVisible();
    await pageA.locator("select").selectOption("enigme");
    await pageA.getByRole("button", { name: /Créer un défi/i }).click();
    const inviteCode = (await pageA.locator(".game-invite-card strong").innerText()).trim();
    expect(inviteCode).toMatch(/^[A-Z0-9]{8}$/);

    await pageB.goto(`/cockpit/defis?code=${inviteCode}`);
    await pageB.getByRole("button", { name: /Rejoindre/i }).click();
    await expect(pageB.locator(".game-challenge-live")).toBeVisible();
    await expect(pageA.locator(".game-play-question")).toBeVisible({ timeout: 15_000 });
    await expect(pageB.locator(".game-play-question")).toBeVisible({ timeout: 15_000 });

    // Both people answer each of the four questions; the server advances only after both answers.
    for (let question = 0; question < 4; question++) {
      await expect(pageA.locator(".game-play-question")).toBeVisible();
      await expect(pageB.locator(".game-play-question")).toBeVisible();
      await pageA.locator(".game-answer-option").nth(question % 4).click();
      await pageA.getByRole("button", { name: /Valider ma réponse/i }).click();
      await expect(pageA.getByText(/Votre réponse est enregistrée|Les deux réponses sont reçues/i)).toBeVisible();

      await pageB.locator(".game-answer-option").nth((question + 1) % 4).click();
      await pageB.getByRole("button", { name: /Valider ma réponse/i }).click();

      if (question < 3) {
        await expect(pageA.locator(".game-play-question")).not.toContainText(
          question === 0 ? "Plus on les partage" : question === 1 ? "On peut la rompre" : "Elle grandit",
          { timeout: 15_000 },
        );
        await expect(pageB.locator(".game-play-question")).toBeVisible({ timeout: 15_000 });
      }
    }
    await expect(pageA.locator(".game-play-result")).toBeVisible({ timeout: 15_000 });
    await expect(pageB.locator(".game-play-result")).toBeVisible({ timeout: 15_000 });

    // Exchange a message in each direction and verify persistence from the other account.
    if (conversationA.chatUnlocked) {
      const firstMessage = `Bonjour ! Petit test de conversation NAKAHYA ${Date.now()}.`;
      await pageA.goto(`/messages/${conversationA.conversationId}`);
      await pageA.getByLabel("Votre message").fill(firstMessage);
      await pageA.getByRole("button", { name: /Envoyer le message/i }).click();
      await expect(pageA.getByText(firstMessage)).toBeVisible();
      await pageB.goto(`/messages/${conversationB.conversationId}`);
      await expect(pageB.getByText(firstMessage)).toBeVisible({ timeout: 15_000 });
      const reply = `Bien reçu, je te réponds ! ${Date.now()}.`;
      await pageB.getByLabel("Votre message").fill(reply);
      await pageB.getByRole("button", { name: /Envoyer le message/i }).click();
      await expect(pageB.getByText(reply)).toBeVisible();
      await pageA.reload();
      await expect(pageA.getByText(reply)).toBeVisible({ timeout: 15_000 });
    } else {
      const readA = await pageA.request.get(`/api/conversations/${conversationA.conversationId}/messages`);
      expect(readA.status()).toBe(403);
      expect((await readA.json()).code).toBe("CHAT_MEMBERSHIP_REQUIRED");
      const sendA = await pageA.request.post(`/api/conversations/${conversationA.conversationId}/messages`, { data: { body: "Ce message ne doit pas être envoyé." } });
      expect(sendA.status()).toBe(403);
      expect((await sendA.json()).code).toBe("CHAT_MEMBERSHIP_REQUIRED");
    }
  } finally {
    await contextA.close();
    await contextB.close();
  }
});
