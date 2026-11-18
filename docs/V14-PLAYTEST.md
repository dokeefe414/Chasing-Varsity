# v1.4 verification and limits

## Automated evidence

- `npm test`: **160 passing, zero failures**, including 14 trail-update tests and a fresh-save full Varsity calendar controller flow.
- `npm run balance`: all 18 meets completed first in the deterministic trained-team campaign at 55% and 85% workout quality. Total training sessions: 21 and 17 respectively. This harness trains/recruits adaptively and selects routes using the new estimates; it checks progression/completion, not novice difficulty.
- `npm run opening-check`: nine workouts, five races, 400 simulated seconds; three camp upgrades and six mastery medals earned. This scripted progression does not predict a human's first seven minutes.
- `npm run training-check`: all three core games in both Standard and Challenge reached 100% with controller inputs. This establishes solvability, not typical player performance.

The optimized campaign becomes comfortable with a trained squad. Fields have not been inflated just to defeat the script. Optional objectives, hard workouts and fixed-stat race moments offer further challenges; independent player pacing/frustration should guide the next balance adjustment.

## Browser coverage

Desktop Chromium and a 390 × 844 CSS viewport check camp navigation, destination signs and the More menu. Training result/retry and route selection are checked through actual page controls. The earlier implementation session identified unstable route-button child replacement during animation; restored labels update only when changed. The resumed build reruns its tests instead of relying on the interrupted workspace's results.

## Limits and follow-up

No independent human participants or physical phones were available. Narrow-screen browser checks are not physical-touchscreen tests. Enjoyment, unaided discoverability, touch accuracy, device rotation and long-session fatigue remain unverified. Use the [player protocol](PLAYER-PLAYTEST.md), record exact confusion points and change one balance rule at a time. There is no analytics upload in the game. Do not describe automated wins as independent human playtesting.
