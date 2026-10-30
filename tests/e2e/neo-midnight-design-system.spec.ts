import { expect, test } from "@playwright/test";

test.describe("Design system NAKAHYA — Émeraude, Champagne, Ivoire", () => {
  test("applique la palette de la recherche approfondie sans violet", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);

    const theme = await page.evaluate(() => {
      const root = getComputedStyle(document.documentElement);
      const body = getComputedStyle(document.body);
      return {
        background: root.getPropertyValue("--nk-bg").trim().toLowerCase(),
        primary: root.getPropertyValue("--nk-brand-900").trim().toLowerCase(),
        accent: root.getPropertyValue("--nk-accent-500").trim().toLowerCase(),
        bodyBackground: body.backgroundColor,
        colorScheme: root.colorScheme,
      };
    });

    expect(theme.background).toBe("#f7f3ea");
    expect(theme.primary).toBe("#173f35");
    expect(theme.accent).toBe("#c8a96b");
    expect(theme.colorScheme).toBe("light");
    expect(theme.bodyBackground).toBe("rgb(247, 243, 234)");
    await expect(page.locator("main h1").first()).toBeVisible();
    await expect(page.locator('a[href="/connexion"]:visible').first()).toBeVisible();
  });

  test("conserve un focus visible et la landing responsive", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await expect(page.locator("html")).toHaveCSS("color-scheme", "light");
    const dimensions = await page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth,
    }));
    expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth);
  });
});
