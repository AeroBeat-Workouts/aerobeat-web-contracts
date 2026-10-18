# Shared Flow solid blade authority

**Status:** Shared contract implementation validated; commit/push pending. **Owner:** contracts, linked Bead `aerobeat-web-assembly-ey1h`. **Parent plan:** `/home/derrick/.dsh/projects/aerobeat/aerobeat-web-assembly/.plans/2026-10-17-flow-collider-scale-visible-equipment.md`. **Next acceptance:** exported radius `.024` is tied to the pinned solid GLB blade, and shared Flow Scale/Depth settings accept every finite nonnegative input while Boxing continues to reject zero scale and forward depth.

## Goal and boundaries

Provide one public solid-art Flow blade radius authority for gameplay and renderer. Preserve the existing legacy `.18` saber-capsule contract where other code expects it. Allow finite nonnegative Flow collider scale and both depths, including zero, `.00001`, and `9999999`; reject nonfinite or negative inputs. The old target-bound utility must reject finite settings whose computed bounds overflow. Boxing is unchanged. No assembly/renderer edits or public cutover. Documentation: update this repo's README.

## Tasks

1. Add solid radius constant and mode-specific shared validator, with failing then passing focused tests (`ey1h`).
2. Validate arithmetic overflow and existing Boxing behavior with contracts checks/unit tests (`ey1h`).
3. Document changed contract, commit and push clean `main`; report exact API and SHA to integration (`ey1h`).

## Diagnosis and current decision

The public `saberGeometry.radius`/`resolveSaberCapsule().radius` is `.18`, while the pinned solid blade is `.024`; gameplay must derive scored radius from the latter without changing historic capsule pose/axis/length. Current shared flat collider validator enforces scale `>0`, forward `>=1`, and rear `>=0` without mode context; introduce an explicit Flow-only validator and keep the generic/Boxing validator strict. Finite inputs can still overflow when multiplied into bounds, so fail derived nonfinite values instead of clamping settings.

## Results

Public `flowSolidBladeRadiusWu = 0.024` exported from the package root and `equipment-contracts.js` subpath. Flow-specific `isFlowColliderSettings`/`normalizeFlowColliderSettings` accept finite nonnegative scale and both depths, while existing generic/Boxing validation remains strict. Flow target-bounds utility checks derived arithmetic for nonfinite values. RED showed missing named exports; GREEN `node scripts/validate-equipment-contracts.js`, `node scripts/validate-collider-contracts.js`, `npm run check`, `npm test`, `git diff --check`. Signed renderer integration is owned by assembly/renderer, not this repo.
