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

La config partagee entre les extensions necessite Linux (native messaging + GNOME).

Voir le README de chaque extension pour les instructions detaillees.

## Installation complete

Le script `install.sh` configure tout en une fois :

```bash
./install.sh
```

Il propose d'installer :
- L'extension GNOME Shell
- Le bridge de config partagee pour Chrome/Brave/Firefox

Apres avoir lance le script, **recharger l'extension dans le navigateur** pour qu'elle detecte le bridge :
- **Chrome/Brave :** aller sur la page des extensions et cliquer sur la fleche de rechargement de Fast Emoji
- **Firefox :** aller sur `about:debugging#/runtime/this-firefox` et cliquer sur "Recharger"

## Config partagee

Quand les deux extensions sont installees sur le meme poste, elles partagent la meme liste de favoris via `favorites.json` a la racine du depot. Les modifications faites depuis le navigateur (via la banque d'emojis) sont automatiquement refletees dans GNOME Shell.

Chaque extension fonctionne aussi de maniere autonome si l'autre n'est pas installee.

## Licence

MIT
