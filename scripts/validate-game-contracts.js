// @ts-check

import assert from "node:assert/strict";
import {
  boxingActions,
  contentImportJobStates,
  conversionRecipeIds,
  defaultAssetPolicy,
  elementNames,
  eventNames,
  isBeatMapSourceManifest,
  isBeatSaverMapSummary,
  isBeatSaverVersionRef,
  isContentHash,
  isContentImportJobSnapshot,
  isContentProvenance,
  isAssetPolicy,
  isBackgroundSuggestion,
  isContainerSnapshot,
  isContentVariantIdentity,
  isCountdownSnapshot,
  isFullscreenSnapshot,
  isGameCapabilities,
  isGameCommand,
  isGameEvent,
  isGameplayEvidenceSnapshot,
  isGameplayJudgement,
  isGameplayJudgementV2,
  isGameplaySessionPurpose,
  isGameplaySessionSnapshot,
  isGameplaySessionSnapshotV2,
  isGameplaySessionStartRequest,
  gameplaySessionPurposes,
  isMediaLeaseSnapshot,
  isObstacleOutcome,
  obstacleResults,
  isPersistenceHandle,
  isPrototypeTuningIdentity,
  isThemeDescriptor,
  mapModifierIds,
  prototypeJudgementDefaults,
  rulesetIds,
  serviceIds
} from "../src/index.js";

const sha1 = { schema: "aerobeat/content_hash", version: 1, algorithm: "sha1", value: "a".repeat(40) };
const sha256 = { schema: "aerobeat/content_hash", version: 1, algorithm: "sha256", value: "b".repeat(64) };
assert.equal(isContentHash(sha1), true);
assert.equal(isContentHash(sha256), true);
assert.equal(isContentHash({ ...sha1, value: "A".repeat(40) }), false);

assert.equal(elementNames.game, "aero-game");
assert.equal(Object.values(elementNames).includes("aerobeat-app"), false);
assert.equal(serviceIds.bodyGrid, "aero.input.body-grid");
assert.equal(serviceIds.beatSaverVendor, "aero.vendor.beatsaver");
assert.equal(serviceIds.contentAuthoring, "aero.content.authoring");
assert.equal(eventNames.contentImportChanged, "aero:content:import-changed");
assert.deepEqual(rulesetIds, ["flow_grid_v1", "flow_grid_v2", "boxing_semantic_track_v1", "boxing_spatial_grid_v1"]);
assert.deepEqual(obstacleResults, ["contact", "avoided", "unevaluated_tracking"]);
assert.deepEqual(conversionRecipeIds, ["row_family_balanced_height_v1", "cut_family_source_height_v1"]);
assert.equal(mapModifierIds.includes("crossed_guard"), true);
assert.equal(boxingActions.includes("crossed_guard"), true);
assert.equal(prototypeJudgementDefaults.timingWindowBeforeMs, 180);
assert.equal(prototypeJudgementDefaults.checkpointFreshnessMs, 150);
assert.equal(prototypeJudgementDefaults.straightQualificationMs, 100);
assert.equal(prototypeJudgementDefaults.minimumPunchSpacingMs, 360);
assert.deepEqual(gameplaySessionPurposes, ["play", "visual_test"]);
assert.equal(isGameplaySessionPurpose("play"), true);
assert.equal(isGameplaySessionPurpose("visual_test"), true);
assert.equal(isGameplaySessionPurpose("test"), false);

assert.equal(isContentVariantIdentity({
  schema: "aerobeat/content_variant_identity",
  version: 1,
  packageId: "pkg-1",
  chartId: "chart-1",
  rulesetId: "boxing_spatial_grid_v1",
  recipeId: "cut_family_source_height_v1",
  modifierIds: ["crossed_guard"],
  mapHash: sha256,
  scoreIdentityHash: sha256,
  ranked: false
}), true);

