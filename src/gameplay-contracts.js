// @ts-check

import {
  hasExactKeys,
  isNonEmptyString,
  isNonNegativeFiniteNumber,
  isOneOf,
  isRecord
} from "./contract-guards.js";
import { isBodyGridAnchorSnapshot, isBodyGridCellEntry } from "./body-grid-contracts.js";

/**
 * @typedef {"flow_grid_v1" | "boxing_semantic_track_v1" | "boxing_spatial_grid_v1"} AeroRulesetId
 */

/**
 * @typedef {"row_family_balanced_height_v1" | "cut_family_source_height_v1"} AeroConversionRecipeId
 */

/**
 * @typedef {"straight_left" | "straight_right" | "hook_left" | "hook_right" | "uppercut_left" | "uppercut_right" | "guard" | "crossed_guard" | "squat" | "weave_left" | "weave_right"} AeroBoxingAction
 */

/**
 * @typedef {"no_input" | "stale_input" | "wrong_cell" | "wrong_subcell" | "wrong_direction" | "qualification_too_short" | "tracking_invalid" | "calibration_mismatch" | "timing_miss" | "blocked_overlap" | "action_consumed"} AeroJudgementDiagnosticCode
 */

/**
 * @typedef {Object} AeroGameplayEvidenceSnapshot
 * @property {"aerobeat/gameplay_evidence_snapshot"} schema Schema ID.
 * @property {1} version Schema version.
 * @property {string} calibrationId Calibration generation.
 * @property {string} measuredSourceFrameId Real source-frame identity.
 * @property {number} measurementTimestampMs Real measurement timestamp.
 * @property {"measured"} provenance Evidence used by calibrated prototype scoring is measured.
 * @property {readonly AeroBoxingAction[]} activeBoxingActions Positive semantic observations; overlapping actions are allowed.
 * @property {readonly import("./body-grid-contracts.js").AeroBodyGridAnchorSnapshot[]} anchors Measured anchor snapshots.
 * @property {readonly import("./body-grid-contracts.js").AeroBodyGridCellEntry[]} entries Measured cardinal cell entries.
 */

/**
 * @typedef {Object} AeroGameplayJudgement
 * @property {"aerobeat/gameplay_judgement"} schema Schema ID.
 * @property {1} version Schema version.
 * @property {string} eventId Authored event identity.
 * @property {AeroRulesetId} rulesetId Ruleset identity.
 * @property {AeroConversionRecipeId | null} recipeId Recipe identity when generated.
 * @property {"hit" | "miss" | "ignored"} result Binary prototype result or non-scoring ignored event.
 * @property {number} beatCenterTimestampMs Event center timestamp.
 * @property {number | null} evidenceTimestampMs Consumed evidence timestamp.
 * @property {number | null} timingOffsetMs Evidence minus beat center.
 * @property {readonly AeroJudgementDiagnosticCode[]} diagnostics Detailed diagnostics.
 * @property {boolean} shadow Whether this judgement is diagnostic-only.
 */

/**
 * @typedef {Object} AeroPrototypeTuningIdentityBase
 * @property {"aerobeat/prototype_tuning_identity"} schema Schema ID.
 * @property {1} version Schema version.
 * @property {string} profileId Stable bounded profile ID.
 * @property {string} profileVersion Stable bounded profile version.
 * @property {string} contentHash Bare lowercase SHA-256 content hash.
 */

/**
 * A converter identity is pending when `regenerationRequired` is true and
 * applied when the owning registry has matched generated-package provenance
 * and emits false. Visual and scoring identities are always live/applied.
 *
 * @typedef {(AeroPrototypeTuningIdentityBase & {class:"live_visual" | "between_run_ruleset", regenerationRequired:false}) | (AeroPrototypeTuningIdentityBase & {class:"converter_regeneration", regenerationRequired:boolean})} AeroPrototypeTuningIdentity
 */

/** @type {readonly AeroRulesetId[]} */
export const rulesetIds = Object.freeze([
  "flow_grid_v1",
  "boxing_semantic_track_v1",
  "boxing_spatial_grid_v1"
]);

/** @type {readonly AeroConversionRecipeId[]} */
export const conversionRecipeIds = Object.freeze([
  "row_family_balanced_height_v1",
  "cut_family_source_height_v1"
]);

