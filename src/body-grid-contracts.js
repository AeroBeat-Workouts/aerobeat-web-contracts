// @ts-check

import {
  isFiniteNumber,
  isNonEmptyString,
  isNonNegativeFiniteNumber,
  isNormalizedNumber,
  isOneOf,
  isRecord
} from "./contract-guards.js";
import {
  athleteBodyGrid4x3,
  athleteBodySubgrid8x6,
  isAeroGridDescriptor
} from "./coordinate-spaces.js";

/**
 * @typedef {"nose" | "left_shoulder" | "right_shoulder" | "left_elbow" | "right_elbow" | "left_wrist" | "right_wrist"} AeroUpperBodyAnchorName
 */

/**
 * @typedef {"up" | "right" | "down" | "left"} AeroCardinalDirection
 */

/**
 * @typedef {"uncalibrated" | "holding" | "cooldown" | "calibrated" | "recalibrating" | "tracking_lost" | "invalidated"} AeroCalibrationState
 */

/**
 * @typedef {"not_ready" | "calibration_required" | "countdown" | "ready" | "paused_tracking" | "paused_manual" | "destroyed"} AeroReadinessState
 */

/**
 * @typedef {Object} AeroCalibratedBounds
 * @property {number} left Athlete-space left edge.
 * @property {number} top Athlete-space top edge.
 * @property {number} right Athlete-space right edge.
 * @property {number} bottom Athlete-space bottom edge.
 */

/**
 * @typedef {Object} AeroBodyGridAnchorSnapshot
 * @property {"aerobeat/body_grid_anchor_snapshot"} schema Schema ID.
 * @property {1} version Schema version.
 * @property {AeroUpperBodyAnchorName} anchor Anchor identity.
 * @property {string} calibrationId Calibration generation identity.
 * @property {number} measurementTimestampMs Latest real measurement timestamp.
 * @property {boolean} valid Whether this measured anchor is gameplay-valid.
 * @property {number} confidence Normalized measured confidence.
 * @property {number} rawX Unclamped athlete-space X.
 * @property {number} rawY Unclamped athlete-space Y.
 * @property {number | null} x Normalized athlete-space X when valid.
 * @property {number | null} y Normalized athlete-space Y when valid.
 * @property {number | null} cell Top-left row-major 4x3 scoring cell, or null outside the grid.
 * @property {number | null} subcell Top-left row-major 8x6 diagnostic/scoring subcell, or null outside the grid.
 */

/**
 * @typedef {Object} AeroBodyGridCellEntry
 * @property {"aerobeat/body_grid_cell_entry"} schema Schema ID.
 * @property {1} version Schema version.
 * @property {AeroUpperBodyAnchorName} anchor Anchor identity.
 * @property {string} calibrationId Calibration generation identity.
 * @property {number} measurementTimestampMs Real measurement timestamp.
 * @property {number} fromCell In-grid source cell.
 * @property {number} toCell In-grid destination cell.
 * @property {AeroCardinalDirection} direction Cardinal athlete-space entry direction.
 * @property {"measured"} provenance Cell entries used for calibrated evidence are measured.
 */

/**
 * @typedef {Object} AeroCalibrationSnapshot
 * @property {"aerobeat/calibration_snapshot"} schema Schema ID.
 * @property {1} version Schema version.
 * @property {AeroCalibrationState} state Calibration lifecycle state.
 * @property {AeroReadinessState} readiness Gameplay readiness state.
 * @property {string | null} calibrationId Current calibration generation.
 * @property {number} timestampMs Snapshot timestamp.
 * @property {number} holdDurationMs Required qualified hold duration.
 * @property {number} holdProgressMs Current qualified hold progress.
 * @property {number} cooldownRemainingMs Cooldown remaining after completion.
 * @property {boolean} releaseRequired Whether T-pose release is required before refire.
 * @property {AeroCalibratedBounds | null} bounds Atomically published athlete-space bounds.
 * @property {import("./coordinate-spaces.js").AeroGridDescriptor} grid Public 4x3 athlete grid.
 * @property {import("./coordinate-spaces.js").AeroGridDescriptor} subgrid Public 8x6 athlete subgrid.
 * @property {string | null} invalidationReason Null or stable invalidation reason.
 */

