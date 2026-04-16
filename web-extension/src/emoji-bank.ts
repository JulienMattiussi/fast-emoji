export interface EmojiCategory {
  name: string;
  emojis: string[];
}

import bank from "../../emoji-bank.json";

export const emojiBank: EmojiCategory[] = bank;
