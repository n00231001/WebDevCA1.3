import { describe, expect, test } from "vitest";
import { updateFileSchema } from "../../src/schemas/files.schemas.js";

describe("File validation", () => {
  // Test filename validation
  test.each([
    ["document.pdf", true],
    ["", false],
    ["   ", false],
    ["a".repeat(255), true],
    ["a".repeat(256), false],
  ])("validates filename %j", (name, expected) => {
    const result = updateFileSchema.safeParse({ name });

    expect(result.success).toBe(expected);
  });

  // Test starred file validation
  test.each([
    [true, true],
    [false, true],
    [undefined, true],
    ["true", false],
    [1, false],
  ])("validates is_starred value %j", (is_starred, expected) => {
    const result = updateFileSchema.safeParse({ is_starred });

    expect(result.success).toBe(expected);
  });
});