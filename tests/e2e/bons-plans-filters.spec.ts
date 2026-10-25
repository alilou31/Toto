import { expect, test } from "@playwright/test";

test.describe("Bons plans : découverte et filtres", () => {
  test("filtre les catégories et les budgets sans annoncer de réservation", async ({ page }) => {
    await page.goto("/bons-plans");
    await expect(page.getByRole("heading", { name: /Les bons plans pour se rapprocher/i })).toBeVisible();
    await page.getByRole("combobox", { name: "Type de sortie" }).selectOption("restaurant");
    await expect(page.getByRole("heading", { name: "Un dîner à deux" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Imaginer une escapade" })).toHaveCount(0);
    await page.getByRole("combobox", { name: "Budget indicatif" }).selectOption("free");
    await expect(page.getByRole("status")).toContainText("Aucune idée");
    await page.getByRole("combobox", { name: "Type de sortie" }).selectOption("activity");
    await expect(page.getByRole("heading", { name: "Une promenade à votre rythme" })).toBeVisible();
    await expect(page.getByText(/aucun partenariat, tarif, disponibilité ou réservation n’est garanti/i)).toBeVisible();
  });
});
