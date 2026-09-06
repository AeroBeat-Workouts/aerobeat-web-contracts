// @ts-check

/** Maximum accepted authored/runtime timeline: exactly 24 hours. */
export const maximumAuthoredTimelineMs = 24 * 60 * 60 * 1_000;
/** Defensive maximum number of tempo or time-signature segments. */
export const maximumTimingSegments = 4_096;

/**
 * @typedef {Object} AeroTempoSegment
 * @property {number} startBeat Non-negative authored beat where this tempo begins.
 * @property {number} bpm Finite positive beats per minute.
 */

/**
 * @typedef {Object} AeroTimeSignatureSegment
 * @property {number} startBeat Non-negative authored beat where this signature begins.
 * @property {number} numerator Positive safe integer.
 * @property {number} denominator Positive safe integer.
 */

/**
 * Current authored song timing shape. Non-empty stop segments are deliberately
 * unsupported: no accepted stop record semantics exist in the current package
 * schema, so guessing a shape or silently ignoring one would corrupt time.
 *
 * @typedef {Object} AeroAuthoredSongTiming
 * @property {number} anchorMs Non-negative timeline anchor, bounded to 24 hours.
 * @property {readonly AeroTempoSegment[]} tempoSegments Strictly ordered segments beginning at beat zero.
 * @property {readonly never[]} stopSegments Must be empty until a stop schema is explicitly versioned.
 * @property {readonly AeroTimeSignatureSegment[]} timeSignatureSegments Strictly ordered segments beginning at beat zero.
 */

/**
 * @param {unknown} value
 * @returns {value is AeroAuthoredSongTiming}
 */
export function isAuthoredSongTiming(value) {
  if (!hasExactDataObject(value, ["anchorMs", "tempoSegments", "stopSegments", "timeSignatureSegments"]) ||
      !isBoundedTimelineNumber(value.anchorMs) ||
      !isExactArray(value.tempoSegments, 1, maximumTimingSegments) ||
      !isExactArray(value.stopSegments, 0, 0) ||
      !isExactArray(value.timeSignatureSegments, 1, maximumTimingSegments)) return false;

  let previousBeat = -1;
  let elapsedMs = Number(value.anchorMs);
  for (let index = 0; index < value.tempoSegments.length; index += 1) {
    const segment = value.tempoSegments[index];
    if (!hasExactDataObject(segment, ["startBeat", "bpm"]) ||
        !isBoundedBeat(segment.startBeat) || typeof segment.bpm !== "number" || !Number.isFinite(segment.bpm) || segment.bpm <= 0 ||
        (index === 0 ? segment.startBeat !== 0 : segment.startBeat <= previousBeat)) return false;
    if (index > 0) {
      const prior = value.tempoSegments[index - 1];
      if (prior === undefined) return false;
      elapsedMs += (Number(segment.startBeat) - Number(prior.startBeat)) * 60_000 / Number(prior.bpm);
      if (!Number.isFinite(elapsedMs) || elapsedMs > maximumAuthoredTimelineMs) return false;
    }
    previousBeat = Number(segment.startBeat);
  }

  previousBeat = -1;
  for (let index = 0; index < value.timeSignatureSegments.length; index += 1) {
    const segment = value.timeSignatureSegments[index];
    if (!hasExactDataObject(segment, ["startBeat", "numerator", "denominator"]) ||
        !isBoundedBeat(segment.startBeat) || !Number.isSafeInteger(segment.numerator) || Number(segment.numerator) <= 0 ||
        !Number.isSafeInteger(segment.denominator) || Number(segment.denominator) <= 0 ||
        (index === 0 ? segment.startBeat !== 0 : segment.startBeat <= previousBeat)) return false;
    previousBeat = Number(segment.startBeat);
  }
  return true;
}

/**
 * Validate and snapshot one timing record, then return its canonical piecewise
 * authored-beat-to-timeline mapper. Later caller mutation cannot change results.
 *
 * @param {unknown} timing
 * @returns {(beat: number) => number}
 */
export function createAuthoredBeatToTimelineMs(timing) {
  if (!isAuthoredSongTiming(timing)) throw new TypeError("Invalid authored song timing");
  const anchorMs = normalizeZero(timing.anchorMs);
  const segments = timing.tempoSegments.map((segment) => Object.freeze({ startBeat: normalizeZero(segment.startBeat), bpm: segment.bpm }));

  return Object.freeze((beat) => {
    if (!isBoundedBeat(beat)) throw new RangeError("Authored beat must be finite, non-negative, and safely bounded");
    const targetBeat = normalizeZero(beat);
    let timelineMs = anchorMs;
    for (let index = 0; index < segments.length; index += 1) {
      const segment = segments[index];
      const next = segments[index + 1];
      if (segment === undefined || targetBeat <= segment.startBeat) break;
      const endBeat = next === undefined ? targetBeat : Math.min(targetBeat, next.startBeat);
      timelineMs += (endBeat - segment.startBeat) * 60_000 / segment.bpm;
      if (!Number.isFinite(timelineMs) || timelineMs > maximumAuthoredTimelineMs) throw new RangeError("Authored beat exceeds the 24-hour timeline");
      if (next === undefined || targetBeat <= next.startBeat) break;
    }
    return normalizeZero(timelineMs);
  });
}

/**
 * One-shot canonical conversion. Prefer `createAuthoredBeatToTimelineMs` when
 * mapping multiple beats from the same validated timing record.
 *
 * @param {unknown} timing
 * @param {number} beat
 * @returns {number}
 */
export function authoredBeatToTimelineMs(timing, beat) {
  return createAuthoredBeatToTimelineMs(timing)(beat);
}

/** @param {unknown} value */
function isBoundedTimelineNumber(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= maximumAuthoredTimelineMs;
}

/** @param {unknown} value */
function isBoundedBeat(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= Number.MAX_SAFE_INTEGER;
}

/** @param {number} value */
function normalizeZero(value) {
  return Object.is(value, -0) ? 0 : value;
}

/**
 * @param {unknown} value
 * @param {number} minimumLength
 * @param {number} maximumLength
 * @returns {value is readonly unknown[]}
 */
function isExactArray(value, minimumLength, maximumLength) {
  if (!Array.isArray(value) || Object.getPrototypeOf(value) !== Array.prototype || value.length < minimumLength || value.length > maximumLength) return false;
  const keys = Reflect.ownKeys(value);
  if (keys.length !== value.length + 1 || !keys.includes("length")) return false;
  for (let index = 0; index < value.length; index += 1) {
    const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
    if (descriptor === undefined || !descriptor.enumerable || !("value" in descriptor)) return false;
  }
  return true;
}

/**
 * @param {unknown} value
 * @param {readonly string[]} expectedKeys
 * @returns {value is Readonly<Record<string, unknown>>}
 */
function hasExactDataObject(value, expectedKeys) {
  if (typeof value !== "object" || value === null || Array.isArray(value) || Object.getPrototypeOf(value) !== Object.prototype) return false;
  const keys = Reflect.ownKeys(value);
  return keys.length === expectedKeys.length && keys.every((key) => {
    if (typeof key !== "string" || !expectedKeys.includes(key)) return false;
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    return descriptor !== undefined && descriptor.enumerable && "value" in descriptor;
  });
}
