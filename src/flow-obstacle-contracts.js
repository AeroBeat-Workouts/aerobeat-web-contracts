// @ts-check

import { hasExactKeys } from "./contract-guards.js";

/** Maximum authored Flow obstacles accepted in one chart. */
export const maximumFlowObstaclesPerChart = 128;

/**
 * Continuous Beat Saber lane/layer obstacle geometry. This record is the sole
 * Flow render and collision authority. `gridMask` is always derived from it.
 *
 * @typedef {Object} AeroFlowObstacleGeometry
 * @property {"aerobeat/flow_obstacle_geometry"} schema Schema ID.
 * @property {1} version Schema version.
 * @property {"beatsaber_lane_layer"} coordinateSpace Source coordinate space.
 * @property {number} x Integer left-most lane, 0..3.
 * @property {number} y Integer bottom-most source layer, 0..2.
 * @property {number} width Integer continuous lane width, 1..4.
 * @property {number} height Integer continuous layer height, 1..5.
 */

/**
 * @param {unknown} value
 * @returns {value is AeroFlowObstacleGeometry}
 */
export function isFlowObstacleGeometry(value) {
  if (!hasExactKeys(value, ["schema", "version", "coordinateSpace", "x", "y", "width", "height"])) {
    return false;
  }
  return value.schema === "aerobeat/flow_obstacle_geometry" &&
    value.version === 1 &&
    value.coordinateSpace === "beatsaber_lane_layer" &&
    typeof value.x === "number" && Number.isInteger(value.x) && value.x >= 0 && value.x <= 3 &&
    typeof value.y === "number" && Number.isInteger(value.y) && value.y >= 0 && value.y <= 2 &&
    typeof value.width === "number" && Number.isInteger(value.width) && value.width >= 1 && value.width <= 4 &&
    typeof value.height === "number" && Number.isInteger(value.height) && value.height >= 1 && value.height <= 5 &&
    value.x + value.width <= 4 &&
    value.y + value.height <= 5;
}

/**
 * Derive the unique sorted top-left row-major 4x3 mask used only for bounded
 * UI/indexing and Boxing feasibility. Rendering and Flow collision must use
 * continuous geometry instead.
 *
 * @param {AeroFlowObstacleGeometry} geometry
 * @returns {readonly number[]}
 */
export function deriveFlowObstacleGridMask(geometry) {
  if (!isFlowObstacleGeometry(geometry)) {
    throw new TypeError("flow_obstacle_geometry_invalid");
  }
  /** @type {number[]} */
  const cells = [];
  const maximumSourceLayer = Math.min(geometry.y + geometry.height, 3);
  for (let sourceLayer = geometry.y; sourceLayer < maximumSourceLayer; sourceLayer += 1) {
    for (let column = geometry.x; column < geometry.x + geometry.width; column += 1) {
      cells.push((2 - sourceLayer) * 4 + column);
    }
  }
  cells.sort((left, right) => left - right);
  return Object.freeze(cells);
}

/**
 * Validate exact derived-mask truth without invoking accessors or accepting
 * truncation, duplicates, reordering, or geometry/mask disagreement.
 *
 * @param {unknown} value
 * @param {AeroFlowObstacleGeometry} geometry
 * @returns {value is readonly number[]}
 */
export function isFlowObstacleGridMask(value, geometry) {
  if (!Array.isArray(value) || Reflect.ownKeys(value).length !== value.length + 1) {
    return false;
  }
  const expected = deriveFlowObstacleGridMask(geometry);
  if (value.length !== expected.length) {
    return false;
  }
  for (let index = 0; index < expected.length; index += 1) {
    const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
    if (!descriptor || !descriptor.enumerable || !("value" in descriptor) || descriptor.value !== expected[index]) {
      return false;
    }
  }
  return true;
}
