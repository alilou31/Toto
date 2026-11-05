import { expect, test, type Page } from "@playwright/test";

const profiles = [
  { id: "amina", public_name: "Amina", city: "Lyon", birth_date: "1995-01-01", bio: "J’aime les énigmes.", relationship_intention: "serious", photo_url: "https://photos.example/amina.jpg" },
  { id: "sarah", public_name: "Sarah", city: "Bordeaux", birth_date: "1990-01-01", bio: "Une relation sincère.", relationship_intention: "marriage" },
];

// All member data and writes are intercepted, also against production.
async function setup(page: Page) {
  // Keep analytics consent deterministic; these tests exercise discovery, not the consent banner.
  await page.addInitScript(() => window.localStorage.setItem("nakahya-analytics-consent", "denied"));
  await page.route("**/api/auth/me", route => route.fulfill({ json: { user: { email: "fixture@example.test" } } }));
  await page.route("**/api/profile", route => route.fulfill({ json: { profile: { onboarding_completed: true } } }));
  await page.route("**/api/rencontre/sessions", route => route.fulfill({ json: { sessions: [] } }));
  await page.route("**/api/presence", route => route.fulfill({ json: {} }));
  await page.route("**/api/discover**", route => route.fulfill({ json: { profiles } }));
  await page.route("**/api/profiles/*", route => route.fulfill({ json: { profile: { ...profiles.find(p => route.request().url().includes(p.id)), played_games: [] } } }));
  await page.route("**/api/interests", route => route.fulfill({ json: { interests: [], matched: false } }));
  await page.route("https://photos.example/**", route => route.fulfill({ status: 404, body: "No photo" }));
}

