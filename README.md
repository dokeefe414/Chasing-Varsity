# Chasing Varsity

## [▶ Play Chasing Varsity in your browser](https://chasing-varsity.nativebolt2.chatgpt.site)

**Click the link above to play instantly — no download or installation needed.** Works with keyboard, mouse, or touch. Your progress saves in the browser you play on.

A cross-country training and racing browser game created by **Daniel O’Keefe**. Train a rookie, learn to manage race effort, and work toward national competition. Original canvas artwork and vanilla JavaScript; no game engine, install, or paid assets required.

## Optional: play locally

Download this repository using **Code → Download ZIP**, extract it, and open **index.html** in Chrome, Edge, Firefox, or Safari. Keep `style.css`, `engine.js`, and `game.js` beside it. For consistent browser save behavior, use VS Code Live Server or run `npm run dev` with Node.js installed and open `http://localhost:3000`.

## Optional: host your own copy on GitHub Pages

In the repository open **Settings → Pages → Build and deployment**. Select **Deploy from a branch**, choose **main** and **/ (root)**, and save. GitHub will show the website link after deployment. No build step is needed. Pages must be enabled by the repository owner; committing these files alone does not enable hosting.

## Cartoon game world

Explore a full-screen animated camp with clickable training signs, a sprint track, lake, hills, and race gate. Original cartoon runners, bright scenery, chunky game menus, an energy meter, optional synthesized sound effects, and celebratory results bring the game to life. Existing browser saves are preserved.

## The game loop

1. Play 20-second training challenges to improve speed, endurance, and strength (maximum 100).
2. Enter the first meet. Finish in the top three to unlock the next one.
3. Earn coins from training and races. Buy cosmetic singlet colors in My runner.
4. Work through six meets, from the Pine Hollow Fun Run to Varsity Nationals.

### Controls

| Activity | Keyboard | Touch / mouse |
| --- | --- | --- |
| Race | 1 ease off, 2 hold pace, 3 push | Pace buttons |
| Intervals | Space when marker crosses gold | Tap action button |
| Long run | Hold Space to increase effort; release to lower | Hold/release action button |
| Hill repeats | Space to jump roots | Tap jump button |
| Pause | P | Pause / Resume |

The game pauses when the tab loses focus. Unfinished activities earn no rewards. Finishing a training session awards 2–6 stat points and 8–25 coins depending on performance, capped at 100 for each stat. Race time is accelerated for short arcade sessions; it is not a realistic race-time predictor.

### Race rules

Speed raises base velocity. Endurance reduces energy cost. Strength reduces the hill penalty. Pushing is faster but uses energy quickly; easing off restores it. Energy below 18% slows you down. Rivals also manage energy and attempt a finishing push. Each meet has a stronger field and a different hill intensity. Best place is kept across replays. All rewards are fictional in-game currency.

## Saves

Stats, coins, unlocked meets, best places, name, and outfits save automatically in this browser using localStorage. Saves do not sync across devices or browser profiles. Clearing site data removes your season. If browser storage is blocked, a warning appears and play continues for the current session. My runner → Save data includes a confirmed reset.

## Development

- `index.html`: game screens and accessible controls.
- `style.css`: base layout styles.
- `cartoon.css`: vibrant full-screen game interface and responsive menus.
- `cartoon.js`: original animated cartoon scenery, runners, optional audio, and visual feedback.
- `engine.js`: independent progression, save validation, and race math.
- `game.js`: UI, canvas artwork, animation, training, race flow, and persistence.
- `dev.js`: optional dependency-free local HTTP server.
- `tests/engine.test.js`: core rule regression tests.

Run `npm test` with Node.js 18+ to test save validation, stat caps, rewards, unlocks, fatigue, and hill effects. There are no npm dependencies. Google Fonts is optional; system fonts are used when offline.

## Prototype scope

This first version is single-player with five computer opponents, six individual meets, three training games, and four outfit colors. Course layouts share a procedural forest setting; terrain difficulty changes by meet. Team scoring, recruiting, cloud saves, and multiple seasons are future additions. Balance and mobile touch feel will benefit from player feedback.
