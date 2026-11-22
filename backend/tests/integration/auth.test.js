
import { describe, expect, test } from "vitest";
import request from "supertest";

import app from "../../src/app.js";

import crypto from "node:crypto";

describe("POST /api/auth/register", () => {
  test("rejects an invalid email address", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        first_name: "John",
        last_name: "Smith",
        email: "invalid-email",
        password: "Password123",
      });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      error: "Enter a valid email address",
      field: "email",
    });
  });


test("registers a new user successfully", async () => {
  const email = `test-${crypto.randomUUID()}@example.com`;

  const res = await request(app)
    .post("/api/auth/register")
    .send({
      first_name: "John",
      last_name: "Smith",
      email,
      password: "Password123",
    });

  expect(res.status).toBe(201);
  expect(res.body.token).toEqual(expect.any(String));

  expect(res.body.user).toMatchObject({
    first_name: "John",
    last_name: "Smith",
    email,
  });

  expect(res.body.user.id).toEqual(expect.any(String));
  expect(res.body.user).not.toHaveProperty("password_hash");
});

test("uses the test database", async () => {
  const { pool } = await import("../../src/db.js");

  const [rows] = await pool.query("SELECT DATABASE() AS db");

  expect(rows[0].db).toBe("app_test");
});


test("rejects a duplicate email address", async () => {
  const email = `duplicate-${crypto.randomUUID()}@example.com`;

  const user = {
    first_name: "John",
    last_name: "Smith",
    email,
    password: "Password123",
  };

  // Register the user for the first time
  const firstResponse = await request(app)
    .post("/api/auth/register")
    .send(user);

  expect(firstResponse.status).toBe(201);

  // Attempt to register with the same email
  const secondResponse = await request(app)
    .post("/api/auth/register")
    .send(user);

  expect(secondResponse.status).toBe(409);
  expect(secondResponse.body).toEqual({
    error: "An account with that email already exists",
  });
});

});
