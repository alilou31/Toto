import { expect, test } from "@playwright/test";

const conversationId = "11111111-1111-4111-8111-111111111111";

test.describe("Messagerie — médias et emojis", () => {
  test("insère un emoji et envoie un message texte dans la conversation existante", async ({ page }) => {
    await page.route(`**/api/conversations/${conversationId}/messages`, async route => {
      if (route.request().method() === "GET") {
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ messages: [], currentUserId: "user-a" }) });
        return;
      }
      const payload = route.request().postDataJSON();
      await route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ message: { id: "22222222-2222-4222-8222-222222222222", sender_id: "user-a", body: payload.body, created_at: new Date().toISOString(), read_at: null, message_type: "text" } }) });
    });

    await page.goto(`/messages/${conversationId}`);
    await page.getByRole("button", { name: "Insérer un emoji" }).click();
    await page.getByRole("button", { name: "Ajouter ❤️" }).click();
    await expect(page.getByLabel("Votre message")).toHaveValue("❤️");
    await page.getByLabel("Votre message").fill("Bonjour ❤️");
    await page.getByRole("button", { name: "Envoyer", exact: true }).click();
    await expect(page.getByText("Bonjour ❤️")).toBeVisible();
  });

  test("sélectionne et envoie une photo via l'API de pièces jointes", async ({ page }) => {
    await page.route(`**/api/conversations/${conversationId}/messages`, async route => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ messages: [], currentUserId: "user-a" }) });
    });
    await page.route(`**/api/conversations/${conversationId}/attachments`, async route => {
      await route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ message: { id: "33333333-3333-4333-8333-333333333333", sender_id: "user-a", body: "Photo envoyée", created_at: new Date().toISOString(), read_at: null, message_type: "image", attachment_name: "photo.png", attachment_mime_type: "image/png" } }) });
    });

    await page.goto(`/messages/${conversationId}`);
    await page.locator('input[type="file"][accept*="image/png"]').setInputFiles({ name: "photo.png", mimeType: "image/png", buffer: Buffer.from("fake-image") });
    await expect(page.getByAltText("photo.png")).toBeVisible();
    await expect(page.getByRole("button", { name: "Ajouter une vidéo" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Ajouter un fichier audio" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Enregistrer un message vocal" })).toBeVisible();
  });
});
