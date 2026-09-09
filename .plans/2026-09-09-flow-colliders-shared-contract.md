# Flow Colliders Shared Contract

**Status:** IMPLEMENTATION COMPLETE — AWAITS INDEPENDENT QA
**Date:** 2026-09-09
**Owning repo:** `/home/derrick/.dsh/projects/aerobeat/aerobeat-web-contracts`
**Bead:** `aerobeat-web-contracts-6dg`

## Goal

Add the minimal strict public contract required for the combined successor to recognize `flow_colliders_v1` without changing stable `flow_grid_v2` behavior or exposing private collision evidence.

## References

- Approved design authority: `/home/derrick/.dsh/projects/aerobeat/aerobeat-web-assembly/.plans/design/2026-09-09-flow-colliders-and-physical-feedback.md`
- Exact assembly map: `/home/derrick/.dsh/projects/aerobeat/aerobeat-web-assembly/.plans/design/2026-09-09-combined-successor-assembly-map.md`

## Scope

1. Extend the exact shared ruleset identity and strict validators.
2. Add a bounded semantic-only Flow Colliders public summary contract.
3. Update public exports, deterministic fixtures/tests, README, and decision evidence.
4. Run all required package validation and dry-run packing.
5. Commit and push intentional changes while leaving the Bead open for independent QA.

## Privacy boundary

The new public shape may contain only mode/ruleset identity, latest semantic judgement, and bounded aggregate note/bomb/wall counts. It must reject extra fields and never contain coordinates, geometry, radii, vectors, timestamps, raw pose identities, calibration/source/frame IDs, or private collision evidence.

## Results

Implementation complete and intentionally left open for independent QA under Bead `aerobeat-web-contracts-6dg`.

- Preserved the original coder's safe partial additions and completed exact `flow_colliders_v1`, `isRulesetId()`, and `wrong_collider` support without changing stable Flow Grid IDs.
- Added the strict version-1 semantic-only Flow Colliders public summary, a `1_000_000` per-counter bound, root/subrecord exact-key enforcement, duplicate-free bounded diagnostics, and accessor/hidden/symbol rejection.
- The public summary exposes only `mode:"flow"`, exact ruleset identity, nullable latest semantic note judgement, and aggregate note/bomb/wall counts. It contains no authored event identity, body/pose identity, coordinates, segment geometry, radii, vectors, timing/contact timestamps, calibration/source/frame IDs, or collision evidence.
- Added deterministic canonical fixture, acceptance/boundary/alias/rejection/accessor/privacy tests, README API documentation, and the accepted decision record `docs/decisions/flow-colliders-public-contract.md`.
- Kept scoring, settings, content/package formats, renderer, UI, assembly, and release behavior out of scope.

Validation completed successfully on 2026-09-09:

- `npm run check`
- `npm test`
- `npm run test:browser`
- `npm pack --dry-run --json` (30 entries; decision doc and public source included; repository-only deterministic fixture intentionally excluded by the package's existing `files` allowlist)
- `git diff --check`

The intentional implementation commit and pushed tree are recorded in Git history and in the Bead QA handoff comment.
