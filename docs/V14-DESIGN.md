# v1.4 — Trail choices and training flow

## Course decisions

Normal quick/calendar races have two forks. Choose during the approach; the dry loop is the default. Choices lock at entry, and both branches rejoin. Practice and fixed-stat scenarios retain their existing physics.

| Branch | Physical distance in fork | Terrain | Extra energy drain |
| --- | --- | --- | --- |
| Dry loop | 100% | Flat | None |
| Creek cut | 84% | Mud | 0.20 per second |
| Ridge cut | 80% | Hill | 0.65 per second, plus normal hill drain |

Shorter is not always faster. Strength offsets terrain slowdown; endurance protects reserves. Weather, fatigue, traffic and bursts still matter. Briefing estimates compare both paths at hold pace/full energy; live estimates use current reserves. Estimates omit drafting, bursts and traffic. Wind is conservatively applied across the full fork, although actual wind exposure depends on course position.

| Course | First fork | Second fork |
| --- | --- | --- |
| Pine Hollow | Creek bend — mud | Lookout rise — hill |
| County Park | Reed beds — mud | Shore crossing — mud |
| Woodland | Pine ridge — hill | Root hollow — mud |
| Districts | First summit — hill | Ridge return — hill |
| States | Farm crossing — mud | Orchard rise — hill |
| Nationals | Stadium ridge — hill | Championship creek — mud |

Forks begin at 25% and 62.5%, span 12.5% of normalized distance, and accept choices from 18 percentage points before entry. Each AI runner chooses independently: cut only if its estimated time is lower and projected energy stays at least 28. Choices cannot change after entry. Results record the captain's chosen branches and entry energy.

## Rival behaviors

| Rival | Habit | Burst trigger |
| --- | --- | --- |
| Reed | Fast opening, then recovery | Opening 24%; one attack |
| Morgan | Steady and economical | After 55%, captain within 100 m and surging or more than 15 m ahead; at most two |
| Casey | Saves before climbs, pushes uphill | Actual selected path is uphill; at most two |
| Alex | Second-half builder | Between 55–88%, an unfinished runner within 110 m ahead; at most two |
| Sam | Protects reserves for the finish | Final 16%; one kick |

A warning lasts 1.8 simulation seconds and requires 44 energy to begin. At execution, the trigger must still apply, at least 36 energy must remain, and burst/cooldown must have ended. Success spends 8 energy for 2.8 seconds (Sam: 4), sets a 16-second surge cooldown and an 18-second attack cooldown. Invalid intentions cancel without energy charge and wait three seconds. Existing circuit ratings remain; these habits add no hidden stat bonuses. Successful moves appear in result analysis.

## Training and presentation

All six games store separate Standard and hard-mode quality bests. The first completed session establishes a benchmark; a higher later score celebrates a PB. Weaker attempts/ties never reduce a best. Retained mastery medals are labeled separately from session quality. Existing saves do not invent a historical hard-mode record.

Retry preserves the game and difficulty, starts a fresh countdown, and awards nothing until that session completes. R retries a completed workout unless a form control/button is focused. Next skill opens the next standard workout. Breathing rings, hit/miss particles and combo cues reinforce actions; reduced-motion mode removes breathing oscillation and reduces particles. Rewards and coaching remain expandable below the primary actions.

Camp, Train, Race and More are the four primary navigation choices. Camp signs lead to Clubhouse, Season board and Trophy shelf. More also provides Your locker and journal. Training plans, weather, chapter detail and race moments use disclosures; race entry sits above supporting detail.

## Implementation and save contracts

- `trail-engine.js` loads after earlier rule layers and before `game.js`. It exports browser `CVTrail` and CommonJS functions for testing.
- `racecraft-engine.js` calls optional course preparation/route hooks. Physical movement divided by branch ratio produces normalized course metres, keeping finish order, quarter splits and ghosts on one shared scale. Additional drain applies once per simulation step.
- `trail.js` loads last and extends briefing, render, tactics, drawing and results. Route-button children only change when labels change, preserving click targets during animation.
- `trail.css` owns destination signs, compact menus, disclosures and training results.
- `trailTraining.best` and `.attempts` accept only six known game IDs and two modes; bests clamp to integer 0–100 and attempts to 0–999999. Activity-level guards prevent duplicate recording.
- New ghost/split keys end in `-v14`. Old records remain in exported saves but are not compared against changed route physics. Ghost capacity increases from 90 to 180 to hold both generations.
- Existing save key, roster, medals and unlocks remain. Controller pause/countdown guards prevent race updates; practice/scenarios bypass the new course behavior.

## Verification and maintenance

Run `npm test`, `npm run balance`, `npm run opening-check`, and `npm run training-check`. The focused `tests/trail.test.js` verifies estimated and actual route tradeoffs, locked choices, captain logging, pause/countdown behavior, warning execution/cancellation, selected-path hill attacks, nearby responses, separate training bests, hard retry and record portability. Existing controller tests exercise the whole season and older features.

See [verification evidence](V14-PLAYTEST.md) and the [human playtest protocol](PLAYER-PLAYTEST.md). To tune routes, change ratios/costs in `trail-engine.js`, rerun actual traversal tests and campaign checks, and review real-player observations before changing difficulty thresholds.
