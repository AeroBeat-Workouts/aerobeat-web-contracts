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
 * @typedef {"flow_grid_v1" | "flow_colliders_v1" | "boxing_semantic_track_v1" | "boxing_spatial_grid_v1"} AeroRulesetId
 */

/**
 * @typedef {"row_family_balanced_height_v1" | "cut_family_source_height_v1"} AeroConversionRecipeId
 */

/**
 * @typedef {"straight_left" | "straight_right" | "hook_left" | "hook_right" | "uppercut_left" | "uppercut_right" | "guard" | "crossed_guard" | "squat" | "weave_left" | "weave_right"} AeroBoxingAction
 */

/**
 * @typedef {"no_input" | "stale_input" | "wrong_collider" | "wrong_cell" | "wrong_subcell" | "wrong_direction" | "qualification_too_short" | "tracking_invalid" | "calibration_mismatch" | "timing_miss" | "blocked_overlap" | "action_consumed"} AeroJudgementDiagnosticCode
 */

/**
 * Per-class visual scale tuning, persisted in Game Setup v3. Each percent is a
 * bounded integer 10-200 defaulting to 100 (today's exact behavior).
 *
 * @typedef {Readonly<{noteScalePercent:number,obstacleScalePercent:number,bombScalePercent:number,markerScalePercent:number}>} AeroVisualScaleSetup
 */

/**
 * Persisted Game Setup v3 snapshot. Stored records missing the four scale
 * percent fields are forward-compatible reads that normalize to 100.
 *
 * @typedef {Readonly<{schema:string,version:3,showGameplayGrid:boolean,guidanceBandMode:"off"|"song_beat_grid"|"target_arrivals",noseCameraParallaxEnabled:boolean,spawnDistanceOverride:Readonly<{enabled:boolean,normalSpawnDistanceWorldUnits:number}>,noseCameraRangeXWorldUnits:number,noseCameraRangeYWorldUnits:number,colliderRadius:number,enforceAuthoredDirection:boolean,directionToleranceDegrees:number,timingWindowMs:number,noteScalePercent:number,obstacleScalePercent:number,bombScalePercent:number,markerScalePercent:number}>} AeroGameSetupSnapshotV3
 */

/**
 * Canonical persistence identity for Game Setup v3. The four per-class visual
 * scale percentages (each 10-200 integer, default 100) extend the timing and
 * collider setup; stored records without them read as 100.
 *
 * @type {Readonly<{schema:string,version:3,key:string}>}
 */
export const aeroGameSetupIdentity = Object.freeze({ schema: "aerobeat/game_setup", version: 3, key: "aerobeat.game-setup.v3" });

/** Exact bounds for each per-class visual scale percent control. */
export const aeroVisualScaleBounds = Object.freeze([Object.freeze(["noteScalePercent", 10, 200]), Object.freeze(["obstacleScalePercent", 10, 200]), Object.freeze(["bombScalePercent", 10, 200]), Object.freeze(["markerScalePercent", 10, 200])]);
const visualScaleBoundsTuples = /** @type {readonly (readonly ["noteScalePercent"|"obstacleScalePercent"|"bombScalePercent"|"markerScalePercent",number,number])[]} */ (aeroVisualScaleBounds);

/**
 * Type guard for one per-class visual scale record: exactly the four bounded
 * integer percent keys, each within its inclusive 10-200 bounds.
 *
 * @param {unknown} value
 * @returns {value is import("./gameplay-contracts.js").AeroVisualScaleSetup}
 */
export function isVisualScaleSetup(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const record = /** @type {Record<string, unknown>} */ (value);
  const ownKeys = Reflect.ownKeys(record);
  if (ownKeys.length !== visualScaleBoundsTuples.length) return false;
  return visualScaleBoundsTuples.every(([key, minimum, maximum]) => Number.isInteger(record[key]) && Number(record[key]) >= minimum && Number(record[key]) <= maximum);
}

