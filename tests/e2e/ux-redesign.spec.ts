import { test, expect } from "@playwright/test";

const publicRoutes = [
  { path: "/", heading: /vous découvrir|rencontre|jouant/i },
  { path: "/connexion", heading: /votre histoire|connectez-vous/i },
  { path: "/inscription", heading: /commençons|faire connaissance/i },
];

const cockpitRoutes = [
  { path: "/cockpit", heading: /découvrir|cockpit|jouer/i },
  { path: "/cockpit/jeux", heading: /jeux|explorer/i },
  { path: "/cockpit/defis", heading: /défis/i },
  { path: "/cockpit/likes", heading: /affinités|likes/i },
  { path: "/cockpit/visites", heading: /profil|visites/i },
  { path: "/cockpit/historique", heading: /chemin|historique|partie/i },
  { path: "/profil", heading: /profil|faire connaissance|mon profil/i },
  { path: "/profil/edit", heading: /profil|faire connaissance|mon profil/i },
];

test.describe("NAKAHYA — pages publiques", () => {
  for (const route of publicRoutes) {
    test(`affiche ${route.path}`, async ({ page }) => {
      const response = await page.goto(route.path);
      expect(response?.status(), `HTTP status for ${route.path}`).toBeLessThan(400);
      await expect(page.locator("body")).toContainText(route.heading);
    });
  }

  test("la connexion présente les champs et liens utiles", async ({ page }) => {
    await page.goto("/connexion");
    await expect(page.getByLabel(/adresse e-mail/i)).toBeVisible();
    await expect(page.getByLabel(/mot de passe/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /connecter|connexion|continuer/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /inscri|créer.*(compte|profil)/i })).toBeVisible();
  });

  test("l'inscription empêche l'envoi sans les champs requis", async ({ page }) => {
    await page.goto("/inscription");
    const email = page.getByLabel(/adresse e-mail/i);
    const password = page.getByLabel(/mot de passe/i);
    await expect(email).toBeVisible();
    await expect(password).toBeVisible();
    await expect(email).toHaveAttribute("type", "email");
    await expect(password).toHaveAttribute("type", "password");
    const form = page.locator("form");
    await expect(form.locator("button[type=submit]")).toBeVisible();
    expect(await form.evaluate((node: HTMLFormElement) => node.checkValidity())).toBe(false);
  });
});

test.describe("NAKAHYA — cockpit et navigation", () => {
  for (const route of cockpitRoutes) {
    test(`ouvre ${route.path} sans erreur HTTP`, async ({ page }) => {
      const response = await page.goto(route.path);
      expect(response?.status(), `HTTP status for ${route.path}`).toBeLessThan(400);
      await expect(page.locator("body")).toContainText(route.heading);
    });
  }

  test("la navigation donne accès aux principales sections du cockpit", async ({ page }) => {
    await page.goto("/cockpit");
    await expect(page.getByRole("navigation", { name: "Navigation principale" }).getByRole("link", { name: "Mon espace" })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Navigation principale" }).getByRole("link", { name: "Découvrir" })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Navigation principale" }).getByRole("link", { name: "Jouer" })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Navigation principale" }).getByRole("link", { name: "Affinités" })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Navigation principale" }).getByRole("link", { name: "Mon profil" })).toBeVisible();
  });

  test("le catalogue ouvre un jeu et expose le parcours de découverte", async ({ page }) => {
    await page.goto("/cockpit/jeux");
    await expect(page.getByText(/mots croisés à deux/i).first()).toBeVisible();
    await expect(page.getByText(/énigme partagée/i).first()).toBeVisible();
    await page.goto("/cockpit/jeux/enigme");
    await expect(page.locator("body")).toContainText(/énigme|indices|ensemble/i);
  });

  test("une route de jeu inconnue retourne une page 404", async ({ page }) => {
    const response = await page.goto("/cockpit/jeux/jeu-inconnu-test");
    expect(response?.status()).toBe(404);
  });

  test("le profil public d'exemple indique clairement les données de démonstration", async ({ page }) => {
    await page.goto("/profil/exemple");
    await expect(page.locator("body")).toContainText(/profil exemple/i);
    await expect(page.locator("body")).toContainText(/données fictives|démonstration/i);
  });
});

test.describe("NAKAHYA — responsive mobile", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test("la landing page n'a pas de débordement horizontal", async ({ page }) => {
    await page.goto("/");
    const sizes = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }));
    expect(sizes.content).toBeLessThanOrEqual(sizes.viewport + 1);
  });

  test("la navigation mobile du cockpit est visible et utilisable", async ({ page }) => {
    await page.goto("/cockpit");
    await expect(page.locator(".game-mobile-nav")).toBeVisible();
    await page.locator(".game-mobile-nav").getByRole("link", { name: /jouer/i }).click();
    await expect(page).toHaveURL(/\/cockpit\/jeux$/);
  });
});

test.describe("Connexion premium — expérience responsive", () => {
  test("présente la promesse produit et un formulaire accessible sur mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.route("**/api/auth/me", async route => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ user: null }) });
    });
    await page.goto("/connexion");
    await expect(page.locator(".auth-story-copy")).toContainText("Moins de swipe.");
    await expect(page.locator(".auth-story-copy")).toContainText("Plus de vrai.");
    await expect(page.getByRole("heading", { name: /Votre histoire.*continue ici/i })).toBeVisible();
    await expect(page.getByLabel(/adresse e-mail/i)).toBeVisible();
    await expect(page.getByLabel(/mot de passe/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /Créer mon profil/i })).toHaveAttribute("href", "/inscription");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(overflow, "la page de connexion ne doit pas déborder horizontalement sur mobile").toBe(false);
  });

  test("conserve la destination demandée après une connexion réussie", async ({ page }) => {
    await page.route("**/api/auth/me", async route => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ user: null }) });
    });
    await page.route("**/api/auth/login", async route => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
    });
    await page.goto("/connexion?next=%2Fcockpit%2Fjeux");
    await page.getByLabel(/adresse e-mail/i).fill("membre@example.fr");
    await page.getByLabel(/mot de passe/i).fill("motdepasse-test");
    await page.getByRole("button", { name: /Se connecter/i }).click();
    await expect(page).toHaveURL(/\/cockpit\/jeux$/);
  });
});
