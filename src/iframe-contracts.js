// @ts-check

import { hasExactKeys, isNonEmptyString, isOneOf, isRecord } from "./contract-guards.js";
import { isGameCommand, isGameEvent } from "./host-contracts.js";

/**
 * @typedef {"handshake_request" | "handshake_ack" | "command" | "event" | "error" | "disconnect"} AeroIframeMessageKind
 */

/**
 * @typedef {Object} AeroIframeMessage
 * @property {"aerobeat/iframe_message"} schema Schema ID.
 * @property {1} version Protocol version.
 * @property {AeroIframeMessageKind} kind Message kind.
 * @property {string} messageId Message identity.
 * @property {string} instanceId Child game instance identity.
 * @property {Readonly<Record<string, unknown>> | null} payload Structured payload without media/binary data.
 */

/** @type {readonly AeroIframeMessageKind[]} */
export const iframeMessageKinds = Object.freeze([
  "handshake_request",
  "handshake_ack",
  "command",
  "event",
  "error",
  "disconnect"
]);

export const iframeProtocol = Object.freeze({
  schema: "aerobeat/iframe_message",
  version: 1,
  target: "immediate_parent",
  rawMediaAllowed: false
});

/** @type {readonly string[]} */
export const forbiddenIframePayloadKeys = Object.freeze([
  "audioBytes",
  "frame",
  "frames",
  "imageBitmap",
  "mediaStream",
  "mediaStreamTrack",
  "pixels",
  "rawAudio",
  "rawFrame",
  "rawFrames",
  "screenshot",
  "videoFrame",
  "zipBytes"
]);

const forbiddenIframePayloadKeyAliases = new Set([
  "archive",
  "archivebuffer",
  "archivebytes",
  "archivedata",
  "audiobuffer",
  "audiobytes",
  "audiodata",
  "audiotrack",
  "cameraframe",
  "cameraframes",
  "frame",
  "framedata",
  "framebuffer",
  "frames",
  "imagebitmap",
  "imagepixels",
  "mediastream",
  "mediastreamtrack",
  "mediatrack",
  "pixel",
  "pixelbuffer",
  "pixeldata",
  "pixels",
  "rawaudio",
  "rawcameraframe",
  "rawcameraframes",
  "rawframe",
  "rawframes",
  "screencapture",
  "screenshot",
  "screenshotbytes",
  "screenshotdata",
  "screenshots",
  "stream",
  "streamtrack",
  "track",
  "videoframe",
  "videoframes",
  "videotrack",
  "zip",
  "ziparchive",
  "zipbuffer",
  "zipbytes",
  "zipdata"
]);

/**
 * @param {string} key
 * @returns {boolean}
 */
function isForbiddenIframePayloadKey(key) {
  const canonicalKey = key.toLowerCase().replace(/[^a-z0-9]/gu, "");
  return forbiddenIframePayloadKeyAliases.has(canonicalKey);
}

/**
 * @param {unknown} value
 * @param {Set<object>} seen
 * @returns {boolean}
 */
function isBridgeValue(value, seen) {
  if (value === null || typeof value === "string" || typeof value === "boolean") {
    return true;
  }
  if (typeof value === "number") {
    return Number.isFinite(value);
  }
  if (Array.isArray(value)) {
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    const valid = value.every((item) => isBridgeValue(item, seen));
    seen.delete(value);
    return valid;
  }
  if (!isRecord(value)) {
    return false;
  }
  if (seen.has(value)) {
    return false;
  }
  const keys = Reflect.ownKeys(value);
  if (keys.some((key) => {
    if (typeof key !== "string") {
      return true;
    }
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    return descriptor === undefined || !descriptor.enumerable || !("value" in descriptor);
  })) {
    return false;
  }
  seen.add(value);
  for (const key of keys) {
    const entry = value[/** @type {string} */ (key)];
    if (isForbiddenIframePayloadKey(/** @type {string} */ (key)) || !isBridgeValue(entry, seen)) {
      seen.delete(value);
      return false;
    }
  }
  seen.delete(value);
  return true;
}

/**
 * Verify that a bridge payload is bounded to JSON-like records and contains no raw
 * frame, archive, audio, pixel, screenshot, stream, or transferable objects.
 *
 * @param {unknown} value
 * @returns {boolean}
 */
export function isSafeIframePayload(value) {
  return value === null || (isRecord(value) && isBridgeValue(value, new Set()));
}

/**
 * @param {unknown} value
 * @returns {value is AeroIframeMessage}
 */
export function isIframeMessage(value) {
  if (!hasExactKeys(value, ["schema", "version", "kind", "messageId", "instanceId", "payload"])) {
    return false;
  }
  if (
    value.schema !== "aerobeat/iframe_message" ||
    value.version !== 1 ||
    !isOneOf(value.kind, iframeMessageKinds) ||
    !isNonEmptyString(value.messageId) ||
    !isNonEmptyString(value.instanceId) ||
    !isSafeIframePayload(value.payload)
  ) {
    return false;
  }
  if (value.kind === "handshake_request") {
    return hasExactKeys(value.payload, ["protocolVersion"]) &&
      value.payload.protocolVersion === 1;
  }
  if (value.kind === "handshake_ack") {
    return hasExactKeys(value.payload, ["protocolVersion", "accepted"]) &&
      value.payload.protocolVersion === 1 &&
      typeof value.payload.accepted === "boolean";
  }
  if (value.kind === "command") {
    return hasExactKeys(value.payload, ["command"]) &&
      isGameCommand(value.payload.command);
  }
  if (value.kind === "event") {
    return hasExactKeys(value.payload, ["event"]) &&
      isGameEvent(value.payload.event);
  }
  return true;
}
