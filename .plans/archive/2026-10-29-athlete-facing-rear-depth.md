# Athlete-facing rear depth — contracts

Status: complete; approved coordination slice implemented. Owner: delegated coder; umbrella Bead aerobeat-web-assembly-qrtp remains parent-owned.
Coordination: ../aerobeat-web-assembly/.plans/2026-10-29-athlete-facing-rear-depth.md

1. Add strict mode-default boolean settings and shared immutable convex-part geometry. Preserve endpoint APIs.
2. Add normal geometry/settings/export regressions and update README.
3. Run check, test and browser contract gates; commit/push main before gameplay pin update.

Results: shared seven-field settings and public immutable union helpers implemented. Endpoint APIs untouched. Normal geometry/settings tests cover both modes/toggles, rotated front invariance and rear direction, zero depths, unit axes, immutable records and strict booleans. Root/subpath exports checked. README updated.

Validation passed: npm test (includes all check gates), npm run test:browser, targeted checkJs TypeScript on equipment-pose-contracts.js and collider-contracts.js, git diff --check. Browser-named contracts script validates iframe contracts in Node; installed visual/phone acceptance belongs to parent. No timing, knee, target-size, UI or renderer changes. No outstanding source blockers.
