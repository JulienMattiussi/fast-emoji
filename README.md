# <img src="web-extension/icons/icon-48.png" width="32" height="32" alt="icon" /> Fast Emoji

Copiez un emoji dans le presse-papier en un clic. Disponible en extension navigateur et en extension GNOME Shell.

<p align="center">
  <img src="web-extension/docs/preview.png" alt="Fast Emoji popup" width="160" />
</p>

## Compatibilite

| Extension | Navigateur / Environnement | OS |
| --- | --- | --- |
| [**web-extension/**](web-extension/) | Chrome, Brave, Edge (Manifest V3) | Windows, macOS, Linux |
| [**web-extension/**](web-extension/) | Firefox 121+ (Manifest V3) | Windows, macOS, Linux |
| [**gnome-extension/**](gnome-extension/) | GNOME Shell 46 | Linux (Ubuntu 24.04, Fedora 40, Arch...) |

Voir le README de chaque extension pour les instructions detaillees.

## Installation

### Extension navigateur seule

Charger `web-extension/dist/` dans le navigateur (voir [web-extension/README](web-extension/)).

### Extension GNOME seule

```bash
make install-gnome
```

Puis redemarrer GNOME Shell (`Alt+F2` → `r` → `Enter` sur X11) et activer :

```bash
gnome-extensions enable fast-emoji@yavadeus
```

### Config partagee (navigateur + GNOME)

Pour que les deux extensions partagent la meme liste d'emojis, configurer le bridge avec l'ID de l'extension navigateur :

```bash
make install-bridge ID=<id_extension>
```

L'ID est visible dans la page des extensions du navigateur (`chrome://extensions`, `brave://extensions`, etc.) avec le mode developpeur active.

Apres la commande, **recharger l'extension dans le navigateur** pour qu'elle detecte le bridge.

> Si vous reinstallez l'extension navigateur, l'ID peut changer. Relancez `make install-bridge ID=<nouvel_id>` dans ce cas.

### Installation interactive

Pour tout configurer en une fois (GNOME + bridge) :

```bash
make install
```

## Commandes disponibles

| Commande | Description |
| --- | --- |
| `make install` | Installation interactive (GNOME + bridge) |
| `make install-gnome` | Installer l'extension GNOME Shell |
| `make install-bridge ID=...` | Configurer le bridge navigateur |
| `make uninstall` | Tout desinstaller |
| `make uninstall-gnome` | Desinstaller l'extension GNOME |

## Config partagee

Quand les deux extensions sont installees sur le meme poste, elles partagent la meme liste de favoris via `favorites.json` a la racine du depot. Les modifications faites depuis le navigateur (via la banque d'emojis) sont automatiquement refletees dans GNOME Shell.

Chaque extension fonctionne aussi de maniere autonome si l'autre n'est pas installee.

### Comment ca marche

Les extensions navigateur sont sandboxees et n'ont pas acces au filesystem. Le dossier `native-host/` contient un petit script Python qui sert de pont via le mecanisme [Native Messaging](https://developer.chrome.com/docs/extensions/develop/concepts/native-messaging) :

```
Navigateur → service worker → native messaging → fast-emoji-host.py → favorites.json ← GNOME extension
```

`make install-bridge` enregistre ce script aupres du navigateur. Sans le bridge, chaque extension fonctionne independamment mais sans partage de config.

## Structure du projet

```
fast-emoji/
├── web-extension/         # Extension navigateur (Chrome, Firefox, Brave)
├── gnome-extension/       # Extension GNOME Shell
├── native-host/           # Script Python de bridge (native messaging)
├── favorites.json         # Config partagee (generee au runtime)
├── install.sh             # Installation interactive
├── Makefile               # Commandes make
└── LICENSE
```

## Licence

MIT
