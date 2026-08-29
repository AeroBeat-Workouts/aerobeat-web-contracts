# aerobeat-web-contracts

Shared AeroBeat web contracts for service IDs, event names, custom element names, and cross-repo data shapes.

## Responsibility

This repo is the first shared contract home for the web port. It defines stable names and documented shapes that other `@aerobeat/web-*` packages consume through public exports.

It intentionally does not implement camera access, pose detection, input routing, gameplay scoring, content loading, rendering, audio playback, UI components, or assembly wiring.

## Public API Surface

- `src/service-ids.js` owns service ID constants such as `aero.cv.pose`.
- `src/event-names.js` owns event name constants such as `aero:cv:pose-frame`.
- `src/element-names.js` owns custom element registry names such as `aero-calibration-screen`.
- `src/coordinate-spaces.js` owns explicit camera-preview, gameplay-camera, athlete, and playfield spaces plus the calibrated 4x3/8x6 top-left row-major mapping helpers.
- `src/pose-shapes.js` owns normalized measured pose frames and the separate provenance-tagged gameplay-routing sample. Predicted samples carry distinct measurement/target timestamps and never masquerade as CV adapter output.
- `src/pose-adapter.js` defines the vendor-neutral structural `AeroPoseAdapter` lifecycle, frame/options, identity, telemetry, capabilities, and cleanup boundary. Optional execution telemetry can split end-to-end estimate time into vendor runtime inference and adapter postprocessing without exposing vendor objects.
- `src/body-grid-contracts.js` owns calibrated anchors, cardinal cell entries, calibration/readiness, tracking-safety states, and locked production defaults.
- `src/input-shapes.js` retains additive compatibility for current gameplay-facing input events.
- `src/session-contracts.js` and `src/gameplay-contracts.js` own session/countdown/lease snapshots, Flow/Boxing ruleset IDs, positive measured evidence, judgement diagnostics, recipes and prototype tuning identities. Converter identities carry dynamic selected-vs-applied truth (`regenerationRequired` true while pending, false after matching generated-package provenance); live visual and between-run scoring identities always carry false.
- `src/content-shapes.js` retains baseline map/chart/package JSDoc; `src/content-contracts.js` adds immutable hash/provenance/variant/modifier/persistence identities.
- `src/beatsaver-contracts.js` owns normalized browser-facing BeatSaver summary/version, provider-neutral source-manifest and import-job shapes without exposing provider-native objects or raw archives.
- `src/theme-contracts.js` owns serializable theme tokens and background suggestions.
- `src/host-contracts.js` owns exact-container capabilities, fullscreen state, asset policy and exact versioned direct-host command/event envelopes.
- `src/iframe-contracts.js` owns the strict immediate-parent protocol and rejects nested case/separator aliases for raw frames, pixels, screenshots, media streams/tracks, ZIP/archive bytes and audio bytes.
- `src/index.js` exports the complete public contract surface; focused subpath exports are also declared in `package.json`.

## Adjacent Repos

- `aerobeat-web-cv` produces normalized pose frames and owns camera/CV service implementation.
- `aerobeat-web-input` converts pose/body-grid data into gameplay-facing input events.
- `aerobeat-web-vendor-beatsaver` normalizes BeatSaver acquisition and source inspection behind these contracts.
- `aerobeat-web-content-authoring` converts provider-neutral source material into validated local packages.
- `aerobeat-web-content` validates and loads packaged, external, and locally authored content.
- `aerobeat-web-gameplay` consumes content/input/audio contracts to run Flow and Boxing sessions.
- `aerobeat-web-assembly` wires concrete services into reconnectable `aero-game` instances and the strict iframe bridge.

## Import Rules

Consumers import contracts through `@aerobeat/web-contracts` public exports only. Do not import `src/internal`, `.testbed`, or unexported files from this repo.

## Development Shape

This is a standard AeroBeat web package:

```text
/
  README.md
  LICENSE.md
  .gitignore
  package.json
  package-lock.json
  src/
  .testbed/
  scripts/
  fixtures/
  assets/
  docs/
    decisions/
  .plans/
  .beads/
```

Generated `.testbed/node_modules` symlinks are local state and must not be committed.

## Validation

Run these commands before handoff:

```bash
npm run check
npm test
npm run test:browser
```

The checks enforce strict JSDoc/no-escape posture, public import boundaries, the executable generic pose-adapter contract, component-only screen/scene rules, and Playwright console-warning/error failure posture. The adapter rationale and compatibility boundary are recorded in `docs/decisions/pose-adapter-contract.md`.

## Documentation Handoff

Keep repo-local decisions under `docs/decisions/`. Public contributor or product docs belong in `aerobeat-web-docs` after the contracts are accepted.
