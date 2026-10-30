# Vicky’s Gallery

A personal portfolio for AIGC design, interactive creation and stories.

**Website:** https://lyx1265897416-lab.github.io/vicky-gallery/

## Collections

- 52 interactive works
- 5 interactive series
- 6 reusable creative method cards
- Vicky Asset Repository
- About Vicky and a personal journal (some media is still being collected)

## Update the website

1. Edit `content/catalog.json` to change titles, descriptions, ordering or preview links.
2. Place new media in `content/` and reference its repository-relative path in the catalog.
3. Edit layout and interactions in `source/`.
4. Run `npm --prefix source ci` and `node source/build.mjs` to rebuild `index.html`.
5. Commit the updated source, assets and generated `index.html`, then push to `main`. GitHub Pages automatically publishes the branch at the same URL.

For local development (Node.js 22):

```sh
npm --prefix source ci
node source/build.mjs
python3 -m http.server 8080 --bind 127.0.0.1
```

Open http://127.0.0.1:8080/. Do not commit `node_modules`, secrets, private review notes, or source-generation logs.

## Hosting

This is a static site on GitHub Pages. It has no server process to keep running and does not depend on the author's local computer. Keep the repository public and Pages enabled to retain the address. Interactive experiences linked from the gallery are hosted separately and depend on their original services. AI, camera, and microphone features may require permissions or the original platform environment.

Artwork and portfolio content belong to their respective creators. Three.js license is included in `THREE-LICENSE.txt`.

## Languages

The interface supports Simplified Chinese and English with in-place switching. New visitors start in their browser language; a manual choice is saved on the device. Switching preserves the current scene, filters and open player. Approved cover artwork stays in English. Embedded works and external sites retain their own language controls.

- `content/catalog.json`: source catalog and Chinese copy.
- `content/locales/en.json`: English content translations, keyed by the Chinese source text.
- `source/locale-ui.js`: interface labels and messages.
- Run `node source/check-locales.mjs` after content changes, then rebuild. Add a translation whenever a source text changes.
- English method-card downloads are regenerated during the build.
