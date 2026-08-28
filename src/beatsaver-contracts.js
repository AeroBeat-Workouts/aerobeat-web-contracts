// @ts-check

import {
  hasExactKeys,
  isNonEmptyString,
  isNonNegativeFiniteNumber,
  isOneOf
} from "./contract-guards.js";
import { isContentHash, isPersistenceHandle } from "./content-contracts.js";

/**
 * @typedef {Object} AeroBeatSaverMapSummary
 * @property {"aerobeat/beatsaver_map_summary"} schema Schema ID.
 * @property {1} version Schema version.
 * @property {string} mapId BeatSaver map key.
 * @property {string} name Song/map name.
 * @property {string} songAuthorName Song author display name.
 * @property {string} levelAuthorName Mapper display name.
 * @property {number} durationSeconds Provider duration when known.
 * @property {string | null} coverUrl HTTPS cover URL when available.
 * @property {readonly string[]} tags Normalized provider tags.
 */

/**
 * @typedef {Object} AeroBeatSaverVersionRef
 * @property {"aerobeat/beatsaver_version_ref"} schema Schema ID.
 * @property {1} version Schema version.
 * @property {string} mapId BeatSaver map key.
 * @property {string} versionHash Provider SHA-1 version hash.
 * @property {string} downloadUrl HTTPS selected-version ZIP URL.
 * @property {string} createdAt Provider timestamp string.
 * @property {readonly string[]} difficulties Normalized available difficulty IDs.
 */

/**
 * @typedef {Object} AeroSourceManifestEntry
 * @property {string} path Normalized relative archive path.
 * @property {"metadata" | "difficulty" | "audio" | "image" | "other"} kind Entry class.
 * @property {number} byteLength Uncompressed byte length.
 * @property {import("./content-contracts.js").AeroContentHash} hash Entry integrity hash.
 */

/**
 * @typedef {Object} AeroBeatMapSourceManifest
 * @property {"aerobeat/beatmap_source_manifest"} schema Provider-neutral schema ID.
 * @property {1} version Schema version.
 * @property {string} sourceProvider Source provider ID.
 * @property {string} sourceId Source map identity.
 * @property {string} sourceVersionHash Selected source version.
 * @property {"v2" | "v3" | "v4"} beatMapFormat Normalized Beat Saber format family.
 * @property {string} metadataPath Normalized archive metadata path.
 * @property {readonly AeroSourceManifestEntry[]} entries Inspected entry metadata without raw bytes.
 * @property {readonly string[]} difficultyIds Available normalized difficulty IDs.
 * @property {number} totalUncompressedBytes Total inspected uncompressed bytes.
 * @property {import("./content-contracts.js").AeroContentHash} archiveHash Downloaded/imported archive hash.
 */

/**
 * @typedef {"queued" | "acquiring" | "inspecting" | "converting" | "validating" | "persisting" | "complete" | "cancelled" | "failed"} AeroContentImportJobState
 */

/**
 * @typedef {Object} AeroContentImportJobSnapshot
 * @property {"aerobeat/content_import_job_snapshot"} schema Schema ID.
 * @property {1} version Schema version.
 * @property {string} jobId Job identity.
 * @property {AeroContentImportJobState} state Job state.
 * @property {number} progress Normalized progress from 0 to 1.
 * @property {string | null} sourceId Source map identity.
 * @property {string | null} sourceVersionHash Source version identity.
 * @property {string | null} difficultyId Selected difficulty.
 * @property {string | null} errorCode Stable error code.
 * @property {string | null} errorMessage User-safe error message.
 * @property {import("./content-contracts.js").AeroPersistenceHandle | null} result Persisted package handle after completion.
 */

/** @type {readonly AeroContentImportJobState[]} */
export const contentImportJobStates = Object.freeze([
  "queued",
  "acquiring",
  "inspecting",
  "converting",
  "validating",
  "persisting",
  "complete",
  "cancelled",
  "failed"
]);

/**
 * @param {unknown} value
 * @returns {value is AeroBeatSaverMapSummary}
 */