/**
 * @typedef {Object} AeroTrackingSafetySnapshot
 * @property {"aerobeat/tracking_safety_snapshot"} schema Schema ID.
 * @property {1} version Schema version.
 * @property {number} timestampMs Snapshot timestamp.
 * @property {number} lossThresholdMs Sustained loss duration that pauses gameplay.
 * @property {number} lossDurationMs Current sustained loss duration.
 * @property {boolean} allRequiredAnchorsVisible Whether all seven required anchors pass confidence.
 * @property {boolean} gameplayPaused Whether tracking safety currently pauses gameplay.
 * @property {boolean} freshCalibrationRequired Whether pause exit requires new calibration.
 */

/** @type {readonly AeroUpperBodyAnchorName[]} */
export const upperBodyAnchorNames = Object.freeze([
  "nose",
  "left_shoulder",
  "right_shoulder",
  "left_elbow",
  "right_elbow",
  "left_wrist",
  "right_wrist"
]);

/** @type {readonly AeroCardinalDirection[]} */
export const cardinalDirections = Object.freeze(["up", "right", "down", "left"]);

/** @type {readonly AeroCalibrationState[]} */
export const calibrationStates = Object.freeze([
  "uncalibrated",
  "holding",
  "cooldown",
  "calibrated",
  "recalibrating",
  "tracking_lost",
  "invalidated"
]);

/** @type {readonly AeroReadinessState[]} */
export const readinessStates = Object.freeze([
  "not_ready",
  "calibration_required",
  "countdown",
  "ready",
  "paused_tracking",
  "paused_manual",
  "destroyed"
]);

export const calibrationDefaults = Object.freeze({
  requiredConfidence: 0.5,
  holdDurationMs: 4000,
  cooldownDurationMs: 4000,
  trackingLossPauseMs: 500,
  wristElbowVerticalRatio: 0.35,
  minimumElbowAngleDeg: 130
});

/**
 * @param {unknown} value
 * @returns {value is AeroBodyGridAnchorSnapshot}
 */
export function isBodyGridAnchorSnapshot(value) {
  if (!isRecord(value)) {
    return false;
  }
  const valid = typeof value.valid === "boolean" ? value.valid : false;
  const normalizedPosition = valid
    ? isNormalizedNumber(value.rawX) && isNormalizedNumber(value.rawY) && isNormalizedNumber(value.x) && isNormalizedNumber(value.y)
    : (value.x === null || isNormalizedNumber(value.x)) && (value.y === null || isNormalizedNumber(value.y));
  const nullableCell = value.cell === null || (Number.isInteger(value.cell) && Number(value.cell) >= 0 && Number(value.cell) < 12);
  const nullableSubcell = value.subcell === null || (Number.isInteger(value.subcell) && Number(value.subcell) >= 0 && Number(value.subcell) < 48);
  const invalidHasNoScoringCell = valid || (value.cell === null && value.subcell === null);
  return value.schema === "aerobeat/body_grid_anchor_snapshot" &&
    value.version === 1 &&
    isOneOf(value.anchor, upperBodyAnchorNames) &&
    isNonEmptyString(value.calibrationId) &&
    isNonNegativeFiniteNumber(value.measurementTimestampMs) &&
    typeof value.valid === "boolean" &&
    isNormalizedNumber(value.confidence) &&
    isFiniteNumber(value.rawX) &&
    isFiniteNumber(value.rawY) &&
    normalizedPosition &&
    nullableCell &&
    nullableSubcell &&
    invalidHasNoScoringCell &&
    (!valid || (value.x !== null && value.y !== null));
}

