import { describe, it, expect } from "vitest";
import { emojis } from "../src/emojis";

describe("emojis list", () => {
  it("should contain exactly 10 emojis", () => {
    expect(emojis).toHaveLength(10);
  });

  it("should have unique emojis", () => {
    const emojiChars = emojis.map((e) => e.emoji);
    expect(new Set(emojiChars).size).toBe(emojiChars.length);
  });

  it("should have non-empty labels", () => {
    for (const entry of emojis) {
      expect(entry.label.length).toBeGreaterThan(0);
    }
  });
});
