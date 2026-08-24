// @ts-check

/**
 * @typedef {"straight_left" | "straight_right" | "uppercut_left" | "uppercut_right" | "hook_left" | "hook_right" | "guard_enabled" | "guard_disabled" | "squat_enabled" | "squat_disabled" | "weave_left_enabled" | "weave_left_disabled" | "weave_right_enabled" | "weave_right_disabled"} BoxingInputIntentName
 */

/**
 * @typedef {Object} BoxingInputEvent
 * @property {BoxingInputIntentName} name Canonical Boxing v1 input intent name.
 * @property {number} timestampMs Input timestamp in milliseconds.
 * @property {number} confidence Input confidence from 0 to 1.
 */

/**
 * @typedef {"left_wrist" | "right_wrist" | "nose"} BodyGridAnchorName
 */

/**
 * @typedef {"cell_entered" | "squat_enabled" | "squat_disabled"} FlowIntentKind
 */

/**
 * @typedef {Object} FlowInputEvent
 * @property {FlowIntentKind} kind Flow grid or squat intent kind.
 * @property {BodyGridAnchorName} anchor Body anchor that produced the event.
 * @property {number} column Zero-based grid column.
 * @property {number} row Zero-based grid row.
 * @property {number} timestampMs Input timestamp in milliseconds.
 * @property {number} confidence Input confidence from 0 to 1.
 */

/**
 * Input contracts marker.
 *
 * @type {"aero.contracts.input"}
 */
export const inputContractsId = "aero.contracts.input";
