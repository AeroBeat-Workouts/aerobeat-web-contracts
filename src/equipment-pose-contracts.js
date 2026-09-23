// @ts-check

import { hasExactKeys, isFiniteNumber, isNonEmptyString } from "./contract-guards.js";
import { gloveGeometry, saberGeometry } from "./equipment-contracts.js";

const NORMALIZED_EPSILON = 1e-12;
const SLERP_LINEAR_THRESHOLD = 0.9995;

/** @typedef {Readonly<{x: number, y: number, z: number}>} AeroVector3 */
/** @typedef {Readonly<{x: number, y: number, z: number, w: number}>} AeroQuaternion */
/** @typedef {"left_wrist" | "right_wrist"} AeroEquipmentRole */
/** @typedef {"flow" | "boxing"} AeroEquipmentMode */
/** @typedef {"aerobeat/saber_capsule_v1" | "aerobeat/glove_obb_v1"} AeroEquipmentGeometryIdentity */

/**
 * Hash identity supplied by the config/integrity owner. This package owns the
 * canonical hash input, but deliberately does not own a crypto implementation.
 *
 * @typedef {Object} AeroEquipmentConfigIdentity
 * @property {"aerobeat/equipment_config_identity"} schema
 * @property {1} version
 * @property {"sha256"} algorithm
 * @property {string} value Lowercase hexadecimal SHA-256.
 */

/**
 * Exact private per-frame equipment pose shared by gameplay and renderer.
 * No scalar rotation alias is valid in this record.
 *
 * @typedef {Object} AeroResolvedEquipmentPose
 * @property {AeroEquipmentRole} role
 * @property {AeroEquipmentMode} mode
 * @property {AeroVector3} anchor Judge-space anchor.
 * @property {number} scale Positive uniform scale.
 * @property {AeroQuaternion} orientation Normalized world orientation.
 * @property {AeroEquipmentGeometryIdentity} geometryIdentity
 * @property {AeroEquipmentConfigIdentity} configIdentity
 */

/** @typedef {Readonly<{start: AeroQuaternion, target: AeroQuaternion}>} AeroFixedQuaternionEndpoints */
/** @typedef {Readonly<{start: AeroResolvedEquipmentPose, target: AeroResolvedEquipmentPose}>} AeroFixedEquipmentPoseEndpoints */

/** Canonical local +X saber capsule descriptor. */
export const saberCapsuleGeometry = Object.freeze({
  identity: /** @type {const} */ ("aerobeat/saber_capsule_v1"),
  kind: /** @type {const} */ ("capsule"),
  start: Object.freeze({ x: 0, y: 0, z: 0 }),
  end: Object.freeze({ x: saberGeometry.length, y: 0, z: 0 }),
  radius: saberGeometry.radius
});

/** Canonical glove OBB descriptor in its local frame. */
export const gloveObbGeometry = Object.freeze({
  identity: /** @type {const} */ ("aerobeat/glove_obb_v1"),
  kind: /** @type {const} */ ("obb"),
  center: Object.freeze({ x: 0, y: 0, z: gloveGeometry.offsetZ }),
  axes: Object.freeze({
    x: Object.freeze({ x: 1, y: 0, z: 0 }),
    y: Object.freeze({ x: 0, y: 1, z: 0 }),
    z: Object.freeze({ x: 0, y: 0, z: 1 })
  }),
  halfExtents: Object.freeze({ x: gloveGeometry.x, y: gloveGeometry.y, z: gloveGeometry.z })
});

/** @param {unknown} value @returns {value is AeroVector3} */
export function isEquipmentVector3(value) {
  return hasExactKeys(value, ["x", "y", "z"]) &&
    isFiniteNumber(value.x) && isFiniteNumber(value.y) && isFiniteNumber(value.z);
}

/** @param {unknown} value @returns {value is AeroQuaternion} */
export function isNormalizedEquipmentQuaternion(value) {
  if (!hasExactKeys(value, ["x", "y", "z", "w"]) ||
      !isFiniteNumber(value.x) || !isFiniteNumber(value.y) ||
      !isFiniteNumber(value.z) || !isFiniteNumber(value.w)) return false;
  const lengthSquared = value.x * value.x + value.y * value.y + value.z * value.z + value.w * value.w;
  return lengthSquared > 0 && Math.abs(lengthSquared - 1) <= NORMALIZED_EPSILON;
}

