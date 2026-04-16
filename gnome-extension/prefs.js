import Gtk from "gi://Gtk";
import Adw from "gi://Adw";
import Gio from "gi://Gio";
import GLib from "gi://GLib";

import { ExtensionPreferences } from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";

const DEFAULT_EMOJIS = [
  "👍", "😂", "👎", "💩", "🎉", "🤣", "👀", "❤️", "🫶", "😘",
];

function resolveRepoDir(extensionPath) {
  try {
    const info = Gio.File.new_for_path(extensionPath).query_info(
      "standard::is-symlink,standard::symlink-target",
      Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS,
      null,
    );
    if (info.get_is_symlink()) {
      return GLib.path_get_dirname(info.get_symlink_target());
    }
  } catch {
    // Not a symlink
  }
  return extensionPath;
}

function loadEmojiBank(repoDir) {
  const path = GLib.build_filenamev([repoDir, "emoji-bank.json"]);
  const file = Gio.File.new_for_path(path);
  try {
    const [ok, contents] = file.load_contents(null);
    if (ok) {
      return JSON.parse(new TextDecoder().decode(contents));
    }
  } catch {
    // Fall back
  }
  return [];
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
    const repoDir = resolveRepoDir(this.path);
    const configFile = GLib.build_filenamev([repoDir, "favorites.json"]);
    const emojiBank = loadEmojiBank(repoDir);
    let favorites = loadFavorites(configFile);

    const page = new Adw.PreferencesPage({
      title: "Emojis",
      icon_name: "face-smile-symbolic",
    });

    for (const category of emojiBank) {
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

    // Signature (derniere categorie)
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
