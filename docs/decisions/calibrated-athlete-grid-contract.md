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
- Gameplay consumes athlete-space cell IDs and cardinal entries without camera mirroring logic.
- Calibration/tracking snapshots carry generation IDs so stale evidence cannot cross recalibration.
- Existing input-event prediction fields remain additive compatibility, but new calibrated evidence is explicitly measured.
