import "server-only";
import { neon } from "@neondatabase/serverless";

/**
 * Server-only Neon SQL client.
 * DATABASE_URL must be configured in the runtime environment.
 * Never import this module into a Client Component.
 */
export function getDb() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured");
  }

  return neon(connectionString);
}
