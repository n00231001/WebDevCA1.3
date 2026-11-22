import { describe, expect, test, vi } from "vitest";
import { loadNotes } from "./database.js";

describe("mock functions", () => {
  test("a mock function records its calls", () => {
    const greet = vi.fn();

    greet("Alice");
    greet("Bob");

    expect(greet).toHaveBeenCalledTimes(2);
    expect(greet).toHaveBeenCalledWith("Alice");
    expect(greet.mock.lastCall).toEqual(["Bob"]);
  });

  test("a mock function can return a value", () => {
    const getApples = vi.fn();
    getApples.mockReturnValue(10);

    expect(getApples()).toBe(10);
  });
});

async function countNotes(loadNotes) {
  const notes = await loadNotes();
  return notes.length;
}

describe("countNotes", () => {
  test("counts the notes that it loads", async () => {
    const loadNotes = vi.fn();

    loadNotes.mockResolvedValue([
      { id: 1 },
      { id: 2 },
    ]);

    expect(await countNotes(loadNotes)).toBe(2);
    expect(loadNotes).toHaveBeenCalledTimes(1);
  });
});

vi.mock("./database.js", () => ({
  loadNotes: vi.fn(),
}));

describe("module mocking", () => {
  test("replaces the database function with a mock", async () => {
    loadNotes.mockResolvedValue([{ id: 10 }, { id: 20 }]);

    const notes = await loadNotes();

    expect(notes).toHaveLength(2);
    expect(loadNotes).toHaveBeenCalledTimes(1);
  });
});