/**
 * Semantic-only latest Flow Colliders note judgement. Authored event identity,
 * timing, pose identity, and collision evidence are intentionally absent.
 *
 * @typedef {Object} AeroFlowCollidersLatestJudgement
 * @property {"hit" | "miss"} result Latest resolved note result.
 * @property {readonly AeroJudgementDiagnosticCode[]} diagnostics Bounded semantic diagnostics only.
 */

/**
 * @typedef {Object} AeroFlowCollidersNoteCounts
 * @property {number} hit Resolved note hits.
 * @property {number} miss Resolved note misses.
 */

/**
 * @typedef {Object} AeroFlowCollidersHazardCounts
 * @property {number} contact Proven hazard contacts.
 * @property {number} avoided Proven avoided hazards.
 * @property {number} unevaluatedTracking Hazards without complete tracking coverage.
 */

/**
 * Strict semantic-only public Flow Colliders projection. It is not collision
 * evidence and cannot contain landmark, geometry, timing, or provenance data.
 *
 * @typedef {Object} AeroFlowCollidersPublicSummary
 * @property {"aerobeat/flow_colliders_public_summary"} schema Schema ID.
 * @property {1} version Schema version.
 * @property {"flow"} mode Stable renderer/gameplay mode identity.
 * @property {"flow_colliders_v1"} rulesetId Exact collision ruleset identity.
 * @property {AeroFlowCollidersLatestJudgement | null} latestJudgement Latest semantic note judgement, if any.
 * @property {AeroFlowCollidersNoteCounts} notes Bounded aggregate note counts.
 * @property {AeroFlowCollidersHazardCounts} bombs Bounded aggregate bomb counts.
 * @property {AeroFlowCollidersHazardCounts} walls Bounded aggregate wall counts.
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
 * @property {readonly import("./body-grid-contracts.js").AeroBodyGridCellEntry[]} entries Measured cell entries with optional eight-way directional evidence.
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
 * Version 2 is authoritative normal-Play judgement truth with the exact song
 * timeline position at which gameplay committed the result. Visual Test
 * demonstrations never create this record; they remain renderer/assembly-local.
 *
 * @typedef {Object} AeroGameplayJudgementV2
 * @property {"aerobeat/gameplay_judgement"} schema Schema ID.
 * @property {2} version Schema version.
 * @property {"play"} sessionPurpose Only normal Play may produce real judgement truth.
 * @property {string} eventId Authored event identity.
 * @property {AeroRulesetId} rulesetId Ruleset identity.
 * @property {AeroConversionRecipeId | null} recipeId Recipe identity when generated.
 * @property {"hit" | "miss" | "ignored"} result Binary prototype result or non-scoring ignored event.
 * @property {number} beatCenterTimestampMs Event center timestamp.
 * @property {number} committedTimelinePositionMs Authoritative song timeline position at result commitment.
 * @property {number | null} evidenceTimestampMs Consumed evidence timestamp.
 * @property {number | null} timingOffsetMs Evidence minus beat center.
 * @property {readonly AeroJudgementDiagnosticCode[]} diagnostics Detailed diagnostics.
 * @property {boolean} shadow Whether this judgement is diagnostic-only.
 */

/**
 * @typedef {"contact" | "avoided" | "unevaluated_tracking"} AeroObstacleResult
 */

/**
 * Internal deterministic Flow obstacle outcome. Public assembly projections
 * must expose aggregate counts only and omit evidence/calibration identities.
 *
 * @typedef {Object} AeroObstacleOutcome
 * @property {"aerobeat/obstacle_outcome"} schema Schema ID.
 * @property {1} version Schema version.
 * @property {string} eventId Authored obstacle identity.
 * @property {"flow_colliders_v1"} rulesetId Exact Flow ruleset identity.
 * @property {AeroObstacleResult} result Evaluation result.
 * @property {number} intervalStartTimestampMs Exact authored interval start.
 * @property {number} intervalEndTimestampMs Exact authored interval end.
 * @property {number} committedTimelinePositionMs Song time at commitment.
 * @property {number | null} firstContactTimelinePositionMs First proven contact.
 * @property {number} contactDurationMs Proven clipped-union contact duration.
 * @property {string | null} contactEpisodeId Deterministic entry episode.
 * @property {string | null} evidenceFrameId Internal measured frame identity.
 * @property {string | null} calibrationId Internal calibration generation.
 * @property {boolean} consequenceApplied Whether this obstacle won entry ordering.
 */