assert.equal(isBeatSaverMapSummary({
  schema: "aerobeat/beatsaver_map_summary",
  version: 1,
  mapId: "4858",
  name: "Papercut",
  songAuthorName: "Linkin Park",
  levelAuthorName: "mapper",
  durationSeconds: 187,
  coverUrl: "https://cdn.example/cover.png",
  tags: ["rock"]
}), true);

assert.equal(isBeatSaverVersionRef({
  schema: "aerobeat/beatsaver_version_ref",
  version: 1,
  mapId: "4858",
  versionHash: "a".repeat(40),
  downloadUrl: "https://r2cdn.example/map.zip",
  createdAt: "2022-05-12T00:00:00Z",
  difficulties: ["Standard/Expert"]
}), true);

const manifest = {
  schema: "aerobeat/beatmap_source_manifest",
  version: 1,
  sourceProvider: "beatsaver",
  sourceId: "4858",
  sourceVersionHash: "a".repeat(40),
  beatMapFormat: "v3",
  metadataPath: "Info.dat",
  entries: [{ path: "Expert.dat", kind: "difficulty", byteLength: 42, hash: sha256 }],
  difficultyIds: ["Standard/Expert"],
  totalUncompressedBytes: 42,
  archiveHash: sha1
};
assert.equal(isBeatMapSourceManifest(manifest), true);
assert.equal(isBeatMapSourceManifest({ ...manifest, entries: [{ ...manifest.entries[0], path: "../escape.dat" }] }), false);
assert.equal(isBeatMapSourceManifest({ ...manifest, providerNative: { raw: true } }), false);
assert.equal(isBeatMapSourceManifest({ ...manifest, entries: [{ ...manifest.entries[0], bytes: new Uint8Array([1]) }] }), false);

const persistence = {
  schema: "aerobeat/persistence_handle",
  version: 1,
  storage: "indexeddb",
  namespace: "aerobeat.content.v1",
  key: "pkg-1",
  packageId: "pkg-1",
  packageHash: sha256
};
assert.equal(isPersistenceHandle(persistence), true);
assert.equal(isPersistenceHandle({ ...persistence, database: { providerNative: true } }), false);
assert.equal(contentImportJobStates.includes("converting"), true);
const importJob = {
  schema: "aerobeat/content_import_job_snapshot",
  version: 1,
  jobId: "job-1",
  state: "complete",
  progress: 1,
  sourceId: "4858",
  sourceVersionHash: "a".repeat(40),
  difficultyId: "Standard/Expert",
  errorCode: null,
  errorMessage: null,
  result: persistence
};
assert.equal(isContentImportJobSnapshot(importJob), true);
assert.equal(isContentImportJobSnapshot({ ...importJob, archiveBytes: new Uint8Array([1]) }), false);

const anchor = {
  schema: "aerobeat/body_grid_anchor_snapshot",
  version: 1,
  anchor: "nose",
  calibrationId: "cal-1",
  measurementTimestampMs: 100,
  valid: true,
  confidence: 0.9,
  rawX: 0.5,
  rawY: 0.5,
  x: 0.5,
  y: 0.5,
  cell: 6,
  subcell: 28
};
assert.equal(isGameplayEvidenceSnapshot({
  schema: "aerobeat/gameplay_evidence_snapshot",
  version: 1,
  calibrationId: "cal-1",
  measuredSourceFrameId: "epoch:1",
  measurementTimestampMs: 100,
  provenance: "measured",
  activeBoxingActions: ["guard", "squat"],
  anchors: [anchor],
  entries: []
}), true);
assert.equal(isGameplayEvidenceSnapshot({
  schema: "aerobeat/gameplay_evidence_snapshot",
  version: 1,
  calibrationId: "cal-1",
  measuredSourceFrameId: "epoch:1",
  measurementTimestampMs: 100,
  provenance: "predicted",
  activeBoxingActions: [],
  anchors: [anchor],
  entries: []
}), false);

