// @ts-check

import { hasExactKeys, isNonEmptyString, isNonNegativeFiniteNumber, isOneOf, isRecord } from "./contract-guards.js";

/**
 * @typedef {"idle" | "selecting_content" | "calibrating" | "countdown" | "playing" | "paused_manual" | "paused_tracking" | "completed" | "error" | "destroyed"} AeroGameplaySessionState
 */

/**
 * @typedef {"initial_start" | "manual_resume" | "tracking_resume" | "content_change"} AeroCountdownReason
 */

/**
 * Session purpose is authoritative orchestration truth. `play` owns calibrated
 * input and real judgement/score truth; `visual_test` is unranked, input-free
 * presentation and must not emit gameplay judgements or scores.
 *
 * @typedef {"play" | "visual_test"} AeroGameplaySessionPurpose
 */

/**
 * @typedef {Object} AeroGameplaySessionStartRequest
 * @property {"aerobeat/gameplay_session_start"} schema Schema ID.
 * @property {1} version Schema version.
 * @property {AeroGameplaySessionPurpose} purpose Requested session purpose.
 */

/**
 * @typedef {Object} AeroCountdownSnapshot
 * @property {"aerobeat/countdown_snapshot"} schema Schema ID.
 * @property {1} version Schema version.
 * @property {"inactive" | "three" | "two" | "one" | "complete" | "cancelled"} state Countdown state.
 * @property {AeroCountdownReason | null} reason Countdown reason.
 * @property {number | null} value Visible countdown numeral.
 * @property {number} timestampMs Snapshot timestamp.
 * @property {boolean} gameplayTimeFrozen Whether gameplay/audio time is frozen.
 * @property {string | null} calibrationId Calibration generation required by this countdown.
 */

/**
 * @typedef {Object} AeroGameplaySessionSnapshot
 * @property {"aerobeat/gameplay_session_snapshot"} schema Schema ID.
 * @property {1} version Schema version.
 * @property {string} sessionId Session identity.
 * @property {AeroGameplaySessionState} state Session lifecycle state.
 * @property {number} timestampMs Snapshot timestamp.
 * @property {number} timelinePositionMs Authoritative audio timeline position.
 * @property {string | null} packageId Loaded package identity.
 * @property {string | null} chartId Loaded chart identity.
 * @property {string | null} calibrationId Active calibration identity.
 * @property {string | null} rulesetId Active ruleset identity.
 * @property {string | null} recipeId Active recipe identity.
 * @property {boolean} ranked Whether the run is eligible for ranked identity.
 * @property {string | null} pauseReason Stable pause/error reason.
 */

/**
 * Version 2 adds exact purpose truth while version 1 remains accepted for
 * persisted/embedded compatibility. A visual-test snapshot is necessarily
 * unranked, has no calibration identity, and cannot enter calibration,
 * countdown, or tracking-loss states.
 *
 * @typedef {Object} AeroGameplaySessionSnapshotV2
 * @property {"aerobeat/gameplay_session_snapshot"} schema Schema ID.
 * @property {2} version Schema version.
 * @property {string} sessionId Session identity.
 * @property {AeroGameplaySessionState} state Session lifecycle state.
 * @property {AeroGameplaySessionPurpose} purpose Authoritative session purpose.
 * @property {number} timestampMs Snapshot timestamp.
 * @property {number} timelinePositionMs Authoritative audio timeline position.
 * @property {string | null} packageId Loaded package identity.
 * @property {string | null} chartId Loaded chart identity.
 * @property {string | null} calibrationId Active calibration identity; always null for visual test.
 * @property {string | null} rulesetId Active ruleset identity.
 * @property {string | null} recipeId Active recipe identity.
 * @property {boolean} ranked Whether the run is eligible for ranked identity; always false for visual test.
 * @property {string | null} pauseReason Stable pause/error reason.
 */

/**
 * @typedef {Object} AeroMediaLeaseSnapshot
 * @property {"aerobeat/media_lease_snapshot"} schema Schema ID.
 * @property {1} version Schema version.
 * @property {string | null} ownerInstanceId Active owner, if present.
 * @property {number} generation Monotonic lease generation.
 * @property {"idle" | "transferring" | "owned"} state Lease state.
 * @property {readonly ("camera" | "audio")[]} resources Leased resource classes.
 */

/** @type {readonly AeroGameplaySessionState[]} */
export const gameplaySessionStates = Object.freeze([
  "idle",
  "selecting_content",
  "calibrating",
  "countdown",
  "playing",
  "paused_manual",
  "paused_tracking",
  "completed",
  "error",
  "destroyed"
]);

/** @type {readonly AeroCountdownReason[]} */
export const countdownReasons = Object.freeze([
  "initial_start",
  "manual_resume",
  "tracking_resume",
  "content_change"
]);

/** @type {readonly AeroGameplaySessionPurpose[]} */
export const gameplaySessionPurposes = Object.freeze(["play", "visual_test"]);

/** @type {readonly ("camera" | "audio")[]} */
export const mediaLeaseResources = Object.freeze(["camera", "audio"]);

/**
 * @param {unknown} value
 * @returns {value is AeroGameplaySessionPurpose}
 */
export function isGameplaySessionPurpose(value) {
  return isOneOf(value, gameplaySessionPurposes);
}

