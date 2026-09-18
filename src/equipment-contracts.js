// @ts-check

import { isFiniteNumber } from "./contract-guards.js";

/**
 * 0.0.61 equipment = detection volumes (GATE 1, locked 2026-09-17).
 *
 * This module is the ONE shared geometry source for athlete equipment.
 * Gameplay consumes these constants to run hit detection (judge space);
 * the renderer consumes the same constants to stage the visible equipment
 * (presentation space), so the visible equipment size/offset always equals
 * the detection volume — the "what you see is what hits" invariant
 * (F2-class coordinate-space trap, now a named invariant).
 *
 * Coordinate spaces (never interchangeable):
 * - JUDGE space: the normalized 4x3 wrist space of the existing punch boxes.
 *   `sx = 4 * x_norm - 0.5` places the four column centers at 0, 1, 2, 3
 *   with 1 WU per cell. All constants in this module are JUDGE-SPACE units.
 * - PRESENTATION space: the renderer world grid
 *   (`columnX = [-1.5, -0.5, 0.5, 1.5]`), which is exactly judge X - 1.5.
 *   Use {@link judgeToPresentationPoint} to project; it is the only
 *   sanctioned judge-to-presentation mapping in this repo.
 *
 * The detection surfaces replace the legacy wrist markers:
 * - Flow: the saber capsule replaces wrist-in-cell as the single hit detector.
 * - Boxing: the glove box replaces the wrist-sample box as the detection
 *   primitive (guard poses judge through the same volume).
 * All wrist markers and the nose marker are HIDDEN in equipment modes;
 * obstacle nose detection is unchanged and stays active.
 */

/**
 * JUDGE-SPACE saber hit volume for Flow. The spec stores geometry only: the
 * capsule extends from the wrist sample along a direction vector that gameplay
 * supplies at runtime (smoothed last-motion direction, fallback facing).
 *
 * @typedef {Object} AeroSaberGeometry
 * @property {number} length Capsule axis length in WU.
 * @property {number} radius Capsule cylinder radius in WU.
 */

/**
 * JUDGE-SPACE glove hit volume for Boxing. The volume is an axis-aligned box
 * in the glove local frame, centered at the wrist sample offset toward the
 * grid by `offsetZ` so it covers the fist. Local frame axes (v1, fixed):
 * x = thumb side (mirrored per hand), y = up, z = grid-facing.
 *
 * @typedef {Object} AeroGloveGeometry
 * @property {number} x Box half-extent along the thumb-side axis (WU).
 * @property {number} y Box half-extent along the up axis (WU).
 * @property {number} z Box half-extent along the grid-facing axis (WU).
 * @property {number} offsetZ Grid-facing center offset from the wrist sample (WU).
 */

/** Flow saber capsule: 0.75 WU axis, 0.18 WU radius (GATE 1 decision 1). */
export const saberGeometry = Object.freeze({
  length: 0.75,
  radius: 0.18
});

/** Boxing glove box: 0.34 x 0.28 x 0.34 WU, +0.05 WU grid-facing offset (GATE 1). */
export const gloveGeometry = Object.freeze({
  x: 0.34,
  y: 0.28,
  z: 0.34,
  offsetZ: 0.05
});

/**
 * Marker-visibility contract for equipment modes. Equipment replaces the
 * legacy markers as the visible + detection surface:
 * - Flow: wrist dots hidden while the sabers are active; nose marker hidden
 *   (no head model; obstacle nose detection is unaffected and stays active).
 * - Boxing: wrist dots hidden while the gloves are active; nose marker hidden.
 *
 * Values are `"hidden"` (marker not rendered) or `"visible"` (legacy marker
 * rendering unchanged). The cursor-record path still feeds equipment staging;
 * this constant governs marker VISIBILITY only, never cursor records.
 */
export const equipmentMarkerVisibility = Object.freeze({
  flow: Object.freeze({
    left_wrist: "hidden",
    right_wrist: "hidden",
    nose: "hidden"
  }),
  boxing: Object.freeze({
    left_wrist: "hidden",
    right_wrist: "hidden",
    nose: "hidden"
  })
});

/** @typedef {"left_wrist" | "right_wrist" | "nose"} AeroEquipmentMarkerRole */
/** @typedef {"hidden" | "visible"} AeroMarkerVisibility */

/**
 * Judge-plane X of the canonical 4x3 column centers (column 0..3 → 0..3).
 * One WU per cell, matching `sx = 4 * x_norm - 0.5`.
 *
 * @type {readonly number[]}
 */
export const judgeColumnCenters = Object.freeze([0, 1, 2, 3]);

/**
 * Presentation-plane X of the four grid column centers
 * (`columnX = [-1.5, -0.5, 0.5, 1.5]`).
 *
 * @type {readonly number[]}
 */
export const presentationColumnCenters = Object.freeze([-1.5, -0.5, 0.5, 1.5]);

/**
 * Project a judge-space point to presentation space: X shifts by -1.5
 * (judge X - 1.5), Y is unchanged. Both spaces share the same WU units, so
 * equipment geometry constants translate directly between them.
 *
 * @param {Readonly<{x: number, y: number}>} point Judge-space point.
 * @returns {Readonly<{x: number, y: number}>} Presentation-space point.
 */
export function judgeToPresentationPoint(point) {
  if (
    typeof point !== "object" || point === null ||
    !isFiniteNumber(point.x) || !isFiniteNumber(point.y)
  ) {
    throw new TypeError("equipment_judge_point_invalid");
  }
  return Object.freeze({ x: point.x - 1.5, y: point.y });
}
