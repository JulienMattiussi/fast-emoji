import Gtk from "gi://Gtk";
import Adw from "gi://Adw";
import Gio from "gi://Gio";
import GLib from "gi://GLib";

import { ExtensionPreferences } from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";

const DEFAULT_EMOJIS = [
  "👍", "😂", "👎", "💩", "🎉", "🤣", "👀", "❤️", "🫶", "😘",
];

const EMOJI_BANK = [
  { name: "Smileys", emojis: ["😀","😃","😄","😁","😆","😅","🤣","😂","🙂","🙃","😉","😊","😇","🥰","😍","🤩","😘","😗","😚","😙","🥲","😋","😛","😜","🤪","😝","🤑","🤗","🤭","🤫","🤔","🫡","🤐","🤨","😐","😑","😶","🫥","😏","😒","🙄","😬","🤥","😌","😔","😪","🤤","😴","😷","🤒","🤕","🤢","🤮","🥵","🥶","🥴","😵","🤯","🤠","🥳","🥸","😎","🤓","🧐","😕","🫤","😟","🙁","😮","😯","😲","😳","🥺","🥹","😦","😧","😨","😰","😥","😢","😭","😱","😖","😣","😞","😓","😩","😫","🥱","😤","😡","😠","🤬","😈","👿","💀","☠️","💩","🤡","👹","👺","👻","👽","🤖","😺","😸","😹","😻","😼","😽","🙀","😿","😾"] },
  { name: "Gestes", emojis: ["👋","🤚","🖐️","✋","🖖","🫱","🫲","🫳","🫴","👌","🤌","🤏","✌️","🤞","🫰","🤟","🤘","🤙","👈","👉","👆","🖕","👇","☝️","🫵","👍","👎","✊","👊","🤛","🤜","👏","🙌","🫶","👐","🤲","🤝","🙏","✍️","💅","🤳","💪","🦾","🦿","🦵","🦶","👂","🦻","👃","👀","👁️","👅","👄","🫦"] },
  { name: "Coeurs", emojis: ["❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","❤️‍🔥","❤️‍🩹","💔","💕","💞","💓","💗","💖","💘","💝","💟","♥️","🩷","🩵","🩶"] },
  { name: "Celebration", emojis: ["🎉","🎊","🎈","🎁","🎀","🪅","🎆","🎇","✨","🎍","🎎","🎏","🎐","🎑","🎄","🎃","🧨","🪩","🏆","🥇","🥈","🥉","🏅","🎖️"] },
  { name: "Animaux", emojis: ["🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯","🦁","🐮","🐷","🐸","🐵","🙈","🙉","🙊","🐔","🐧","🐦","🦄","🐝","🐛","🦋","🐌","🐞","🐢","🐍","🦖"] },
  { name: "Nourriture", emojis: ["🍎","🍐","🍊","🍋","🍌","🍉","🍇","🍓","🫐","🍒","🍑","🥭","🍍","🥥","🥝","🍔","🍕","🌭","🍟","🌮","🍣","🍩","🍪","🎂","🍰","☕","🍺","🍷","🥂","🍾"] },
  { name: "Objets", emojis: ["⌚","📱","💻","⌨️","🖥️","🖨️","🖱️","💡","🔦","🕯️","📷","🎥","🎬","📺","🔔","🔕","🎵","🎶","🎤","🎧","📻","🎸","🎹","🎺","🔑","🔒","🔓","📌","📎","✏️"] },
  { name: "Symboles", emojis: ["✅","❌","❓","❗","‼️","⁉️","💯","🔥","💫","⭐","🌟","💥","💢","💤","💬","👁️‍🗨️","🗨️","💭","🕳️","⚠️","♻️","🚫","⛔","🏳️","🏴","🚀","⚡","☀️","🌈","🔴"] },
];

function resolveConfigFile(extensionPath) {
  try {
    const info = Gio.File.new_for_path(extensionPath).query_info(
      "standard::is-symlink,standard::symlink-target",
      Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS,
      null,
    );
    if (info.get_is_symlink()) {
      const target = info.get_symlink_target();
      const repoDir = GLib.path_get_dirname(target);
      return GLib.build_filenamev([repoDir, "favorites.json"]);
    }
  } catch {
    // Not a symlink
  }
  return GLib.build_filenamev([extensionPath, "favorites.json"]);
}

function loadFavorites(configFile) {
  try {
    const file = Gio.File.new_for_path(configFile);
    const [ok, contents] = file.load_contents(null);
    if (ok) {
      const parsed = JSON.parse(new TextDecoder().decode(contents));
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // File doesn't exist
  }
  return [...DEFAULT_EMOJIS];
}

function saveFavorites(configFile, favorites) {
  const file = Gio.File.new_for_path(configFile);
  const json = JSON.stringify(favorites, null, 2);
  file.replace_contents(
    new TextEncoder().encode(json),
    null,
    false,
    Gio.FileCreateFlags.REPLACE_DESTINATION,
    null,
  );
}

export default class FastEmojiPreferences extends ExtensionPreferences {
  fillPreferencesWindow(window) {
    const configFile = resolveConfigFile(this.path);
    let favorites = loadFavorites(configFile);

    const page = new Adw.PreferencesPage({
      title: "Emojis",
      icon_name: "face-smile-symbolic",
    });

    for (const category of EMOJI_BANK) {
      const group = new Adw.PreferencesGroup({
        title: category.name,
      });

      const flow = new Gtk.FlowBox({
        max_children_per_line: 10,
        min_children_per_line: 6,
        selection_mode: Gtk.SelectionMode.NONE,
        homogeneous: true,
        row_spacing: 4,
        column_spacing: 4,
      });

      for (const emoji of category.emojis) {
        const btn = new Gtk.ToggleButton({
          label: emoji,
          active: favorites.includes(emoji),
          css_classes: ["flat"],
          width_request: 36,
          height_request: 36,
        });

        btn.connect("toggled", () => {
          if (btn.get_active()) {
            if (!favorites.includes(emoji)) {
              favorites.push(emoji);
            }
          } else {
            favorites = favorites.filter((e) => e !== emoji);
          }
          saveFavorites(configFile, favorites);
        });

        flow.append(btn);
      }

      group.add(flow);
      page.add(group);
    }

    // Signature
    const sigGroup = new Adw.PreferencesGroup();
    const sigLabel = new Gtk.Label({
      label: "with ❤\uFE0F by YavaDeus",
      css_classes: ["dim-label"],
    });
    sigGroup.add(sigLabel);
    page.add(sigGroup);

    window.add(page);
  }
}
