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
  normalizedPointToGridCell,
  upperBodyAnchorNames
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
assert.deepEqual(normalizedPointToGridCell({ x: 0, y: 0 }, athleteBodySubgrid8x6), { id: 0, row: 0, column: 0 });
assert.deepEqual(normalizedPointToGridCell({ x: 0.999, y: 0 }, athleteBodySubgrid8x6), { id: 7, row: 0, column: 7 });
assert.deepEqual(normalizedPointToGridCell({ x: 0, y: 0.999 }, athleteBodySubgrid8x6), { id: 40, row: 5, column: 0 });
assert.deepEqual(normalizedPointToGridCell({ x: 0.999, y: 0.999 }, athleteBodySubgrid8x6), { id: 47, row: 5, column: 7 });
for (const descriptor of [athleteBodyGrid4x3, athleteBodySubgrid8x6]) {
  for (const point of [
    { x: 1, y: 0.5 },
    { x: -0.001, y: 0.5 },
    { x: 0.5, y: 1 },
    { x: 0.5, y: -0.001 },
    { x: Number.NaN, y: 0.5 },
    { x: 0.5, y: Number.NaN },
    { x: Number.POSITIVE_INFINITY, y: 0.5 },
    { x: 0.5, y: Number.NEGATIVE_INFINITY }
  ]) {
    assert.equal(normalizedPointToGridCell(point, descriptor), null);
  }
  const signedZero = normalizedPointToGridCell({ x: -0, y: -0 }, descriptor);
  assert.deepEqual(signedZero, { id: 0, row: 0, column: 0 });
  assert.equal(Object.is(signedZero?.id, -0), false);
  assert.equal(Object.is(signedZero?.row, -0), false);
  assert.equal(Object.is(signedZero?.column, -0), false);
}

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
assert.equal(isBodyGridAnchorSnapshot({ ...anchor, rawX: -0.2, valid: true }), false);
assert.equal(isBodyGridAnchorSnapshot({ ...anchor, valid: false, cell: 0, subcell: 0 }), false);
assert.equal(isBodyGridAnchorSnapshot({ ...anchor, valid: true, cell: null }), true, "valid in-grid coordinates may retain null scoring cell only when calibration geometry rejects it downstream");

const calibration = {
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
};
assert.equal(isCalibrationSnapshot(calibration), true);
assert.equal(isCalibrationSnapshot({ ...calibration, grid: { ...athleteBodyGrid4x3, id: "wrong-grid" } }), false);
assert.equal(isCalibrationSnapshot({ ...calibration, subgrid: { ...athleteBodySubgrid8x6, columns: 4 } }), false);

assert.deepEqual(upperBodyAnchorNames, [
  "nose",
  "left_shoulder",
  "right_shoulder",
  "left_elbow",
  "right_elbow",
  "left_wrist",
  "right_wrist"
]);
assert.equal(calibrationDefaults.requiredConfidence, 0.5);
assert.equal(calibrationDefaults.holdDurationMs, 4000);
assert.equal(calibrationDefaults.cooldownDurationMs, 4000);
assert.equal(calibrationDefaults.trackingLossPauseMs, 500);
assert.equal(calibrationDefaults.wristElbowVerticalRatio, 0.35);
assert.equal(calibrationDefaults.minimumElbowAngleDeg, 130);

console.log("Coordinate and calibrated-grid contract validation passed.");
