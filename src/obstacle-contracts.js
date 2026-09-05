// @ts-check

import { hasExactKeys } from "./contract-guards.js";

/** Maximum normalized obstacles accepted in one chart. */
export const maximumObstaclesPerChart = 128;

/**
 * Exact provider-coordinate evidence retained beside normalized gameplay geometry.
 * `kind` selects one explicit, fixture-locked conversion; coordinate spaces are
 * never interchangeable with AeroBeat gameplay coordinates.
 *
 * @typedef {Object} AeroObstacleSourceGeometry
 * @property {"aerobeat/obstacle_source_geometry"} schema
 * @property {1} version
 * @property {"beatsaber_v2_legacy_obstacle"|"beatsaber_v3_obstacle_rect"|"beatsaber_v4_obstacle_rect"} coordinateSpace
 * @property {"v2_type_0"|"v2_type_1"|"v3_rect"|"v4_rect"} kind
 * @property {number} x
 * @property {number} y
 * @property {number} width
 * @property {number} height
 */

/**
 * Mode-neutral normalized render, occupancy, and collision authority. X and Y
 * begin at the top-left of the canonical 4x3 grid and positive height extends
 * downward.
 *
 * @typedef {Object} AeroObstacleGameplayGeometry
 * @property {"aerobeat/obstacle_gameplay_geometry"} schema
 * @property {1} version
 * @property {"aerobeat_top_left_grid"} coordinateSpace
 * @property {number} x
 * @property {number} y
 * @property {number} width
 * @property {number} height
 */

/** @param {unknown} value @returns {value is AeroObstacleSourceGeometry} */
export function isObstacleSourceGeometry(value) {
  if (!hasExactKeys(value, ["schema", "version", "coordinateSpace", "kind", "x", "y", "width", "height"])) return false;
  if (value.schema !== "aerobeat/obstacle_source_geometry" || value.version !== 1) return false;
  const pair = `${value.coordinateSpace}|${value.kind}`;
  if (!["beatsaber_v2_legacy_obstacle|v2_type_0", "beatsaber_v2_legacy_obstacle|v2_type_1", "beatsaber_v3_obstacle_rect|v3_rect", "beatsaber_v4_obstacle_rect|v4_rect"].includes(pair)) return false;
  return integer(value.x, 0, 3) && integer(value.y, 0, 2) && integer(value.width, 1, 4) && integer(value.height, 1, 5) && Number(value.x) + Number(value.width) <= 4 && Number(value.y) + Number(value.height) <= 5;
}

/** @param {unknown} value @returns {value is AeroObstacleGameplayGeometry} */
export function isObstacleGameplayGeometry(value) {
  return hasExactKeys(value, ["schema", "version", "coordinateSpace", "x", "y", "width", "height"]) &&
    value.schema === "aerobeat/obstacle_gameplay_geometry" && value.version === 1 && value.coordinateSpace === "aerobeat_top_left_grid" &&
    integer(value.x, 0, 3) && integer(value.y, 0, 2) && integer(value.width, 1, 4) && integer(value.height, 1, 3) &&
    Number(value.x) + Number(value.width) <= 4 && Number(value.y) + Number(value.height) <= 3;
}

/** @param {AeroObstacleGameplayGeometry} geometry @returns {readonly number[]} */
export function deriveObstacleGridMask(geometry) {
  if (!isObstacleGameplayGeometry(geometry)) throw new TypeError("obstacle_gameplay_geometry_invalid");
  const cells = [];
  for (let row = geometry.y; row < geometry.y + geometry.height; row += 1) {
    for (let column = geometry.x; column < geometry.x + geometry.width; column += 1) cells.push(row * 4 + column);
  }
  return Object.freeze(cells);
}

/** @param {unknown} value @param {AeroObstacleGameplayGeometry} geometry @returns {value is readonly number[]} */
export function isObstacleGridMask(value, geometry) {
  if (!Array.isArray(value) || Reflect.ownKeys(value).length !== value.length + 1) return false;
  const expected = deriveObstacleGridMask(geometry);
  if (value.length !== expected.length) return false;
  for (let index = 0; index < expected.length; index += 1) {
    const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
    if (!descriptor || !descriptor.enumerable || !("value" in descriptor) || descriptor.value !== expected[index]) return false;
  }
  return true;
}

/** @param {unknown} value @param {number} minimum @param {number} maximum */
function integer(value, minimum, maximum) { return typeof value === "number" && Number.isInteger(value) && value >= minimum && value <= maximum; }
