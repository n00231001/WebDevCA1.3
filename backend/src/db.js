import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import config from "./config.js";

// A pool keeps a few database connections open and reuses them,
// so each request does not have to open a new connection.
export const pool = mysql.createPool({
  host: config.DB_HOST,
  port: config.DB_PORT,
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
  // MySQL stores times in UTC.
  timezone: "Z",
});

// Drizzle, for querying the tables in schema.js
export const db = drizzle(pool);