/** @param {unknown} value @returns {value is AeroEquipmentConfigIdentity} */
export function isEquipmentConfigIdentity(value) {
  return hasExactKeys(value, ["schema", "version", "algorithm", "value"]) &&
    value.schema === "aerobeat/equipment_config_identity" && value.version === 1 &&
    value.algorithm === "sha256" && typeof value.value === "string" &&
    /^[0-9a-f]{64}$/u.test(value.value);
}

/** @param {unknown} value @returns {value is AeroResolvedEquipmentPose} */
export function isResolvedEquipmentPose(value) {
  if (!hasExactKeys(value, ["role", "mode", "anchor", "scale", "orientation", "geometryIdentity", "configIdentity"])) return false;
  const roleValid = value.role === "left_wrist" || value.role === "right_wrist";
  const modeValid = value.mode === "flow" || value.mode === "boxing";
  const expectedGeometry = value.mode === "flow" ? saberCapsuleGeometry.identity : gloveObbGeometry.identity;
  return roleValid && modeValid && isEquipmentVector3(value.anchor) &&
    isFiniteNumber(value.scale) && value.scale > 0 &&
    isNormalizedEquipmentQuaternion(value.orientation) &&
    value.geometryIdentity === expectedGeometry && isEquipmentConfigIdentity(value.configIdentity);
}

/** @param {unknown} value @returns {AeroEquipmentConfigIdentity} */
export function createEquipmentConfigIdentity(value) {
  if (!isEquipmentConfigIdentity(value)) throw new TypeError("equipment_config_identity_invalid");
  return Object.freeze({ schema: value.schema, version: value.version, algorithm: value.algorithm, value: value.value });
}

/** @param {unknown} value @returns {AeroQuaternion} */
export function normalizeEquipmentQuaternion(value) {
  if (!hasExactKeys(value, ["x", "y", "z", "w"]) ||
      !isFiniteNumber(value.x) || !isFiniteNumber(value.y) ||
      !isFiniteNumber(value.z) || !isFiniteNumber(value.w)) {
    throw new TypeError("equipment_quaternion_invalid");
  }
  const length = Math.hypot(value.x, value.y, value.z, value.w);
  if (length === 0) throw new TypeError("equipment_quaternion_zero");
  return canonicalizeNormalizedQuaternion({
    x: value.x / length,
    y: value.y / length,
    z: value.z / length,
    w: value.w / length
  });
}

/** @param {unknown} value @returns {AeroQuaternion} */
export function canonicalizeEquipmentQuaternion(value) {
  return canonicalizeNormalizedQuaternion(requireNormalizedQuaternion(value));
}

/** @param {AeroQuaternion} value @returns {AeroQuaternion} */
function canonicalizeNormalizedQuaternion(value) {
  let sign = 1;
  if (value.w < 0 ||
      (value.w === 0 && (value.z < 0 ||
       (value.z === 0 && (value.y < 0 ||
        (value.y === 0 && value.x < 0)))))) sign = -1;
  return Object.freeze({
    x: cleanZero(sign * value.x),
    y: cleanZero(sign * value.y),
    z: cleanZero(sign * value.z),
    w: cleanZero(sign * value.w)
  });
}

/** @param {number} value @returns {number} */
function cleanZero(value) {
  return Object.is(value, -0) || Math.abs(value) < Number.EPSILON ? 0 : value;
}

/** @param {unknown} value @returns {AeroQuaternion} */
function requireNormalizedQuaternion(value) {
  if (!isNormalizedEquipmentQuaternion(value)) throw new TypeError("equipment_quaternion_not_normalized");
  return /** @type {AeroQuaternion} */ (value);
}

/**
 * Hamilton product `left * right`; the rightmost rotation applies first.
 * @param {unknown} left
 * @param {unknown} right
 * @returns {AeroQuaternion}
 */
export function multiplyEquipmentQuaternions(left, right) {
  const a = requireNormalizedQuaternion(left);
  const b = requireNormalizedQuaternion(right);
  return normalizeEquipmentQuaternion({
    x: a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y,
    y: a.w * b.y - a.x * b.z + a.y * b.w + a.z * b.x,
    z: a.w * b.z + a.x * b.y - a.y * b.x + a.z * b.w,
    w: a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z
  });
}

/**
 * Right-handed intrinsic-local XYZ conversion: qEuler = qZ * qY * qX.
 * @param {unknown} eulerDeg
 * @returns {AeroQuaternion}
 */
