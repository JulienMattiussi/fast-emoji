import { describe, it, expect, beforeEach, vi } from "vitest";
import { emojis } from "../src/emojis";

describe("popup", () => {
  beforeEach(async () => {
    document.body.innerHTML = `
      <div id="app">
        <div id="emoji-grid"></div>
      </div>
    `;

    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });

    // Import triggers init()
    vi.resetModules();
    await import("../src/popup/index");
  });

  it("should render one button per emoji", () => {
    const buttons = document.querySelectorAll(".emoji-btn");
    expect(buttons.length).toBe(emojis.length);
  });

  it("should display emoji text in each button", () => {
    const buttons = document.querySelectorAll(".emoji-btn");

    buttons.forEach((btn, i) => {
      expect(btn.textContent).toBe(emojis[i].emoji);
    });
  });

  it("should set data-emoji attribute on each button", () => {
    const buttons = document.querySelectorAll(".emoji-btn");

    buttons.forEach((btn, i) => {
      expect(btn.getAttribute("data-emoji")).toBe(emojis[i].emoji);
    });
  });

  it("should copy emoji to clipboard on click", async () => {
    const button = document.querySelector(".emoji-btn") as HTMLButtonElement;
    button.click();

    // Wait for async clipboard write
    await vi.waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        emojis[0].emoji,
      );
    });
  });

  it("should add copied class on click then remove it", async () => {
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

  it("should render buttons inside the grid container", () => {
    const grid = document.getElementById("emoji-grid")!;
    const buttons = grid.querySelectorAll(".emoji-btn");
    expect(buttons.length).toBe(emojis.length);
  });
});
