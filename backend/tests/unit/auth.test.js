import { describe, expect, test } from "vitest";
import { registerSchema } from "../../src/schemas/auth.schemas.js";

describe("Registration validation", () => {
  test("accepts valid registration details", () => {
    const result = registerSchema.safeParse({
      first_name: "John",
      last_name: "Smith",
      email: "john@example.com",
      password: "Password123",
    });

    expect(result.success).toBe(true);
  });

  test("rejects an invalid email address", () => {
    const result = registerSchema.safeParse({
      first_name: "John",
      last_name: "Smith",
      email: "invalid-email",
      password: "Password123",
    });

    expect(result.success).toBe(false);
  });

  test.each([
    ["", false],
    ["abc", false],
    ["1234567", false],
    ["12345678", true],
    ["Password123", true],
  ])("validates password %j", (password, expected) => {
    const result = registerSchema.safeParse({
      first_name: "John",
      last_name: "Smith",
      email: "john@example.com",
      password,
    });

    expect(result.success).toBe(expected);
  });
});

async function countNotes(loadNotes) {
  const notes = await loadNotes();
  return notes.length;
}

