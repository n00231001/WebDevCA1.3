import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { migrate } from "drizzle-orm/mysql2/migrator";
import config from "../src/config.js";
import { db, pool } from "../src/db.js";
import { users, files } from "../src/schema.js";
import * as storageService from "../src/services/storage.service.js";

// WARNING: this deletes ALL data in the database, runs the migrations to
// create the tables again, and adds sample data. Only use it locally.
// To create or update the tables in production, use npm run db:migrate.

// -- Seed data

const sampleUsers = [
  {
    first_name: "Alice",
    last_name: "Johnson",
    email: "alice@example.com",
    password: "password123",
    files: [
      "Isle of Skye.jpg",
      "Mountain lake.jpg",
      "Welcome to Dropbox.pdf",
      "Shopping list.txt",
    ],
    starred: ["Isle of Skye.jpg"],
  },
  {
    first_name: "Bob",
    last_name: "Smith",
    email: "bob@example.com",
    password: "password123",
    files: ["Dolomites sunset.jpg", "Poppy field.jpg", "Project budget.csv"],
    starred: ["Project budget.csv"],
  },
  {
    first_name: "Charlie",
    last_name: "Brown",
    email: "charlie@example.com",
    password: "password123",
    files: ["Misty sunrise.jpg", "Welcome to Dropbox.pdf"],
    starred: [],
  },
];

// The sample files are in db/sample-files
const sampleFilesDir = "db/sample-files";

const mimeTypes = {
  ".jpg": "image/jpeg",
  ".pdf": "application/pdf",
  ".txt": "text/plain",
  ".csv": "text/csv",
};

console.log(`Deleting all data in ${config.DB_NAME}...`);
// __drizzle_migrations is where Drizzle records which migrations have run
await pool.query("DROP TABLE IF EXISTS files, users, __drizzle_migrations");

console.log("Creating the tables...");
await migrate(db, { migrationsFolder: "db/migrations" });

// Files in a local uploads folder would be left over from last time, so empty it.
// (Files in S3 are left alone. Old ones just stay in the bucket, unused.)
// Only the files inside are deleted, not the folder itself, because in a
// container the folder is often a volume, which can't be deleted.
if (config.STORAGE_DRIVER === "local") {
  await fs.mkdir(config.UPLOAD_DIR, { recursive: true });
  for (const name of await fs.readdir(config.UPLOAD_DIR)) {
    await fs.rm(path.join(config.UPLOAD_DIR, name), { recursive: true });
  }
}

console.log(
  `Adding users, and their files to ${config.STORAGE_DRIVER} storage...`,
);
for (const user of sampleUsers) {
  const [newUser] = await db
    .insert(users)
    .values({
      uuid: crypto.randomUUID(),
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      password_hash: await bcrypt.hash(user.password, 10),
    })
    .$returningId();
  console.log(`  ${user.email} / ${user.password}`);

  for (const name of user.files) {
    const buffer = await fs.readFile(path.join(sampleFilesDir, name));
    const mimeType = mimeTypes[path.extname(name)];
    const key = crypto.randomUUID();

    await storageService.saveFile(key, buffer, mimeType);
    await db.insert(files).values({
      uuid: crypto.randomUUID(),
      user_id: newUser.id,
      name,
      storage_key: key,
      mime_type: mimeType,
      size_bytes: buffer.length,
      is_starred: user.starred.includes(name),
    });
    console.log(`    ${name}`);
  }
}

console.log("Done.");

await pool.end();
