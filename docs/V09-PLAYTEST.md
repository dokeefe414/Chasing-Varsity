# v0.9 verification and design notes

## Repeatable checks

Run `npm test`, `node scripts/scenario-report.cjs`, and `node scripts/training-report.cjs` from the GitHub checkout. Scripts use the actual controllers against a minimal DOM, not a replacement race implementation.

| Race moment | Hold pace, no actions | Tactical strategy |
|---|---|---|
| Catch the breakaway | 2nd; loss | 1st; win |
| Through the field | 6th; loss | 3rd; win |
| Every place matters | 2nd team; loss | 1st team; win |

The tactical strategy pushes above 28 energy, selects the attack team plan, changes lanes when blocked, surges before 80%, and kicks after 90%. This proves a reachable solution, not that this is the only solution or an optimal player strategy. Challenges use a fresh temporary roster and cannot change the player's stats, race count, chapter progress, team bonds, season standings, or personal-best ghosts. A first win alone grants 50 coins and an unlock. Imported and exported saves retain the new progress.

A deterministic input controller can achieve at least 95% quality in all three disciplines at both difficulties. It taps at the speed target, holds/releases around the effort target, and jumps about 0.43 seconds before an obstacle. This checks timing feasibility, not human difficulty. Tests also cover reward limits, legacy-save migration, all six course scenes under all forecasts, route-specific ghosts, and calendar isolation.

## Browser pass

Checked the new training selection and locked-mode guidance; started training and used its action control; completed a breakaway challenge; exercised surge and lane changes in the ridge challenge; inspected portrait 390 × 844 and landscape 844 × 390 layouts, pause feedback, controls, and results. The larger camera keeps the captain prominent and makes a close same-lane leader visible even when the ordinary label-spacing rule would cull it. Nearby visual separation is intentionally exaggerated; the distance cue and simulation use actual metres.

The browser pass found and fixed a pre-existing returning-player error: the replay close handler assumed a welcome dialog already existed. It now listens for dialog close events without requiring the dialog on startup.

This is an engineering playtest, not a study with first-time human players. Physical iPhone/Android touch feel and player judgments of late-game fairness remain follow-up playtesting. No analytics or player tracking were added.

## Save and record behavior

The `adventure` save section stores mastery, training mode, completed moments, selected route variation, and the cosmetic toggle. Older personal-best training scores seed mastery. Variation ghosts append `-creek` or `-sunset` after the existing weather key. Variation races do not overwrite original-route split comparisons; ordinary race rewards and course qualification still apply. Scenario results are deliberately separate from ordinary race records and do not produce finish replays.

## Modules

`adventure-engine.js` owns pure unlock, reward, training-profile, and variation rules. `adventure.js` integrates controllers, scenario setup, the camera, and procedural course artwork. `adventure.css` supplies desktop, portrait, and landscape layouts. The existing fixed-step race simulation remains the source of truth for positions and scoring.
