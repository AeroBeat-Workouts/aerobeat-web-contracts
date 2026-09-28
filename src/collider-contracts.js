// @ts-check

import { hasExactKeys, isFiniteNumber } from "./contract-guards.js";

/** @typedef {"flow" | "boxing"} AeroColliderMode */
/** @typedef {Readonly<{colliderVisible: boolean, colliderScale: number, colliderDepthForward: number, colliderDepthBackward: number}>} AeroColliderSettings */
/** @typedef {Readonly<{x: number, y: number, z: number}>} AeroColliderPoint */
/** @typedef {Readonly<{minX: number, maxX: number, minY: number, maxY: number, minZ: number, maxZ: number}>} AeroColliderBounds */

/** Forward is world -Z; the hit plane is world Z=0. One default extension equals the existing 180 ms window at .006 WU/ms. */
export const colliderDefaultDepthWu = 180 * 0.006;

const defaultSettings = Object.freeze({
  colliderVisible: false,
  colliderScale: 1,
  colliderDepthForward: 1,
  colliderDepthBackward: 1
});

/** Independent per-mode defaults; neither a rendering toggle nor depth modifies the equipment hit geometry. */
export const colliderSettingsDefaults = Object.freeze({
  flow: Object.freeze({ ...defaultSettings }),
  boxing: Object.freeze({ ...defaultSettings })
});

/** @param {unknown} value @returns {value is AeroColliderSettings} */
export function isColliderSettings(value) {
  return hasExactKeys(value, ["colliderVisible", "colliderScale", "colliderDepthForward", "colliderDepthBackward"]) &&
    typeof value.colliderVisible === "boolean" &&
    isFiniteNumber(value.colliderScale) && value.colliderScale > 0 &&
    isFiniteNumber(value.colliderDepthForward) && value.colliderDepthForward >= 1 &&
    isFiniteNumber(value.colliderDepthBackward) && value.colliderDepthBackward >= 1;
}

/**
 * Strictly normalize a partial settings record for one mode. Missing fields use
 * defaults; unknown fields and explicit undefined, null, NaN, or infinity fail.
 * Depth factors are >= 1: 1 keeps the base depth, 2 doubles it.
 * @param {unknown} value
 * @param {AeroColliderMode} mode
 * @returns {AeroColliderSettings}
 */
export function normalizeColliderSettings(value, mode) {
  if (mode !== "flow" && mode !== "boxing") throw new TypeError("collider_mode_invalid");
  if (typeof value !== "object" || value === null || Array.isArray(value) ||
      (Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null)) {
    throw new TypeError("collider_settings_invalid");
  }
  const keys = ["colliderVisible", "colliderScale", "colliderDepthForward", "colliderDepthBackward"];
  const ownKeys = Reflect.ownKeys(value);
  if (ownKeys.some((key) => typeof key !== "string" || !keys.includes(key) ||
      !Object.getOwnPropertyDescriptor(value, key)?.enumerable ||
      !("value" in Object.getOwnPropertyDescriptor(value, key)))) {
    throw new TypeError("collider_settings_invalid");
  }
  const settings = { ...colliderSettingsDefaults[mode], ...value };
  if (!isColliderSettings(settings)) throw new TypeError("collider_settings_invalid");
  return Object.freeze(settings);
}

/** @param {unknown} value @returns {value is AeroColliderPoint} */
export function isColliderPoint(value) {
  return hasExactKeys(value, ["x", "y", "z"]) &&
    isFiniteNumber(value.x) && isFiniteNumber(value.y) && isFiniteNumber(value.z);
}

/** @param {unknown} value @returns {value is AeroColliderBounds} */
export function isColliderBounds(value) {
  return hasExactKeys(value, ["minX", "maxX", "minY", "maxY", "minZ", "maxZ"]) &&
    isFiniteNumber(value.minX) && isFiniteNumber(value.maxX) && value.minX <= value.maxX &&
    isFiniteNumber(value.minY) && isFiniteNumber(value.maxY) && value.minY <= value.maxY &&
    isFiniteNumber(value.minZ) && isFiniteNumber(value.maxZ) && value.minZ <= value.maxZ;
}

/**
 * Single world-space volume authority for gameplay collision and renderer wireframe.
 * Scale changes X/Y only; depth factors independently extend the two Z faces.
 * `center.z` is the equipment visual plane; forward extends toward negative Z.
 * Caller timing overrides must be supplied together; otherwise use 180 * .006.
 * @param {unknown} input
 * @returns {AeroColliderBounds}
 */
export function resolveColliderBounds(input) {
  const baseKeys = ["mode", "center", "halfWidth", "halfHeight", "settings"];
  const timingKeys = [...baseKeys, "timingWindowMs", "speedWuPerMs"];
  if (!hasExactKeys(input, baseKeys) && !hasExactKeys(input, timingKeys)) {
    throw new TypeError("collider_bounds_input_invalid");
  }
  if ((input.mode !== "flow" && input.mode !== "boxing") || !isColliderPoint(input.center) ||
      !isFiniteNumber(input.halfWidth) || input.halfWidth <= 0 ||
      !isFiniteNumber(input.halfHeight) || input.halfHeight <= 0 ||
      !isColliderSettings(input.settings)) {
    throw new TypeError("collider_bounds_input_invalid");
  }
  const timed = hasExactKeys(input, timingKeys);
  if (timed && (!isFiniteNumber(input.timingWindowMs) || input.timingWindowMs <= 0 ||
                !isFiniteNumber(input.speedWuPerMs) || input.speedWuPerMs <= 0)) {
    throw new TypeError("collider_bounds_input_invalid");
  }
  const depth = timed ? input.timingWindowMs * input.speedWuPerMs : colliderDefaultDepthWu;
  const halfWidth = input.halfWidth * input.settings.colliderScale;
  const halfHeight = input.halfHeight * input.settings.colliderScale;
  const result = {
    minX: input.center.x - halfWidth,
    maxX: input.center.x + halfWidth,
    minY: input.center.y - halfHeight,
    maxY: input.center.y + halfHeight,
    minZ: input.center.z - depth * input.settings.colliderDepthForward,
    maxZ: input.center.z + depth * input.settings.colliderDepthBackward
  };
  if (!isColliderBounds(result)) throw new TypeError("collider_bounds_nonfinite");
  return Object.freeze(result);
}

/** Inclusive faces: a point on the visible collider surface is hittable. */
export function isPointInsideColliderBounds(point, bounds) {
  if (!isColliderPoint(point) || !isColliderBounds(bounds)) throw new TypeError("collider_query_invalid");
  return point.x >= bounds.minX && point.x <= bounds.maxX &&
    point.y >= bounds.minY && point.y <= bounds.maxY &&
    point.z >= bounds.minZ && point.z <= bounds.maxZ;
}
