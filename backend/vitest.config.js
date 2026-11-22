import { loadEnvFile } from "node:process";
import { defineConfig } from "vitest/config";

// Load the local database connection settings.
loadEnvFile(".env");

// Ensure automated tests use the test database.
process.env.DB_HOST = "127.0.0.1";
process.env.DB_NAME = "app_test";

export default defineConfig({
  test: {
    fileParallelism: false,
  },
});