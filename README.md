# aerobeat-web-contracts

Shared AeroBeat web contracts for service IDs, event names, custom element names, and cross-repo data shapes.

## Responsibility

This repo is the first shared contract home for the web port. It defines stable names and documented shapes that other `@aerobeat/web-*` packages consume through public exports.

It intentionally does not implement camera access, pose detection, input routing, gameplay scoring, content loading, rendering, audio playback, UI components, or assembly wiring.

## Public API Surface

- `src/service-ids.js` owns service ID constants such as `aero.cv.pose`.
- `src/event-names.js` owns event name constants such as `aero:cv:pose-frame`.
- `src/element-names.js` owns custom element registry names such as `aero-calibration-screen`.
- `src/pose-shapes.js` is the JSDoc home for normalized pose frames and body-grid shapes.
- `src/pose-adapter.js` defines the vendor-neutral structural `AeroPoseAdapter` lifecycle, frame/options, identity, telemetry, capabilities, and cleanup boundary. Optional execution telemetry can split end-to-end estimate time into vendor runtime inference and adapter postprocessing without exposing vendor objects.
- `src/input-shapes.js` is the JSDoc home for gameplay-facing input event shapes.
- `src/content-shapes.js` is the JSDoc home for map/chart/content package shapes.
- `src/index.js` exports the public contract surface.

## Adjacent Repos

- `aerobeat-web-cv` produces normalized pose frames and owns camera/CV service implementation.
- `aerobeat-web-input` converts pose/body-grid data into gameplay-facing input events.
- `aerobeat-web-content` validates and loads concrete content packages.
- `aerobeat-web-gameplay` consumes content and input contracts to run modes.
- `aerobeat-web-assembly` wires concrete services together.

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
