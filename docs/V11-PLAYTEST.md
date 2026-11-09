# v1.1 gameplay and visual polish: verification plan

## Scope and invariants

The v1.1 layer is intentionally additive. It uses existing race physics, scoring, recruitment, persistence and rewards. It does not create a second simulation, weaken lane-clearance checks, change the team size constraints, or change the Challenge training target profile.

- v11-engine.js: pure rules for jersey validation, lineup display, bounded standard-training assistance, training progress, passing cues, opponent finish margins and coaching summaries.
- v11.js: UI integration after the v1.0 controllers. Previous functions are called before enhancing the UI.
- v11.css: decorative locker-room art, race/training HUD, flexible controls and reduced-motion rules.
- tests/v11.test.js: safe style migration, roster constraints, training difficulty bounds, tactical hints, close-finish math, and controller integrations.
- .github/workflows/browser-game-ci.yml: Node.js syntax validation and all regression tests on pushes and pull requests.

## Automated acceptance criteria

Run npm test and node --check v11.js with Node 22 or higher. All previous v1.0 controller and full-season checks must remain green. Each added test has an explicit expectation: invalid save styles fall back to Classic; the captain is always present; minimum/maximum teammates remain enforced; adaptive assistance is bounded and absent from Challenge training; progress values are exact; race cue priority favors a nearby announced attack and the last tenth of the course; close-finish labels only apply to actual time gaps.

## Manual desktop smoke test

1. Open an existing save and a clean save in separate browser profiles. Neither should reset achievements or show a script error.
2. Use **Explore all activities** on a new save, then open **Team**. Confirm there are five starters including the captain, that the bench updates after recruiting, and that the coach's recommendation is reflected in the visual scene.
3. Try removing a runner when only four teammates are selected and adding a seventh teammate when six are selected. The appropriate buttons must be disabled. Enter a team race and confirm the actual starters match the scene.
4. Switch from Classic to Track stripe and Varsity V. Refresh. Check that the choice persists in the locker room, the runner profile, and the race scene.
5. Enter Pine Hollow, approach a runner from behind, verify that a genuinely clear lane is recommended, and verify that no illegal lane move becomes allowed. Confirm rival attacks are more prominent when within 120 m. Check the final-stretch cue and completion flow.
6. Play Sprint training. Miss at least three consecutive targets and verify the coach-assist explanation. Hit a target, confirm the feedback changes and the assist resets. Complete an Endurance and Hills session, and confirm the post-session gain summary matches the actual stat change.
7. Play Interval ladder, Endurance checkpoints and Trail time trial. Confirm progress counters and target messages correspond to successful actions. Ending a session should not give duplicate rewards.
8. Race with a near-tie and inspect finish highlights and recorded replay. The result and coin rewards must still match the original simulation. A photo-finish card should not be shown for a large gap.
9. Pause, leave and re-enter an activity; ensure no stale tactical controls or training HUD obstruct the next screen.

## Mobile and accessibility test

At widths 320, 390, 430, 768 and 1024 CSS pixels, and in portrait and landscape orientation:

- Confirm the locker room wraps without clipping runner names, substituting controls or jersey choices.
- Confirm all pace, lane, surge, kick and pause controls stay tappable with no overlay; rotate midway through a race.
- Confirm the canvas and action controls fit without horizontal page scrolling. Tactical submenus may require vertical scrolling, but should never cover actions.
- Confirm keyboard tab order, visible focus, and aria-pressed state for wardrobe and lineup controls.
- With reduced-motion enabled, portraits should stop animating and race feedback should remain readable.
- On an older/slow device, confirm no obvious frame-rate regression from rendering the extra HUD.

## Difficulty review

The training assist applies only to the standard mode after three consecutive misses; the profile window may widen by up to 0.048 (capped at 0.35), and obstacle spacing may increase by up to 0.14 seconds. It never raises stats directly and resets once a target is hit. If feedback from real play shows it trivializes the minigames, lower these limits instead of changing race physics.

## Limits / release criteria

The automated controller harness does **not** verify physical-device touch events, layout collisions, audio, canvas appearance, user-perceived fun or the hosted deployment. A human should complete the mobile and desktop smoke tests before the branch is merged and separately redeployed to the live URL. No v1.1 changes to this GitHub repository automatically update the separately hosted public game.
