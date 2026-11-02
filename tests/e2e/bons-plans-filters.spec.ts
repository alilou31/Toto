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
  test("mise en page mobile sans débordement et avec cartes stylisées", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/bons-plans");
    const container = page.locator(".bons-plans-page");
    await expect(container).toBeVisible();
    await expect(container).toHaveCSS("padding-left", "18px");
    await expect(page.locator(".bons-plans-card").first()).toHaveCSS("border-radius", "20px");
    await expect(page.locator(".bons-plans-card").first()).toHaveCSS("background-color", "rgb(255, 255, 255)");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(overflow).toBe(false);
  });

});