assert.equal(isGameplayJudgement({
  schema: "aerobeat/gameplay_judgement",
  version: 1,
  eventId: "event-1",
  rulesetId: "boxing_spatial_grid_v1",
  recipeId: "row_family_balanced_height_v1",
  result: "miss",
  beatCenterTimestampMs: 1000,
  evidenceTimestampMs: null,
  timingOffsetMs: null,
  diagnostics: ["no_input"],
  shadow: false
}), true, "legacy version 1 judgement remains accepted");
const committedJudgement = {
  schema: "aerobeat/gameplay_judgement",
  version: 2,
  sessionPurpose: "play",
  eventId: "event-1",
  rulesetId: "boxing_spatial_grid_v1",
  recipeId: "row_family_balanced_height_v1",
  result: "miss",
  beatCenterTimestampMs: 1000,
  committedTimelinePositionMs: 1180,
  evidenceTimestampMs: null,
  timingOffsetMs: null,
  diagnostics: ["no_input"],
  shadow: false
};
assert.equal(isGameplayJudgementV2(committedJudgement), true);
assert.equal(isGameplayJudgement(committedJudgement), true);
for (const invalid of [
  { ...committedJudgement, sessionPurpose: "visual_test" },
  { ...committedJudgement, committedTimelinePositionMs: -1 },
  { ...committedJudgement, committedTimelinePositionMs: Number.POSITIVE_INFINITY },
  { ...committedJudgement, diagnostics: ["no_input", "no_input"] },
  { ...committedJudgement, synthetic: true },
  { ...committedJudgement, result: "great" }
]) assert.equal(isGameplayJudgementV2(invalid), false, "synthetic, ambiguous, or unbounded judgement truth rejects");
const missingCommitment = { ...committedJudgement }; Reflect.deleteProperty(missingCommitment, "committedTimelinePositionMs");
assert.equal(isGameplayJudgementV2(missingCommitment), false);
let judgementAccessorCalled = false;
const accessorJudgement = { ...committedJudgement };
Object.defineProperty(accessorJudgement, "committedTimelinePositionMs", { enumerable: true, get() { judgementAccessorCalled = true; return 1180; } });
assert.equal(isGameplayJudgementV2(accessorJudgement), false);
assert.equal(isGameplayJudgement(accessorJudgement), false);
assert.equal(judgementAccessorCalled, false, "version 2 judgement validators must not invoke accessors");
let diagnosticAccessorCalled = false;
const accessorDiagnostics = [];
Object.defineProperty(accessorDiagnostics, "0", { enumerable: true, get() { diagnosticAccessorCalled = true; return "no_input"; } });
accessorDiagnostics.length = 1;
assert.equal(isGameplayJudgementV2({ ...committedJudgement, diagnostics: accessorDiagnostics }), false);
assert.equal(diagnosticAccessorCalled, false, "version 2 judgement diagnostics must not invoke accessors");
const extraDiagnosticProperty = ["no_input"]; extraDiagnosticProperty.extra = true;
assert.equal(isGameplayJudgementV2({ ...committedJudgement, diagnostics: extraDiagnosticProperty }), false);

const obstacleOutcome = {
  schema: "aerobeat/obstacle_outcome",
  version: 1,
  eventId: "flow-obstacle-1",
  rulesetId: "flow_grid_v2",
  result: "contact",
  intervalStartTimestampMs: 37039.99938964844,
  intervalEndTimestampMs: 37064.99938964844,
  committedTimelinePositionMs: 37065,
  firstContactTimelinePositionMs: 37040,
  contactDurationMs: 25,
  contactEpisodeId: "session-1:obstacle-episode:1",
  evidenceFrameId: "frame-2",
  calibrationId: "cal-1",
  consequenceApplied: true
};
assert.equal(isObstacleOutcome(obstacleOutcome), true);
assert.equal(isObstacleOutcome({ ...obstacleOutcome, rulesetId: "flow_grid_v1" }), false);
assert.equal(isObstacleOutcome({ ...obstacleOutcome, intervalEndTimestampMs: obstacleOutcome.intervalStartTimestampMs }), false);
assert.equal(isObstacleOutcome({ ...obstacleOutcome, contactDurationMs: 26 }), false);
assert.equal(isObstacleOutcome({ ...obstacleOutcome, noseX: 0.5 }), false);
const avoidedObstacle = { ...obstacleOutcome, result: "avoided", firstContactTimelinePositionMs: null, contactDurationMs: 0, contactEpisodeId: null, evidenceFrameId: null, calibrationId: null, consequenceApplied: false };
assert.equal(isObstacleOutcome(avoidedObstacle), true);
assert.equal(isObstacleOutcome({ ...avoidedObstacle, consequenceApplied: true }), false);

