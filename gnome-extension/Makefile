.PHONY: help install uninstall restart

EXTENSION_UUID = fast-emoji@yavadeus
EXTENSIONS_DIR = $(HOME)/.local/share/gnome-shell/extensions

default: help

help: ## Display available commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk -F ':.*?## ' '{printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

install: ## Install extension (symlink) and restart GNOME Shell
	mkdir -p $(EXTENSIONS_DIR)
	ln -sfn $(CURDIR) $(EXTENSIONS_DIR)/$(EXTENSION_UUID)
	@echo "Installed. Run 'make restart' or log out/in to activate."

uninstall: ## Remove extension
	rm -f $(EXTENSIONS_DIR)/$(EXTENSION_UUID)
	@echo "Uninstalled."

restart: ## Restart GNOME Shell (Wayland: log out/in required)
	@if [ "$$XDG_SESSION_TYPE" = "x11" ]; then \
		busctl --user call org.gnome.Shell /org/gnome/Shell org.gnome.Shell Eval s 'Meta.restart("Restarting…")' 2>/dev/null || echo "Restart manually (Alt+F2 → r → Enter)"; \
	else \
		echo "Wayland: please log out and log back in to restart GNOME Shell."; \
	fi

enable: ## Enable the extension via gnome-extensions
	gnome-extensions enable $(EXTENSION_UUID)

disable: ## Disable the extension via gnome-extensions
	gnome-extensions disable $(EXTENSION_UUID)
