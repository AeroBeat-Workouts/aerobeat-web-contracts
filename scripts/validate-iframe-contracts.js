// @ts-check

import assert from "node:assert/strict";
import {
  forbiddenIframePayloadKeys,
  iframeProtocol,
  isIframeMessage,
  isSafeIframePayload
} from "../src/index.js";

assert.equal(iframeProtocol.version, 1);
assert.equal(iframeProtocol.target, "immediate_parent");
assert.equal(iframeProtocol.rawMediaAllowed, false);
for (const key of ["rawFrame", "pixels", "screenshot", "mediaStreamTrack", "videoFrame", "zipBytes", "audioBytes"]) {
  assert.equal(forbiddenIframePayloadKeys.includes(key), true);
  assert.equal(isSafeIframePayload({ nested: { [key]: "forbidden" } }), false, `${key} must be forbidden at every depth`);
}
for (const alias of [
  "rawframe",
  "RAW_FRAME",
  "raw-camera-frame",
  "PIXEL_DATA",
  "screen_capture",
  "MEDIA_STREAM",
  "stream-track",
  "media-track",
  "VIDEO_FRAME",
  "zip_archive",
  "archiveBytes",
  "AUDIO_DATA"
]) {
  assert.equal(isSafeIframePayload({ outer: { inner: { [alias]: "forbidden" } } }), false, `${alias} alias must be forbidden at every depth`);
}
assert.equal(isSafeIframePayload({
  landmarks: [{ name: "nose", x: 0.1, y: 0.2, confidence: 0.9 }],
  sourceFrameId: "epoch:1",
  telemetry: {
    score: 2,
    state: "playing",
    audioPositionMs: 120,
    stream: "telemetry-channel",
    track: { rulesetId: "boxing_semantic_track_v1" }
  }
}), true);
for (const binary of [
  new ArrayBuffer(4),
  new DataView(new ArrayBuffer(4)),
  new Uint8Array([1, 2, 3]),
  new Blob(["raw"]),
  new Date()
]) {
  assert.equal(isSafeIframePayload({ data: binary }), false);
}
class UnsafePayload {}
assert.equal(isSafeIframePayload({ data: new UnsafePayload() }), false);
assert.equal(isSafeIframePayload({ [Symbol("hidden")]: "not-json" }), false);
const accessorPayload = {};
Object.defineProperty(accessorPayload, "landmarks", { enumerable: true, get() { throw new Error("validator must not execute accessors"); } });
assert.equal(isSafeIframePayload(accessorPayload), false);
assert.equal(isSafeIframePayload({ callback: () => undefined }), false);
const cyclic = {};
cyclic.self = cyclic;
assert.equal(isSafeIframePayload(cyclic), false);

const command = {
  schema: "aerobeat/game_command",
  version: 1,
  commandId: "command-1",
  type: "browse_beatsaver",
  payload: { query: "Papercut" }
};
assert.equal(isIframeMessage({
  schema: "aerobeat/iframe_message",
  version: 1,
  kind: "command",
  messageId: "message-1",
  instanceId: "game-1",
  payload: { command }
}), true);
const visualTestCommand = {
  schema: "aerobeat/game_command",
  version: 1,
  commandId: "command-test-1",
  type: "start",
  payload: { schema: "aerobeat/gameplay_session_start", version: 1, purpose: "visual_test" }
};
const visualTestMessage = {
  schema: "aerobeat/iframe_message",
  version: 1,
  kind: "command",
  messageId: "message-test-1",
  instanceId: "game-1",
  payload: { command: visualTestCommand }
};
assert.equal(isIframeMessage(visualTestMessage), true, "iframe can request bounded visual test without media or package data");
assert.equal(isIframeMessage({ ...visualTestMessage, payload: { command: { ...visualTestCommand, payload: { ...visualTestCommand.payload, package: {} } } } }), false);
assert.equal(isIframeMessage({ ...visualTestMessage, payload: { command: { ...visualTestCommand, payload: { ...visualTestCommand.payload, purpose: "test" } } } }), false);
assert.equal(isIframeMessage({ ...visualTestMessage, payload: { command: { ...visualTestCommand, type: "test", payload: null } } }), false);
let iframeStartAccessorCalled = false;
const accessorStartPayload = { ...visualTestCommand.payload };
Object.defineProperty(accessorStartPayload, "purpose", { enumerable: true, get() { iframeStartAccessorCalled = true; return "visual_test"; } });
assert.equal(isIframeMessage({ ...visualTestMessage, payload: { command: { ...visualTestCommand, payload: accessorStartPayload } } }), false);
assert.equal(iframeStartAccessorCalled, false, "iframe validation must not invoke Start payload accessors");

const event = {
  schema: "aerobeat/game_event",
  version: 1,
  eventId: "event-1",
  type: "import_changed",
  timestampMs: 100,
  payload: { progress: 0.5 }
};
assert.equal(isIframeMessage({
  schema: "aerobeat/iframe_message",
  version: 1,
  kind: "event",
  messageId: "message-2",
  instanceId: "game-1",
  payload: { event }
}), true);
assert.equal(isIframeMessage({
  schema: "aerobeat/iframe_message",
  version: 1,
  kind: "command",
  messageId: "message-command-extra",
  instanceId: "game-1",
  payload: { command: { ...command, unexpected: true } }
}), false);
assert.equal(isIframeMessage({
  schema: "aerobeat/iframe_message",
  version: 1,
  kind: "event",
  messageId: "message-event-extra",
  instanceId: "game-1",
  payload: { event: { ...event, unexpected: true } }
}), false);

assert.equal(isIframeMessage({
  schema: "aerobeat/iframe_message",
  version: 1,
  kind: "command",
  messageId: "message-3",
  instanceId: "game-1",
  payload: { command: { ...command, payload: { zipBytes: "raw" } } }
}), false);
assert.equal(isIframeMessage({
  schema: "aerobeat/iframe_message",
  version: 1,
  kind: "handshake_request",
  messageId: "message-4-valid",
  instanceId: "game-1",
  payload: { protocolVersion: 1 }
}), true);
assert.equal(isIframeMessage({
  schema: "aerobeat/iframe_message",
  version: 1,
  kind: "handshake_request",
  messageId: "message-4-mismatch",
  instanceId: "game-1",
  payload: { protocolVersion: 2 }
}), false);
assert.equal(isIframeMessage({
  schema: "aerobeat/iframe_message",
  version: 1,
  kind: "handshake_request",
  messageId: "message-4",
  instanceId: "game-1",
  payload: { protocolVersion: 1 },
  unexpected: true
}), false);
assert.equal(isIframeMessage({
  schema: "aerobeat/iframe_message",
  version: 1,
  kind: "handshake_request",
  messageId: "message-symbol",
  instanceId: "game-1",
  payload: { protocolVersion: 1 },
  [Symbol("unexpected")]: true
}), false);
assert.equal(isIframeMessage({
  schema: "aerobeat/iframe_message",
  version: 2,
  kind: "handshake_request",
  messageId: "message-5",
  instanceId: "game-1",
  payload: { protocolVersion: 2 }
}), false);

console.log("Strict iframe contract and forbidden-payload validation passed.");
