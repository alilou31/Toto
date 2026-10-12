import { expect, test, type APIRequestContext } from "@playwright/test";

const API_BASE_PATHS = [
  { method: "GET", path: "/api/auth/me" },
  { method: "GET", path: "/api/db-check" },
  { method: "GET", path: "/api/profile" },
  { method: "GET", path: "/api/discover" },
  { method: "GET", path: "/api/matches" },
  { method: "GET", path: "/api/games/results" },
  { method: "GET", path: "/api/games/sessions" },
  { method: "POST", path: "/api/games/sessions", data: { gameId: "enigme" } },
  { method: "POST", path: "/api/games/sessions/join", data: { code: "INVALID1" } },
  { method: "POST", path: "/api/reports", data: { reportedUserId: "", category: "unknown", details: "" } },
] as const;

async function requestEndpoint(request: APIRequestContext, endpoint: (typeof API_BASE_PATHS)[number]) {
  if (endpoint.method === "POST") {
    return request.post(endpoint.path, { data: "data" in endpoint ? endpoint.data : {} });
  }
  return request.get(endpoint.path);
}

async function assertJsonResponse(
  response: Awaited<ReturnType<typeof requestEndpoint>>,
  label: string,
) {
  const contentType = response.headers()["content-type"] ?? "";
  const body = await response.text();

  expect(
    contentType.toLowerCase(),
    `${label}: l'API doit annoncer un Content-Type JSON (HTTP ${response.status()}, début du corps: ${body.slice(0, 100)})`,
  ).toContain("application/json");

  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    throw new Error(
      `${label}: réponse annoncée JSON mais invalide (HTTP ${response.status()}, début du corps: ${body.slice(0, 160)})`,
    );
  }

  expect(response.status(), `${label}: une API ne doit pas tomber en erreur serveur`).toBeLessThan(500);
  expect(parsed).toBeDefined();
}

test.describe("Contrat JSON des API — prévention de Unexpected token '<'", () => {
  for (const endpoint of API_BASE_PATHS) {
    test(`${endpoint.method} ${endpoint.path} renvoie du JSON même en cas d'erreur`, async ({ request }) => {
      const response = await requestEndpoint(request, endpoint);
      await assertJsonResponse(response, `${endpoint.method} ${endpoint.path}`);
    });
  }

  test("les pages métier ne déclenchent pas de réponses HTML sur les routes API", async ({ page }) => {
    const problems: string[] = [];
    const browserErrors: string[] = [];
    const origin = new URL(process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000").origin;

    page.on("pageerror", error => {
      browserErrors.push(error.message);
    });

    page.on("response", async response => {
      const url = new URL(response.url());
      if (url.origin !== origin || !url.pathname.startsWith("/api/")) return;

      const contentType = response.headers()["content-type"] ?? "";
      if (!contentType.toLowerCase().includes("application/json")) {
        problems.push(`${response.status()} ${url.pathname} Content-Type=${contentType || "(absent)"}`);
        return;
      }

      try {
        JSON.parse(await response.text());
      } catch {
        problems.push(`${response.status()} ${url.pathname} corps JSON invalide`);
      }
    });

    for (const route of [
      "/",
      "/connexion",
      "/inscription",
      "/decouvrir",
      "/matchs",
      "/rencontre",
      "/cockpit/jeux",
      "/cockpit/defis",
      "/profil",
      "/tableau-de-bord",
      "/parametres/securite",
    ]) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
    }

    // Allow response handlers to finish reading their bodies.
    await page.waitForTimeout(300);
    expect(problems, "Des endpoints API renvoient du HTML ou du JSON invalide").toEqual([]);
    expect(
      browserErrors.filter(message => /Unexpected token ['"]?</i.test(message)),
      "Aucune page ne doit échouer en parsant du HTML comme du JSON",
    ).toEqual([]);
  });
});
