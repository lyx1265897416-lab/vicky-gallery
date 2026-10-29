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
