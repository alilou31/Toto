import { defineConfig } from "@playwright/test";
import base from "./playwright.config";

if (process.env.PLAYWRIGHT_BASE_URL !== "https://nakahya.com") {
  throw new Error("Production checks require PLAYWRIGHT_BASE_URL=https://nakahya.com");
}

export default defineConfig({ ...base, testDir: "./tests", webServer: undefined });
