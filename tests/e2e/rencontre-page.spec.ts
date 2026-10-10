import { expect, test } from "@playwright/test";

test("Mode Rencontre présente les quatre activités et demande une connexion", async ({ page }) => {
  await page.goto("/rencontre");
  await expect(page.getByRole("heading", { name: /Mode Rencontre/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Défi logique" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Duo langues" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Snake challenge" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Défi coopératif" })).toBeVisible();
  await expect(page.getByRole("alert")).toContainText("Connectez-vous");
  await expect(page.getByRole("link", { name: "Se connecter" })).toHaveAttribute("href", "/connexion");
});
