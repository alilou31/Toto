import { expect, test } from "@playwright/test";

test("un membre connecté peut se déconnecter depuis la navigation persistante", async ({ page }) => {
  let signedIn = true;
  await page.route("**/api/auth/me", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ user: signedIn ? { id: "user-logout", email: "logout@example.fr" } : null }) });
  });
  await page.route("**/api/profile", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ profile: { public_name: "Camille", birth_date: "1990-01-01", visibility: "visible", onboarding_completed: true } }) });
  });
  await page.route("**/api/auth/logout", async (route) => {
    expect(route.request().method()).toBe("POST");
    signedIn = false;
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/tableau-de-bord");
  await expect(page.getByRole("heading", { name: "Bonjour, Camille." })).toBeVisible();
  await page.getByRole("button", { name: "Ouvrir le menu du compte" }).click();
  const logout = page.getByRole("button", { name: "Se déconnecter" });
  await expect(logout).toBeVisible();
  await logout.click();
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("link", { name: "Se connecter" }).first()).toBeVisible();
});
