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
assert.equal(isSafeIframePayload({ landmarks: [{ x: 0.1, y: 0.2 }], score: 2, state: "playing" }), true);
assert.equal(isSafeIframePayload({ bytes: new Uint8Array([1, 2, 3]) }), false);
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
  version: 2,
  kind: "handshake_request",
  messageId: "message-5",
  instanceId: "game-1",
  payload: { protocolVersion: 2 }
}), false);

console.log("Strict iframe contract and forbidden-payload validation passed.");
