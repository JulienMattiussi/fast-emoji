import { emojis as defaultEmojis } from "./emojis";

const STORAGE_KEY = "fastEmojiFavorites";

const defaults = () => defaultEmojis.map((e) => e.emoji);

function sendNative(payload: unknown): Promise<Record<string, unknown>> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: "native", payload }, (response) => {
      if (chrome.runtime.lastError || !response || response.error) {
        resolve({});
      } else {
        resolve(response);
      }
    });
  });
}

async function nativeLoad(): Promise<string[] | null> {
  const response = await sendNative({ action: "load" });
  const favorites = response.favorites;
  if (Array.isArray(favorites) && favorites.length > 0) {
    return favorites as string[];
  }
  return null;
}

async function nativeSave(emojis: string[]): Promise<void> {
  await sendNative({ action: "save", favorites: emojis });
}

export async function loadFavorites(): Promise<string[]> {
  // Try shared config first (via service worker → native messaging)
  const shared = await nativeLoad();
  if (shared) return shared;

  // Fall back to browser-local storage
  const result = await chrome.storage.local.get(STORAGE_KEY);
  const stored = result[STORAGE_KEY];
  if (Array.isArray(stored) && stored.length > 0) {
    return stored;
  }

  return defaults();
}

export async function saveFavorites(emojis: string[]): Promise<void> {
  // Save to shared config (best effort)
  await nativeSave(emojis);

  // Always save to browser-local storage as fallback
  await chrome.storage.local.set({ [STORAGE_KEY]: emojis });
}
