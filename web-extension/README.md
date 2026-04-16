# <img src="icons/icon-48.png" width="32" height="32" alt="icon" /> Fast Emoji — Extension navigateur

Extension pour Chrome, Firefox et Brave permettant de copier un emoji dans le presse-papier en un clic.

<p align="center">
  <img src="docs/preview.png" alt="Fast Emoji popup" width="160" />
</p>

## Installation

Le dossier `dist/` est inclus dans le depot — pas besoin de build.

**Chrome/Brave :**

1. Cloner le depot ou telecharger le ZIP
2. Ouvrir `chrome://extensions` (ou `brave://extensions`)
3. Activer le **Mode developpeur** (en haut a droite)
4. Cliquer sur **Charger l'extension non empaquetee**
5. Selectionner le dossier `web-extension/dist/`

**Firefox :**

1. Cloner le depot ou telecharger le ZIP
2. Ouvrir `about:debugging#/runtime/this-firefox`
3. Cliquer sur **Charger un module complementaire temporaire**
4. Selectionner le fichier `web-extension/dist/manifest.json`

## Utilisation

Cliquer sur l'icone de l'extension dans la barre d'outils. La popup s'ouvre avec la grille d'emojis. Un clic copie l'emoji dans le presse-papier — le bouton passe brievement en vert pour confirmer.

### Personnaliser les emojis

Cliquer sur l'icone ⚙️ dans la barre de titre pour ouvrir la banque d'emojis. Les emojis sont classes par categorie (Smileys, Gestes, Coeurs, Celebration, Animaux, Nourriture, Objets, Symboles). Cliquer sur un emoji pour l'ajouter ou le retirer de la selection. Les choix sont sauvegardes localement.

## Developpement

```bash
make install       # Installer les dependances
make watch         # Build avec rebuild automatique
make check         # Lancer tous les checks (types + format + tests)
```

### Commandes disponibles

| Commande            | Description                                  |
| ------------------- | -------------------------------------------- |
| `make install`      | Installer les dependances                    |
| `make build`        | Build l'extension dans `dist/`               |
| `make watch`        | Mode dev avec rebuild on change              |
| `make clean`        | Nettoyer `dist/` et rebuild                  |
| `make typecheck`    | Verification des types TypeScript            |
| `make format`       | Formater le code avec Prettier               |
| `make format-check` | Verifier le formatage (CI)                   |
| `make test`         | Lancer les tests                             |
| `make test-watch`   | Tests en mode watch                          |
| `make check`        | Tous les checks (typecheck + format + tests) |

## Stack technique

- **Build** — esbuild (IIFE, target Chrome 120)
- **Langage** — TypeScript 5.7 (strict)
- **Tests** — Vitest + jsdom
- **Format** — Prettier
- **Extension** — Manifest V3 (Chrome, Firefox, Brave)

## Structure du projet

```
web-extension/
├── manifest.json          # Manifest V3
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── build.mjs              # Script de build esbuild
├── Makefile
├── icons/                 # Icones 16, 48, 128px
├── src/
│   ├── emojis.ts          # Liste des emojis par defaut
│   ├── emoji-bank.ts      # Banque complete (~335 emojis, 8 categories)
│   ├── storage.ts         # Persistance (native messaging + chrome.storage)
│   ├── popup.html
│   ├── popup.css
│   ├── popup/
│   │   └── index.ts       # Logique popup, settings, copie clipboard
│   └── service-worker/
│       └── index.ts       # Bridge native messaging
└── tests/
    ├── emojis.test.ts     # Tests sur la liste par defaut
    ├── emoji-bank.test.ts # Tests sur la banque d'emojis
    ├── storage.test.ts    # Tests du module de persistance
    └── popup.test.ts      # Tests DOM (rendu, settings, clipboard)
```

## Licence

MIT
