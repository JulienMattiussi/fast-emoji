import GObject from "gi://GObject";
import St from "gi://St";
import Gio from "gi://Gio";
import GLib from "gi://GLib";
import Clutter from "gi://Clutter";

import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";
import * as Main from "resource:///org/gnome/shell/ui/main.js";
import * as PanelMenu from "resource:///org/gnome/shell/ui/panelMenu.js";
import * as PopupMenu from "resource:///org/gnome/shell/ui/popupMenu.js";

const DEFAULT_EMOJIS = [
  "👍",
  "😂",
  "👎",
  "💩",
  "🎉",
  "🤣",
  "👀",
  "❤️",
  "🫶",
  "😘",
];

// Resolve config file path. The extension is symlinked:
//   ~/.local/share/gnome-shell/extensions/fast-emoji@yavadeus → <repo>/gnome/
// We resolve the symlink and look for favorites.json in the repo root.
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

const FastEmojiButton = GObject.registerClass(
  class FastEmojiButton extends PanelMenu.Button {
    _init(extensionPath) {
      super._init(0.0, "Fast Emoji");

      this._configFile = resolveConfigFile(extensionPath);

      const gicon = Gio.icon_new_for_string(
        GLib.build_filenamev([extensionPath, "icon.png"]),
      );
      const icon = new St.Icon({
        gicon,
        style_class: "system-status-icon",
        icon_size: 16,
      });
      this.add_child(icon);

      this._favorites = this._loadFavorites();
      this._buildMenu();

      // Watch for config changes (e.g. from Chrome extension)
      const file = Gio.File.new_for_path(this._configFile);
      this._configMonitor = file.monitor_file(
        Gio.FileMonitorFlags.NONE,
        null,
      );
      this._configMonitor.connect(
        "changed",
        (_monitor, _file, _other, eventType) => {
          if (eventType === Gio.FileMonitorEvent.CHANGES_DONE_HINT) {
            this._favorites = this._loadFavorites();
            this._buildMenu();
          }
        },
      );
    }

    _loadFavorites() {
      const file = Gio.File.new_for_path(this._configFile);
      try {
        const [ok, contents] = file.load_contents(null);
        if (ok) {
          const parsed = JSON.parse(new TextDecoder().decode(contents));
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch {
        // File doesn't exist yet
      }
      return [...DEFAULT_EMOJIS];
    }

    _buildMenu() {
      this.menu.removeAll();

      const item = new PopupMenu.PopupBaseMenuItem({ reactive: false });

      const grid = new St.Widget({
        layout_manager: new Clutter.GridLayout(),
        x_expand: true,
      });

      const layout = grid.layout_manager;
      const cols = 5;

      this._favorites.forEach((emoji, i) => {
        const btn = new St.Button({
          label: emoji,
          style_class: "fast-emoji-btn",
          can_focus: true,
        });

        btn.connect("clicked", () => {
          St.Clipboard.get_default().set_text(
            St.ClipboardType.CLIPBOARD,
            emoji,
          );
          btn.add_style_class_name("fast-emoji-copied");
          GLib.timeout_add(GLib.PRIORITY_DEFAULT, 400, () => {
            btn.remove_style_class_name("fast-emoji-copied");
            return GLib.SOURCE_REMOVE;
          });
        });

        layout.attach(btn, i % cols, Math.floor(i / cols), 1, 1);
      });

      item.add_child(grid);
      this.menu.addMenuItem(item);

      // Settings button
      this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
      const settingsItem = new PopupMenu.PopupMenuItem("⚙️  Personnaliser");
      settingsItem.connect("activate", () => {
        this._openPrefs();
      });
      this.menu.addMenuItem(settingsItem);
    }

    _openPrefs() {
      const subprocess = new Gio.Subprocess({
        argv: ["gnome-extensions", "prefs", "fast-emoji@yavadeus"],
        flags: Gio.SubprocessFlags.NONE,
      });
      subprocess.init(null);
    }

    destroy() {
      if (this._configMonitor) {
        this._configMonitor.cancel();
        this._configMonitor = null;
      }
      super.destroy();
    }
  },
);

export default class FastEmojiExtension extends Extension {
  enable() {
    this._indicator = new FastEmojiButton(this.path);
    Main.panel.addToStatusArea("fast-emoji", this._indicator);
  }

  disable() {
    this._indicator?.destroy();
    this._indicator = null;
  }
}
