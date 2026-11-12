# v1.2 verification and balance

## Checks

133 automated tests pass, including a full fresh-save calendar through actual UI controllers. New tests cover rivalry reversals and duplicate prevention, save round trips and malformed data, practice/scenario exclusion, pre-meet previews, real plan execution, and season baselines.

All 18 calendar meets can be won by the scripted campaign at 55% and 85% training quality. The tested campaign needed 21 and 17 cumulative workouts respectively across all three circuits. These are deterministic strategies, not human difficulty ratings.

## Strategy comparison

Run `node scripts/strategy-report.cjs`. Each row starts from the same stats for that course (course level + 8, teammate endurance + 10), the same four teammates and captain controller. Calendar weather is fixed. Score is the sum of the first five places; lower is better. Average teammate finish is in arcade seconds. Results are one controlled fixture, not proof of a universally best plan.

The first candidate patient plan eased for 30% of the race and consistently lost with reserves left over. The final plan holds early, builds after 55% with energy above 45, and recovers below 38. It now wins four of these six course fixtures. Aggressive wins all six in this fixture but scores worse than patient at County and State; pack preserves substantially more energy and may sacrifice places. Mixed-strength packs and other player tactics can change the result.

| Course | Plan | Team place | XC score | Avg teammate time | Avg finish energy |
| --- | --- | --- | --- | --- | --- |
| Pine Hollow | patient | 1 | 17 | 31.03 | 58.3% |
| Pine Hollow | pack | 1 | 20 | 32.41 | 72.9% |
| Pine Hollow | attack | 1 | 16 | 30.23 | 50.6% |
| County | patient | 1 | 15 | 47.86 | 34.8% |
| County | pack | 1 | 17 | 50.14 | 56.2% |
| County | attack | 1 | 21 | 47.41 | 30.1% |
| Woodland | patient | 3 | 46 | 64.97 | 28.5% |
| Woodland | pack | 2 | 49 | 65.91 | 36.3% |
| Woodland | attack | 1 | 21 | 62.02 | 28.7% |
| Ridgeline | patient | 2 | 46 | 69.14 | 28.8% |
| Ridgeline | pack | 2 | 50 | 71.71 | 43.7% |
| Ridgeline | attack | 1 | 34 | 66.51 | 28.5% |
| State | patient | 1 | 20 | 78.04 | 29% |
| State | pack | 1 | 33 | 81.6 | 42.5% |
| State | attack | 1 | 24 | 76.53 | 27.6% |
| Nationals | patient | 1 | 36 | 75.15 | 30.4% |
| Nationals | pack | 2 | 44 | 78.15 | 41.8% |
| Nationals | attack | 1 | 29 | 72.77 | 29.4% |

## Compatibility and limits

Existing head-to-head win/loss totals remain in the original journey save. Streaks and last-duel gaps begin with races completed in v1.2. Season growth starts at the first calendar entry after this update; recruitment affects the roster average. No retroactive growth is invented. Practice and fixed scenarios do not affect the new rivalry records or use the revised team policy.

Browser QA covers desktop briefing and strategy selection, a completed team race with passing/surge input, persistent rivalry results, and the 390 × 844 phone briefing. The phone dialog has no horizontal overflow; its start and back actions remain visible while the content scrolls. Physical iOS/Android and independent human playtesting remain pending. Follow [the player playtest guide](PLAYER-PLAYTEST.md); no human feedback is fabricated and no analytics collection was added.
