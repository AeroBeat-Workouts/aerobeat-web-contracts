// @ts-check

import {
  hasExactKeys,
  isNonEmptyString,
  isNonNegativeFiniteNumber,
  isOneOf
} from "./contract-guards.js";
import { isContentHash, isPersistenceHandle } from "./content-contracts.js";
import { isSourceNotePalette } from "./note-palette-contracts.js";

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
 * One exact difficulty discovered during provider-neutral source inspection. Info
 * format remains separate because a legacy v2 Info.dat can select a v3 beatmap.
 *
 * @typedef {Object} AeroSourceManifestDifficulty
 * @property {string} id Stable normalized difficulty ID.
 * @property {string} characteristic Exact characteristic identity.
 * @property {string} difficulty Exact difficulty identity.
 * @property {string} path Normalized relative archive path.
 * @property {"v2" | "v3" | "v4"} beatMapFormat Referenced difficulty beatmap family.
 * @property {string} beatMapVersion Exact declared difficulty beatmap version.
 * @property {import("./note-palette-contracts.js").AeroSourceNotePalette | null} notePalette Sanitized atomic song pair or null.
 */

/**
 * @typedef {Object} AeroBeatMapSourceManifest
 * @property {"aerobeat/beatmap_source_manifest"} schema Provider-neutral schema ID.
 * @property {2} version Schema version. Version 2 separates Info and beatmap formats and binds per-difficulty note palettes.
 * @property {string} sourceProvider Source provider ID.
 * @property {string} sourceId Source map identity.
 * @property {string} sourceVersionHash Selected source version.
 * @property {"v2" | "v4"} infoFormat Normalized Info.dat family; Info has no v3 family.
 * @property {string} metadataPath Normalized archive metadata path.
 * @property {readonly AeroSourceManifestEntry[]} entries Inspected entry metadata without raw bytes.
 * @property {readonly AeroSourceManifestDifficulty[]} difficulties Available normalized difficulty records.
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
    "infoFormat",
    "metadataPath",
    "entries",
    "difficulties",
    "totalUncompressedBytes",
    "archiveHash"
  ];
  if (!hasExactKeys(value, exactKeys) || !isStrictArray(value.entries) || !isStrictArray(value.difficulties) || value.difficulties.length === 0) {
    return false;
  }
  const entryKinds = /** @type {const} */ (["metadata", "difficulty", "audio", "image", "other"]);
  const entriesValid = value.entries.every((entry) => hasExactKeys(entry, ["path", "kind", "byteLength", "hash"]) &&
    isNormalizedArchivePath(entry.path) &&
    isOneOf(entry.kind, entryKinds) &&
    isNonNegativeFiniteNumber(entry.byteLength) &&
    isContentHash(entry.hash));
  const difficultyIds = new Set();
  const difficultiesValid = value.difficulties.every((difficulty) => {
    if (!hasExactKeys(difficulty, ["id", "characteristic", "difficulty", "path", "beatMapFormat", "beatMapVersion", "notePalette"]) ||
        !isNonEmptyString(difficulty.id) || difficultyIds.has(difficulty.id) ||
        !isNonEmptyString(difficulty.characteristic) || !isNonEmptyString(difficulty.difficulty) ||
        !isNormalizedArchivePath(difficulty.path) || typeof difficulty.beatMapVersion !== "string" || !/^\d+\.\d+\.\d+$/u.test(difficulty.beatMapVersion) ||
        (difficulty.notePalette !== null && !isSourceNotePalette(difficulty.notePalette))) return false;
    difficultyIds.add(difficulty.id);
    return value.infoFormat === "v2"
      ? difficulty.beatMapFormat === "v2" || difficulty.beatMapFormat === "v3"
      : difficulty.beatMapFormat === "v4";
  });
  return value.schema === "aerobeat/beatmap_source_manifest" &&
    value.version === 2 &&
    isNonEmptyString(value.sourceProvider) &&
    isNonEmptyString(value.sourceId) &&
    isNonEmptyString(value.sourceVersionHash) &&
    (value.infoFormat === "v2" || value.infoFormat === "v4") &&
    isNormalizedArchivePath(value.metadataPath) &&
    entriesValid && difficultiesValid &&
    isNonNegativeFiniteNumber(value.totalUncompressedBytes) && value.totalUncompressedBytes <= 512 * 1024 * 1024 &&
    isContentHash(value.archiveHash);
}

/** @param {unknown} value */
function isNormalizedArchivePath(value) {
  return isNonEmptyString(value) && !value.startsWith("/") && !value.split("/").includes("..") && !value.includes("\\");
}

/** @param {unknown} value @returns {value is readonly unknown[]} */
function isStrictArray(value) {
  if (!Array.isArray(value) || Object.getPrototypeOf(value) !== Array.prototype) return false;
  const keys = Reflect.ownKeys(value);
  if (keys.length !== value.length + 1 || !keys.includes("length")) return false;
  for (let index = 0; index < value.length; index += 1) {
    const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
    if (descriptor === undefined || !descriptor.enumerable || !("value" in descriptor)) return false;
  }
  return true;
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