export function equipmentEulerDegreesToQuaternion(eulerDeg) {
  if (!isEquipmentVector3(eulerDeg)) throw new TypeError("equipment_euler_invalid");
  const x = eulerDeg.x * Math.PI / 360;
  const y = eulerDeg.y * Math.PI / 360;
  const z = eulerDeg.z * Math.PI / 360;
  const qx = normalizeEquipmentQuaternion({ x: Math.sin(x), y: 0, z: 0, w: Math.cos(x) });
  const qy = normalizeEquipmentQuaternion({ x: 0, y: Math.sin(y), z: 0, w: Math.cos(y) });
  const qz = normalizeEquipmentQuaternion({ x: 0, y: 0, z: Math.sin(z), w: Math.cos(z) });
  return multiplyEquipmentQuaternions(multiplyEquipmentQuaternions(qz, qy), qx);
}

/**
 * Flow composition: QheadingWorld * QbaseLocal * QanimatedLocal.
 * @param {unknown} input
 * @returns {AeroQuaternion}
 */
export function resolveFlowEquipmentOrientation(input) {
  if (!hasExactKeys(input, ["headingDeg", "baseEulerDeg", "animatedEulerDeg"]) ||
      !isFiniteNumber(input.headingDeg)) throw new TypeError("flow_equipment_orientation_invalid");
  const heading = equipmentEulerDegreesToQuaternion({ x: 0, y: 0, z: input.headingDeg });
  const base = equipmentEulerDegreesToQuaternion(input.baseEulerDeg);
  const animated = equipmentEulerDegreesToQuaternion(input.animatedEulerDeg);
  return multiplyEquipmentQuaternions(multiplyEquipmentQuaternions(heading, base), animated);
}

/**
 * Boxing composition: QbaseLocal * QanimatedLocal.
 * @param {unknown} input
 * @returns {AeroQuaternion}
 */
export function resolveBoxingEquipmentOrientation(input) {
  if (!hasExactKeys(input, ["baseEulerDeg", "animatedEulerDeg"])) throw new TypeError("boxing_equipment_orientation_invalid");
  return multiplyEquipmentQuaternions(
    equipmentEulerDegreesToQuaternion(input.baseEulerDeg),
    equipmentEulerDegreesToQuaternion(input.animatedEulerDeg)
  );
}

/**
 * Shortest-path normalized quaternion interpolation.
 * @param {unknown} start
 * @param {unknown} target
 * @param {number} progress
 * @returns {AeroQuaternion}
 */
export function slerpEquipmentQuaternionShortest(start, target, progress) {
  const a = requireNormalizedQuaternion(start);
  const originalB = requireNormalizedQuaternion(target);
  if (!isFiniteNumber(progress) || progress < 0 || progress > 1) throw new RangeError("equipment_slerp_progress_invalid");
  let dot = a.x * originalB.x + a.y * originalB.y + a.z * originalB.z + a.w * originalB.w;
  const targetSign = dot < 0 ? -1 : 1;
  const b = { x: originalB.x * targetSign, y: originalB.y * targetSign, z: originalB.z * targetSign, w: originalB.w * targetSign };
  dot = Math.abs(dot);
  if (progress === 0) return normalizeEquipmentQuaternion(a);
  if (progress === 1) return normalizeEquipmentQuaternion(b);
  if (dot > SLERP_LINEAR_THRESHOLD) {
    return normalizeEquipmentQuaternion({
      x: a.x + progress * (b.x - a.x),
      y: a.y + progress * (b.y - a.y),
      z: a.z + progress * (b.z - a.z),
      w: a.w + progress * (b.w - a.w)
    });
  }
  const theta = Math.acos(Math.min(1, dot));
  const sinTheta = Math.sin(theta);
  const startWeight = Math.sin((1 - progress) * theta) / sinTheta;
  const targetWeight = Math.sin(progress * theta) / sinTheta;
  return normalizeEquipmentQuaternion({
    x: startWeight * a.x + targetWeight * b.x,
    y: startWeight * a.y + targetWeight * b.y,
    z: startWeight * a.z + targetWeight * b.z,
    w: startWeight * a.w + targetWeight * b.w
  });
}

/** @param {unknown} start @param {unknown} target @returns {AeroFixedQuaternionEndpoints} */
export function createFixedEquipmentQuaternionEndpoints(start, target) {
  return Object.freeze({
    start: normalizeEquipmentQuaternion(requireNormalizedQuaternion(start)),
    target: normalizeEquipmentQuaternion(requireNormalizedQuaternion(target))
  });
}

