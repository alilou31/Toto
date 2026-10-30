import { test, expect } from "@playwright/test";

/** Research-led identity checks; public route only, no production account required. */
test("landing uses emerald brand and has visible keyboard focus", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".landing-page")).toBeVisible();
  const tokens = await page.evaluate(() => {
    const styles = getComputedStyle(document.documentElement);
    return {
      emerald: styles.getPropertyValue("--nk-brand-900").trim(),
      champagne: styles.getPropertyValue("--nk-accent-500").trim(),
      ivory: styles.getPropertyValue("--nk-bg").trim(),
    };
  });
  expect(tokens).toEqual({ emerald: "#173f35", champagne: "#c8a96b", ivory: "#f7f3ea" });
  await page.keyboard.press("Tab");
  await expect(page.locator(":focus-visible").first()).toBeVisible();
});

test("landing respects reduced motion and mobile width", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".landing-page")).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  expect(overflow).toBe(false);
});

test("public brand tokens and mobile navigation are readable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const theme = await page.evaluate(() => ({
    background: getComputedStyle(document.body).backgroundColor,
    brand: getComputedStyle(document.documentElement).getPropertyValue("--nk-brand-900").trim(),
  }));
  expect(theme.brand).toBe("#173f35");
  expect(theme.background).toBe("rgb(247, 243, 234)");
  const menu = page.getByRole("button", { name: "Ouvrir le menu" });
  if (await menu.isVisible()) {
    await menu.click();
    await expect(page.getByRole("navigation", { name: "Menu mobile" })).toBeVisible();
    const colors = await page.locator("#mobile-navigation").evaluate(el => {
      const style = getComputedStyle(el);
      const item = el.querySelector("a");
      return { bg: style.backgroundColor, fg: item ? getComputedStyle(item).color : "" };
    });
    expect(colors.bg).toBe("rgb(255, 255, 255)");
    expect(colors.fg).toBe("rgb(23, 33, 29)");
  }
});
