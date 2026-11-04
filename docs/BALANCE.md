# v0.8 balance checks

Run `npm run balance` to reproduce the deterministic campaign report. Run `npm test` for regression coverage.

| Training quality | Varsity title | Elite title | Legends title |
|---|---:|---:|---:|
| 55% | 18 sessions | 20 sessions | 21 sessions |
| 85% | 14 sessions | 16 sessions | 17 sessions |

Counts are cumulative. The simulation retries each meet until the team wins, trains its weakest captain stat after a loss, buys affordable team workouts, and recruits when possible. It uses the attack team plan, energy-aware pacing, clear-lane passing, and a late kick. It grants training coins but does not add race rewards. It models quality scores, not human minigame inputs. These are repeatable progression checks, not promised player completion times or proof of subjective fun.

The team can carry a weaker captain. Elite and Legends still provide additional development without resetting progress. Fully trained teams can win Legends nationals under all three forecasts. Separate tests cover trained qualification on all six courses and three forecasts.

Passing checks distinguish a four-metre lane-change clearance from an eight-metre following gap. Every crossed lane must be clear; a close leader cannot be bypassed by a large simulation step. Being boxed in remains part of racing and is explained by the cue banner and post-race report.

Variety bonuses require a different last completed discipline, at least 55% quality, and an uncapped target stat. The first session and repeated disciplines retain their base rewards. Saves retain the previous discipline.

Browser QA used a 390 × 844 frame: team-race completion, pause/resume feedback, readable race cues, lane reasons, route buttons, and scrollable results. This does not replace physical-device touch testing.
