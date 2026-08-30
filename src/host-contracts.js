// @ts-check

import { hasExactKeys, isNonEmptyString, isNonNegativeFiniteNumber, isOneOf, isRecord } from "./contract-guards.js";
import { isGameplaySessionStartRequest } from "./session-contracts.js";

/**
 * @typedef {"configure" | "start" | "pause" | "resume" | "stop" | "reset_calibration" | "request_fullscreen" | "select_content" | "select_variant" | "browse_beatsaver" | "import_beatsaver" | "import_local_zip" | "cancel_import" | "delete_package" | "set_theme" | "destroy"} AeroGameCommandType
 */

/**
 * @typedef {"ready" | "capabilities_changed" | "calibration_changed" | "tracking_changed" | "session_changed" | "score_changed" | "content_changed" | "beatsaver_results" | "import_changed" | "fullscreen_changed" | "error" | "destroyed"} AeroGameEventType
 */

/**
 * @typedef {Object} AeroGameCommand
 * @property {"aerobeat/game_command"} schema Schema ID.
 * @property {1} version Schema version.
 * @property {string} commandId Caller-provided command identity.
 * @property {AeroGameCommandType} type Command type.
 * @property {Readonly<Record<string, unknown>> | null} payload Versioned command payload. `start` accepts null for legacy Play or an exact AeroGameplaySessionStartRequest for explicit Play/Visual Test.
 */

/**
 * @typedef {Object} AeroGameEvent
 * @property {"aerobeat/game_event"} schema Schema ID.
 * @property {1} version Schema version.
 * @property {string} eventId Event identity.
 * @property {AeroGameEventType} type Event type.
 * @property {number} timestampMs Event timestamp.
 * @property {Readonly<Record<string, unknown>> | null} payload Versioned event payload.
 */

/**
 * @typedef {Object} AeroContainerSnapshot
 * @property {"aerobeat/container_snapshot"} schema Schema ID.
 * @property {1} version Schema version.
 * @property {number} widthCssPx Parent content-box width.
 * @property {number} heightCssPx Parent content-box height.
 * @property {number} devicePixelRatio Effective device-pixel ratio.
 * @property {boolean} visible Whether the owning document/iframe is visible.
 * @property {boolean} fullscreen Whether the child game element is fullscreen.
 */

/**
 * @typedef {Object} AeroFullscreenSnapshot
 * @property {"aerobeat/fullscreen_snapshot"} schema Schema ID.
 * @property {1} version Schema version.
 * @property {boolean} supported Whether fullscreen is available and delegated.
 * @property {boolean} active Whether this game element is currently fullscreen.
 * @property {boolean} requestPending Whether a child-owned request is pending.
 * @property {string | null} errorCode Stable failure code for the latest request.
 */

/**
 * @typedef {Object} AeroGameCapabilities
 * @property {"aerobeat/game_capabilities"} schema Schema ID.
 * @property {1} version Schema version.
 * @property {boolean} secureContext Secure-context availability.
 * @property {boolean} camera Camera API availability/delegation.
 * @property {boolean} fullscreen Fullscreen availability/delegation.
 * @property {boolean} autoplay Audio autoplay availability.
 * @property {boolean} webgl2 WebGL2 availability.
 * @property {boolean} indexedDb IndexedDB availability.
 * @property {boolean} worker Worker availability.
 * @property {boolean} directBeatSaverCors Direct BeatSaver transport observed available.
 * @property {boolean} localZipImport Local File/ZIP import availability.
 * @property {readonly string[]} limitations Stable limitation codes.
 */

/**
 * @typedef {Object} AeroAssetPolicy
 * @property {"aerobeat/asset_policy"} schema Schema ID.
 * @property {1} version Schema version.
 * @property {boolean} requireChartHash Whether charts require declared hashes.
 * @property {boolean} requireAudioHash Whether audio requires declared hashes.
 * @property {boolean} requireExternalAudioCors Whether external audio must be CORS-readable.
 * @property {boolean} requireSampledMediaCors Whether sampled image/video media must be CORS-readable.
 * @property {"fallback"} cosmeticBackgroundFailure Cosmetic background behavior.
 * @property {"block_startup"} criticalAssetFailure Gameplay-critical asset behavior.
 */

/** @type {readonly AeroGameCommandType[]} */
export const gameCommandTypes = Object.freeze([
  "configure",
  "start",
  "pause",
  "resume",
  "stop",
  "reset_calibration",
  "request_fullscreen",
  "select_content",
  "select_variant",
  "browse_beatsaver",
  "import_beatsaver",
  "import_local_zip",
  "cancel_import",
  "delete_package",
  "set_theme",
  "destroy"
]);

