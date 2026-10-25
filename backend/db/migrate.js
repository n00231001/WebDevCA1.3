import { migrate } from "drizzle-orm/mysql2/migrator";
import { db, pool } from "../src/db.js";

// Run with: npm run db:migrate
// Runs the migrations in db/migrations that haven't run on this database yet, in order.

console.log(`Running migrations on ${process.env.DB_NAME}...`);
await migrate(db, { migrationsFolder: "db/migrations" });
console.log("Done.");

await pool.end();
