# v1.3 Camp life & mastery verification

## Automated checks

`npm test`: 146 passing tests. The 13 new camp tests cover medal thresholds, hard-mode gold, legacy migration, per-game locks, skilled versus idle performance in all three Expert drills, repeated completion, fixed pre-race objectives, final-quarter position accounting, original-lineup eligibility, bench exclusion, camp unlocks, portable saves and malformed import data. Existing campaign, tactics, training and reward tests remain green.

`npm run opening-check`: real game controllers from a fresh state, normal training inputs and tactical race actions. No added coins, stats, medals or race results. Three core workouts fund Jules's recruitment; five Pine Hollow team races unlock the clubhouse and Quinn's goal; normal then Expert versions of all three trail drills earn gold. A gold badge is equipped and survives export/import.

Recorded run: 397 seconds of simulated activity (excludes menu-reading time), nine workouts, five races, all three camp upgrades, six silver-or-better medals including three golds, all four original teammates' goals complete, and exactly one homegrown bonus key despite five wins on that course. This is a reproducible skilled-input regression check, not a claim about a beginner's completion time or enjoyment. Run `CV_QA_SAVE=/absolute/path/save.json npm run opening-check` to create its earned QA save.

## Browser checks

Desktop preview: new-player guide, training controls, mastery tabs, imported earned progress, the grown camp scene, completed teammate conversation, optional-objective selection and its live race reminder. Save import showed the expected 9 sessions / 5 races and retained camp milestones.

A 390 × 844 iframe checked the actual responsive page, camp navigation and stacked mastery cards. Journal placement was tightened to avoid crowding the athlete panel. This was a viewport/layout check, not physical-phone testing. The temporary layout fixture is excluded from publication.

The focused controller checks exercise full training/race completions; browser inspection verifies interaction wiring and rendering. The preview reloads when source files change, so incomplete browser workouts are not represented as completed playthroughs.

## Remaining player validation

No independent human participants or physical touch devices were tested. The 15-minute protocol in PLAYER-PLAYTEST.md includes mastery, camp, teammate and optional-objective questions. Real player observations are still needed to judge frustration, perceived challenge, replay interest and device-specific input feel. No analytics or external telemetry was added.