/**
 * @typedef {Object} AeroGameplayCoordinatorSnapshotV2
 * @property {"aerobeat/gameplay_coordinator_snapshot"} schema Schema ID.
 * @property {2} version Schema version.
 * @property {readonly AeroObstacleOutcome[]} obstacleOutcomes Bounded run-local outcomes.
 */

/** @type {readonly AeroObstacleResult[]} */
export const obstacleResults = Object.freeze(["contact", "avoided", "unevaluated_tracking"]);

/**
 * @param {unknown} value
 * @returns {value is AeroObstacleOutcome}
 */
export function isObstacleOutcome(value) {
  const fields = ["schema", "version", "eventId", "rulesetId", "result", "intervalStartTimestampMs", "intervalEndTimestampMs", "committedTimelinePositionMs", "firstContactTimelinePositionMs", "contactDurationMs", "contactEpisodeId", "evidenceFrameId", "calibrationId", "consequenceApplied"];
  if (!hasExactKeys(value, fields) || value.schema !== "aerobeat/obstacle_outcome" || value.version !== 1 ||
      !isBoundedNonEmptyString(value.eventId, 512) || value.rulesetId !== "flow_colliders_v1" || !isOneOf(value.result, obstacleResults) ||
      !isNonNegativeFiniteNumber(value.intervalStartTimestampMs) || !isNonNegativeFiniteNumber(value.intervalEndTimestampMs) ||
      value.intervalEndTimestampMs <= value.intervalStartTimestampMs || value.intervalEndTimestampMs > 86_400_000 ||
      !isNonNegativeFiniteNumber(value.committedTimelinePositionMs) || value.committedTimelinePositionMs > 86_400_000 ||
      !isNonNegativeFiniteNumber(value.contactDurationMs) || value.contactDurationMs > value.intervalEndTimestampMs - value.intervalStartTimestampMs ||
      !(value.firstContactTimelinePositionMs === null || isNonNegativeFiniteNumber(value.firstContactTimelinePositionMs)) ||
      !(value.contactEpisodeId === null || isBoundedNonEmptyString(value.contactEpisodeId, 512)) ||
      !(value.evidenceFrameId === null || isBoundedNonEmptyString(value.evidenceFrameId, 512)) ||
      !(value.calibrationId === null || isBoundedNonEmptyString(value.calibrationId, 512)) ||
      typeof value.consequenceApplied !== "boolean") {
    return false;
  }
  if (value.result === "contact") {
    return value.firstContactTimelinePositionMs !== null && value.contactDurationMs >= 0 && value.contactEpisodeId !== null;
  }
  return value.firstContactTimelinePositionMs === null && value.contactDurationMs === 0 && value.contactEpisodeId === null && value.consequenceApplied === false;
}

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
  "flow_colliders_v1",
  "boxing_semantic_track_v1",
  "boxing_spatial_grid_v1"
]);

/**
 * @param {unknown} value
 * @returns {value is AeroRulesetId}
 */
export function isRulesetId(value) {
  return isOneOf(value, rulesetIds);
}

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
  "wrong_collider",
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

/** Maximum value accepted for each public Flow Colliders aggregate count. */
export const flowCollidersPublicCountMaximum = 1_000_000;

/**
 * Accept only the bounded semantic projection. Extra, hidden, symbolic, or
 * accessor properties reject, including private collision evidence.
 *
 * @param {unknown} value
 * @returns {value is AeroFlowCollidersPublicSummary}
 */
