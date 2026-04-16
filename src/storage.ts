import { emojis as defaultEmojis } from "./emojis";

const STORAGE_KEY = "fastEmojiFavorites";

export async function loadFavorites(): Promise<string[]> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  const stored = result[STORAGE_KEY];
  if (Array.isArray(stored) && stored.length > 0) {
    return stored;
  }
  return defaultEmojis.map((e) => e.emoji);
}

export async function saveFavorites(emojis: string[]): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: emojis });
}
