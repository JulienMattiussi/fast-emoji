# Fast Emoji — GNOME Shell

Extension GNOME Shell pour copier un emoji dans le presse-papier depuis la barre du haut.

## Installation

```bash
cd gnome-extension
make install
```

Puis redemarrer GNOME Shell pour que l'extension soit detectee :

- **X11 :** `Alt+F2` → taper `r` → `Enter`
- **Wayland :** se deconnecter puis se reconnecter, ou ouvrir [extensions.gnome.org/local](https://extensions.gnome.org/local/) dans un navigateur (necessite l'extension navigateur [GNOME Shell integration](https://addons.mozilla.org/firefox/addon/gnome-shell-integration/)) et activer Fast Emoji depuis la liste

Enfin, activer l'extension :

```bash
make enable
```

> **Astuce :** pour savoir si vous etes sur X11 ou Wayland, lancez `echo $XDG_SESSION_TYPE` dans un terminal.

## Utilisation

Cliquer sur l'icone Fast Emoji dans la barre du haut. La grille d'emojis s'ouvre. Un clic copie l'emoji dans le presse-papier.

## Personnalisation

Cliquer sur **⚙️ Personnaliser** en bas du menu pour ouvrir la fenetre de preferences. Les emojis sont classes par categorie -- cliquer pour ajouter ou retirer un emoji des favoris.

La personnalisation est aussi accessible via :

```bash
gnome-extensions prefs fast-emoji@yavadeus
```

Si l'extension navigateur est aussi installee, la configuration est partagee automatiquement.

## Desinstallation

```bash
cd gnome-extension
make disable
make uninstall
```

## Compatibilite

- GNOME Shell 46 (Ubuntu 24.04, Fedora 40, Arch...)
