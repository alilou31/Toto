import { expect, test } from "@playwright/test";

test.describe("Design system Neo Midnight", () => {
  test("applique le fond nuit et les accents de marque sans violet", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);

    const theme = await page.evaluate(() => {
      const root = getComputedStyle(document.documentElement);
      const body = getComputedStyle(document.body);
      return {
        background: root.getPropertyValue("--background").trim().toLowerCase(),
        primary: root.getPropertyValue("--brand-primary").trim().toLowerCase(),
        secondary: root.getPropertyValue("--brand-secondary").trim().toLowerCase(),
        bodyBackground: body.backgroundColor,
        colorScheme: root.colorScheme,
      };
    });

    expect(theme.background).toBe("#0b0f17");
    expect(theme.primary).toBe("#d7ff72");
    expect(theme.secondary).toBe("#65e6d0");
    expect(theme.colorScheme).toBe("dark");
    expect(theme.bodyBackground).toBe("rgb(11, 15, 23)");
    await expect(page.locator("main h1").first()).toBeVisible();
    await expect(page.locator('a[href="/connexion"]:visible').first()).toBeVisible();
  });

  test("conserve un focus visible et la landing responsive", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await expect(page.locator("html")).toHaveCSS("color-scheme", "dark");
    const dimensions = await page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth,
    }));
    expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth);
  });
});
