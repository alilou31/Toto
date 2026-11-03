import { expect, test } from "@playwright/test";
import { createVerificationEmail, createVerificationToken, hashVerificationToken, isVerificationToken } from "../../lib/email-verification";

test.describe("Confirmation e-mail sans envoi de message ni création de compte", () => {
  test("jeton cryptographiquement aléatoire, haché en SHA-256 et lien de 24 heures", () => {
    const token = createVerificationToken();
    const another = createVerificationToken();
    expect(isVerificationToken(token)).toBe(true);
    expect(isVerificationToken(another)).toBe(true);
    expect(token).not.toBe(another);
    expect(hashVerificationToken(token)).toMatch(/^[a-f0-9]{64}$/);
    expect(hashVerificationToken(token)).not.toBe(hashVerificationToken(another));
    const mail = createVerificationEmail(token, "https://nakahya.com");
    expect(mail.subject).toContain("NAKAHYA");
    expect(mail.text).toContain(`https://nakahya.com/confirmer-email?token=${token}`);
    expect(mail.html).toContain("24 heures");
    expect(mail.html).not.toContain("mot de passe");
  });

  test("aucune confirmation n'est possible sans jeton", async ({ page }) => {
    const response = await page.goto("/confirmer-email");
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { name: "Confirmez votre adresse e-mail" })).toBeVisible();
    await expect(page.locator(".auth-card [role='alert']")).toContainText("absent");
    await expect(page.getByRole("button", { name: "Confirmer mon adresse" })).toHaveCount(0);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });

  test("refuse un jeton mal formé avant tout accès à Neon", async ({ request }) => {
    const response = await request.post("/api/auth/confirm-email", { data: { token: "invalide" } });
    expect(response.status()).toBe(400);
    expect(response.headers()["cache-control"]).toContain("no-store");
    expect(await response.json()).toMatchObject({ error: "Ce lien de confirmation est invalide ou a expiré." });
  });

  test("une inscription en attente affiche le bon message sans créer de session", async ({ page }) => {
    let sent = 0;
    await page.route("**/api/auth/register", async route => {
      sent++;
      await route.fulfill({
        status: 202, contentType: "application/json",
        body: JSON.stringify({ verificationRequired: true, message: "Si cette adresse peut être utilisée, un e-mail de confirmation sera envoyé." }),
      });
    });
    await page.goto("/inscription");
    await page.getByLabel("Votre adresse e-mail").fill("exemple@example.fr");
    await page.getByLabel("Choisissez un mot de passe").fill("MotdepasseLong123!");
    for (const checkbox of await page.getByRole("checkbox").all()) await checkbox.check();
    await page.getByRole("button", { name: /Créer mon compte/ }).click();
    await expect(page.getByRole("status")).toContainText("Vérifiez votre boîte mail");
    await expect(page).toHaveURL(/\/inscription$/);
    expect(sent).toBe(1);
  });

  test("un scanner ne consomme pas le jeton : confirmation uniquement après clic", async ({ page }) => {
    const token = createVerificationToken();
    let confirmations = 0;
    await page.route("**/api/auth/confirm-email", async route => {
      confirmations++;
      expect(route.request().method()).toBe("POST");
      expect(route.request().postDataJSON()).toEqual({ token });
      await route.fulfill({ status: 400, contentType: "application/json", body: JSON.stringify({ error: "Ce lien de confirmation est invalide ou a expiré." }) });
    });
    await page.goto(`/confirmer-email?token=${token}`);
    await expect(page).toHaveURL(/\/confirmer-email$/);
    expect(confirmations).toBe(0);
    await page.getByRole("button", { name: "Confirmer mon adresse" }).click();
    await expect(page.locator(".auth-card [role='alert']")).toContainText("invalide ou a expiré");
    expect(confirmations).toBe(1);
  });
});
