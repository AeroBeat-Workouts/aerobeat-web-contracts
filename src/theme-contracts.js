// @ts-check

import { isContentHash } from "./content-contracts.js";
import { hasExactKeys, isNonEmptyString, isNonNegativeFiniteNumber, isRecord } from "./contract-guards.js";

/**
 * @typedef {Object} AeroThemeTokens
 * @property {string} leftHandColor CSS color token value.
 * @property {string} rightHandColor CSS color token value.
 * @property {string} guardColor CSS color token value.
 * @property {string} obstacleColor CSS color token value.
 * @property {string} receptorColor CSS color token value.
 * @property {number} approachLeadMs Approach animation lead time.
 * @property {number} targetStartScale Target initial scale.
 * @property {number} targetHitScale Target beat-center scale.
 * @property {string} approachEasing Serializable easing token.
 * @property {string} hitEasing Serializable easing token.
 * @property {string} missEasing Serializable easing token.
 */

/**
 * @typedef {Object} AeroThemeDescriptor
 * @property {"aerobeat/theme_descriptor"} schema Schema ID.
 * @property {1} version Schema version.
 * @property {string} id Stable theme ID.
 * @property {string} themeVersion Theme version.
 * @property {AeroThemeTokens} tokens Serializable approved tokens.
 * @property {import("./content-contracts.js").AeroContentHash} contentHash Canonical token hash.
 */

/**
 * @typedef {Object} AeroBackgroundSuggestion
 * @property {"aerobeat/background_suggestion"} schema Schema ID.
 * @property {1} version Schema version.
 * @property {"default" | "playlist" | "song" | "athlete"} source Suggestion precedence source.
 * @property {"css" | "image" | "video"} kind Background kind.
 * @property {string | null} url External/package URL for media kinds.
 * @property {import("./content-contracts.js").AeroContentHash | null} hash Required media hash for gameplay package assets.
 * @property {string | null} themeId Optional associated theme.
 */

/** @type {readonly (keyof AeroThemeTokens)[]} */
export const serializableThemeTokenNames = Object.freeze([
  "leftHandColor",
  "rightHandColor",
  "guardColor",
  "obstacleColor",
  "receptorColor",
  "approachLeadMs",
  "targetStartScale",
  "targetHitScale",
  "approachEasing",
  "hitEasing",
  "missEasing"
]);

/** @type {readonly ("default" | "playlist" | "song" | "athlete")[]} */
export const backgroundSuggestionPrecedence = Object.freeze(["default", "playlist", "song", "athlete"]);

/**
 * @param {unknown} value
 * @returns {value is AeroThemeDescriptor}
 */
export function isThemeDescriptor(value) {
  if (!hasExactKeys(value, ["schema", "version", "id", "themeVersion", "tokens", "contentHash"]) || !isRecord(value.tokens)) {
    return false;
  }
  const tokens = value.tokens;
  const exactTokenKeys = Object.keys(tokens).length === serializableThemeTokenNames.length &&
    Object.keys(tokens).every((key) => serializableThemeTokenNames.includes(/** @type {keyof AeroThemeTokens} */ (key)));
  return value.schema === "aerobeat/theme_descriptor" &&
    value.version === 1 &&
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.themeVersion) &&
    exactTokenKeys &&
    isNonEmptyString(tokens.leftHandColor) &&
    isNonEmptyString(tokens.rightHandColor) &&
    isNonEmptyString(tokens.guardColor) &&
    isNonEmptyString(tokens.obstacleColor) &&
    isNonEmptyString(tokens.receptorColor) &&
    isNonNegativeFiniteNumber(tokens.approachLeadMs) &&
    isNonNegativeFiniteNumber(tokens.targetStartScale) &&
    isNonNegativeFiniteNumber(tokens.targetHitScale) &&
    isNonEmptyString(tokens.approachEasing) &&
    isNonEmptyString(tokens.hitEasing) &&
    isNonEmptyString(tokens.missEasing) &&
    isContentHash(value.contentHash);
}

/**
 * @param {unknown} value
 * @returns {value is AeroBackgroundSuggestion}
 */
export function isBackgroundSuggestion(value) {
  if (!hasExactKeys(value, ["schema", "version", "source", "kind", "url", "hash", "themeId"])) {
    return false;
  }
  const sources = /** @type {const} */ (["default", "playlist", "song", "athlete"]);
  const kinds = /** @type {const} */ (["css", "image", "video"]);
  const mediaKind = value.kind === "image" || value.kind === "video";
  return value.schema === "aerobeat/background_suggestion" &&
    value.version === 1 &&
    typeof value.source === "string" && sources.includes(/** @type {"default" | "playlist" | "song" | "athlete"} */ (value.source)) &&
    typeof value.kind === "string" && kinds.includes(/** @type {"css" | "image" | "video"} */ (value.kind)) &&
    (mediaKind ? isNonEmptyString(value.url) : value.url === null) &&
    (value.hash === null || isContentHash(value.hash)) &&
    (value.themeId === null || isNonEmptyString(value.themeId));
}
