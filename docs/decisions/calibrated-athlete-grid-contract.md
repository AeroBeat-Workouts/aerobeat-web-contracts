# Calibrated Athlete Grid Contract

**Status:** Accepted  
**Date:** 2026-08-28

## Decision

Upstream normalized pose frames use camera/preview top-left coordinates and own horizontal mirroring. Detector gameplay geometry may use bottom-left Y internally. Public calibrated body-grid snapshots use athlete-space top-left coordinates, athlete-left columns, and top-left row-major IDs.

The public grids are frozen as 4x3 cells (`0..11`) and the 2x2 subdivision as 8x6 subcells (`0..47`). Camera-image columns oppose athlete columns. Camera-preview Y already matches public athlete top-left rows after the internal gameplay-camera Y conversion is reversed.

Out-of-grid coordinates are never clamped into a scoring cell. They retain finite raw diagnostics and publish `cell: null` / `subcell: null`.

Calibration requires measured samples and all seven upper-body anchors. Predictions remain routing-only and cannot calibrate or satisfy measured prototype evidence. Production defaults are 0.5 confidence, 4000ms qualified T-pose hold, 4000ms cooldown, release-before-refire, 500ms tracking-loss pause, 0.35 wrist/elbow vertical ratio, and 130-degree minimum elbow angle.

## Consequences

- Renderers consume explicit coordinate-space metadata and cannot infer facing from preview CSS.
- Gameplay consumes athlete-space cell IDs and exact eight-way shoulder-relative entry directions (`up`, `up-right`, `right`, `down-right`, `down`, `down-left`, `left`, `up-left`) without camera mirroring logic. `direction` is optional: omission records a measured cell transition whose recent motion was ambiguous or below the minimum magnitude, allowing Flow dot notes to require entry without inventing directional evidence. When present it must be one of the exact eight values; present `undefined`/`null` is invalid and producers must omit the property.
- The entry schema remains v1 because this is a backward-compatible optional-field extension: every previously valid record remains valid with identical meaning and serialized shape, while consumers must now branch on own-property presence before applying directional requirements.
- Calibration/tracking snapshots carry generation IDs so stale evidence cannot cross recalibration.
- Existing input-event prediction fields remain additive compatibility, but new calibrated evidence is explicitly measured.
