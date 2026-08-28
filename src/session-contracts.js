// @ts-check

import { hasExactKeys, isNonEmptyString, isNonNegativeFiniteNumber, isOneOf, isRecord } from "./contract-guards.js";

/**
 * @typedef {"idle" | "selecting_content" | "calibrating" | "countdown" | "playing" | "paused_manual" | "paused_tracking" | "completed" | "error" | "destroyed"} AeroGameplaySessionState
 */

/**
 * @typedef {"initial_start" | "manual_resume" | "tracking_resume" | "content_change"} AeroCountdownReason
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

/** @type {readonly ("camera" | "audio")[]} */
export const mediaLeaseResources = Object.freeze(["camera", "audio"]);

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
 * @param {unknown} value
 * @returns {value is AeroGameplaySessionSnapshot}
 */
export function isGameplaySessionSnapshot(value) {
  return isRecord(value) &&
    value.schema === "aerobeat/gameplay_session_snapshot" &&
    value.version === 1 &&
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
