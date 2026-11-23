import { beforeEach, describe, expect, test } from "vitest";
import request from "supertest";
import crypto from "node:crypto";

import app from "../../src/app.js";
import { resetDatabase } from "../helpers/database.js";

beforeEach(async () => {
  await resetDatabase();
});

describe("integration exercises", () => {

    

test("rejects login for an unregistered user", async () => {
  const res = await request(app)
    .post("/api/auth/login")
    .send({
      email: "unknown@example.com",
      password: "Password123",
    });

  expect(res.status).toBe(401);
});


    test("returns an empty file list for a new user", async () => {
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
    .get("/api/files")
    .set("Authorization", `Bearer ${token}`);

  expect(res.status).toBe(200);
  expect(res.body).toEqual([]);
});

    test("rejects file access without authentication", async () => {
  const res = await request(app).get("/api/files");

  expect(res.status).toBe(401);
    });

  test("rejects login with an incorrect password", async () => {
    const email = `test-${crypto.randomUUID()}@example.com`;

    await request(app)
      .post("/api/auth/register")
      .send({
        first_name: "John",
        last_name: "Smith",
        email,
        password: "Password123",
      });

    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email,
        password: "WrongPassword123",
      });

    expect(res.status).toBe(401);
  });
});