for (const viewport of [{ width: 1280, height: 900 }, { width: 390, height: 844 }]) {
  test.describe(`Découverte immersive ${viewport.width}px`, () => {
    test.use({ viewport });
    test.beforeEach(async ({ page }) => setup(page));

    test("le bouton central connecté ouvre l'immersion, Passer n'envoie rien", async ({ page }) => {
      const writes: string[] = [];
      page.on("request", r => { if (r.method() === "POST" && r.url().includes("/api/interests")) writes.push(r.postData() || ""); });
      await page.goto("/decouvrir");
      const central = page.getByRole("navigation", { name: "Navigation de votre espace" }).getByRole("link", { name: "Découverte immersive" });
      await expect(central).toHaveAttribute("href", "/decouvrir/immersif");
      await central.click();
      await expect(page.getByRole("heading", { name: "Amina", exact: true })).toBeVisible();
      await expect(page.locator(".immersive-profile")).toContainText("31 ans");
      await expect(central).toHaveAttribute("aria-current", "page");
      await expect(page.getByRole("button", { name: "Passer ce profil" })).toHaveCSS("color", "rgb(185, 28, 28)");
      await expect(page.getByRole("button", { name: "Liker Amina" })).toHaveCSS("background-color", "rgb(21, 128, 61)");
      await page.getByRole("button", { name: "Passer ce profil" }).click();
      await expect(page.getByRole("heading", { name: "Sarah", exact: true })).toBeVisible();
      expect(writes).toEqual([]);
      await expect(page.getByRole("img", { name: "Photo indisponible" })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    });

    test("Liker utilise l'API existante et bloque les actions pendant l'envoi", async ({ page }) => {
      let release: () => void = () => {};
      const pending = new Promise<void>(resolve => { release = resolve; });
      const calls: unknown[] = [];
      await page.route("**/api/interests", async route => {
        if (route.request().method() !== "POST") return route.fulfill({ json: { interests: [] } });
        calls.push(route.request().postDataJSON());
        await pending;
        await route.fulfill({ json: { matched: true } });
      });
      await page.goto("/decouvrir/immersif");
      const like = page.getByRole("button", { name: "Liker Amina" });
      await like.focus();
      await page.keyboard.press("Enter");
      await expect(like).toBeDisabled();
      await expect(page.getByRole("button", { name: "Passer ce profil" })).toBeDisabled();
      await expect.poll(() => calls).toEqual([{ recipientId: "amina" }]);
      release();
      await expect(page.getByRole("heading", { name: "Sarah", exact: true })).toBeVisible();
      await expect(page.locator(".discovery-notice[role=status]")).toContainText("C’est réciproque");
      expect(calls).toHaveLength(1);
    });

    test("fiche complète et retours conservent la position puis ouvrent la grille", async ({ page }) => {
      await page.goto("/decouvrir/immersif");
      await page.getByRole("button", { name: "Passer ce profil" }).click();
      await page.getByRole("link", { name: "Consulter le profil complet" }).click();
      await expect(page.getByRole("heading", { name: "Sarah." })).toBeVisible();
      await page.goBack();
      await expect(page.getByRole("heading", { name: "Sarah", exact: true })).toBeVisible();
      await page.getByRole("link", { name: "Consulter le profil complet" }).click();
      await page.getByRole("link", { name: "Retour aux profils" }).click();
      await expect(page).toHaveURL(/\/decouvrir\/immersif\?position=1$/);
      await expect(page.getByRole("heading", { name: "Sarah", exact: true })).toBeVisible();
      await page.getByRole("link", { name: "Vue profils", exact: true }).click();
      await expect(page).toHaveURL(/\/decouvrir$/);
      await expect(page.locator(".discovery-feed")).toHaveCSS("display", "grid");
      await expect(page.locator(".discovery-card")).toHaveCount(2);
    });

    test("une erreur de like conserve le profil et permet de réessayer", async ({ page }) => {
      let attempts = 0;
      await page.route("**/api/interests", route => {
        if (route.request().method() !== "POST") return route.fulfill({ json: { interests: [] } });
        return ++attempts === 1 ? route.fulfill({ status: 503, json: { error: "Intérêt indisponible." } }) : route.fulfill({ json: { matched: false } });
      });
      await page.goto("/decouvrir/immersif");
      await page.getByRole("button", { name: "Liker Amina" }).click();
      await expect(page.locator(".discovery-notice[role=alert]")).toContainText("Intérêt indisponible.");
      await expect(page.getByRole("heading", { name: "Amina", exact: true })).toBeVisible();
      await page.getByRole("button", { name: "Liker Amina" }).click();
      await expect(page.getByRole("heading", { name: "Sarah", exact: true })).toBeVisible();
    });

    test("une réponse de like tardive ne modifie pas la fiche ouverte entre-temps", async ({ page }) => {
      let release: () => void = () => {};
      const pending = new Promise<void>(resolve => { release = resolve; });
      await page.route("**/api/interests", async route => {
        if (route.request().method() !== "POST") return route.fulfill({ json: { interests: [] } });
        await pending;
        await route.fulfill({ json: { matched: false } });
      });
      await page.goto("/decouvrir/immersif");
      await page.getByRole("button", { name: "Liker Amina" }).click();
      await expect(page.getByRole("button", { name: "Liker Amina" })).toBeDisabled();
      await page.getByRole("link", { name: "Consulter le profil complet" }).click();
      await expect(page.getByRole("heading", { name: "Amina." })).toBeVisible();
      const url = page.url();
      const response = page.waitForResponse(r => r.url().endsWith("/api/interests") && r.request().method() === "POST");
      release();
      await response;
      // Round-trip through the UI after the response, not a fixed timeout.
      await page.getByRole("link", { name: "Continuer la découverte" }).focus();
      await expect(page).toHaveURL(url);
    });

    test("fin de liste et reprise des profils sans écriture", async ({ page }) => {
      await page.goto("/decouvrir/immersif");
      await page.getByRole("button", { name: "Passer ce profil" }).click();
      await page.getByRole("button", { name: "Passer ce profil" }).click();
      await expect(page.getByRole("heading", { name: "Vous avez parcouru tous les profils" })).toBeVisible();
      await page.getByRole("button", { name: "Revoir les profils" }).click();
      await expect(page.getByRole("heading", { name: "Amina", exact: true })).toBeVisible();
    });
  });
}

test("chargement, erreur serveur et réessai sans faux écran vide", async ({ page }) => {
  await setup(page);
  let release: () => void = () => {};
  const pending = new Promise<void>(resolve => { release = resolve; });
  let attempts = 0;
  await page.route("**/api/discover**", async route => {
    if (++attempts === 1) { await pending; return route.fulfill({ status: 503, body: "Service unavailable" }); }
    return route.fulfill({ json: { profiles: [] } });
  });
  await page.goto("/decouvrir/immersif");
  await expect(page.locator(".discovery-state[role=status]")).toContainText("Chargement des profils");
  release();
  await expect(page.locator(".discovery-state[role=alert]")).toContainText("Impossible de charger les profils.");
  await page.getByRole("button", { name: "Réessayer" }).click();
  await expect(page.getByRole("heading", { name: "De nouvelles rencontres bientôt" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Revoir les profils" })).toHaveCount(0);
});

test("session absente : données privées refusées et connexion proposée", async ({ page, request }) => {
  await page.route("**/api/auth/me", route => route.fulfill({ json: { user: null } }));
  await page.route("**/api/discover**", route => route.fulfill({ status: 401, json: { error: "Authentification requise." } }));
  await page.goto("/decouvrir/immersif");
  await expect(page.getByRole("link", { name: "Se connecter", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /Liker/ })).toHaveCount(0);
  expect((await request.get("/api/discover")).status()).toBe(401);
});

test("photo grand format avec alternative accessible", async ({ page }) => {
  await setup(page);
  await page.route("https://photos.example/**", route => route.fulfill({ contentType: "image/svg+xml", body: '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="green"/></svg>' }));
  await page.goto("/decouvrir/immersif");
  const photo = page.getByRole("img", { name: "Portrait de Amina" });
  await expect(photo).toBeVisible();
  await expect(photo).toHaveCSS("object-fit", "cover");
});
