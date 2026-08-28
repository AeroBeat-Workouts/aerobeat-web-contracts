// @ts-check

/**
 * @typedef {Object} NormalizedPoseLandmark
 * @property {string} name Stable AeroBeat landmark name.
 * @property {number} x Horizontal normalized camera/preview position from 0 to 1; upstream owns mirroring.
 * @property {number} y Vertical normalized camera/preview top-left position from 0 to 1.
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
 * @typedef {"measured" | "predicted"} AeroPoseSampleProvenance
 */

/**
 * Truthfully tagged pose sample used only after measured CV output enters gameplay routing.
 * It is deliberately separate from NormalizedPoseFrame so an estimate cannot masquerade
 * as adapter output.
 *
 * @typedef {Object} AeroPoseRoutingSample
 * @property {"aerobeat/pose_routing_sample"} schema Routing sample schema ID.
 * @property {1} version Routing sample schema version.
 * @property {string} sourceId Measured source identifier.
 * @property {string} routeEpoch Lifecycle generation assigned by the routing owner.
 * @property {string} measuredSourceFrameId Stable epoch-qualified identity of the latest real source frame.
 * @property {number} targetTimestampMs Gameplay/media time represented by this sample.
 * @property {number} measurementTimestampMs Timestamp of the latest real measurement.
 * @property {number} predictionHorizonMs Target minus measurement time; zero for measured samples.
 * @property {AeroPoseSampleProvenance} provenance Real measurement or bounded prediction.
 * @property {readonly NormalizedPoseLandmark[]} landmarks Normalized landmark list.
 * @property {boolean} mirrored Whether the source is mirrored for player-facing presentation.
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
 * @typedef {"nose" | "left_wrist" | "right_wrist"} BodyGridAnchorName
 */

/**
 * @typedef {Object} BodyGridAnchor
 * @property {"aerobeat/body_grid_anchor"} schema Body-grid anchor schema ID.
 * @property {1} version Body-grid anchor schema version.
 * @property {BodyGridAnchorName} anchor Body anchor represented by this sample.
 * @property {boolean} valid Whether the anchor has enough signal for gameplay use.
 * @property {number} rawX Unclamped horizontal normalized coordinate.
 * @property {number} rawY Unclamped vertical normalized coordinate.
 * @property {number} x Clamped horizontal normalized coordinate.
 * @property {number} y Clamped vertical normalized coordinate.
 * @property {number} cell Zero-based 4x3 row-major body-grid cell.
 * @property {number} row Zero-based body-grid row.
 * @property {number} column Zero-based body-grid column.
 */

/**
 * Pose contracts marker.
 *
 * @type {"aero.contracts.pose"}
 */
export const poseContractsId = "aero.contracts.pose";

/** @type {"aerobeat/pose_routing_sample"} */
export const aeroPoseRoutingSampleSchema = "aerobeat/pose_routing_sample";

/** @type {readonly AeroPoseSampleProvenance[]} */
export const aeroPoseSampleProvenances = Object.freeze(["measured", "predicted"]);
