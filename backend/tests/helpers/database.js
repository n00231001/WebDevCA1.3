
import { db, pool } from "../../src/db.js";
import { users } from "../../src/schema.js";

// Reset the test database before each test.
export async function resetDatabase() {
  const [rows] = await pool.query("SELECT DATABASE() AS db");

  if (rows[0].db !== "app_test") {
    throw new Error("Tests must use app_test");
  }

  await db.delete(users);
}
