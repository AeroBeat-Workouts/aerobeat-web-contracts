// @ts-check

/**
 * @typedef {"flow" | "boxing"} GameplayModeId
 */

/**
 * @typedef {"note" | "burst" | "bomb" | "obstacle" | "arc"} FlowChartEventKind
 */

/**
 * @typedef {"straight_left" | "straight_right" | "hook_left" | "hook_right" | "uppercut_left" | "uppercut_right" | "guard" | "squat" | "weave_left" | "weave_right"} BoxingChartEventKind
 */

/**
 * @typedef {Object} ChartEvent
 * @property {string} id Stable event identifier.
 * @property {GameplayModeId} mode Gameplay mode that consumes the event.
 * @property {number} beat Beat position in the chart timeline.
 * @property {string} kind Mode-specific event kind.
 */

/**
 * @typedef {Object} ContentChart
 * @property {string} id Chart identifier.
 * @property {GameplayModeId} mode Gameplay mode identifier.
 * @property {readonly ChartEvent[]} events Ordered chart events.
 */

/**
 * @typedef {Object} SongPackage
 * @property {string} id Package identifier.
 * @property {string} title Package display title.
 * @property {readonly ContentChart[]} charts Charts bundled with this package.
 * @property {string | undefined} sourceProvider Optional source provider name.
 * @property {string | undefined} sourceId Optional provider source identifier.
 */

/**
 * Content contracts marker.
 *
 * @type {"aero.contracts.content"}
 */
export const contentContractsId = "aero.contracts.content";
