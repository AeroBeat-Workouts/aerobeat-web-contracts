// @ts-check

import { isNonEmptyString, isOneOf, isRecord } from "./contract-guards.js";
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
  seen.add(value);
  for (const [key, entry] of Object.entries(value)) {
    if (forbiddenIframePayloadKeys.includes(key) || !isBridgeValue(entry, seen)) {
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
  if (!isRecord(value)) {
    return false;
  }
  const exactKeys = ["schema", "version", "kind", "messageId", "instanceId", "payload"];
  if (Object.keys(value).length !== exactKeys.length || !Object.keys(value).every((key) => exactKeys.includes(key))) {
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
    return isRecord(value.payload) &&
      Object.keys(value.payload).length === 1 &&
      value.payload.protocolVersion === 1;
  }
  if (value.kind === "handshake_ack") {
    return isRecord(value.payload) &&
      Object.keys(value.payload).length === 2 &&
      value.payload.protocolVersion === 1 &&
      typeof value.payload.accepted === "boolean";
  }
  if (value.kind === "command") {
    return isRecord(value.payload) &&
      Object.keys(value.payload).length === 1 &&
      isGameCommand(value.payload.command);
  }
  if (value.kind === "event") {
    return isRecord(value.payload) &&
      Object.keys(value.payload).length === 1 &&
      isGameEvent(value.payload.event);
  }
  return true;
}
