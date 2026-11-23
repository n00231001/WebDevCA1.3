
import request from "supertest";
import crypto from "node:crypto";
import app from "../../src/app.js";

import { beforeEach, describe, expect, test } from "vitest";
import { resetDatabase } from "../helpers/database.js";

import { db } from "../../src/db.js";
import { users, files } from "../../src/schema.js";
import { eq } from "drizzle-orm";

beforeEach(async () => {
  await resetDatabase();
});

describe("POST /api/files", () => {
  test("rejects an empty file upload", async () => {
    // Register a test user
    const email = `test-${crypto.randomUUID()}@example.com`;

    const user = await request(app)
      .post("/api/auth/register")
      .send({
        first_name: "John",
        last_name: "Smith",
        email,
        password: "Password123",
      });

    expect(user.status).toBe(201);

    const token = user.body.token;

    // Attempt to upload without attaching a file
    const res = await request(app)
      .post("/api/files")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      error: "Choose at least one file to upload",
    });
  });
});