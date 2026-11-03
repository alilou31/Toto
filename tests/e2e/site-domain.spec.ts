import { expect, test } from "@playwright/test";
import { getSiteUrl } from "../../lib/site-origin";

const origin = process.env.PLAYWRIGHT_BASE_URL?.startsWith("https://nakahya.com") ? "https://nakahya.com" : getSiteUrl();

for (const path of ["/", "/demo", "/bons-plans"]) {
  test(`canonical et partage social cohérents : ${path}`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    const canonical = page.locator('link[rel="canonical"]');
    const social = page.locator('meta[property="og:url"]');
    await expect(canonical).toHaveAttribute("href", /.+/);
    await expect(social).toHaveAttribute("content", /.+/);
    expect(new URL(await canonical.getAttribute("href") || "about:blank").href).toBe(new URL(path, origin).href);
    expect(new URL(await social.getAttribute("content") || "about:blank").href).toBe(new URL(path, origin).href);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveCount(1);
  });
}

test("sitemap et robots utilisent la même origine et excluent le privé", async ({ request }) => {
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain(`${origin}/bons-plans`);
  expect(sitemap).not.toContain("workers.dev");
  expect(sitemap).not.toContain("/decouvrir");
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain(`Sitemap: ${origin}/sitemap.xml`);
  expect(robots).toContain("Disallow: /decouvrir");
  expect(robots).toContain("Disallow: /api/");
  const privatePage = await request.get("/decouvrir/immersif");
  expect(privatePage.headers()["x-robots-tag"]).toContain("noindex");
});

test("les données structurées référencent l'origine canonique", async ({ page }) => {
  await page.goto("/");
  const data = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent() || "[]");
  expect(data.filter((entry: { url?: string }) => entry.url).map((entry: { url: string }) => entry.url)).toEqual([origin, origin]);
});
