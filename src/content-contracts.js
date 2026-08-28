// @ts-check

import { hasExactKeys, isNonEmptyString, isOneOf } from "./contract-guards.js";
import { conversionRecipeIds, rulesetIds } from "./gameplay-contracts.js";

/**
 * @typedef {"no_squats" | "no_weaves" | "any_punch" | "crossed_guard" | "cross_body"} AeroMapModifierId
 */

/**
 * @typedef {Object} AeroContentHash
 * @property {"aerobeat/content_hash"} schema Schema ID.
 * @property {1} version Schema version.
 * @property {"sha1" | "sha256"} algorithm Hash algorithm.
 * @property {string} value Lowercase hexadecimal hash.
 */

/**
 * @typedef {Object} AeroContentProvenance
 * @property {"aerobeat/content_provenance"} schema Schema ID.
 * @property {1} version Schema version.
 * @property {string} sourceProvider Provider identity.
 * @property {string} sourceId Provider map/source identity.
 * @property {string} sourceVersionHash Selected source version hash.
 * @property {string} sourceDifficulty Source difficulty identity.
 * @property {string} recipeVersion Immutable recipe version.
 * @property {readonly string[]} sourceEventIds Stable source event lineage.
 */

/**
 * @typedef {Object} AeroContentVariantIdentity
 * @property {"aerobeat/content_variant_identity"} schema Schema ID.
 * @property {1} version Schema version.
 * @property {string} packageId Package identity.
 * @property {string} chartId Chart identity.
 * @property {import("./gameplay-contracts.js").AeroRulesetId} rulesetId Ruleset identity.
 * @property {import("./gameplay-contracts.js").AeroConversionRecipeId | null} recipeId Conversion recipe.
 * @property {readonly AeroMapModifierId[]} modifierIds Ordered modifier identities.
 * @property {AeroContentHash} mapHash Canonical map hash.
 * @property {AeroContentHash} scoreIdentityHash Ruleset/recipe/map score partition hash.
 * @property {boolean} ranked Whether this immutable variant is ranked.
 */

/**
 * @typedef {Object} AeroPersistenceHandle
 * @property {"aerobeat/persistence_handle"} schema Schema ID.
 * @property {1} version Schema version.
 * @property {"indexeddb" | "memory" | "external_url"} storage Storage class.
 * @property {string} namespace Stable storage namespace.
 * @property {string} key Opaque package key.
 * @property {string} packageId Public package identity.
 * @property {AeroContentHash} packageHash Package integrity hash.
 */

/** @type {readonly AeroMapModifierId[]} */
export const mapModifierIds = Object.freeze([
  "no_squats",
  "no_weaves",
  "any_punch",
  "crossed_guard",
  "cross_body"
]);

/**
 * @param {unknown} value
 * @returns {value is AeroContentHash}
 */
export function isContentHash(value) {
  if (!hasExactKeys(value, ["schema", "version", "algorithm", "value"]) || value.schema !== "aerobeat/content_hash" || value.version !== 1) {
    return false;
  }
  if (value.algorithm !== "sha1" && value.algorithm !== "sha256") {
    return false;
  }
  if (typeof value.value !== "string") {
    return false;
  }
  const expectedLength = value.algorithm === "sha1" ? 40 : 64;
  return value.value.length === expectedLength && /^[0-9a-f]+$/u.test(value.value);
}

/**
 * @param {unknown} value
 * @returns {value is AeroContentVariantIdentity}
 */
export function isContentVariantIdentity(value) {
  return hasExactKeys(value, ["schema", "version", "packageId", "chartId", "rulesetId", "recipeId", "modifierIds", "mapHash", "scoreIdentityHash", "ranked"]) &&
    value.schema === "aerobeat/content_variant_identity" &&
    value.version === 1 &&
    isNonEmptyString(value.packageId) &&
    isNonEmptyString(value.chartId) &&
    isOneOf(value.rulesetId, rulesetIds) &&
    (value.recipeId === null || isOneOf(value.recipeId, conversionRecipeIds)) &&
    Array.isArray(value.modifierIds) && value.modifierIds.every((item) => isOneOf(item, mapModifierIds)) &&
    isContentHash(value.mapHash) &&
    isContentHash(value.scoreIdentityHash) &&
    typeof value.ranked === "boolean";
}

/**
 * @param {unknown} value
 * @returns {value is AeroPersistenceHandle}
 */
export function isPersistenceHandle(value) {
  const storageIds = /** @type {const} */ (["indexeddb", "memory", "external_url"]);
  return hasExactKeys(value, ["schema", "version", "storage", "namespace", "key", "packageId", "packageHash"]) &&
    value.schema === "aerobeat/persistence_handle" &&
    value.version === 1 &&
    isOneOf(value.storage, storageIds) &&
    isNonEmptyString(value.namespace) &&
    isNonEmptyString(value.key) &&
    isNonEmptyString(value.packageId) &&
    isContentHash(value.packageHash);
}

/**
 * @param {unknown} value
 * @returns {value is AeroContentProvenance}
 */
export function isContentProvenance(value) {
  return hasExactKeys(value, ["schema", "version", "sourceProvider", "sourceId", "sourceVersionHash", "sourceDifficulty", "recipeVersion", "sourceEventIds"]) &&
    value.schema === "aerobeat/content_provenance" &&
    value.version === 1 &&
    isNonEmptyString(value.sourceProvider) &&
    isNonEmptyString(value.sourceId) &&
    isNonEmptyString(value.sourceVersionHash) &&
    isNonEmptyString(value.sourceDifficulty) &&
    isNonEmptyString(value.recipeVersion) &&
    Array.isArray(value.sourceEventIds) && value.sourceEventIds.every(isNonEmptyString);
}
