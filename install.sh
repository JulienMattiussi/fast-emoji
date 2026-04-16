#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
HOST_NAME="com.yavadeus.fast_emoji"
HOST_SCRIPT="$SCRIPT_DIR/native-host/fast-emoji-host.py"
GNOME_UUID="fast-emoji@yavadeus"
FIREFOX_EXT_ID="fast-emoji@yavadeus"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "Fast Emoji — Installation"
echo "========================="
echo ""

# --- 1. Verify repo structure ---
echo -e "${GREEN}✓${NC} Depot: $SCRIPT_DIR"

# --- 2. GNOME Shell extension ---
read -rp "Installer l'extension GNOME Shell ? [o/N] " install_gnome
if [[ "$install_gnome" =~ ^[oOyY]$ ]]; then
    EXTENSIONS_DIR="$HOME/.local/share/gnome-shell/extensions"
    mkdir -p "$EXTENSIONS_DIR"
    ln -sfn "$SCRIPT_DIR/gnome-extension" "$EXTENSIONS_DIR/$GNOME_UUID"
    echo -e "${GREEN}✓${NC} Extension GNOME installee (symlink)"
    echo -e "${YELLOW}  → Redemarrer GNOME Shell pour activer (Alt+F2 → r → Enter sur X11)${NC}"
    echo -e "${YELLOW}  → Puis: gnome-extensions enable $GNOME_UUID${NC}"
fi

# --- 3. Native messaging host for Chromium-based browsers ---
read -rp "Configurer le partage avec un navigateur Chromium (Chrome, Brave, Edge...) ? [o/N] " install_chrome
if [[ "$install_chrome" =~ ^[oOyY]$ ]]; then
    echo ""
    echo "L'ID de l'extension est visible dans la page des extensions"
    echo "(chrome://extensions ou brave://extensions, mode developpeur active)."
    echo ""
    read -rp "ID de l'extension : " chrome_id

    if [[ -n "$chrome_id" ]]; then
        MANIFEST_CONTENT=$(cat <<EOF
{
  "name": "$HOST_NAME",
  "description": "Fast Emoji shared config bridge",
  "path": "$HOST_SCRIPT",
  "type": "stdio",
  "allowed_origins": ["chrome-extension://$chrome_id/"]
}
EOF
)
        # Install for all known Chromium-based browsers
        CHROME_DIRS=(
            "$HOME/.config/google-chrome/NativeMessagingHosts"
            "$HOME/.config/BraveSoftware/Brave-Browser/NativeMessagingHosts"
            "$HOME/.config/chromium/NativeMessagingHosts"
            "$HOME/.config/microsoft-edge/NativeMessagingHosts"
            "$HOME/snap/brave/current/.config/BraveSoftware/Brave-Browser/NativeMessagingHosts"
        )
        installed=0
        for dir in "${CHROME_DIRS[@]}"; do
            parent="$(dirname "$dir")"
            if [[ -d "$parent" ]]; then
                mkdir -p "$dir"
                echo "$MANIFEST_CONTENT" > "$dir/$HOST_NAME.json"
                echo -e "${GREEN}✓${NC} Native messaging configure dans $dir"
                installed=1
            fi
        done
        if [[ $installed -eq 0 ]]; then
            # No known browser dir found, create for Chrome by default
            mkdir -p "${CHROME_DIRS[0]}"
            echo "$MANIFEST_CONTENT" > "${CHROME_DIRS[0]}/$HOST_NAME.json"
            echo -e "${GREEN}✓${NC} Native messaging configure dans ${CHROME_DIRS[0]}"
        fi
    fi
fi

# --- 4. Native messaging host for Firefox ---
read -rp "Configurer le partage avec Firefox ? [o/N] " install_firefox
if [[ "$install_firefox" =~ ^[oOyY]$ ]]; then
    FIREFOX_NM_DIR="$HOME/.mozilla/native-messaging-hosts"
    mkdir -p "$FIREFOX_NM_DIR"
    cat > "$FIREFOX_NM_DIR/$HOST_NAME.json" <<EOF
{
  "name": "$HOST_NAME",
  "description": "Fast Emoji shared config bridge",
  "path": "$HOST_SCRIPT",
  "type": "stdio",
  "allowed_extensions": ["$FIREFOX_EXT_ID"]
}
EOF
    echo -e "${GREEN}✓${NC} Native messaging Firefox configure"
fi

echo ""
echo -e "${GREEN}Installation terminee.${NC}"
echo ""
echo "Recap :"
echo "  Config partagee : $SCRIPT_DIR/favorites.json"
echo "  Extension navigateur : charger web-extension/dist/ dans le navigateur"
echo "  Extension GNOME      : gnome-extensions enable $GNOME_UUID"
