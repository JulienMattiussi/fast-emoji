import { describe, it, expect, beforeEach, vi } from "vitest";
import { emojis as defaultEmojis } from "../src/emojis";

const store: Record<string, unknown> = {};

function mockChrome({ nativeResponse }: { nativeResponse?: unknown } = {}) {
  const storage = {
    local: {
      get: vi.fn(async (key: string) => ({ [key]: store[key] })),
      set: vi.fn(async (items: Record<string, unknown>) => {
        Object.assign(store, items);
      }),
    },
  };
  const runtime = {
    lastError: null as chrome.runtime.LastError | null,
    sendMessage: nativeResponse
      ? vi.fn((_msg: unknown, callback: (r: unknown) => void) => {
          callback(nativeResponse);
        })
      : vi.fn((_msg: unknown, callback: (r: unknown) => void) => {
          runtime.lastError = { message: "native host not found" };
          callback(undefined);
          runtime.lastError = null;
        }),
  };
  Object.defineProperty(globalThis, "chrome", {
    value: { storage, runtime },
    writable: true,
    configurable: true,
  });
}

describe("storage — no native host", () => {
  beforeEach(() => {
    for (const key of Object.keys(store)) delete store[key];
    mockChrome();
    vi.resetModules();
  });

  it("should return default emojis when storage is empty", async () => {
    const { loadFavorites } = await import("../src/storage");
    const result = await loadFavorites();
    expect(result).toEqual(defaultEmojis.map((e) => e.emoji));
  });

  it("should return stored emojis from chrome.storage.local", async () => {
    store["fastEmojiFavorites"] = ["🔥", "🚀"];
    const { loadFavorites } = await import("../src/storage");
    const result = await loadFavorites();
    expect(result).toEqual(["🔥", "🚀"]);
  });

  it("should save to chrome.storage.local when native host fails", async () => {
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

describe("storage — with native host", () => {
  beforeEach(() => {
    for (const key of Object.keys(store)) delete store[key];
    vi.resetModules();
  });

  it("should return favorites from native host when available", async () => {
    mockChrome({ nativeResponse: { favorites: ["⭐", "🚀", "🔥"] } });
    const { loadFavorites } = await import("../src/storage");
    const result = await loadFavorites();
    expect(result).toEqual(["⭐", "🚀", "🔥"]);
  });

  it("should fall back to chrome.storage when native returns null", async () => {
    store["fastEmojiFavorites"] = ["💯"];
    mockChrome({ nativeResponse: { favorites: null } });
    const { loadFavorites } = await import("../src/storage");
    const result = await loadFavorites();
    expect(result).toEqual(["💯"]);
  });

  it("should save via service worker and chrome.storage", async () => {
    mockChrome({ nativeResponse: { ok: true } });
    const { saveFavorites } = await import("../src/storage");
    await saveFavorites(["🎉", "👀"]);
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
      { type: "native", payload: { action: "save", favorites: ["🎉", "👀"] } },
      expect.any(Function),
    );
    expect(store["fastEmojiFavorites"]).toEqual(["🎉", "👀"]);
  });
});