assert.equal(isCountdownSnapshot({
  schema: "aerobeat/countdown_snapshot",
  version: 1,
  state: "three",
  reason: "tracking_resume",
  value: 3,
  timestampMs: 200,
  gameplayTimeFrozen: true,
  calibrationId: "cal-2"
}), true);

assert.equal(isGameplaySessionSnapshot({
  schema: "aerobeat/gameplay_session_snapshot",
  version: 1,
  sessionId: "session-1",
  state: "playing",
  timestampMs: 1000,
  timelinePositionMs: 250,
  packageId: "pkg-1",
  chartId: "chart-1",
  calibrationId: "cal-2",
  rulesetId: "boxing_semantic_track_v1",
  recipeId: "row_family_balanced_height_v1",
  ranked: false,
  pauseReason: null
}), true, "legacy version 1 session remains accepted");
const visualTestSession = {
  schema: "aerobeat/gameplay_session_snapshot",
  version: 2,
  sessionId: "session-test-1",
  state: "playing",
  purpose: "visual_test",
  timestampMs: 1000,
  timelinePositionMs: 250,
  packageId: "pkg-1",
  chartId: "chart-1",
  calibrationId: null,
  rulesetId: "flow_grid_v1",
  recipeId: null,
  ranked: false,
  pauseReason: null
};
assert.equal(isGameplaySessionSnapshotV2(visualTestSession), true);
assert.equal(isGameplaySessionSnapshot(visualTestSession), true);
assert.equal(isGameplaySessionSnapshotV2({ ...visualTestSession, state: "paused_manual" }), true, "menu pause retains visual-test purpose");
for (const invalid of [
  { ...visualTestSession, ranked: true },
  { ...visualTestSession, calibrationId: "cal-forbidden" },
  { ...visualTestSession, state: "calibrating" },
  { ...visualTestSession, state: "countdown" },
  { ...visualTestSession, state: "paused_tracking" },
  { ...visualTestSession, purpose: "test" },
  { ...visualTestSession, sessionId: "x".repeat(257) },
  { ...visualTestSession, syntheticJudgements: [] }
]) assert.equal(isGameplaySessionSnapshotV2(invalid), false, "visual test cannot become ranked/calibrated/judgement-bearing truth");
const normalPlaySession = { ...visualTestSession, purpose: "play", calibrationId: "cal-2", state: "countdown" };
assert.equal(isGameplaySessionSnapshotV2(normalPlaySession), true, "normal Play retains calibration/countdown lifecycle");
let sessionAccessorCalled = false;
const accessorSession = { ...visualTestSession };
Object.defineProperty(accessorSession, "purpose", { enumerable: true, get() { sessionAccessorCalled = true; return "visual_test"; } });
assert.equal(isGameplaySessionSnapshotV2(accessorSession), false);
assert.equal(isGameplaySessionSnapshot(accessorSession), false);
assert.equal(sessionAccessorCalled, false, "version 2 session validators must not invoke accessors");
const explicitTestStart = { schema: "aerobeat/gameplay_session_start", version: 1, purpose: "visual_test" };
assert.equal(isGameplaySessionStartRequest(explicitTestStart), true);
assert.equal(isGameplaySessionStartRequest({ ...explicitTestStart, purpose: "play" }), true);
assert.equal(isGameplaySessionStartRequest({ ...explicitTestStart, purpose: "test" }), false);
assert.equal(isGameplaySessionStartRequest({ ...explicitTestStart, package: {} }), false);
let startAccessorCalled = false;
const accessorStart = { ...explicitTestStart };
Object.defineProperty(accessorStart, "purpose", { enumerable: true, get() { startAccessorCalled = true; return "visual_test"; } });
assert.equal(isGameplaySessionStartRequest(accessorStart), false);
assert.equal(startAccessorCalled, false, "start request validator must not invoke accessors");

