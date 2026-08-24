// @ts-check

/**
 * Canonical AeroBeat web event names.
 *
 * @type {Readonly<{
 *   uiNavigate: "aero:ui:navigate",
 *   cvPoseFrame: "aero:cv:pose-frame",
 *   audioClockTick: "aero:audio:clock-tick",
 *   inputBoxingIntent: "aero:input:boxing-intent",
 *   inputFlowIntent: "aero:input:flow-intent",
 *   gameplayScoreChange: "aero:gameplay:score-change",
 *   contentChartLoaded: "aero:content:chart-loaded"
 * }>}
 */
export const eventNames = Object.freeze({
  uiNavigate: "aero:ui:navigate",
  cvPoseFrame: "aero:cv:pose-frame",
  audioClockTick: "aero:audio:clock-tick",
  inputBoxingIntent: "aero:input:boxing-intent",
  inputFlowIntent: "aero:input:flow-intent",
  gameplayScoreChange: "aero:gameplay:score-change",
  contentChartLoaded: "aero:content:chart-loaded"
});
