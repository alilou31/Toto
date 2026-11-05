import { expect, test } from "@playwright/test";

test.describe("Retour d'abonnement", () => {
  test("affiche un état d'attente sans attribuer les droits Premium/Élite", async ({ page }) => {
    await page.goto("/abonnement/succes?session_id=cs_test_placeholder");
    await expect(page.getByRole("heading", { name: "Merci, vous êtes presque arrivé." })).toBeVisible();
    await expect(page.getByRole("status")).toContainText("Vérification en attente");
    await expect(page.getByText(/ne sont pas activés par cette page seule/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /Retourner à mon espace/i })).toHaveAttribute("href", "/tableau-de-bord");
  });

  test("ne présente pas un retour sans session comme un paiement confirmé", async ({ page }) => {
    await page.goto("/abonnement/succes");
    await expect(page.getByRole("status")).toContainText("Vérification en attente");
    await expect(page.getByText(/seul le serveur NAKAHYA peut confirmer/i)).toBeVisible();
  });
});
