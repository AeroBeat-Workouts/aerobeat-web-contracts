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
 * Require a plain record to contain exactly the declared own enumerable keys.
 * Payload records remain the versioned extension point; contract envelopes do not.
 *
 * @param {unknown} value
 * @param {readonly string[]} expectedKeys
 * @returns {value is Readonly<Record<string, unknown>>}
 */
export function hasExactKeys(value, expectedKeys) {
  if (!isRecord(value)) {
    return false;
  }
  const keys = Reflect.ownKeys(value);
  return keys.length === expectedKeys.length && keys.every((key) => {
    if (typeof key !== "string" || !expectedKeys.includes(key)) {
      return false;
    }
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    return descriptor !== undefined && descriptor.enumerable && "value" in descriptor;
  });
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
