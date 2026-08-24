// @ts-check

/**
 * @typedef {"left" | "right"} InputHand
 */

/**
 * @typedef {"jab" | "hook" | "uppercut" | "guard"} BoxingIntentKind
 */

/**
 * @typedef {Object} BoxingInputEvent
 * @property {InputHand} hand Hand that produced the intent.
 * @property {BoxingIntentKind} kind Boxing intent kind.
 * @property {number} timestampMs Input timestamp in milliseconds.
 * @property {number} confidence Input confidence from 0 to 1.
 */

/**
 * @typedef {"enter-cell" | "leave-cell" | "hold-cell"} FlowIntentKind
 */

/**
 * @typedef {Object} FlowInputEvent
 * @property {FlowIntentKind} kind Flow grid intent kind.
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
