import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Phase 1 mobile shell:
 * Next.js currently depends on server-side routes and Cloudflare Workers,
 * so the native shell loads the official HTTPS application.
 * Do not switch to a local webDir build until the app has a supported
 * static/native frontend architecture.
 */
const config: CapacitorConfig = {
  appId: "com.nakahya.app",
  appName: "NAKAHYA",
  webDir: "www",
  server: {
    url: "https://nakahya.com",
    cleartext: false,
    allowNavigation: ["nakahya.com", "*.nakahya.com"],
  },
  android: {
    allowMixedContent: false,
  },
  ios: {
    contentInset: "automatic",
  },
};

export default config;