/** @param {unknown} endpoints @param {number} progress @returns {AeroQuaternion} */
export function resolveFixedEquipmentQuaternion(endpoints, progress) {
  if (!hasExactKeys(endpoints, ["start", "target"])) throw new TypeError("equipment_quaternion_endpoints_invalid");
  return slerpEquipmentQuaternionShortest(endpoints.start, endpoints.target, progress);
}

/** @param {unknown} start @param {unknown} target @returns {AeroFixedEquipmentPoseEndpoints} */
export function createFixedEquipmentPoseEndpoints(start, target) {
  const startPose = createResolvedEquipmentPose(start);
  const targetPose = createResolvedEquipmentPose(target);
  if (startPose.role !== targetPose.role || startPose.mode !== targetPose.mode ||
      startPose.geometryIdentity !== targetPose.geometryIdentity ||
      startPose.configIdentity.value !== targetPose.configIdentity.value) {
    throw new TypeError("equipment_pose_endpoints_identity_mismatch");
  }
  return Object.freeze({ start: startPose, target: targetPose });
}

/** @param {unknown} endpoints @param {number} progress @returns {AeroResolvedEquipmentPose} */
export function resolveFixedEquipmentPose(endpoints, progress) {
  if (!hasExactKeys(endpoints, ["start", "target"]) ||
      !isFiniteNumber(progress) || progress < 0 || progress > 1) {
    throw new TypeError("equipment_pose_endpoints_invalid");
  }
  const fixed = createFixedEquipmentPoseEndpoints(endpoints.start, endpoints.target);
  return createResolvedEquipmentPose({
    role: fixed.start.role,
    mode: fixed.start.mode,
    anchor: {
      x: fixed.start.anchor.x + (fixed.target.anchor.x - fixed.start.anchor.x) * progress,
      y: fixed.start.anchor.y + (fixed.target.anchor.y - fixed.start.anchor.y) * progress,
      z: fixed.start.anchor.z + (fixed.target.anchor.z - fixed.start.anchor.z) * progress
    },
    scale: fixed.start.scale + (fixed.target.scale - fixed.start.scale) * progress,
    orientation: slerpEquipmentQuaternionShortest(fixed.start.orientation, fixed.target.orientation, progress),
    geometryIdentity: fixed.start.geometryIdentity,
    configIdentity: fixed.start.configIdentity
  });
}

/** @param {unknown} input @returns {AeroResolvedEquipmentPose} */
export function createResolvedEquipmentPose(input) {
  if (!isResolvedEquipmentPose(input)) throw new TypeError("resolved_equipment_pose_invalid");
  return Object.freeze({
    role: input.role,
    mode: input.mode,
    anchor: Object.freeze({ x: input.anchor.x, y: input.anchor.y, z: input.anchor.z }),
    scale: input.scale,
    orientation: normalizeEquipmentQuaternion(input.orientation),
    geometryIdentity: input.geometryIdentity,
    configIdentity: Object.freeze({
      schema: input.configIdentity.schema,
      version: input.configIdentity.version,
      algorithm: input.configIdentity.algorithm,
      value: input.configIdentity.value
    })
  });
}

/** @param {AeroQuaternion} quaternion @param {AeroVector3} vector @returns {AeroVector3} */
function rotateVector(quaternion, vector) {
  const q = requireNormalizedQuaternion(quaternion);
  const tx = 2 * (q.y * vector.z - q.z * vector.y);
  const ty = 2 * (q.z * vector.x - q.x * vector.z);
  const tz = 2 * (q.x * vector.y - q.y * vector.x);
  return Object.freeze({
    x: cleanZero(vector.x + q.w * tx + (q.y * tz - q.z * ty)),
    y: cleanZero(vector.y + q.w * ty + (q.z * tx - q.x * tz)),
    z: cleanZero(vector.z + q.w * tz + (q.x * ty - q.y * tx))
  });
}

/** @param {AeroResolvedEquipmentPose} pose @param {AeroVector3} local @returns {AeroVector3} */
function transformPoint(pose, local) {
  const rotated = rotateVector(pose.orientation, { x: local.x * pose.scale, y: local.y * pose.scale, z: local.z * pose.scale });
  return Object.freeze({ x: pose.anchor.x + rotated.x, y: pose.anchor.y + rotated.y, z: pose.anchor.z + rotated.z });
}

/**
 * Resolve world/judge-space saber capsule endpoints, axis, and scaled radius.
 * @param {unknown} value
 * @returns {Readonly<{geometryIdentity: "aerobeat/saber_capsule_v1", start: AeroVector3, end: AeroVector3, axis: AeroVector3, radius: number}>}
 */