export function isBeatSaverMapSummary(value) {
  return hasExactKeys(value, ["schema", "version", "mapId", "name", "songAuthorName", "levelAuthorName", "durationSeconds", "coverUrl", "tags"]) &&
    value.schema === "aerobeat/beatsaver_map_summary" &&
    value.version === 1 &&
    isNonEmptyString(value.mapId) &&
    isNonEmptyString(value.name) &&
    typeof value.songAuthorName === "string" &&
    typeof value.levelAuthorName === "string" &&
    isNonNegativeFiniteNumber(value.durationSeconds) &&
    (value.coverUrl === null || (isNonEmptyString(value.coverUrl) && value.coverUrl.startsWith("https://"))) &&
    Array.isArray(value.tags) && value.tags.every((item) => typeof item === "string");
}

/**
 * @param {unknown} value
 * @returns {value is AeroBeatSaverVersionRef}
 */
export function isBeatSaverVersionRef(value) {
  return hasExactKeys(value, ["schema", "version", "mapId", "versionHash", "downloadUrl", "createdAt", "difficulties"]) &&
    value.schema === "aerobeat/beatsaver_version_ref" &&
    value.version === 1 &&
    isNonEmptyString(value.mapId) &&
    typeof value.versionHash === "string" && /^[0-9a-fA-F]{40}$/u.test(value.versionHash) &&
    isNonEmptyString(value.downloadUrl) && value.downloadUrl.startsWith("https://") &&
    isNonEmptyString(value.createdAt) &&
    Array.isArray(value.difficulties) && value.difficulties.every(isNonEmptyString);
}

/**
 * @param {unknown} value
 * @returns {value is AeroBeatMapSourceManifest}
 */
export function isBeatMapSourceManifest(value) {
  const exactKeys = [
    "schema",
    "version",
    "sourceProvider",
    "sourceId",
    "sourceVersionHash",
    "beatMapFormat",
    "metadataPath",
    "entries",
    "difficultyIds",
    "totalUncompressedBytes",
    "archiveHash"
  ];
  if (!hasExactKeys(value, exactKeys) || !Array.isArray(value.entries)) {
    return false;
  }
  const entryKinds = /** @type {const} */ (["metadata", "difficulty", "audio", "image", "other"]);
  const entriesValid = value.entries.every((entry) => hasExactKeys(entry, ["path", "kind", "byteLength", "hash"]) &&
    isNonEmptyString(entry.path) &&
    !entry.path.startsWith("/") &&
    !entry.path.split("/").includes("..") &&
    isOneOf(entry.kind, entryKinds) &&
    isNonNegativeFiniteNumber(entry.byteLength) &&
    isContentHash(entry.hash));
  return value.schema === "aerobeat/beatmap_source_manifest" &&
    value.version === 1 &&
    isNonEmptyString(value.sourceProvider) &&
    isNonEmptyString(value.sourceId) &&
    isNonEmptyString(value.sourceVersionHash) &&
    (value.beatMapFormat === "v2" || value.beatMapFormat === "v3" || value.beatMapFormat === "v4") &&
    isNonEmptyString(value.metadataPath) &&
    entriesValid &&
    Array.isArray(value.difficultyIds) && value.difficultyIds.every(isNonEmptyString) &&
    isNonNegativeFiniteNumber(value.totalUncompressedBytes) &&
    isContentHash(value.archiveHash);
}

/**
 * @param {unknown} value
 * @returns {value is AeroContentImportJobSnapshot}
 */
export function isContentImportJobSnapshot(value) {
  return hasExactKeys(value, [
    "schema",
    "version",
    "jobId",
    "state",
    "progress",
    "sourceId",
    "sourceVersionHash",
    "difficultyId",
    "errorCode",
    "errorMessage",
    "result"
  ]) &&
    value.schema === "aerobeat/content_import_job_snapshot" &&
    value.version === 1 &&
    isNonEmptyString(value.jobId) &&
    isOneOf(value.state, contentImportJobStates) &&
    typeof value.progress === "number" && Number.isFinite(value.progress) && value.progress >= 0 && value.progress <= 1 &&
    (value.sourceId === null || isNonEmptyString(value.sourceId)) &&
    (value.sourceVersionHash === null || isNonEmptyString(value.sourceVersionHash)) &&
    (value.difficultyId === null || isNonEmptyString(value.difficultyId)) &&
    (value.errorCode === null || isNonEmptyString(value.errorCode)) &&
    (value.errorMessage === null || isNonEmptyString(value.errorMessage)) &&
    (value.result === null || isPersistenceHandle(value.result));
}
