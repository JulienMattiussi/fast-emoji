import { describe, it, expect } from "vitest";
import { emojiBank } from "../src/emoji-bank";

describe("emoji bank", () => {
  it("should have at least 5 categories", () => {
    expect(emojiBank.length).toBeGreaterThanOrEqual(5);
  });

  it("should have non-empty category names", () => {
    for (const category of emojiBank) {
      expect(category.name.length).toBeGreaterThan(0);
    }
  });

  it("should have at least 10 emojis per category", () => {
    for (const category of emojiBank) {
      expect(category.emojis.length).toBeGreaterThanOrEqual(10);
    }
  });

  it("should not have duplicate emojis across categories", () => {
    const all = emojiBank.flatMap((c) => c.emojis);
    expect(new Set(all).size).toBe(all.length);
  });
});
