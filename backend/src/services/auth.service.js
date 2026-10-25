import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { eq, sum } from "drizzle-orm";
import { db } from "../db.js";
import { users, files } from "../schema.js";
import { HttpError } from "../utils/httpError.js";
import * as storageService from "./storage.service.js";

export async function register({ first_name, last_name, email, password }) {
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email));
  if (existing) {
    throw new HttpError(409, "An account with that email already exists");
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);
  const uuid = crypto.randomUUID();

  await db.insert(users).values({
    uuid,
    first_name,
    last_name,
    email,
    password_hash: passwordHash,
  });

  return { id: uuid, first_name, last_name, email };
}

export async function login({ email, password }) {
  const [user] = await db.select().from(users).where(eq(users.email, email));

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    throw new HttpError(401, "Email or password is incorrect");
  }

  return {
    id: user.uuid,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
  };
}

export async function getMe(userId) {
  const [user] = await db.select().from(users).where(eq(users.id, userId));

  // The total size of all the user's files
  const [usage] = await db
    .select({ used: sum(files.size_bytes) })
    .from(files)
    .where(eq(files.user_id, userId));

  const avatarURL = user.avatar_key
    ? await storageService.getUrl(
        user.avatar_key,
        "avatar",
        user.avatar_mime_type,
      )
    : null;

  return {
    id: user.uuid,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    avatar_url: avatarURL,
    // SUM() comes back as a string, or null if there are no files.
    // Number() turns both into a number, and Number(null) is 0.
    storage_used_bytes: Number(usage.used),
    storage_quota_bytes: user.storage_quota_bytes,
  };
}

export async function updateName(userId, { first_name, last_name }) {
  await db
    .update(users)
    .set({ first_name, last_name })
    .where(eq(users.id, userId));

  return getMe(userId);
}

export async function changePassword(
  userId,
  { current_password, new_password },
) {
  const [user] = await db
    .select({ password_hash: users.password_hash })
    .from(users)
    .where(eq(users.id, userId));

  if (!(await bcrypt.compare(current_password, user.password_hash))) {
    // Not 401, because the frontend treats a 401 as "logged out"
    throw new HttpError(400, "Current password is incorrect");
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(new_password, saltRounds);

  await db
    .update(users)
    .set({ password_hash: passwordHash })
    .where(eq(users.id, userId));
}

const AVATAR_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

// Saves a new profile picture, which Multer has already put in storage, and deletes the old one.
export async function setAvatar(userId, file) {
  if (!AVATAR_TYPES.includes(file.mimetype)) {
    await storageService.deleteFile(file.key);
    throw new HttpError(
      400,
      "Profile pictures must be JPEG, PNG, GIF or WebP images",
    );
  }

  const [user] = await db
    .select({ avatar_key: users.avatar_key })
    .from(users)
    .where(eq(users.id, userId));
  const oldKey = user.avatar_key;

  await db
    .update(users)
    .set({ avatar_key: file.key, avatar_mime_type: file.mimetype })
    .where(eq(users.id, userId));

  if (oldKey) {
    await storageService.deleteFile(oldKey);
  }
  return getMe(userId);
}

export async function removeAvatar(userId) {
  const [user] = await db
    .select({ avatar_key: users.avatar_key })
    .from(users)
    .where(eq(users.id, userId));
  const oldKey = user.avatar_key;

  await db
    .update(users)
    .set({ avatar_key: null, avatar_mime_type: null })
    .where(eq(users.id, userId));

  if (oldKey) {
    await storageService.deleteFile(oldKey);
  }
}

// Finds a user by their UUID, or returns null if there is no user with that UUID.
export async function getUserFromUUID(uuid) {
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.uuid, uuid));

  if (!user) {
    return null;
  }

  return getUser(user.id);
}

// Finds a user by their numeric id, or returns null if there is no user with that id.
export async function getUser(userId) {
  const [user] = await db.select().from(users).where(eq(users.id, userId));

  if (!user) {
    return null;
  }

  return {
    internalId: user.id,
    id: user.uuid,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    avatarKey: user.avatar_key,
    avatarMimeType: user.avatar_mime_type,
    storageQuotaBytes: user.storage_quota_bytes,
    createdAt: user.created_at,
  };
}