export function resolveSaberCapsule(value) {
  const pose = createResolvedEquipmentPose(value);
  if (pose.mode !== "flow") throw new TypeError("saber_pose_mode_invalid");
  const start = transformPoint(pose, saberCapsuleGeometry.start);
  const end = transformPoint(pose, saberCapsuleGeometry.end);
  const axis = rotateVector(pose.orientation, { x: 1, y: 0, z: 0 });
  return Object.freeze({ geometryIdentity: saberCapsuleGeometry.identity, start, end, axis, radius: saberCapsuleGeometry.radius * pose.scale });
}

/**
 * Resolve world/judge-space glove OBB center, orthonormal axes, and scaled half-extents.
 * @param {unknown} value
 * @returns {Readonly<{geometryIdentity: "aerobeat/glove_obb_v1", center: AeroVector3, axes: Readonly<{x: AeroVector3, y: AeroVector3, z: AeroVector3}>, halfExtents: AeroVector3}>}
 */
export function resolveGloveObb(value) {
  const pose = createResolvedEquipmentPose(value);
  if (pose.mode !== "boxing") throw new TypeError("glove_pose_mode_invalid");
  return Object.freeze({
    geometryIdentity: gloveObbGeometry.identity,
    center: transformPoint(pose, gloveObbGeometry.center),
    axes: Object.freeze({
      x: rotateVector(pose.orientation, gloveObbGeometry.axes.x),
      y: rotateVector(pose.orientation, gloveObbGeometry.axes.y),
      z: rotateVector(pose.orientation, gloveObbGeometry.axes.z)
    }),
    halfExtents: Object.freeze({
      x: gloveObbGeometry.halfExtents.x * pose.scale,
      y: gloveObbGeometry.halfExtents.y * pose.scale,
      z: gloveObbGeometry.halfExtents.z * pose.scale
    })
  });
}

/**
 * Stable canonical UTF-8 hash input. The config must already be canonical JSON;
 * this wrapper locks schema/version plus geometry identities into score identity.
 * @param {unknown} input
 * @returns {string}
 */
export function equipmentConfigIdentityInput(input) {
  if (!hasExactKeys(input, ["configSchema", "configVersion", "canonicalConfigJson"]) ||
      input.configSchema !== "aerobeat/equipment_config" || input.configVersion !== 2 ||
      !isNonEmptyString(input.canonicalConfigJson)) throw new TypeError("equipment_config_identity_input_invalid");
  let parsed;
  try {
    parsed = JSON.parse(input.canonicalConfigJson);
  } catch {
    throw new TypeError("equipment_config_identity_json_invalid");
  }
  if (canonicalJson(parsed) !== input.canonicalConfigJson) throw new TypeError("equipment_config_identity_json_not_canonical");
  return JSON.stringify({
    schema: "aerobeat/equipment_config_identity_input",
    version: 1,
    configSchema: input.configSchema,
    configVersion: input.configVersion,
    geometryIdentities: [saberCapsuleGeometry.identity, gloveObbGeometry.identity],
    canonicalConfigJson: input.canonicalConfigJson
  });
}

/** @param {unknown} value @returns {string} */
function canonicalJson(value) {
  if (value === null || typeof value === "boolean" || typeof value === "string") return JSON.stringify(value);
  if (isFiniteNumber(value)) return JSON.stringify(Object.is(value, -0) ? 0 : value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (typeof value !== "object" || value === null || Object.getPrototypeOf(value) !== Object.prototype) throw new TypeError("equipment_config_identity_json_invalid");
  const keys = Reflect.ownKeys(value);
  if (keys.some((key) => typeof key !== "string")) throw new TypeError("equipment_config_identity_json_invalid");
  for (const key of keys) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (descriptor === undefined || !("value" in descriptor) || !descriptor.enumerable) throw new TypeError("equipment_config_identity_json_invalid");
  }
  keys.sort();
  return `{${keys.map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
}

/**
 * Canonical ASCII bytes for sign-equivalent normalized quaternion identities.
 * @param {unknown} value
 * @returns {readonly number[]}
 */
export function canonicalEquipmentQuaternionBytes(value) {
  const quaternion = normalizeEquipmentQuaternion(requireNormalizedQuaternion(value));
  const text = JSON.stringify([quaternion.x, quaternion.y, quaternion.z, quaternion.w]);
  return Object.freeze(Array.from(text, (character) => character.charCodeAt(0)));
}
