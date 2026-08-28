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
  isAssetPolicy,
  isBackgroundSuggestion,
  isContainerSnapshot,
  isContentVariantIdentity,
  isCountdownSnapshot,
  isGameCapabilities,
  isGameplayEvidenceSnapshot,
  isGameplayJudgement,
  isGameplaySessionSnapshot,
  isMediaLeaseSnapshot,
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
assert.deepEqual(rulesetIds, ["flow_grid_v1", "boxing_semantic_track_v1", "boxing_spatial_grid_v1"]);
assert.deepEqual(conversionRecipeIds, ["row_family_balanced_height_v1", "cut_family_source_height_v1"]);
assert.equal(mapModifierIds.includes("crossed_guard"), true);
assert.equal(boxingActions.includes("crossed_guard"), true);
assert.equal(prototypeJudgementDefaults.timingWindowBeforeMs, 180);
assert.equal(prototypeJudgementDefaults.checkpointFreshnessMs, 150);
assert.equal(prototypeJudgementDefaults.straightQualificationMs, 100);
assert.equal(prototypeJudgementDefaults.minimumPunchSpacingMs, 360);

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

const persistence = {
  schema: "aerobeat/persistence_handle",
  version: 1,
  storage: "indexeddb",
  namespace: "aerobeat.content.v1",
  key: "pkg-1",
  packageId: "pkg-1",
  packageHash: sha256
};
assert.equal(contentImportJobStates.includes("converting"), true);
assert.equal(isContentImportJobSnapshot({
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
}), true);

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
}), true);

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
}), true);

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
assert.equal(isContainerSnapshot({
  schema: "aerobeat/container_snapshot",
  version: 1,
  widthCssPx: 640,
  heightCssPx: 360,
  devicePixelRatio: 2,
  visible: true,
  fullscreen: false
}), true);
assert.equal(isAssetPolicy(defaultAssetPolicy), true);
assert.equal(isMediaLeaseSnapshot({
  schema: "aerobeat/media_lease_snapshot",
  version: 1,
  ownerInstanceId: "game-1",
  generation: 2,
  state: "owned",
  resources: ["camera", "audio"]
}), true);
assert.equal(isPrototypeTuningIdentity({
  schema: "aerobeat/prototype_tuning_identity",
  version: 1,
  profileId: "converter-fast",
  profileVersion: "1",
  contentHash: "c".repeat(64),
  class: "converter_regeneration",
  regenerationRequired: true
}), true);
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
