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
 *   bodyGridChanged: "aero:input:body-grid-changed",
 *   calibrationChanged: "aero:input:calibration-changed",
 *   trackingSafetyChanged: "aero:input:tracking-safety-changed",
 *   beatSaverResults: "aero:beatsaver:results",
 *   contentImportChanged: "aero:content:import-changed",
 *   contentChartLoaded: "aero:content:chart-loaded",
 *   contentVariantChanged: "aero:content:variant-changed",
 *   gameplaySessionChanged: "aero:gameplay:session-changed",
 *   gameplayScoreChange: "aero:gameplay:score-change",
 *   gameplayJudgement: "aero:gameplay:judgement",
 *   countdownChanged: "aero:gameplay:countdown-changed",
 *   mediaLeaseChanged: "aero:assembly:media-lease-changed",
 *   gameCommand: "aero:game:command",
 *   gameEvent: "aero:game:event"
 * }>}
 */
export const eventNames = Object.freeze({
  uiNavigate: "aero:ui:navigate",
  cvPoseFrame: "aero:cv:pose-frame",
  audioClockTick: "aero:audio:clock-tick",
  inputBoxingIntent: "aero:input:boxing-intent",
  inputFlowIntent: "aero:input:flow-intent",
  bodyGridChanged: "aero:input:body-grid-changed",
  calibrationChanged: "aero:input:calibration-changed",
  trackingSafetyChanged: "aero:input:tracking-safety-changed",
  beatSaverResults: "aero:beatsaver:results",
  contentImportChanged: "aero:content:import-changed",
  contentChartLoaded: "aero:content:chart-loaded",
  contentVariantChanged: "aero:content:variant-changed",
  gameplaySessionChanged: "aero:gameplay:session-changed",
  gameplayScoreChange: "aero:gameplay:score-change",
  gameplayJudgement: "aero:gameplay:judgement",
  countdownChanged: "aero:gameplay:countdown-changed",
  mediaLeaseChanged: "aero:assembly:media-lease-changed",
  gameCommand: "aero:game:command",
  gameEvent: "aero:game:event"
});
