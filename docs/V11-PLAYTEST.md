# v1.1 verification

- 126 automated tests pass, including a complete fresh-save Varsity calendar through the real game controller.
- New checks cover legal passing paths, energy/cooldown restrictions, attack/finish cues, successful-beat feedback, drill goals, and read-only locker rendering.
- Deterministic campaign checks complete all 18 meets at 55% and 85% training quality. No balance constants changed in this release.
- All three fixed race scenarios lose with idle play and win with the tested tactical strategy.
- Standard and Challenge training remain solvable with simulated normal controls. These are scripted strategies, not human difficulty measurements.
- Browser checks: desktop locker portraits and navigation; 390 × 844 portrait locker room; 844 × 390 landscape training, goal display and pause. Jersey accessible names match their colors; mobile sound toggle clears the navigation bar.
- This does not substitute for physical iOS/Android testing or human playtesting. Race cue edge cases and full-season progression are covered by controller tests; this pass did not manually play a full season.

## Behavior

Race prompts use the same crossed-lane clearance, energy and cooldown rules as movement. Close-finish cues show actual simulated gaps; the illustrated duel is not a timing photo. Training meters describe the current session goal; quality can fall after missed beats. Existing save format and rewards remain intact.
