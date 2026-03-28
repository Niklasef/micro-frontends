import { config as loadEnv } from "dotenv";
import { existsSync } from "node:fs";

/**
 * Load environment variables.
 *
 * Priority:
 *   1. .env.local  – developer-specific overrides
 *   2. .env        – default values
 */
if (existsSync(".env.local")) {
  loadEnv({ path: ".env.local" });
} else {
  loadEnv();
}
