.PHONY: help install install-gnome install-bridge uninstall uninstall-gnome

REPO_DIR := $(shell cd "$(dir $(lastword $(MAKEFILE_LIST)))" && pwd)
HOST_NAME := com.yavadeus.fast_emoji
HOST_SCRIPT := $(REPO_DIR)/native-host/fast-emoji-host.py
GNOME_UUID := fast-emoji@yavadeus
EXTENSIONS_DIR := $(HOME)/.local/share/gnome-shell/extensions

default: help

help: ## Afficher les commandes disponibles
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk -F ':.*?## ' '{printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

install: ## Installation interactive (GNOME + bridge navigateur)
	@bash $(REPO_DIR)/install.sh

install-gnome: ## Installer l'extension GNOME Shell
	@mkdir -p $(EXTENSIONS_DIR)
	@ln -sfn $(REPO_DIR)/gnome-extension $(EXTENSIONS_DIR)/$(GNOME_UUID)
	@echo "Extension GNOME installee."
	@echo "Redemarrer GNOME Shell (Alt+F2 → r → Enter) puis :"
	@echo "  gnome-extensions enable $(GNOME_UUID)"

install-bridge: ## Configurer le bridge navigateur (necessite l'ID de l'extension)
	@if [ -z "$(ID)" ]; then \
		echo "Usage: make install-bridge ID=<id_extension_chrome>"; \
		echo ""; \
		echo "L'ID est visible dans la page des extensions du navigateur"; \
		echo "(chrome://extensions ou brave://extensions, mode developpeur active)."; \
		exit 1; \
	fi
	@MANIFEST='{ "name": "$(HOST_NAME)", "description": "Fast Emoji shared config bridge", "path": "$(HOST_SCRIPT)", "type": "stdio", "allowed_origins": ["chrome-extension://$(ID)/"] }'; \
	installed=0; \
	for dir in \
		"$(HOME)/.config/google-chrome/NativeMessagingHosts" \
		"$(HOME)/.config/BraveSoftware/Brave-Browser/NativeMessagingHosts" \
		"$(HOME)/.config/chromium/NativeMessagingHosts" \
		"$(HOME)/.config/microsoft-edge/NativeMessagingHosts" \
		"$(HOME)/snap/brave/current/.config/BraveSoftware/Brave-Browser/NativeMessagingHosts"; \
	do \
		parent=$$(dirname "$$dir"); \
		if [ -d "$$parent" ]; then \
			mkdir -p "$$dir"; \
			echo "$$MANIFEST" > "$$dir/$(HOST_NAME).json"; \
			echo "Bridge configure dans $$dir"; \
			installed=1; \
		fi; \
	done; \
	if [ "$$installed" -eq 0 ]; then \
		mkdir -p "$(HOME)/.config/google-chrome/NativeMessagingHosts"; \
		echo "$$MANIFEST" > "$(HOME)/.config/google-chrome/NativeMessagingHosts/$(HOST_NAME).json"; \
		echo "Bridge configure dans $(HOME)/.config/google-chrome/NativeMessagingHosts"; \
	fi
	@echo ""
	@echo "Penser a recharger l'extension dans le navigateur."

uninstall-gnome: ## Desinstaller l'extension GNOME Shell
	@gnome-extensions disable $(GNOME_UUID) 2>/dev/null || true
	@rm -f $(EXTENSIONS_DIR)/$(GNOME_UUID)
	@echo "Extension GNOME desinstallee."

uninstall: ## Tout desinstaller (GNOME + bridges)
	@$(MAKE) -s uninstall-gnome
	@rm -f $(HOME)/.config/google-chrome/NativeMessagingHosts/$(HOST_NAME).json 2>/dev/null || true
	@rm -f $(HOME)/.config/BraveSoftware/Brave-Browser/NativeMessagingHosts/$(HOST_NAME).json 2>/dev/null || true
	@rm -f $(HOME)/.config/chromium/NativeMessagingHosts/$(HOST_NAME).json 2>/dev/null || true
	@rm -f $(HOME)/.config/microsoft-edge/NativeMessagingHosts/$(HOST_NAME).json 2>/dev/null || true
	@rm -f $(HOME)/snap/brave/current/.config/BraveSoftware/Brave-Browser/NativeMessagingHosts/$(HOST_NAME).json 2>/dev/null || true
	@rm -f $(HOME)/.mozilla/native-messaging-hosts/$(HOST_NAME).json 2>/dev/null || true
	@echo "Bridges navigateur desinstalles."
