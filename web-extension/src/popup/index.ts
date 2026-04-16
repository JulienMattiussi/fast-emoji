import { emojiBank } from "../emoji-bank";
import { loadFavorites, saveFavorites } from "../storage";

const FEEDBACK_DURATION_MS = 600;

let favorites: string[] = [];

async function init() {
  favorites = await loadFavorites();
  renderMain();
}

function renderMain() {
  const app = document.getElementById("app")!;
  app.innerHTML = "";

  // Title bar
  const titleBar = document.createElement("div");
  titleBar.id = "title-bar";

  const icon = document.createElement("img");
  icon.src = "icons/icon-48.png";
  icon.alt = "Fast Emoji";
  icon.id = "app-icon";

  const titleText = document.createElement("span");
  titleText.textContent = "Fast Emoji";

  const settingsBtn = document.createElement("button");
  settingsBtn.id = "settings-btn";
  settingsBtn.title = "Personnaliser les emojis";
  settingsBtn.setAttribute("aria-label", "Personnaliser les emojis");
  settingsBtn.textContent = "⚙️";
  settingsBtn.addEventListener("click", renderSettings);

  titleBar.appendChild(icon);
  titleBar.appendChild(titleText);
  titleBar.appendChild(settingsBtn);
  app.appendChild(titleBar);

  // Emoji grid
  const grid = document.createElement("div");
  grid.id = "emoji-grid";
  for (const emoji of favorites) {
    const button = document.createElement("button");
    button.className = "emoji-btn";
    button.setAttribute("data-emoji", emoji);
    button.textContent = emoji;
    button.addEventListener("click", () => copyEmoji(button, emoji));
    grid.appendChild(button);
  }
  app.appendChild(grid);
}

function renderSettings() {
  const app = document.getElementById("app")!;
  app.innerHTML = "";

  // Header
  const header = document.createElement("div");
  header.id = "settings-header";

  const backBtn = document.createElement("button");
  backBtn.id = "back-btn";
  backBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  backBtn.title = "Retour";
  backBtn.addEventListener("click", renderMain);

  const title = document.createElement("span");
  title.textContent = "Personnaliser";

  header.appendChild(backBtn);
  header.appendChild(title);
  app.appendChild(header);

  // Bank
  const bank = document.createElement("div");
  bank.id = "emoji-bank";

  for (const category of emojiBank) {
    const section = document.createElement("div");
    section.className = "bank-category";

    const catTitle = document.createElement("div");
    catTitle.className = "category-title";
    catTitle.textContent = category.name;
    section.appendChild(catTitle);

    const catGrid = document.createElement("div");
    catGrid.className = "category-grid";

    for (const emoji of category.emojis) {
      const btn = document.createElement("button");
      btn.className = "bank-emoji";
      if (favorites.includes(emoji)) {
        btn.classList.add("selected");
      }
      btn.textContent = emoji;
      btn.addEventListener("click", () => toggleFavorite(btn, emoji));
      catGrid.appendChild(btn);
    }

    section.appendChild(catGrid);
    bank.appendChild(section);
  }

  app.appendChild(bank);

  // Signature
  const signature = document.createElement("div");
  signature.id = "signature";
  signature.textContent = "with ❤️ by YavaDeus";
  app.appendChild(signature);
}

function toggleFavorite(btn: HTMLButtonElement, emoji: string) {
  const index = favorites.indexOf(emoji);
  if (index >= 0) {
    favorites.splice(index, 1);
    btn.classList.remove("selected");
  } else {
    favorites.push(emoji);
    btn.classList.add("selected");
  }
  saveFavorites(favorites);
}

async function copyEmoji(button: HTMLButtonElement, emoji: string) {
  await navigator.clipboard.writeText(emoji);

  button.classList.add("copied");
  setTimeout(() => button.classList.remove("copied"), FEEDBACK_DURATION_MS);
}

init();