/** @type {readonly AeroBoxingAction[]} */
export const boxingActions = Object.freeze([
  "straight_left",
  "straight_right",
  "hook_left",
  "hook_right",
  "uppercut_left",
  "uppercut_right",
  "guard",
  "crossed_guard",
  "squat",
  "weave_left",
  "weave_right"
]);

/** @type {readonly AeroJudgementDiagnosticCode[]} */
export const judgementDiagnosticCodes = Object.freeze([
  "no_input",
  "stale_input",
  "wrong_cell",
  "wrong_subcell",
  "wrong_direction",
  "qualification_too_short",
  "tracking_invalid",
  "calibration_mismatch",
  "timing_miss",
  "blocked_overlap",
  "action_consumed"
]);

export const prototypeJudgementDefaults = Object.freeze({
  timingWindowBeforeMs: 180,
  timingWindowAfterMs: 180,
  checkpointFreshnessMs: 150,
  straightQualificationMs: 100,
  straightContinuityGapMs: 150,
  minimumPunchSpacingMs: 360
});

/**
 * @param {unknown} value
 * @returns {value is AeroGameplayEvidenceSnapshot}
 */
export function isGameplayEvidenceSnapshot(value) {
  return isRecord(value) &&
    value.schema === "aerobeat/gameplay_evidence_snapshot" &&
    value.version === 1 &&
    isNonEmptyString(value.calibrationId) &&
    isNonEmptyString(value.measuredSourceFrameId) &&
    isNonNegativeFiniteNumber(value.measurementTimestampMs) &&
    value.provenance === "measured" &&
    Array.isArray(value.activeBoxingActions) && value.activeBoxingActions.every((item) => isOneOf(item, boxingActions)) &&
    Array.isArray(value.anchors) && value.anchors.every(isBodyGridAnchorSnapshot) &&
    Array.isArray(value.entries) && value.entries.every(isBodyGridCellEntry);
}

/**
 * @param {unknown} value
 * @returns {value is AeroGameplayJudgement}
 */
export function isGameplayJudgement(value) {
  return isRecord(value) &&
    value.schema === "aerobeat/gameplay_judgement" &&
    value.version === 1 &&
    isNonEmptyString(value.eventId) &&
    isOneOf(value.rulesetId, rulesetIds) &&
    (value.recipeId === null || isOneOf(value.recipeId, conversionRecipeIds)) &&
    (value.result === "hit" || value.result === "miss" || value.result === "ignored") &&
    isNonNegativeFiniteNumber(value.beatCenterTimestampMs) &&
    (value.evidenceTimestampMs === null || isNonNegativeFiniteNumber(value.evidenceTimestampMs)) &&
    (value.timingOffsetMs === null || (typeof value.timingOffsetMs === "number" && Number.isFinite(value.timingOffsetMs))) &&
    Array.isArray(value.diagnostics) && value.diagnostics.every((item) => isOneOf(item, judgementDiagnosticCodes)) &&
    typeof value.shadow === "boolean";
}

/**
 * @param {unknown} value
 * @returns {value is AeroPrototypeTuningIdentity}
 */
export function isPrototypeTuningIdentity(value) {
  const fields = ["schema", "version", "profileId", "profileVersion", "contentHash", "class", "regenerationRequired"];
  const classes = /** @type {const} */ (["live_visual", "between_run_ruleset", "converter_regeneration"]);
  return hasExactKeys(value, fields) &&
    value.schema === "aerobeat/prototype_tuning_identity" &&
    value.version === 1 &&
    isBoundedNonEmptyString(value.profileId, 256) &&
    isBoundedNonEmptyString(value.profileVersion, 256) &&
    typeof value.contentHash === "string" && /^[0-9a-f]{64}$/u.test(value.contentHash) &&
    isOneOf(value.class, classes) &&
    typeof value.regenerationRequired === "boolean" &&
    (value.class === "converter_regeneration" || value.regenerationRequired === false);
}

/** @param {unknown} value @param {number} maximum */
function isBoundedNonEmptyString(value, maximum) {
  return typeof value === "string" && value.length > 0 && value.length <= maximum;
}
