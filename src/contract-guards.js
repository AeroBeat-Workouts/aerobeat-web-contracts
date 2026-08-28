// @ts-check

/**
 * @param {unknown} value
 * @returns {value is Readonly<Record<string, unknown>>}
 */
export function isRecord(value) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

/**
 * @param {unknown} value
 * @returns {value is number}
 */
export function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

/**
 * @param {unknown} value
 * @returns {value is number}
 */
export function isNonNegativeFiniteNumber(value) {
  return isFiniteNumber(value) && value >= 0;
}

/**
 * @param {unknown} value
 * @returns {value is number}
 */
export function isPositiveInteger(value) {
  return Number.isInteger(value) && Number(value) > 0;
}

/**
 * @param {unknown} value
 * @returns {value is string}
 */
export function isNonEmptyString(value) {
  return typeof value === "string" && value.length > 0;
}

/**
 * @param {unknown} value
 * @returns {value is number}
 */
export function isNormalizedNumber(value) {
  return isFiniteNumber(value) && value >= 0 && value <= 1;
}

/**
 * @template {string} T
 * @param {unknown} value
 * @param {readonly T[]} allowed
 * @returns {value is T}
 */
export function isOneOf(value, allowed) {
  return typeof value === "string" && allowed.includes(/** @type {T} */ (value));
}
