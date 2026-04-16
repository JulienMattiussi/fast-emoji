import { emojis } from "../emojis";

const FEEDBACK_DURATION_MS = 600;

function init() {
  const grid = document.getElementById("emoji-grid")!;

  for (const { emoji, label } of emojis) {
    const button = document.createElement("button");
    button.className = "emoji-btn";
    button.title = label;
    button.setAttribute("aria-label", `Copier ${label}`);
    button.setAttribute("data-emoji", emoji);

    button.textContent = emoji;

    button.addEventListener("click", () => copyEmoji(button, emoji));

    grid.appendChild(button);
  }
}

async function copyEmoji(button: HTMLButtonElement, emoji: string) {
  await navigator.clipboard.writeText(emoji);

  button.classList.add("copied");
  setTimeout(() => button.classList.remove("copied"), FEEDBACK_DURATION_MS);
}

init();
