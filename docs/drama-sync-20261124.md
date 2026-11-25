# Drama synchronization audit - 2026-11-24

Compared the portfolio's 12 entries with current project release sources, Git history and public player files. Only confirmed published material is eligible for replacement.

| Series | Result |
|---|---|
| Sunset Island | Still 7 episodes. Later playback work had reintroduced 4/2 Mbps encodes. Restored all 548 original CDN clips while retaining the latest preloading and transition fixes. Published cover unchanged; recent covers-v2 images are candidates. |
| No Work Today, Mii's Got You | Latest release unchanged: 10 episodes. Cover, player and original-media manifest unchanged. |
| The Cat Who Inherited Everything | Already synchronized earlier in this audit to 5 episodes. Third position and original-quality player retained. |
| Meet Me, Again (branching) | Latest release unchanged: 8 episodes, 298 original CDN clips. |
| Among Wolves | Latest release unchanged: 7 episodes, 8 choice points, 26 approved SeedVR2 masters. Interactive branches retained. |
| The Sea Prince's Almost Bride | Latest release unchanged: first 5 episodes, 119 original clips. |
| One Night, Nine Lives | Latest release unchanged: 6 episodes, 20 choices, 3 endings, 299 original clips. Public files match current checkout. |
| Rafael / Not Pretending | Only relay.json connection address updated since previous audit. Published opening and cover unchanged. |
| Don't Trust This Feed | Only relay.json updated. Published media unchanged. |
| Meet Me, Again (live) | Only relay.json updated. Confirmed opening retained. |
| Four Liars, One Island | Only relay.json updated. Published media unchanged. |
| The Sea Prince's Almost Bride (live) | Only relay.json updated. Published media unchanged. |

## Validation

- For the ten players with unchanged media, public index.html and present app.js, data.js, player-data.json, release.json and original-media.json match the latest local release byte-for-byte. Git changes since the November 15 original-quality audit show no subsequent media compression.
- Sunset Island: all 548 CDN files match local original size and storage MD5; all support byte ranges. The story, subtitle, state and choice graph (346 nodes) is unchanged. Removed lite mappings and all automatic downgrade code.
- Portfolio embedded and external Sunset links use the same refreshed player URL and follow the selected Chinese/English language.
- Original quality means the approved master, not a claim that native 480p or 720p is native 1080p. No paid live generation was triggered during this audit.