export function isFlowCollidersPublicSummary(value) {
  const fields = ["schema", "version", "mode", "rulesetId", "latestJudgement", "notes", "bombs", "walls"];
  return hasExactKeys(value, fields) &&
    value.schema === "aerobeat/flow_colliders_public_summary" &&
    value.version === 1 &&
    value.mode === "flow" &&
    value.rulesetId === "flow_colliders_v1" &&
    (value.latestJudgement === null || isFlowCollidersLatestJudgement(value.latestJudgement)) &&
    isFlowCollidersNoteCounts(value.notes) &&
    isFlowCollidersHazardCounts(value.bombs) &&
    isFlowCollidersHazardCounts(value.walls);
}

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
 * Accept legacy version 1 judgements and exact version 2 commitment-aware
 * judgements. New gameplay producers must emit version 2.
 *
 * @param {unknown} value
 * @returns {value is AeroGameplayJudgement | AeroGameplayJudgementV2}
 */
export function isGameplayJudgement(value) {
  if (!isRecord(value)) {
    return false;
  }
  const version = Object.getOwnPropertyDescriptor(value, "version");
  if (!version || !("value" in version)) {
    return false;
  }
  if (version.value === 2) {
    return isGameplayJudgementV2(value);
  }
  return version.value === 1 &&
    value.schema === "aerobeat/gameplay_judgement" &&
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
 * @returns {value is AeroGameplayJudgementV2}
 */
export function isGameplayJudgementV2(value) {
  const fields = ["schema", "version", "sessionPurpose", "eventId", "rulesetId", "recipeId", "result", "beatCenterTimestampMs", "committedTimelinePositionMs", "evidenceTimestampMs", "timingOffsetMs", "diagnostics", "shadow"];
  return hasExactKeys(value, fields) &&
    value.schema === "aerobeat/gameplay_judgement" &&
    value.version === 2 &&
    value.sessionPurpose === "play" &&
    isBoundedNonEmptyString(value.eventId, 512) &&
    isOneOf(value.rulesetId, rulesetIds) &&
    (value.recipeId === null || isOneOf(value.recipeId, conversionRecipeIds)) &&
    (value.result === "hit" || value.result === "miss" || value.result === "ignored") &&
    isNonNegativeFiniteNumber(value.beatCenterTimestampMs) &&
    isNonNegativeFiniteNumber(value.committedTimelinePositionMs) &&
    (value.evidenceTimestampMs === null || isNonNegativeFiniteNumber(value.evidenceTimestampMs)) &&
    (value.timingOffsetMs === null || (typeof value.timingOffsetMs === "number" && Number.isFinite(value.timingOffsetMs))) &&
    isExactDiagnosticList(value.diagnostics) &&
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

/** @param {unknown} value */
function isFlowCollidersLatestJudgement(value) {
  return hasExactKeys(value, ["result", "diagnostics"]) &&
    (value.result === "hit" || value.result === "miss") &&
    isExactDiagnosticList(value.diagnostics);
}

/** @param {unknown} value */
function isFlowCollidersNoteCounts(value) {
  return hasExactKeys(value, ["hit", "miss"]) &&
    isBoundedAggregateCount(value.hit) &&
    isBoundedAggregateCount(value.miss);
}

/** @param {unknown} value */
function isFlowCollidersHazardCounts(value) {
  return hasExactKeys(value, ["contact", "avoided", "unevaluatedTracking"]) &&
    isBoundedAggregateCount(value.contact) &&
    isBoundedAggregateCount(value.avoided) &&
    isBoundedAggregateCount(value.unevaluatedTracking);
}

/** @param {unknown} value */
function isBoundedAggregateCount(value) {
  return Number.isSafeInteger(value) && Number(value) >= 0 && Number(value) <= flowCollidersPublicCountMaximum;
}

/** @param {unknown} value @param {number} maximum */
function isBoundedNonEmptyString(value, maximum) {
  return typeof value === "string" && value.length > 0 && value.length <= maximum;
}

/** @param {unknown} value */
function isExactDiagnosticList(value) {
  if (!Array.isArray(value) || value.length > judgementDiagnosticCodes.length || Reflect.ownKeys(value).length !== value.length + 1) {
    return false;
  }
  const seen = new Set();
  for (let index = 0; index < value.length; index += 1) {
    const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
    if (!descriptor || !descriptor.enumerable || !("value" in descriptor) || !isOneOf(descriptor.value, judgementDiagnosticCodes) || seen.has(descriptor.value)) {
      return false;
    }
    seen.add(descriptor.value);
  }
  return true;
}
