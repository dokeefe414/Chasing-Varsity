# Chasing Varsity

## [▶ Play Chasing Varsity in your browser](https://chasing-varsity.nativebolt2.chatgpt.site/)

**Click to play — no download or installation.** Created by **Daniel O’Keefe**. Train your rookie, build a cross-country team, and race from Pine Hollow to Varsity Nationals. Original cartoon artwork, keyboard and touch controls, and automatic browser saves.

## The varsity journey — new in 0.4.0

- **A playable journey map:** follow six chapters from Pine Hollow to nationals, preview locked destinations, and select one course at a time.
- **18 challenge stars:** each chapter rewards a strong finish, beating its featured rival, and a pacing or performance challenge. Stars accumulate across attempts; each new star pays 30 coins once.
- **Five recurring rivals:** recognizable outfits, different strengths, and distinct race tactics, with saved head-to-head records and scouting tips. Team races include the featured rival as an opposing captain.
- **A trophy cabinet and wardrobe:** nine achievements award one-time coin bonuses and unlock shoes, hairstyles, and singlets. Equipment changes appearance, not stats.
- **A short optional coach guide:** complete a training session, then finish Pine Hollow. Skip it or replay it from Runner; returning saves are not forced through onboarding.
- **A championship celebration and season recap:** earn your varsity letter with an individual or team nationals win. Review chapter stars, your roster, milestones, and the last 30 race results without resetting progress.

## The expanded season

- **Three training minigames:** sprint timing with Perfect hits and combos; a moving endurance target; increasingly fast roots and rocks to jump. Sessions last 20 seconds after a countdown, and personal-best quality scores are saved.
- **Interactive races:** a starting countdown, effort controls, energy management, position-change feedback, a final-stretch cue, and one finishing kick. Full results show every finisher and arcade elapsed time.
- **Six distinct courses:** meadows, a lakeside course, woodland, mountain ridges, autumn trails, and a championship stadium. Route previews show grass, climbs, descents, mud, and the finishing track. Terrain affects speed; strength helps on climbs and in mud.
- **Team building:** start with four teammates plus your runner. Recruit specialists, develop a seven-runner roster, and compete against three other teams in fields of 26–28 runners.
- **Progression:** finish top three in an individual race or win a team meet to unlock the next course. Coins come from training and racing and pay for recruits, team workouts, and cosmetic singlets.

## Clearer team races

The captain has a dedicated foreground row and a gold YOU marker. Nearby opponents use three stable display rows with spacing checks, and runners outside the camera are no longer pinned to its edges. Overlapping sprites are omitted from the main view, but **every runner still races and scores normally**. The pack map tracks the full field, including runners not drawn nearby.

A compact standings strip shows your position, the distance to the runner ahead, and your current team-score estimate. Team scores are provisional until everyone finishes. Low-energy and kick-ready messages make pacing easier to follow. Results include quick Race again / Train again buttons. Touch controls prevent long-press selection and stay within reach while scrolling on phones.

## How to play

Choose a sign in camp to train, **Race** to select a course and individual/team mode, or **Team** to manage your roster. The course menu compares your rating with the field as a rough readiness guide. Specialization and pacing still matter.

| Activity | Keyboard | Mouse / touch |
| --- | --- | --- |
| Race effort | 1 ease off, 2 hold pace, 3 push | Pace buttons |
| Finishing kick | K | Kick button |
| Sprint training | Space in the gold zone; center = Perfect | Tap action button |
| Endurance training | Hold Space to raise effort; release to lower | Hold / release action button |
| Hill training | Space to jump | Tap jump button |
| Pause | P | Pause / Resume |

The finishing kick lasts five seconds, is available once per race in the final 20%, and requires at least 20% energy to start. Pushing constantly drains energy; below 18%, fatigue reduces speed. The game pauses when the tab loses focus. After you finish, the remaining field runs at accelerated speed before results appear. These are short arcade races, not realistic race-time predictions.

### Training and team development

A completed session gives 3–8 points in its chosen stat and 12–35 coins according to quality, with stats capped at 100. Teammates receive 65% of that session's nominal stat gain. Personal bests track quality, not the number of attempts. Unfinished activities do not earn rewards.

There are six recruitable specialists. When the roster has seven runners including you, recruiting replaces the lowest-rated teammate after confirmation. Each prospect can be recruited once per season. A team workout costs 60 coins and gives every teammate +5 in all three stats, capped at 100; it does not raise the captain's stats.

### Cross-country scoring

Each team's first five finishers score their overall places. Lowest total wins. Sixth and seventh runners still occupy places and can push opponents' scores higher. Tied totals are decided by the sixth finisher; a team without a sixth runner loses that tie to a team with one. The results list shows team totals, scoring places, and all individual finishers.

## Saves

Your runner, coins, outfits, unlocked courses, personal bests, recruits, teammate development, team records, chapter stars, rival records, achievements, and recent race history save automatically in this browser. Existing saves migrate without losing the original runner's progress. Saves do not sync across devices; clearing site data removes them. If storage is unavailable, play continues for the session with a warning. **Runner → Save data** contains a confirmed season reset.

## Optional local development

Download and extract the repository, keeping all HTML, CSS, and JavaScript files together, then open `index.html`. For consistent save behavior, use VS Code Live Server or install Node.js 18+ and run:

```sh
npm run dev
```

Open `http://localhost:3000`. No npm dependencies are required. Google Fonts is optional; fallback fonts are used offline.

```sh
npm test
```

The 40 tests cover original rules, legacy/new saves, recruiting, stat caps, team displacement and tie-breaking, race simulations on all six courses, fatigue, full controller flows, pause/countdown, kick eligibility, rewards occurring once, rival strategies, chapter challenges, cosmetic unlocks, tutorial progression, and championship recaps. Controller tests use a minimal DOM to test game state; they complement rather than replace visual browser checks.

### Source guide

| File | Responsibility |
| --- | --- |
| `index.html` | Game screens and script loading order |
| `engine.js` | Original progression and save foundation |
| `game.js` | Base UI, input, persistence, and animation loop |
| `cartoon.js` / `cartoon.css` | Cartoon world, characters, audio, and game presentation |
| `season-engine.js` | Pure course, team, recruiting, and expanded physics rules |
| `season.js` / `season.css` | Expanded training/race controllers, team UI, and results |
| `journey-engine.js` | Chapter stars, recurring rivals, achievements, wardrobe rules, and journey save migration |
| `journey.js` / `journey.css` | Journey map, coach guide, trophy cabinet, wardrobe, and championship recap |
| `style.css` | Base responsive styles |
| `dev.js` | Dependency-free local development server |
| `tests/` | Rule and complete controller-flow regression tests |

The season layer extends the original game and reuses its save key. The public game is hosted separately from GitHub; repository commits alone do not update that hosted deployment.

## Optional GitHub Pages hosting

To host your own copy: **Settings → Pages → Deploy from a branch → main → / (root) → Save**. No build is required. The main Play link above already works without enabling GitHub Pages.

## Current scope

Single-player arcade competition against computer-controlled runners. There is no online multiplayer or cloud save system. The season is playable through nationals in individual or team mode. Balance has been checked with simulations; more hands-on playtesting, especially on phones, can refine difficulty and touch feel.