/**
 * Validate the exact bounded Start command payload. A legacy null Start payload
 * is interpreted by the host contract as `play`; new callers should send this
 * record explicitly.
 *
 * @param {unknown} value
 * @returns {value is AeroGameplaySessionStartRequest}
 */
export function isGameplaySessionStartRequest(value) {
  return hasExactKeys(value, ["schema", "version", "purpose"]) &&
    value.schema === "aerobeat/gameplay_session_start" &&
    value.version === 1 &&
    isGameplaySessionPurpose(value.purpose);
}

/**
 * @param {unknown} value
 * @returns {value is AeroCountdownSnapshot}
 */
export function isCountdownSnapshot(value) {
  if (!isRecord(value)) {
    return false;
  }
  const states = /** @type {const} */ (["inactive", "three", "two", "one", "complete", "cancelled"]);
  return value.schema === "aerobeat/countdown_snapshot" &&
    value.version === 1 &&
    isOneOf(value.state, states) &&
    (value.reason === null || isOneOf(value.reason, countdownReasons)) &&
    (value.value === null || value.value === 1 || value.value === 2 || value.value === 3) &&
    isNonNegativeFiniteNumber(value.timestampMs) &&
    typeof value.gameplayTimeFrozen === "boolean" &&
    (value.calibrationId === null || isNonEmptyString(value.calibrationId));
}

/**
 * Accept legacy version 1 snapshots and exact version 2 purpose-aware snapshots.
 * New producers must emit version 2.
 *
 * @param {unknown} value
 * @returns {value is AeroGameplaySessionSnapshot | AeroGameplaySessionSnapshotV2}
 */
export function isGameplaySessionSnapshot(value) {
  if (!isRecord(value)) {
    return false;
  }
  const version = Object.getOwnPropertyDescriptor(value, "version");
  if (!version || !("value" in version)) {
    return false;
  }
  if (version.value === 2) {
    return isGameplaySessionSnapshotV2(value);
  }
  return version.value === 1 &&
    value.schema === "aerobeat/gameplay_session_snapshot" &&
    isNonEmptyString(value.sessionId) &&
    isOneOf(value.state, gameplaySessionStates) &&
    isNonNegativeFiniteNumber(value.timestampMs) &&
    isNonNegativeFiniteNumber(value.timelinePositionMs) &&
    (value.packageId === null || isNonEmptyString(value.packageId)) &&
    (value.chartId === null || isNonEmptyString(value.chartId)) &&
    (value.calibrationId === null || isNonEmptyString(value.calibrationId)) &&
    (value.rulesetId === null || isNonEmptyString(value.rulesetId)) &&
    (value.recipeId === null || isNonEmptyString(value.recipeId)) &&
    typeof value.ranked === "boolean" &&
    (value.pauseReason === null || isNonEmptyString(value.pauseReason));
}

/**
 * @param {unknown} value
 * @returns {value is AeroGameplaySessionSnapshotV2}
 */
export function isGameplaySessionSnapshotV2(value) {
  const fields = ["schema", "version", "sessionId", "state", "purpose", "timestampMs", "timelinePositionMs", "packageId", "chartId", "calibrationId", "rulesetId", "recipeId", "ranked", "pauseReason"];
  if (!hasExactKeys(value, fields) ||
    value.schema !== "aerobeat/gameplay_session_snapshot" ||
    value.version !== 2 ||
    !isBoundedNullableString(value.sessionId, 256, false) ||
    !isOneOf(value.state, gameplaySessionStates) ||
    !isGameplaySessionPurpose(value.purpose) ||
    !isNonNegativeFiniteNumber(value.timestampMs) ||
    !isNonNegativeFiniteNumber(value.timelinePositionMs) ||
    !isBoundedNullableString(value.packageId, 512) ||
    !isBoundedNullableString(value.chartId, 512) ||
    !isBoundedNullableString(value.calibrationId, 256) ||
    !isBoundedNullableString(value.rulesetId, 128) ||
    !isBoundedNullableString(value.recipeId, 128) ||
    typeof value.ranked !== "boolean" ||
    !isBoundedNullableString(value.pauseReason, 256)) {
    return false;
  }
  return value.purpose !== "visual_test" || (
    value.ranked === false &&
    value.calibrationId === null &&
    value.state !== "calibrating" &&
    value.state !== "countdown" &&
    value.state !== "paused_tracking"
  );
}

/**
 * @param {unknown} value
 * @returns {value is AeroMediaLeaseSnapshot}
 */
export function isMediaLeaseSnapshot(value) {
  return hasExactKeys(value, ["schema", "version", "ownerInstanceId", "generation", "state", "resources"]) &&
    value.schema === "aerobeat/media_lease_snapshot" &&
    value.version === 1 &&
    (value.ownerInstanceId === null || isNonEmptyString(value.ownerInstanceId)) &&
    Number.isInteger(value.generation) && Number(value.generation) >= 0 &&
    (value.state === "idle" || value.state === "transferring" || value.state === "owned") &&
    Array.isArray(value.resources) &&
    value.resources.every((item) => mediaLeaseResources.includes(item)) &&
    new Set(value.resources).size === value.resources.length;
}

/** @param {unknown} value @param {number} maximum @param {boolean} [nullable] */
function isBoundedNullableString(value, maximum, nullable = true) {
  return (nullable && value === null) || (typeof value === "string" && value.length > 0 && value.length <= maximum);
}
