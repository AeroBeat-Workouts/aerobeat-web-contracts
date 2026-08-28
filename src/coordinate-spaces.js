// @ts-check

import { isFiniteNumber, isPositiveInteger, isRecord } from "./contract-guards.js";

/**
 * @typedef {"camera_preview_top_left" | "gameplay_camera_bottom_left" | "athlete_top_left" | "playfield_top_left"} AeroCoordinateSpaceId
 */

/**
 * @typedef {Object} AeroNormalizedPoint
 * @property {number} x Normalized horizontal coordinate.
 * @property {number} y Normalized vertical coordinate.
 */

/**
 * @typedef {Object} AeroGridCellRef
 * @property {number} id Top-left row-major cell ID.
 * @property {number} row Zero-based top-left row.
 * @property {number} column Zero-based athlete-left column.
 */

/**
 * @typedef {Object} AeroGridDescriptor
 * @property {"aerobeat/grid_descriptor"} schema Schema ID.
 * @property {1} version Schema version.
 * @property {string} id Stable grid ID.
 * @property {number} columns Positive column count.
 * @property {number} rows Positive row count.
 * @property {"athlete_top_left" | "playfield_top_left"} coordinateSpace Public coordinate space.
 * @property {"top_left_row_major"} indexing Cell indexing contract.
 * @property {boolean} horizontallyOpposedToCamera Whether athlete-left opposes camera-image left.
 */

/** @type {readonly AeroCoordinateSpaceId[]} */
export const coordinateSpaceIds = Object.freeze([
  "camera_preview_top_left",
  "gameplay_camera_bottom_left",
  "athlete_top_left",
  "playfield_top_left"
]);

/** @type {AeroGridDescriptor} */
export const athleteBodyGrid4x3 = Object.freeze({
  schema: "aerobeat/grid_descriptor",
  version: 1,
  id: "athlete_body_4x3",
  columns: 4,
  rows: 3,
  coordinateSpace: "athlete_top_left",
  indexing: "top_left_row_major",
  horizontallyOpposedToCamera: true
});

/** @type {AeroGridDescriptor} */
export const athleteBodySubgrid8x6 = Object.freeze({
  schema: "aerobeat/grid_descriptor",
  version: 1,
  id: "athlete_body_8x6",
  columns: 8,
  rows: 6,
  coordinateSpace: "athlete_top_left",
  indexing: "top_left_row_major",
  horizontallyOpposedToCamera: true
});

/** @type {AeroGridDescriptor} */
export const gameplayPlayfieldGrid4x3 = Object.freeze({
  schema: "aerobeat/grid_descriptor",
  version: 1,
  id: "gameplay_playfield_4x3",
  columns: 4,
  rows: 3,
  coordinateSpace: "playfield_top_left",
  indexing: "top_left_row_major",
  horizontallyOpposedToCamera: false
});

/**
 * Convert upstream top-left camera coordinates to detector gameplay-camera coordinates.
 * Mirroring is deliberately not applied here because the upstream source owns it.
 *
 * @param {AeroNormalizedPoint} point
 * @returns {AeroNormalizedPoint}
 */
export function cameraPreviewToGameplayCamera(point) {
  return Object.freeze({ x: point.x, y: 1 - point.y });
}

/**
 * Convert a gameplay-camera point to public athlete space.
 *
 * @param {AeroNormalizedPoint} point
 * @returns {AeroNormalizedPoint}
 */
export function gameplayCameraToAthlete(point) {
  return Object.freeze({ x: 1 - point.x, y: 1 - point.y });
}

/**
 * Convert an upstream camera point directly to public athlete space.
 *
 * @param {AeroNormalizedPoint} point
 * @returns {AeroNormalizedPoint}
 */
export function cameraPreviewToAthlete(point) {
  return Object.freeze({ x: 1 - point.x, y: point.y });
}

/**
 * @param {number} cameraColumn
 * @param {number} columns
 * @returns {number}
 */
export function cameraColumnToAthleteColumn(cameraColumn, columns) {
  return columns - 1 - cameraColumn;
}

/**
 * @param {number} gameplayRow
 * @param {number} rows
 * @returns {number}
 */
export function gameplayRowToAthleteRow(gameplayRow, rows) {
  return rows - 1 - gameplayRow;
}

/**
 * Resolve a normalized point without clamping. Coordinates on or outside the far edge
 * are diagnostic-only and produce no scoring cell.
 *
 * @param {AeroNormalizedPoint} point
 * @param {AeroGridDescriptor} descriptor
 * @returns {AeroGridCellRef | null}
 */
export function normalizedPointToGridCell(point, descriptor) {
  if (
    !isFiniteNumber(point.x) ||
    !isFiniteNumber(point.y) ||
    point.x < 0 ||
    point.x >= 1 ||
    point.y < 0 ||
    point.y >= 1
  ) {
    return null;
  }
  const column = point.x === 0 ? 0 : Math.floor(point.x * descriptor.columns);
  const row = point.y === 0 ? 0 : Math.floor(point.y * descriptor.rows);
  return Object.freeze({
    id: row === 0 && column === 0 ? 0 : row * descriptor.columns + column,
    row,
    column
  });
}

/**
 * @param {unknown} value
 * @returns {value is AeroGridDescriptor}
 */
export function isAeroGridDescriptor(value) {
  return isRecord(value) &&
    value.schema === "aerobeat/grid_descriptor" &&
    value.version === 1 &&
    typeof value.id === "string" &&
    value.id.length > 0 &&
    isPositiveInteger(value.columns) &&
    isPositiveInteger(value.rows) &&
    (value.coordinateSpace === "athlete_top_left" || value.coordinateSpace === "playfield_top_left") &&
    value.indexing === "top_left_row_major" &&
    typeof value.horizontallyOpposedToCamera === "boolean";
}
