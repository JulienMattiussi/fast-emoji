import { describe, it, expect, beforeEach, vi } from "vitest";
import { emojis as defaultEmojis } from "../src/emojis";
import { emojiBank } from "../src/emoji-bank";

function mockChromeStorage(stored?: string[]) {
  const store: Record<string, unknown> = {};
  if (stored) store["fastEmojiFavorites"] = stored;

  Object.defineProperty(globalThis, "chrome", {
    value: {
      storage: {
        local: {
          get: vi.fn(async (key: string) => ({ [key]: store[key] })),
          set: vi.fn(async (items: Record<string, unknown>) => {
            Object.assign(store, items);
          }),
        },
      },
    },
    writable: true,
    configurable: true,
  });
}

describe("popup - main view", () => {
  beforeEach(async () => {
    document.body.innerHTML = `<div id="app"></div>`;

    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });

    mockChromeStorage();
    vi.resetModules();
    await import("../src/popup/index");
    // Wait for async init to complete
    await vi.waitFor(() => {
      expect(document.querySelectorAll(".emoji-btn").length).toBeGreaterThan(0);
    });
  });

  it("should render default emojis as buttons", () => {
    const buttons = document.querySelectorAll(".emoji-btn");
    expect(buttons.length).toBe(defaultEmojis.length);
    buttons.forEach((btn, i) => {
      expect(btn.textContent).toBe(defaultEmojis[i].emoji);
    });
  });

  it("should copy emoji to clipboard on click", async () => {
    const button = document.querySelector(".emoji-btn") as HTMLButtonElement;
    button.click();

    await vi.waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        defaultEmojis[0].emoji,
      );
    });
  });

  it("should show copied feedback on click", async () => {
    vi.useFakeTimers();

    const button = document.querySelector(".emoji-btn") as HTMLButtonElement;
    button.click();

    await vi.waitFor(() => {
      expect(button.classList.contains("copied")).toBe(true);
    });

    vi.advanceTimersByTime(600);
    expect(button.classList.contains("copied")).toBe(false);

    vi.useRealTimers();
  });

  it("should render a settings button", () => {
    const btn = document.getElementById("settings-btn");
    expect(btn).not.toBeNull();
  });
});

describe("popup - custom favorites", () => {
  it("should render stored favorites instead of defaults", async () => {
    document.body.innerHTML = `<div id="app"></div>`;
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });

    mockChromeStorage(["🔥", "🚀", "⭐"]);
    vi.resetModules();
    await import("../src/popup/index");

    await vi.waitFor(() => {
      expect(document.querySelectorAll(".emoji-btn").length).toBe(3);
    });

    const buttons = document.querySelectorAll(".emoji-btn");
    expect(buttons[0].textContent).toBe("🔥");
    expect(buttons[1].textContent).toBe("🚀");
    expect(buttons[2].textContent).toBe("⭐");
  });
});

describe("popup - settings view", () => {
  beforeEach(async () => {
    document.body.innerHTML = `<div id="app"></div>`;

    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });

    mockChromeStorage();
    vi.resetModules();
    await import("../src/popup/index");
    await vi.waitFor(() => {
      expect(document.querySelectorAll(".emoji-btn").length).toBeGreaterThan(0);
    });

    // Open settings
    document.getElementById("settings-btn")!.click();
  });

  it("should show settings view when settings button is clicked", () => {
    expect(document.getElementById("settings-header")).not.toBeNull();
    expect(document.getElementById("emoji-bank")).not.toBeNull();
  });

  it("should render all emoji bank categories", () => {
    const titles = document.querySelectorAll(".category-title");
    expect(titles.length).toBe(emojiBank.length);
    titles.forEach((title, i) => {
      expect(title.textContent).toBe(emojiBank[i].name);
    });
  });

  it("should mark default favorites as selected", () => {
    const selected = document.querySelectorAll(".bank-emoji.selected");
    expect(selected.length).toBe(defaultEmojis.length);
  });

  it("should toggle favorite on click", () => {
    // Find a non-selected emoji and click it
    const unselected = document.querySelector(
      ".bank-emoji:not(.selected)",
    ) as HTMLButtonElement;
    const emoji = unselected.textContent!;

    unselected.click();
    expect(unselected.classList.contains("selected")).toBe(true);

    // Click again to deselect
    unselected.click();
    expect(unselected.classList.contains("selected")).toBe(false);

    // Verify the emoji was removed
    expect(chrome.storage.local.set).toHaveBeenCalledWith(
      expect.objectContaining({
        fastEmojiFavorites: expect.not.arrayContaining([emoji]),
      }),
    );
  });

  it("should return to main view when back button is clicked", async () => {
    document.getElementById("back-btn")!.click();

    await vi.waitFor(() => {
      expect(document.querySelectorAll(".emoji-btn").length).toBeGreaterThan(0);
    });

    expect(document.getElementById("emoji-grid")).not.toBeNull();
    expect(document.getElementById("settings-header")).toBeNull();
  });
});
