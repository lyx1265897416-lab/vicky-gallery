# The Cat Who Inherited Everything — original quality

Added to the bilingual gallery on 2026-11-23 with an English 9:16 cover and the four-episode interactive player. Both embedded preview and external link point to the same published player; their language follows the gallery when opened.

- All 73 current and comparison-version movie/idle assets: 1080×1920.
- Every CDN object has the same byte length and MD5 as its approved local final master; CDN supports byte range requests. SHA-256 inventory: https://lyx1265897416-lab.github.io/cat-who-inherited-play/player/original-media.json
- Removed publication-time 4 Mbps/2 Mbps encoding and automatic lower-bitrate routing. Future builds copy/upload original files and record their SHA-256.
- Preserved 49 current-story nodes, 50 comparison-story nodes, choices, effects, subtitles and episode navigation.
- Preserved early opening preload, sequential next-node/choice preloading, current-video buffer priority and video-element swapping. A waiting indicator replaces silent quality downgrade.
- Browser check at desktop and 390×844: opening, first transition and first choice A played at 1080×1920; both A/B clips were already buffered when choices appeared. Choice A had 16.54 seconds buffered immediately after selection.

Playback depends on connection throughput. These changes do not promise stall-free playback on every network; quality never silently drops to a compressed alternate.

## Update verified 2026-11-24

The public player matches release 9f25c4f and contains five episodes (episode 5: The Review). The gallery remains in position three. Updated the bilingual episode count and English cover to five episodes. The public story, player and original-media manifest match the published project checkout. Browser playback of episode 5 reports 1080×1920. The 17 episode-5 video/idle files match their local masters by SHA-256 and CDN MD5/byte length, with no bitrate fallback.
