import { describe, it, expect, beforeEach, vi } from "vitest";
import { emojis as defaultEmojis } from "../src/emojis";

const store: Record<string, unknown> = {};

function mockChromeStorage() {
  const storage = {
    local: {
      get: vi.fn(async (key: string) => ({ [key]: store[key] })),
      set: vi.fn(async (items: Record<string, unknown>) => {
        Object.assign(store, items);
      }),
    },
  };
  Object.defineProperty(globalThis, "chrome", {
    value: { storage },
    writable: true,
    configurable: true,
  });
}

describe("storage", () => {
  beforeEach(() => {
    for (const key of Object.keys(store)) delete store[key];
    mockChromeStorage();
    vi.resetModules();
  });

  it("should return default emojis when storage is empty", async () => {
    const { loadFavorites } = await import("../src/storage");
    const result = await loadFavorites();
    expect(result).toEqual(defaultEmojis.map((e) => e.emoji));
  });

  it("should return stored emojis when storage has data", async () => {
    store["fastEmojiFavorites"] = ["🔥", "🚀"];
    const { loadFavorites } = await import("../src/storage");
    const result = await loadFavorites();
    expect(result).toEqual(["🔥", "🚀"]);
  });

  it("should save favorites to storage", async () => {
    const { saveFavorites } = await import("../src/storage");
    await saveFavorites(["😎", "🎉"]);
    expect(store["fastEmojiFavorites"]).toEqual(["😎", "🎉"]);
  });

  it("should return defaults when stored value is not an array", async () => {
    store["fastEmojiFavorites"] = "invalid";
    const { loadFavorites } = await import("../src/storage");
    const result = await loadFavorites();
    expect(result).toEqual(defaultEmojis.map((e) => e.emoji));
  });

  it("should return defaults when stored array is empty", async () => {
    store["fastEmojiFavorites"] = [];
    const { loadFavorites } = await import("../src/storage");
    const result = await loadFavorites();
    expect(result).toEqual(defaultEmojis.map((e) => e.emoji));
  });
});
