import crypto from "node:crypto";
import { and, asc, desc, eq, inArray, like } from "drizzle-orm";
import { db } from "../db.js";
import { files } from "../schema.js";
import { HttpError } from "../utils/httpError.js";
import * as authService from "./auth.service.js";
import * as storageService from "./storage.service.js";

// Lists the user's files, newest first.
// search: only files whose name contains this text
// starredOnly: only starred files
export async function listFiles(userId, { search, starredOnly }) {
  // Only the user's files, plus any filters
  const conditions = [eq(files.user_id, userId)];
  if (search) {
    conditions.push(like(files.name, `%${search}%`));
  }
  if (starredOnly) {
    conditions.push(eq(files.is_starred, true));
  }

  const rows = await db
    .select()
    .from(files)
    .where(and(...conditions)) // and() needs every condition to match
    .orderBy(desc(files.created_at), desc(files.id));

  const results = [];
  for (const file of rows) {
    results.push(await formatFile(file));
  }
  return results;
}

// Saves the details of files that Multer has already put in storage.
export async function addFiles(userId, uploadedFiles) {
  try {
    // Check the new files fit in the user's storage quota
    const me = await authService.getMe(userId);
    let newBytes = 0;
    for (const file of uploadedFiles) {
      newBytes += file.size;
    }

    if (me.storage_used_bytes + newBytes > me.storage_quota_bytes) {
      throw new HttpError(413, "Not enough storage space");
    }

    // One row per file. Inserting them all in one query means either every
    // file is saved, or none of them are.
    const newFiles = uploadedFiles.map((file) => ({
      uuid: crypto.randomUUID(),
      user_id: userId,
      name: file.originalname,
      storage_key: file.key,
      mime_type: file.mimetype,
      size_bytes: file.size,
    }));
    await db.insert(files).values(newFiles);
  } catch (err) {
    // The files are already in storage, so remove them before returning the error
    for (const file of uploadedFiles) {
      await storageService.deleteFile(file.key);
    }

    if (isDuplicateName(err)) {
      throw new HttpError(409, "A file with that name already exists");
    }
    throw err;
  }

  // Send back the new files
  const keys = uploadedFiles.map((file) => file.key);
  const rows = await db
    .select()
    .from(files)
    .where(inArray(files.storage_key, keys))
    .orderBy(asc(files.id));

  const results = [];
  for (const file of rows) {
    results.push(await formatFile(file));
  }
  return results;
}

export async function updateFile(userId, fileId, { name, is_starred }) {
  const file = await getFile(userId, fileId);

  if (name !== undefined) {
    try {
      await db.update(files).set({ name }).where(eq(files.id, file.id));
    } catch (err) {
      if (isDuplicateName(err)) {
        throw new HttpError(409, "A file with that name already exists");
      }
      throw err;
    }
  }

  if (is_starred !== undefined) {
    await db.update(files).set({ is_starred }).where(eq(files.id, file.id));
  }

  const updatedFile = await getFile(userId, fileId);
  return formatFile(updatedFile);
}

export async function deleteFile(userId, fileId) {
  const file = await getFile(userId, fileId);

  // Delete the database row first. If deleting from storage then fails, the
  // file is just left unused in storage, instead of the app listing a file
  // that no longer exists.
  await db.delete(files).where(eq(files.id, file.id));
  await storageService.deleteFile(file.storage_key);
}

// Finds one of the user's files by its UUID, or throws a 404.
// Checking user_id means users can only ever get their own files.
async function getFile(userId, fileId) {
  const [file] = await db
    .select()
    .from(files)
    .where(and(eq(files.uuid, fileId), eq(files.user_id, userId)));

  if (!file) {
    throw new HttpError(404, "File not found");
  }
  return file;
}

// Turns a row from the files table into what the API sends back.
async function formatFile(file) {
  return {
    id: file.uuid,
    name: file.name,
    mime_type: file.mime_type,
    size_bytes: file.size_bytes,
    is_starred: file.is_starred,
    created_at: file.created_at,
    updated_at: file.updated_at,
    url: await storageService.getUrl(
      file.storage_key,
      file.name,
      file.mime_type,
    ),
  };
}

// True if MySQL rejected a query because the name is already taken, from the
// UNIQUE (user_id, name) rule on the files table. Drizzle wraps MySQL's error,
// so MySQL's own error code is in err.cause.
function isDuplicateName(err) {
  return Boolean(err.cause) && err.cause.code === "ER_DUP_ENTRY";
}
