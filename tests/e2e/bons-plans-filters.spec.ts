import { expect, test } from "@playwright/test";

test.describe("Bons plans : découverte et filtres", () => {
  test("recommande selon un choix explicite puis réinitialise tous les filtres sur mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/bons-plans");
    await page.getByRole("combobox", { name: "Votre rendez-vous" }).selectOption("first");
    await expect(page.locator(".bons-plans-card")).toHaveCount(2);
    await expect(page.getByRole("heading", { name: "Un café pour faire connaissance" })).toBeVisible();
    await expect(page.getByText("Des idées simples pour une première rencontre, à votre rythme.")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Imaginer une escapade" })).toHaveCount(0);
    await page.getByRole("combobox", { name: "Budget indicatif" }).selectOption("medium");
    await expect(page.getByRole("status")).toContainText("Aucune idée");
    await page.getByRole("button", { name: "Réinitialiser les choix" }).click();
    await expect(page.locator(".bons-plans-card")).toHaveCount(6);
    await page.getByRole("combobox", { name: "Votre rendez-vous" }).selectOption("shared");
    await expect(page.locator(".bons-plans-card")).toHaveCount(3);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  });

  test("garde le catalogue quand les offres sont indisponibles", async ({ page }) => {
    await page.route("**/api/affiliate-offers", route => route.fulfill({ status: 503, body: "{}" }));
    await page.goto("/bons-plans");
    await expect(page.locator(".bons-plans-card")).toHaveCount(6);
    await expect(page.locator("a[rel~=sponsored]")).toHaveCount(0);
  });

  test("publie des métadonnées propres avec canonical indépendant des paramètres", async ({ page }) => {
    await page.goto("/bons-plans?budget=free");
    await expect(page).toHaveTitle("Idées de rendez-vous et bons plans | NAKAHYA");
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /café, promenade et activités/i);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/bons-plans$/);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", /\/bons-plans$/);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", "Idées de rendez-vous et bons plans");
  });

  test("la mesure serveur est désactivée par défaut", async ({ request }) => {
    const response = await request.post("/api/affiliate-clicks", { data: { ideaId: "cafe" } });
    expect(response.status()).toBe(404);
    expect(response.headers()["cache-control"]).toBe("no-store");
  });

  for (const enabled of [false, true]) {
    test(`mesure des clics ${enabled ? "annoncée et minimale" : "sans émission par défaut"}`, async ({ page }) => {
      const clicks: unknown[] = [];
      await page.route("**/api/affiliate-offers", route => route.fulfill({ json: {
        offers: [{ ideaId: "cafe", partner: "Partenaire test", url: "https://offers.example/cafe", label: "Voir l’offre" }],
        ...(enabled ? { clickMeasurementEnabled: true } : {}),
      } }));
      await page.route("**/api/affiliate-clicks", async route => {
        clicks.push(route.request().postDataJSON());
        await route.fulfill({ status: 204 });
      });
      await page.context().route("https://offers.example/**", route => route.fulfill({ body: "Destination de test" }));
      await page.goto("/bons-plans");
      const notice = page.getByText(/Les clics sur les liens affiliés sont comptés/i);
      if (enabled) await expect(notice).toBeVisible();
      else await expect(notice).toHaveCount(0);
      const measured = enabled ? page.waitForRequest("**/api/affiliate-clicks") : undefined;
      const popupOpened = page.waitForEvent("popup");
      await page.getByRole("link", { name: "Voir l’offre" }).click();
      const popup = await popupOpened;
      await popup.waitForLoadState();
      if (measured) await measured;
      expect(clicks).toEqual(enabled ? [{ ideaId: "cafe" }] : []);
      await expect(popup).toHaveURL("https://offers.example/cafe");
      await popup.close();
    });
  }

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
    await expect(page.getByText(/aucun tarif, disponibilité ou réservation n’est garanti/i)).toBeVisible();
    await expect(page.locator("a[rel*=sponsored]")).toHaveCount(0);
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

  test("les offres partenaires validées affichent un lien commercial identifiable", async ({ page }) => {
    await page.route("**/api/affiliate-offers", async route => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ offers: [{ ideaId: "cafe", partner: "Partenaire test", url: "https://example.com/activity", label: "Voir l’offre" }] }) }));
    await page.goto("/bons-plans");
    const link = page.getByRole("link", { name: /Voir l’offre/i });
    await expect(link).toBeVisible();
    await expect(page.getByText("Lien affilié · Partenaire test")).toBeVisible();
    await expect(link).toHaveAttribute("rel", /sponsored/);
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("referrerpolicy", "no-referrer");
  });

});

