// @ts-check

import assert from "node:assert/strict";
import {
  athleteBodyGrid4x3,
  athleteBodySubgrid8x6,
  calibrationDefaults,
  cameraColumnToAthleteColumn,
  cameraPreviewToAthlete,
  cameraPreviewToGameplayCamera,
  gameplayCameraToAthlete,
  gameplayRowToAthleteRow,
  isAeroGridDescriptor,
  isBodyGridAnchorSnapshot,
  isCalibrationSnapshot,
  normalizedPointToGridCell
} from "../src/index.js";

assert.deepEqual(cameraPreviewToGameplayCamera({ x: 0, y: 0 }), { x: 0, y: 1 });
assert.deepEqual(gameplayCameraToAthlete({ x: 0, y: 1 }), { x: 1, y: 0 });
assert.deepEqual(cameraPreviewToAthlete({ x: 0, y: 0 }), { x: 1, y: 0 });
assert.deepEqual(cameraPreviewToAthlete({ x: 1, y: 1 }), { x: 0, y: 1 });
assert.equal(cameraColumnToAthleteColumn(0, 4), 3);
assert.equal(cameraColumnToAthleteColumn(3, 4), 0);
assert.equal(gameplayRowToAthleteRow(0, 3), 2);
assert.equal(gameplayRowToAthleteRow(2, 3), 0);
assert.equal(isAeroGridDescriptor(athleteBodyGrid4x3), true);
assert.equal(isAeroGridDescriptor(athleteBodySubgrid8x6), true);
assert.deepEqual(normalizedPointToGridCell({ x: 0, y: 0 }, athleteBodyGrid4x3), { id: 0, row: 0, column: 0 });
assert.deepEqual(normalizedPointToGridCell({ x: 0.999, y: 0 }, athleteBodyGrid4x3), { id: 3, row: 0, column: 3 });
assert.deepEqual(normalizedPointToGridCell({ x: 0, y: 0.999 }, athleteBodyGrid4x3), { id: 8, row: 2, column: 0 });
assert.deepEqual(normalizedPointToGridCell({ x: 0.999, y: 0.999 }, athleteBodyGrid4x3), { id: 11, row: 2, column: 3 });
assert.equal(normalizedPointToGridCell({ x: 1, y: 0.5 }, athleteBodyGrid4x3), null);
assert.equal(normalizedPointToGridCell({ x: -0.001, y: 0.5 }, athleteBodyGrid4x3), null);
assert.equal(normalizedPointToGridCell({ x: 0.5, y: 1 }, athleteBodySubgrid8x6), null);

const anchor = {
  schema: "aerobeat/body_grid_anchor_snapshot",
  version: 1,
  anchor: "left_wrist",
  calibrationId: "cal-1",
  measurementTimestampMs: 100,
  valid: true,
  confidence: 0.9,
  rawX: 0.2,
  rawY: 0.3,
  x: 0.2,
  y: 0.3,
  cell: 0,
  subcell: 10
};
assert.equal(isBodyGridAnchorSnapshot(anchor), true);
assert.equal(isBodyGridAnchorSnapshot({ ...anchor, rawX: -0.2, rawY: 1.3, valid: false, x: null, y: null, cell: null, subcell: null }), true);
assert.equal(isBodyGridAnchorSnapshot({ ...anchor, valid: true, cell: null }), true, "valid in-grid coordinates may retain null scoring cell only when calibration geometry rejects it downstream");

assert.equal(isCalibrationSnapshot({
  schema: "aerobeat/calibration_snapshot",
  version: 1,
  state: "calibrated",
  readiness: "countdown",
  calibrationId: "cal-1",
  timestampMs: 4000,
  holdDurationMs: calibrationDefaults.holdDurationMs,
  holdProgressMs: 4000,
  cooldownRemainingMs: 4000,
  releaseRequired: true,
  bounds: { left: 0.1, top: 0.1, right: 0.9, bottom: 0.9 },
  grid: athleteBodyGrid4x3,
  subgrid: athleteBodySubgrid8x6,
  invalidationReason: null
}), true);

assert.equal(calibrationDefaults.holdDurationMs, 4000);
assert.equal(calibrationDefaults.cooldownDurationMs, 4000);
assert.equal(calibrationDefaults.trackingLossPauseMs, 500);
assert.equal(calibrationDefaults.wristElbowVerticalRatio, 0.35);
assert.equal(calibrationDefaults.minimumElbowAngleDeg, 130);

console.log("Coordinate and calibrated-grid contract validation passed.");
