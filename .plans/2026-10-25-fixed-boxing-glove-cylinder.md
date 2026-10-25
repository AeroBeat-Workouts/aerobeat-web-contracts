# Fixed-facing Boxing glove scoring cylinder

Status: owner implementation and validations complete; gameplay-owner legacy oracle remains pending.
Parent: assembly `.plans/2026-10-25-boxing-heights-fixed-colliders-knee-calibration.md`, task B. Diagnosis: assembly `.plans/debug/2026-10-25-boxing-collider-orientation.md`.

Goal: glove art follows wrist orientation, while the scored cylinder stays anchored at the wrist and aligned to world Z. The −Z cap faces incoming beats; the +Z cap faces the athlete. Preserve the original radius, scale, reach, and Flow saber.

Tasks:
- [x] Replace the rotating-glove oracle with a fixed-axis regression; confirm it fails on old implementation.
- [x] Resolve scored endpoints along world Z independently of glove orientation.
- [x] Run `npm run check`, `npm test`, `npm run test:browser`; commit and push only these changes.

Gameplay owner follow-up: `validate-boxing-collider-scoring.js` and `validate-knee-collider-scoring.js` pass without gameplay edits. `validate-equipment-pose-collision.js` fails its old tilted-glove expectation at line 81 (actual contact true, expected false) and also retains old rotation-dependent assertions at lines 44–58. Gameplay owner must update that test for the approved fixed-Z scoring behavior; this slice is explicitly forbidden from editing gameplay.

Observed pre-fix failure: `node scripts/validate-equipment-contracts.js` failed because rotated-glove axis was approximately +X rather than world +Z. Gameplay consumes this resolver directly; no gameplay edits are required.

Beads: owner ledger not written in this delegated slice; assembly CLI v53 cannot safely write the v66 DB. No new gate or visible UI.
