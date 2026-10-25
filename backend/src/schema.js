import { sql } from "drizzle-orm";
import {
  mysqlTable,
  bigint,
  boolean,
  char,
  datetime,
  varchar,
  unique,
} from "drizzle-orm/mysql-core";

// The database tables. To change a table, edit it here and then run
// npm run db:generate, which writes a migration in db/migrations.

export const users = mysqlTable("users", {
  id: bigint("id", { mode: "number", unsigned: true })
    .autoincrement()
    .primaryKey(),
  uuid: char("uuid", { length: 36 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password_hash: varchar("password_hash", { length: 255 }).notNull(),
  first_name: varchar("first_name", { length: 100 }).notNull(),
  last_name: varchar("last_name", { length: 100 }).notNull(),
  avatar_key: varchar("avatar_key", { length: 255 }), // where the profile picture is in storage
  avatar_mime_type: varchar("avatar_mime_type", { length: 255 }),
  storage_quota_bytes: bigint("storage_quota_bytes", { mode: "number" })
    .notNull()
    .default(1073741824), // 1 GB
  created_at: datetime("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const files = mysqlTable(
  "files",
  {
    id: bigint("id", { mode: "number", unsigned: true })
      .autoincrement()
      .primaryKey(),
    uuid: char("uuid", { length: 36 }).notNull().unique(),
    user_id: bigint("user_id", { mode: "number", unsigned: true })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    storage_key: varchar("storage_key", { length: 255 }).notNull(), // where the file is in storage
    mime_type: varchar("mime_type", { length: 255 }).notNull(),
    size_bytes: bigint("size_bytes", { mode: "number" }).notNull(),
    is_starred: boolean("is_starred").notNull().default(false),
    created_at: datetime("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updated_at: datetime("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`)
      .$onUpdate(() => new Date()), // Drizzle sets this on every update
  },
  (table) => [
    // A user cannot have two files with the same name
    unique("files_user_id_name_unique").on(table.user_id, table.name),
  ],
);