/** @type {readonly AeroGameEventType[]} */
export const gameEventTypes = Object.freeze([
  "ready",
  "capabilities_changed",
  "calibration_changed",
  "tracking_changed",
  "session_changed",
  "score_changed",
  "content_changed",
  "beatsaver_results",
  "import_changed",
  "fullscreen_changed",
  "error",
  "destroyed"
]);

/** @type {AeroAssetPolicy} */
export const defaultAssetPolicy = Object.freeze({
  schema: "aerobeat/asset_policy",
  version: 1,
  requireChartHash: true,
  requireAudioHash: true,
  requireExternalAudioCors: true,
  requireSampledMediaCors: true,
  cosmeticBackgroundFailure: "fallback",
  criticalAssetFailure: "block_startup"
});

/**
 * @param {unknown} value
 * @returns {value is AeroGameCommand}
 */
export function isGameCommand(value) {
  if (!hasExactKeys(value, ["schema", "version", "commandId", "type", "payload"]) ||
    value.schema !== "aerobeat/game_command" ||
    value.version !== 1 ||
    !isNonEmptyString(value.commandId) ||
    !isOneOf(value.type, gameCommandTypes)) {
    return false;
  }
  if (value.type === "start") {
    return value.payload === null || isGameplaySessionStartRequest(value.payload);
  }
  return value.payload === null || isRecord(value.payload);
}

/**
 * @param {unknown} value
 * @returns {value is AeroGameEvent}
 */
export function isGameEvent(value) {
  return hasExactKeys(value, ["schema", "version", "eventId", "type", "timestampMs", "payload"]) &&
    value.schema === "aerobeat/game_event" &&
    value.version === 1 &&
    isNonEmptyString(value.eventId) &&
    isOneOf(value.type, gameEventTypes) &&
    isNonNegativeFiniteNumber(value.timestampMs) &&
    (value.payload === null || isRecord(value.payload));
}

/**
 * @param {unknown} value
 * @returns {value is AeroFullscreenSnapshot}
 */
export function isFullscreenSnapshot(value) {
  return hasExactKeys(value, ["schema", "version", "supported", "active", "requestPending", "errorCode"]) &&
    value.schema === "aerobeat/fullscreen_snapshot" &&
    value.version === 1 &&
    typeof value.supported === "boolean" &&
    typeof value.active === "boolean" &&
    typeof value.requestPending === "boolean" &&
    (value.errorCode === null || isNonEmptyString(value.errorCode));
}

/**
 * @param {unknown} value
 * @returns {value is AeroGameCapabilities}
 */
export function isGameCapabilities(value) {
  const exactKeys = [
    "schema",
    "version",
    "secureContext",
    "camera",
    "fullscreen",
    "autoplay",
    "webgl2",
    "indexedDb",
    "worker",
    "directBeatSaverCors",
    "localZipImport",
    "limitations"
  ];
  if (!hasExactKeys(value, exactKeys)) {
    return false;
  }
  const booleanKeys = [
    "secureContext",
    "camera",
    "fullscreen",
    "autoplay",
    "webgl2",
    "indexedDb",
    "worker",
    "directBeatSaverCors",
    "localZipImport"
  ];
  return value.schema === "aerobeat/game_capabilities" &&
    value.version === 1 &&
    booleanKeys.every((key) => typeof value[key] === "boolean") &&
    Array.isArray(value.limitations) && value.limitations.every((item) => typeof item === "string");
}

/**
 * @param {unknown} value
 * @returns {value is AeroContainerSnapshot}
 */
export function isContainerSnapshot(value) {
  return hasExactKeys(value, ["schema", "version", "widthCssPx", "heightCssPx", "devicePixelRatio", "visible", "fullscreen"]) &&
    value.schema === "aerobeat/container_snapshot" &&
    value.version === 1 &&
    isNonNegativeFiniteNumber(value.widthCssPx) &&
    isNonNegativeFiniteNumber(value.heightCssPx) &&
    typeof value.devicePixelRatio === "number" && Number.isFinite(value.devicePixelRatio) && value.devicePixelRatio > 0 &&
    typeof value.visible === "boolean" &&
    typeof value.fullscreen === "boolean";
}

/**
 * @param {unknown} value
 * @returns {value is AeroAssetPolicy}
 */
export function isAssetPolicy(value) {
  return hasExactKeys(value, [
    "schema",
    "version",
    "requireChartHash",
    "requireAudioHash",
    "requireExternalAudioCors",
    "requireSampledMediaCors",
    "cosmeticBackgroundFailure",
    "criticalAssetFailure"
  ]) &&
    value.schema === "aerobeat/asset_policy" &&
    value.version === 1 &&
    typeof value.requireChartHash === "boolean" &&
    typeof value.requireAudioHash === "boolean" &&
    typeof value.requireExternalAudioCors === "boolean" &&
    typeof value.requireSampledMediaCors === "boolean" &&
    value.cosmeticBackgroundFailure === "fallback" &&
    value.criticalAssetFailure === "block_startup";
}
