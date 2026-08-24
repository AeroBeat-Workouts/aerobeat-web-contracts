// @ts-check

/**
 * @typedef {Object} NormalizedPoseLandmark
 * @property {string} name Stable AeroBeat landmark name.
 * @property {number} x Horizontal normalized viewport position from 0 to 1.
 * @property {number} y Vertical normalized viewport position from 0 to 1.
 * @property {number} confidence Detector confidence from 0 to 1.
 */

/**
 * @typedef {Object} NormalizedPoseFrame
 * @property {string} sourceId Frame source identifier.
 * @property {number} timestampMs Capture or media timestamp in milliseconds.
 * @property {readonly NormalizedPoseLandmark[]} landmarks Normalized landmark list.
 * @property {boolean} mirrored Whether the frame is mirrored for player-facing display.
 */

/**
 * @typedef {Object} BodyGridCell
 * @property {number} column Zero-based body-grid column.
 * @property {number} row Zero-based body-grid row.
 */

/**
 * @typedef {Object} BodyGridSample
 * @property {BodyGridCell} leftWrist Current left wrist grid cell.
 * @property {BodyGridCell} rightWrist Current right wrist grid cell.
 * @property {BodyGridCell} nose Current nose grid cell.
 * @property {number} timestampMs Sample timestamp in milliseconds.
 */

/**
 * Pose contracts marker.
 *
 * @type {"aero.contracts.pose"}
 */
export const poseContractsId = "aero.contracts.pose";
