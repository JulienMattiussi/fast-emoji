#!/usr/bin/env python3
"""Native messaging host for Fast Emoji.

Bridges Chrome/Firefox extension with the shared config file.
The config is stored next to this script to avoid snap sandbox issues.

Protocol (stdin/stdout with 4-byte length prefix):
  → {"action": "load"}
  ← {"favorites": ["👍", "😂", ...]}  or  {"favorites": null}

  → {"action": "save", "favorites": ["👍", "😂", ...]}
  ← {"ok": true}
"""

import json
import os
import struct
import sys

# Store config next to this script (works even inside snap sandbox)
_script_dir = os.path.dirname(os.path.abspath(__file__))
_repo_dir = os.path.dirname(_script_dir)
CONFIG_FILE = os.path.join(_repo_dir, "favorites.json")


def read_message():
    raw = sys.stdin.buffer.read(4)
    if not raw or len(raw) < 4:
        return None
    length = struct.unpack("=I", raw)[0]
    data = sys.stdin.buffer.read(length)
    return json.loads(data)


def send_message(msg):
    data = json.dumps(msg, ensure_ascii=False).encode("utf-8")
    sys.stdout.buffer.write(struct.pack("=I", len(data)))
    sys.stdout.buffer.write(data)
    sys.stdout.buffer.flush()


def load_favorites():
    try:
        with open(CONFIG_FILE, encoding="utf-8") as f:
            parsed = json.load(f)
            if isinstance(parsed, list) and len(parsed) > 0:
                return parsed
    except (FileNotFoundError, json.JSONDecodeError, OSError):
        pass
    return None


def save_favorites(favorites):
    with open(CONFIG_FILE, "w", encoding="utf-8") as f:
        json.dump(favorites, f, ensure_ascii=False, indent=2)


def main():
    msg = read_message()
    if not msg:
        return

    action = msg.get("action")

    if action == "load":
        send_message({"favorites": load_favorites()})
    elif action == "save":
        save_favorites(msg.get("favorites", []))
        send_message({"ok": True})
    else:
        send_message({"error": f"unknown action: {action}"})


if __name__ == "__main__":
    main()
