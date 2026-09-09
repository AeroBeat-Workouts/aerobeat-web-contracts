# Flow Colliders Public Contract

**Status:** Accepted
**Date:** 2026-09-09

## Decision

`flow_colliders_v1` is an exact ruleset ID alongside the stable `flow_grid_v1` and `flow_grid_v2` IDs. It does not rename, replace, or reinterpret either Flow Grid ruleset. The public ruleset validator accepts only declared exact IDs; case, separator, whitespace, and shortened aliases reject.

The optional version-1 Flow Colliders public summary is deliberately semantic-only. Its exact record contains:

- stable `mode: "flow"` and `rulesetId: "flow_colliders_v1"` identity;
- a nullable latest note judgement containing only `hit` or `miss` plus a bounded, duplicate-free list of existing semantic diagnostic codes;
- integer aggregate note hit/miss counts; and
- integer aggregate bomb and wall `contact`, `avoided`, and `unevaluatedTracking` counts.

Every aggregate count is bounded from zero through the exported `flowCollidersPublicCountMaximum` value. Extra, hidden, symbolic, accessor-backed, malformed, fractional, negative, or over-limit data rejects.

## Privacy boundary

This summary is not collision evidence. It never contains wrist or nose coordinates, landmark identities, collider centers or radii, segment geometry or endpoints, vectors, distances, confidence, timing/contact timestamps, raw pose identity, calibration/source/frame IDs, per-contact episodes, or authored event IDs. Those values remain private to the connection-owned input-to-gameplay graph and must not be reconstructed from this contract.

The `wrong_collider` diagnostic is a bounded semantic outcome code only. It communicates why a note missed without identifying a body landmark or exposing any measurement or collision evidence.

## Consequences

- Flow Colliders consumers can partition packages, gameplay, and scores using one shared exact ID without changing Flow Grid compatibility.
- Assembly may expose the strict summary or an equivalent narrower projection, but cannot append evidence fields.
- Gameplay settings, scoring behavior, content/package formats, renderer state, UI selection, assembly wiring, and release publication remain owned by their respective packages and are outside this contract decision.
- The canonical deterministic fixture is `fixtures/flow-colliders-public-summary-v1.json`; contract tests assert acceptance, strict rejection, accessor safety, bounds, and privacy exclusions.
