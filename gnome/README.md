# Fast Emoji — GNOME Shell

Extension GNOME Shell pour copier un emoji dans le presse-papier depuis la barre du haut.

## Installation

```bash
cd gnome
make install
```

Puis redemarrer GNOME Shell pour que l'extension soit detectee :

- **X11 :** `Alt+F2` → taper `r` → `Enter`
- **Wayland :** se deconnecter puis se reconnecter

Enfin, activer l'extension :

```bash
make enable
```

> **Astuce :** pour savoir si vous etes sur X11 ou Wayland, lancez `echo $XDG_SESSION_TYPE` dans un terminal.

## Desinstallation

```bash
cd gnome
make disable
make uninstall
```

## Personnalisation

Editer le fichier `gnome/favorites.json` avec la liste d'emojis souhaitee :

```json
["🔥", "🚀", "✅", "❌", "💯"]
```

Puis redemarrer GNOME Shell pour appliquer :

- **X11 :** `Alt+F2` → `r` → `Enter`
- **Wayland :** se deconnecter/reconnecter

## Compatibilite

- GNOME Shell 46 (Ubuntu 24.04)