assert.equal(isGameCapabilities({
  schema: "aerobeat/game_capabilities",
  version: 1,
  secureContext: true,
  camera: true,
  fullscreen: true,
  autoplay: false,
  webgl2: true,
  indexedDb: true,
  worker: true,
  directBeatSaverCors: true,
  localZipImport: true,
  limitations: ["autoplay_gesture_required"]
}), true);
const container = {
  schema: "aerobeat/container_snapshot",
  version: 1,
  widthCssPx: 640,
  heightCssPx: 360,
  devicePixelRatio: 2,
  visible: true,
  fullscreen: false
};
assert.equal(isContainerSnapshot(container), true);
assert.equal(isContainerSnapshot({ ...container, viewportWidth: 1920 }), false);
const fullscreen = {
  schema: "aerobeat/fullscreen_snapshot",
  version: 1,
  supported: true,
  active: false,
  requestPending: true,
  errorCode: null
};
assert.equal(isFullscreenSnapshot(fullscreen), true);
assert.equal(isFullscreenSnapshot({ ...fullscreen, owner: "parent" }), false);
const directCommand = { schema: "aerobeat/game_command", version: 1, commandId: "command-1", type: "start", payload: null };
const directEvent = { schema: "aerobeat/game_event", version: 1, eventId: "event-1", type: "ready", timestampMs: 0, payload: null };
assert.equal(isGameCommand(directCommand), true, "legacy null Start remains normal Play");
assert.equal(isGameCommand({ ...directCommand, payload: explicitTestStart }), true, "explicit visual-test Start is valid");
assert.equal(isGameCommand({ ...directCommand, payload: { ...explicitTestStart, purpose: "test" } }), false);
assert.equal(isGameCommand({ ...directCommand, payload: {} }), false, "Start does not accept ambiguous payloads");
assert.equal(isGameCommand({ ...directCommand, type: "test", payload: null }), false, "visual test is a bounded Start purpose, not an alias command");
assert.equal(isGameCommand({ ...directCommand, unexpected: true }), false);
assert.equal(isGameEvent(directEvent), true);
assert.equal(isGameEvent({ ...directEvent, unexpected: true }), false);
assert.equal(isAssetPolicy(defaultAssetPolicy), true);
const mediaLease = {
  schema: "aerobeat/media_lease_snapshot",
  version: 1,
  ownerInstanceId: "game-1",
  generation: 2,
  state: "owned",
  resources: ["camera", "audio"]
};
assert.equal(isMediaLeaseSnapshot(mediaLease), true);
assert.equal(isMediaLeaseSnapshot({ ...mediaLease, tracks: [] }), false);
const tuningIdentity = {
  schema: "aerobeat/prototype_tuning_identity",
  version: 1,
  profileId: "aero.converter.canonical",
  profileVersion: "1.0.0",
  contentHash: "c".repeat(64),
  class: "converter_regeneration",
  regenerationRequired: true
};
assert.equal(isPrototypeTuningIdentity(tuningIdentity), true, "pending converter identity is valid");
assert.equal(isPrototypeTuningIdentity({ ...tuningIdentity, regenerationRequired: false }), true, "applied converter identity is valid after provenance matches");
for (const profileClass of ["live_visual", "between_run_ruleset"]) {
  assert.equal(isPrototypeTuningIdentity({ ...tuningIdentity, class: profileClass, regenerationRequired: false }), true);
  assert.equal(isPrototypeTuningIdentity({ ...tuningIdentity, class: profileClass, regenerationRequired: true }), false, `${profileClass} cannot require regeneration`);
}
for (const missingField of Object.keys(tuningIdentity)) {
  const missing = { ...tuningIdentity };
  Reflect.deleteProperty(missing, missingField);
  assert.equal(isPrototypeTuningIdentity(missing), false, `missing ${missingField} rejects`);
}
assert.equal(isPrototypeTuningIdentity({ ...tuningIdentity, unexpected: true }), false);
assert.equal(isPrototypeTuningIdentity({ ...tuningIdentity, profileId: "x".repeat(257) }), false);
assert.equal(isPrototypeTuningIdentity({ ...tuningIdentity, profileVersion: "x".repeat(257) }), false);
assert.equal(isPrototypeTuningIdentity({ ...tuningIdentity, contentHash: `sha256:${"c".repeat(64)}` }), false);
assert.equal(isPrototypeTuningIdentity({ ...tuningIdentity, contentHash: "C".repeat(64) }), false);
assert.equal(isPrototypeTuningIdentity({ ...tuningIdentity, profileId: new Uint8Array([1]) }), false);
class TuningIdentity { constructor() { Object.assign(this, tuningIdentity); } }
assert.equal(isPrototypeTuningIdentity(new TuningIdentity()), false);
const symbolicTuning = { ...tuningIdentity, [Symbol("extra")]: true };
assert.equal(isPrototypeTuningIdentity(symbolicTuning), false);
const hiddenTuning = { ...tuningIdentity };
Object.defineProperty(hiddenTuning, "hidden", { value: true });
assert.equal(isPrototypeTuningIdentity(hiddenTuning), false);
let tuningGetterCalled = false;
const accessorTuning = { ...tuningIdentity };
Object.defineProperty(accessorTuning, "profileId", { enumerable: true, get() { tuningGetterCalled = true; return "unsafe"; } });
assert.equal(isPrototypeTuningIdentity(accessorTuning), false);
assert.equal(tuningGetterCalled, false, "tuning predicate must not invoke accessors");

