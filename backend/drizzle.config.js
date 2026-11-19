import { defineConfig } from "drizzle-kit";

// Used by npm run db:generate, which compares src/schema.js with the last
// migration and writes a new SQL migration for any changes.
export default defineConfig({
  dialect: "mysql",
  schema: "./src/schema.js",
  out: "./db/migrations",
});
