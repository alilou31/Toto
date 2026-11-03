import { expect, test } from "@playwright/test";

const official = "https://nakahya.com";
const legacy = "https://nikahya.rassoul-ali.workers.dev";

test("HTTPS officiel disponible avec vérification TLS active", async ({ request }) => {
  const response = await request.get(official + "/", { maxRedirects: 0 });
  expect(response.status()).toBe(200);
  expect(await response.text()).toContain("NAKAHYA");
});

test("HTTP rejoint HTTPS en conservant le chemin et la requête", async ({ request }) => {
  const response = await request.get("http://nakahya.com/bons-plans?migration_check=1", { maxRedirects: 0 });
  expect([301, 308]).toContain(response.status());
  expect(response.headers().location).toBe(official + "/bons-plans?migration_check=1");
  expect((await request.get(response.headers().location, { maxRedirects: 5 })).status()).toBe(200);
});

test("anciens liens HTML redirigés sans boucle et anciennes API conservées", async ({ request }) => {
  const response = await request.get(legacy + "/bons-plans?migration_check=1", { maxRedirects: 0 });
  expect(response.status()).toBe(308);
  expect(response.headers().location).toBe(official + "/bons-plans?migration_check=1");
  expect((await request.get(legacy + "/bons-plans", { maxRedirects: 5 })).url()).toBe(official + "/bons-plans");
  const api = await request.get(legacy + "/api/discover", { maxRedirects: 0 });
  expect(api.status()).toBe(401);
  expect(api.headers().location).toBeUndefined();
  expect(api.headers()["x-robots-tag"]).toContain("noindex");
});

test("déconnexion anonyme : cookie effacé avec protections et sans Domain partagé", async ({ request }) => {
  const response = await request.post(official + "/api/auth/logout");
  expect(response.status()).toBe(200);
  const cookie = response.headers()["set-cookie"];
  expect(cookie).toMatch(/nikahya_session=/);
  expect(cookie).toMatch(/HttpOnly/i);
  expect(cookie).toMatch(/Secure/i);
  expect(cookie).toMatch(/SameSite=Lax/i);
  expect(cookie).not.toMatch(/Domain=/i);
});

test("OAuth refuse une origine externe avant de contacter un fournisseur", async ({ request }) => {
  const response = await request.post(official + "/api/auth/oauth/start", {
    headers: { Origin: "https://untrusted.example" }, data: { provider: "google", mode: "login" },
  });
  expect(response.status()).toBe(403);
});

test("OAuth désactivé ou callback configuré sur le domaine officiel", async ({ request }) => {
  for (const provider of ["google", "facebook"]) {
    const response = await request.post(official + "/api/auth/oauth/start", {
      headers: { Origin: official }, data: { provider, mode: "login" },
    });
    expect([200, 503]).toContain(response.status());
    if (response.status() === 200) {
      const data = await response.json();
      expect(new URL(data.url).searchParams.get("redirect_uri")).toBe(official + "/api/auth/oauth/callback");
      expect(response.headers()["set-cookie"]).toMatch(/HttpOnly/i);
      expect(response.headers()["set-cookie"]).toMatch(/Secure/i);
    }
  }
});