const provenance = {
  schema: "aerobeat/content_provenance",
  version: 1,
  sourceProvider: "beatsaver",
  sourceId: "4858",
  sourceVersionHash: "a".repeat(40),
  sourceDifficulty: "Expert",
  recipeVersion: "1",
  sourceEventIds: ["event-1"]
};
assert.equal(isContentProvenance(provenance), true);
assert.equal(isContentProvenance({ ...provenance, converterProfile: tuningIdentity }), false, "content provenance exact shape remains strict");
let provenanceGetterCalled = false;
const accessorProvenance = { ...provenance };
Object.defineProperty(accessorProvenance, "sourceId", { enumerable: true, get() { provenanceGetterCalled = true; return "unsafe"; } });
assert.equal(isContentProvenance(accessorProvenance), false);
assert.equal(provenanceGetterCalled, false, "content provenance must not invoke accessors");
assert.equal(isThemeDescriptor({
  schema: "aerobeat/theme_descriptor",
  version: 1,
  id: "default",
  themeVersion: "1",
  tokens: {
    leftHandColor: "#0A84FF",
    rightHandColor: "#3DBE63",
    guardColor: "#8B5CF6",
    obstacleColor: "#E5484D",
    receptorColor: "rgba(215,244,255,.3)",
    approachLeadMs: 1500,
    targetStartScale: 0.4,
    targetHitScale: 1,
    approachEasing: "linear",
    hitEasing: "ease-out",
    missEasing: "ease-in"
  },
  contentHash: sha256
}), true);
assert.equal(isBackgroundSuggestion({
  schema: "aerobeat/background_suggestion",
  version: 1,
  source: "song",
  kind: "image",
  url: "https://cdn.example/background.webp",
  hash: sha256,
  themeId: "default"
}), true);

console.log("Gameplay, content, session, BeatSaver, theme, and host contract validation passed.");
