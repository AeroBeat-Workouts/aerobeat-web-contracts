// @ts-check

export * from "./service-ids.js";
export * from "./event-names.js";
export * from "./element-names.js";
export * from "./contract-guards.js";
export * from "./coordinate-spaces.js";
export * from "./pose-shapes.js";
export * from "./pose-adapter.js";
export * from "./body-grid-contracts.js";
export { inputContractsId } from "./input-shapes.js";
/** @typedef {import("./input-shapes.js").BoxingInputIntentName} BoxingInputIntentName */
/** @typedef {import("./input-shapes.js").BoxingInputEvent} BoxingInputEvent */
/** @typedef {import("./input-shapes.js").FlowIntentKind} FlowIntentKind */
/** @typedef {import("./input-shapes.js").FlowInputEvent} FlowInputEvent */
// BodyGridAnchorName comes from pose-shapes at the root; the input subpath retains its alias.
export * from "./session-contracts.js";
export * from "./gameplay-contracts.js";
export * from "./obstacle-contracts.js";
export * from "./content-shapes.js";
export * from "./content-contracts.js";
export * from "./beatsaver-contracts.js";
export * from "./note-palette-contracts.js";
export * from "./authored-timing.js";
export * from "./theme-contracts.js";
export * from "./host-contracts.js";
export * from "./iframe-contracts.js";
export * from "./equipment-contracts.js";
export * from "./equipment-pose-contracts.js";
export * from "./collider-contracts.js";