/**
 * @param {unknown} value
 * @returns {value is AeroBodyGridCellEntry}
 */
export function isBodyGridCellEntry(value) {
  return isRecord(value) &&
    value.schema === "aerobeat/body_grid_cell_entry" &&
    value.version === 1 &&
    isOneOf(value.anchor, upperBodyAnchorNames) &&
    isNonEmptyString(value.calibrationId) &&
    isNonNegativeFiniteNumber(value.measurementTimestampMs) &&
    Number.isInteger(value.fromCell) && Number(value.fromCell) >= 0 && Number(value.fromCell) < 12 &&
    Number.isInteger(value.toCell) && Number(value.toCell) >= 0 && Number(value.toCell) < 12 &&
    isOneOf(value.direction, cardinalDirections) &&
    value.provenance === "measured";
}

/**
 * @param {unknown} value
 * @returns {value is AeroCalibrationSnapshot}
 */
export function isCalibrationSnapshot(value) {
  if (!isRecord(value)) {
    return false;
  }
  const bounds = value.bounds;
  const validBounds = bounds === null || (
    isRecord(bounds) &&
    isFiniteNumber(bounds.left) &&
    isFiniteNumber(bounds.top) &&
    isFiniteNumber(bounds.right) &&
    isFiniteNumber(bounds.bottom) &&
    bounds.left < bounds.right &&
    bounds.top < bounds.bottom
  );
  return value.schema === "aerobeat/calibration_snapshot" &&
    value.version === 1 &&
    isOneOf(value.state, calibrationStates) &&
    isOneOf(value.readiness, readinessStates) &&
    (value.calibrationId === null || isNonEmptyString(value.calibrationId)) &&
    isNonNegativeFiniteNumber(value.timestampMs) &&
    isNonNegativeFiniteNumber(value.holdDurationMs) &&
    isNonNegativeFiniteNumber(value.holdProgressMs) &&
    isNonNegativeFiniteNumber(value.cooldownRemainingMs) &&
    typeof value.releaseRequired === "boolean" &&
    validBounds &&
    isAeroGridDescriptor(value.grid) &&
    value.grid.id === athleteBodyGrid4x3.id &&
    value.grid.columns === athleteBodyGrid4x3.columns &&
    value.grid.rows === athleteBodyGrid4x3.rows &&
    value.grid.coordinateSpace === athleteBodyGrid4x3.coordinateSpace &&
    value.grid.indexing === athleteBodyGrid4x3.indexing &&
    value.grid.horizontallyOpposedToCamera === athleteBodyGrid4x3.horizontallyOpposedToCamera &&
    isAeroGridDescriptor(value.subgrid) &&
    value.subgrid.id === athleteBodySubgrid8x6.id &&
    value.subgrid.columns === athleteBodySubgrid8x6.columns &&
    value.subgrid.rows === athleteBodySubgrid8x6.rows &&
    value.subgrid.coordinateSpace === athleteBodySubgrid8x6.coordinateSpace &&
    value.subgrid.indexing === athleteBodySubgrid8x6.indexing &&
    value.subgrid.horizontallyOpposedToCamera === athleteBodySubgrid8x6.horizontallyOpposedToCamera &&
    (value.invalidationReason === null || isNonEmptyString(value.invalidationReason));
}

/**
 * @param {unknown} value
 * @returns {value is AeroTrackingSafetySnapshot}
 */
export function isTrackingSafetySnapshot(value) {
  return isRecord(value) &&
    value.schema === "aerobeat/tracking_safety_snapshot" &&
    value.version === 1 &&
    isNonNegativeFiniteNumber(value.timestampMs) &&
    isNonNegativeFiniteNumber(value.lossThresholdMs) &&
    isNonNegativeFiniteNumber(value.lossDurationMs) &&
    typeof value.allRequiredAnchorsVisible === "boolean" &&
    typeof value.gameplayPaused === "boolean" &&
    typeof value.freshCalibrationRequired === "boolean";
}
