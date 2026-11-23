import { readFile } from "node:fs/promises";
import { beforeEach, describe, expect, test } from "vitest";
import request from "supertest";
import crypto from "node:crypto";

import app from "../../src/app.js";
import { resetDatabase } from "../helpers/database.js";

beforeEach(async () => {
  await resetDatabase();
});

describe("attachments", () => {
    test("rejects a file over 50 MB", async () => {
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

  const res = await request(app)
    .post("/api/files")
    .set("Authorization", `Bearer ${token}`)
    .attach("files", "tests/fixtures/large-file.jpg");

  expect(res.status).toBe(413);
});

  test("saves an attached file", async () => {
    // Register a user
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

    // Upload the image
    const res = await request(app)
      .post("/api/files")
      .set("Authorization", `Bearer ${token}`)
      .attach("files", "tests/fixtures/example.jpg");

    expect(res.status).toBe(201);
    expect(res.body[0].name).toBe("example.jpg");

    // Download the image
    console.log(res.body[0].url);
    const file = await request(app).get(
        new URL(res.body[0].url).pathname + new URL(res.body[0].url).search
    );

    expect(file.status).toBe(200);

    // Compare the downloaded image with the original
    expect(file.body).toEqual(
      await readFile("tests/fixtures/example.jpg"),
    );

    // Delete the uploaded image
    await request(app)
      .delete(`/api/files/${res.body[0].id}`)
      .set("Authorization", `Bearer ${token}`);
  });
});