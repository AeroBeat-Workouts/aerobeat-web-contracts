// @ts-check

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  canonicalEquipmentQuaternionBytes,
  canonicalizeEquipmentQuaternion,
  createEquipmentConfigIdentity,
  createFixedEquipmentPoseEndpoints,
  createFixedEquipmentQuaternionEndpoints,
  createResolvedEquipmentPose,
  equipmentConfigIdentityInput,
  equipmentEulerDegreesToQuaternion,
  equipmentMarkerVisibility,
  gloveGeometry,
  gloveObbGeometry,
  isEquipmentConfigIdentity,
  isNormalizedEquipmentQuaternion,
  isResolvedEquipmentPose,
  judgeColumnCenters,
  judgeToPresentationPoint,
  multiplyEquipmentQuaternions,
  normalizeEquipmentQuaternion,
  presentationColumnCenters,
  resolveBoxingEquipmentOrientation,
  resolveFixedEquipmentPose,
  resolveFixedEquipmentQuaternion,
  resolveFlowEquipmentOrientation,
  resolveGloveObb,
  resolveSaberCapsule,
  saberCapsuleGeometry,
  saberGeometry,
  slerpEquipmentQuaternionShortest
} from "../src/index.js";

// GATE 1 (2026-09-17) locked geometry, JUDGE-SPACE WU:
// flow saber capsule 0.75 x 0.18; boxing glove box 0.34 x 0.28 x 0.34 with
// +0.05 grid-facing offset.
assert.equal(saberGeometry.length, 0.75, "saber capsule length is 0.75 WU");
assert.equal(saberGeometry.radius, 0.18, "saber capsule radius is 0.18 WU");
assert.deepEqual(Object.keys(saberGeometry).sort(), ["length", "radius"], "saber spec stores geometry only; direction comes from gameplay at runtime");
assert.equal(gloveGeometry.x, 0.34, "glove box half-extent x (thumb side) is 0.34 WU");
assert.equal(gloveGeometry.y, 0.28, "glove box half-extent y (up) is 0.28 WU");
assert.equal(gloveGeometry.z, 0.34, "glove box half-extent z (grid-facing) is 0.34 WU");
assert.equal(gloveGeometry.offsetZ, 0.05, "glove center offset is +0.05 WU grid-facing");

// The spec constants are frozen and their nested records too (match the
// repo-wide Object.freeze contract-posture).
assert.equal(Object.isFrozen(saberGeometry), true, "saber geometry is frozen");
assert.equal(Object.isFrozen(gloveGeometry), true, "glove geometry is frozen");
assert.equal(Object.isFrozen(equipmentMarkerVisibility), true, "marker-visibility record is frozen");
for (const mode of ["flow", "boxing"]) {
  assert.equal(Object.isFrozen(equipmentMarkerVisibility[mode]), true, `${mode} marker visibility is frozen`);
}
assert.equal(Object.isFrozen(judgeColumnCenters), true);
assert.equal(Object.isFrozen(presentationColumnCenters), true);
assert.throws(
  () => { saberGeometry.length = 1; },
  (error) => error instanceof TypeError,
  "saber geometry rejects mutation in strict modules"
);
assert.throws(
  () => { gloveGeometry.offsetZ = 0; },
  (error) => error instanceof TypeError,
  "glove geometry rejects mutation in strict modules"
);
assert.throws(
  () => { equipmentMarkerVisibility.flow.nose = "visible"; },
  (error) => error instanceof TypeError,
  "nested marker-visibility records reject mutation"
);

// Marker-visibility contract: equipment modes hide all legacy markers
// (wrist dots + nose). Obstacle nose detection is unaffected — this record
// governs marker VISIBILITY only.
assert.deepEqual(equipmentMarkerVisibility.flow, {
  left_wrist: "hidden",
  right_wrist: "hidden",
  nose: "hidden"
});
assert.deepEqual(equipmentMarkerVisibility.boxing, {
  left_wrist: "hidden",
  right_wrist: "hidden",
  nose: "hidden"
});

// Presentation helper: judge column centers 0..3 map exactly to
// presentation columnX [-1.5, -0.5, 0.5, 1.5] (judge X - 1.5, Y unchanged).
assert.deepEqual(judgeColumnCenters, [0, 1, 2, 3]);
assert.deepEqual(presentationColumnCenters, [-1.5, -0.5, 0.5, 1.5]);
judgeColumnCenters.forEach((judgeX, column) => {
  const projected = judgeToPresentationPoint({ x: judgeX, y: 1 });
  assert.equal(projected.x, presentationColumnCenters[column], `judge column ${column} maps to presentation ${presentationColumnCenters[column]}`);
  assert.equal(projected.y, 1, "Y is unchanged by the judge-to-presentation shift");
  assert.equal(Object.isFrozen(projected), true, "projected points are frozen");
});
// Off-column judge points shift by the same -1.5 constant (one WU per cell).
assert.deepEqual(judgeToPresentationPoint({ x: 0.5, y: 0.5 }), { x: -1, y: 0.5 });
assert.deepEqual(judgeToPresentationPoint({ x: 3.25, y: -0.72 }), { x: 1.75, y: -0.72 });
// Input guard: non-finite or malformed points reject with a stable tag.
for (const invalid of [
  { x: Number.NaN, y: 0 },
  { x: 0, y: Number.POSITIVE_INFINITY },
  { x: 0, y: undefined },
  {},
  null,
  "point",
  [0, 0]
]) {
  assert.throws(
    () => judgeToPresentationPoint(invalid),
    (error) => error instanceof TypeError && error.message === "equipment_judge_point_invalid",
    `malformed point ${JSON.stringify(invalid)} must reject`
  );
}

// 0.0.67 canonical equipment pose authority.
const EPSILON = 1e-12;
const approx = (actual, expected, message) => assert.ok(Math.abs(actual - expected) <= EPSILON, `${message}: expected ${expected}, got ${actual}`);
const approxQuaternion = (actual, expected, message) => {
  for (const key of ["x", "y", "z", "w"]) approx(actual[key], expected[key], `${message}.${key}`);
};
const assertDeepFrozen = (value, message) => {
  if (typeof value !== "object" || value === null) return;
  assert.equal(Object.isFrozen(value), true, message);
  for (const child of Object.values(value)) assertDeepFrozen(child, message);
};
const SQRT_HALF = Math.SQRT1_2;
const identityQuaternion = Object.freeze({ x: 0, y: 0, z: 0, w: 1 });
const configIdentity = Object.freeze({
  schema: "aerobeat/equipment_config_identity",
  version: 1,
  algorithm: "sha256",
  value: "a".repeat(64)
});

assert.deepEqual(equipmentEulerDegreesToQuaternion({ x: 0, y: 0, z: 0 }), identityQuaternion);
approxQuaternion(equipmentEulerDegreesToQuaternion({ x: 90, y: 0, z: 0 }), { x: SQRT_HALF, y: 0, z: 0, w: SQRT_HALF }, "X rotation");
approxQuaternion(equipmentEulerDegreesToQuaternion({ x: 0, y: 90, z: 0 }), { x: 0, y: SQRT_HALF, z: 0, w: SQRT_HALF }, "Y rotation");
approxQuaternion(equipmentEulerDegreesToQuaternion({ x: 0, y: 0, z: 90 }), { x: 0, y: 0, z: SQRT_HALF, w: SQRT_HALF }, "Z rotation");

// Golden intrinsic-local XYZ formula, independently expanded for 30/40/50 degrees.
const hx = 15 * Math.PI / 180;
const hy = 20 * Math.PI / 180;
const hz = 25 * Math.PI / 180;
const sx = Math.sin(hx), cx = Math.cos(hx), sy = Math.sin(hy), cy = Math.cos(hy), sz = Math.sin(hz), cz = Math.cos(hz);
approxQuaternion(equipmentEulerDegreesToQuaternion({ x: 30, y: 40, z: 50 }), {
  x: sx * cy * cz - cx * sy * sz,
  y: cx * sy * cz + sx * cy * sz,
  z: cx * cy * sz - sx * sy * cz,
  w: cx * cy * cz + sx * sy * sz
}, "combined XYZ rotation");

const flowOrientation = resolveFlowEquipmentOrientation({
  headingDeg: 90,
  baseEulerDeg: { x: 30, y: 0, z: 0 },
  animatedEulerDeg: { x: 0, y: 40, z: 0 }
});
const expectedFlow = multiplyEquipmentQuaternions(
  multiplyEquipmentQuaternions(
    equipmentEulerDegreesToQuaternion({ x: 0, y: 0, z: 90 }),
    equipmentEulerDegreesToQuaternion({ x: 30, y: 0, z: 0 })
  ),
  equipmentEulerDegreesToQuaternion({ x: 0, y: 40, z: 0 })
);
approxQuaternion(flowOrientation, expectedFlow, "Flow heading * base * animated");
const boxingOrientation = resolveBoxingEquipmentOrientation({
  baseEulerDeg: { x: 30, y: 40, z: 0 },
  animatedEulerDeg: { x: 0, y: 0, z: 50 }
});
approxQuaternion(boxingOrientation, multiplyEquipmentQuaternions(
  equipmentEulerDegreesToQuaternion({ x: 30, y: 40, z: 0 }),
  equipmentEulerDegreesToQuaternion({ x: 0, y: 0, z: 50 })
), "Boxing base * animated");

// q and -q are the same orientation and produce identical canonical bytes.
const signed = equipmentEulerDegreesToQuaternion({ x: 23, y: -71, z: 179 });
const negated = Object.freeze({ x: -signed.x, y: -signed.y, z: -signed.z, w: -signed.w });
assert.deepEqual(normalizeEquipmentQuaternion(signed), normalizeEquipmentQuaternion(negated));
assert.deepEqual(canonicalizeEquipmentQuaternion(signed), canonicalizeEquipmentQuaternion(negated));
assert.deepEqual(canonicalEquipmentQuaternionBytes(signed), canonicalEquipmentQuaternionBytes(negated));
assert.deepEqual(
  canonicalEquipmentQuaternionBytes({ x: -1, y: -0, z: -0, w: 0 }),
  canonicalEquipmentQuaternionBytes({ x: 1, y: 0, z: 0, w: -0 }),
  "180-degree sign equivalence canonicalizes signed zero"
);
assert.equal(Object.isFrozen(canonicalEquipmentQuaternionBytes(signed)), true);

// +170 to -170 travels 20 degrees through ±180, not 340 degrees through zero.
const plus170 = equipmentEulerDegreesToQuaternion({ x: 0, y: 0, z: 170 });
const minus170 = equipmentEulerDegreesToQuaternion({ x: 0, y: 0, z: -170 });
const at180 = slerpEquipmentQuaternionShortest(plus170, minus170, 0.5);
approx(Math.abs(at180.z), 1, "shortest-path midpoint z");
approx(at180.w, 0, "shortest-path midpoint w");

const endpoints = createFixedEquipmentQuaternionEndpoints(plus170, minus170);
const dense = Array.from({ length: 101 }, (_, index) => resolveFixedEquipmentQuaternion(endpoints, index / 100));
const sparse = [0, 0.25, 0.5, 0.75, 1].map((progress) => resolveFixedEquipmentQuaternion(endpoints, progress));
for (const [index, progress] of [0, 0.25, 0.5, 0.75, 1].entries()) {
  approxQuaternion(sparse[index], dense[Math.round(progress * 100)], `dense/sparse fixed endpoint ${progress}`);
}
assertDeepFrozen(endpoints, "fixed endpoints are deeply frozen");

const flowPose = createResolvedEquipmentPose({
  role: "left_wrist",
  mode: "flow",
  anchor: { x: 1, y: 2, z: 3 },
  scale: 1,
  orientation: equipmentEulerDegreesToQuaternion({ x: 0, y: 0, z: 90 }),
  geometryIdentity: "aerobeat/saber_capsule_v1",
  configIdentity
});
assertDeepFrozen(flowPose, "resolved Flow pose is deeply frozen");
assert.deepEqual(Object.keys(flowPose), ["role", "mode", "anchor", "scale", "orientation", "geometryIdentity", "configIdentity"]);
assert.equal("rotationZ" in flowPose, false);
assert.equal("rotationZDeg" in flowPose, false);
const saberAtOne = resolveSaberCapsule(flowPose);
approxQuaternion({ ...saberAtOne.axis, w: 0 }, { x: 0, y: 1, z: 0, w: 0 }, "scale-one saber axis");
assert.deepEqual(saberAtOne.start, { x: 1, y: 2, z: 3 });
approx(saberAtOne.end.x, 1, "scale-one saber endpoint x");
approx(saberAtOne.end.y, 2.75, "scale-one saber endpoint y");
approx(saberAtOne.end.z, 3, "scale-one saber endpoint z");
approx(saberAtOne.radius, 0.18, "scale-one saber radius");
const saberAtTwo = resolveSaberCapsule({ ...flowPose, scale: 2 });
approx(saberAtTwo.end.y, 3.5, "scale-two saber endpoint y");
approx(saberAtTwo.radius, 0.36, "scale-two saber radius");
assertDeepFrozen(saberAtTwo, "transformed saber is deeply frozen");

const targetFlowPose = createResolvedEquipmentPose({
  ...flowPose,
  anchor: { x: 3, y: 4, z: 5 },
  scale: 2,
  orientation: minus170
});
const poseEndpoints = createFixedEquipmentPoseEndpoints({ ...flowPose, orientation: plus170 }, targetFlowPose);
const sparsePose = resolveFixedEquipmentPose(poseEndpoints, 0.5);
let densePose = poseEndpoints.start;
for (let index = 0; index <= 50; index += 1) densePose = resolveFixedEquipmentPose(poseEndpoints, index / 100);
assert.deepEqual(sparsePose, densePose, "fixed pose endpoints are dense/sparse cadence invariant");
assert.deepEqual(sparsePose.anchor, { x: 2, y: 3, z: 4 });
assert.equal(sparsePose.scale, 1.5);
assertDeepFrozen(poseEndpoints, "fixed pose endpoints are deeply frozen");
assertDeepFrozen(sparsePose, "resolved fixed pose is deeply frozen");

const glovePose = createResolvedEquipmentPose({
  role: "right_wrist",
  mode: "boxing",
  anchor: { x: -1, y: 0.5, z: 2 },
  scale: 0.75,
  orientation: equipmentEulerDegreesToQuaternion({ x: 90, y: 0, z: 90 }),
  geometryIdentity: "aerobeat/glove_obb_v1",
  configIdentity
});
const glove = resolveGloveObb(glovePose);
assert.deepEqual(glove.halfExtents, { x: 0.255, y: 0.21000000000000002, z: 0.255 });
approx(glove.center.x, -0.9625, "scaled glove center x");
approx(glove.center.y, 0.5, "scaled glove center y");
approx(glove.center.z, 2, "scaled glove center z");
approxQuaternion({ ...glove.axes.x, w: 0 }, { x: 0, y: 1, z: 0, w: 0 }, "glove x axis");
approxQuaternion({ ...glove.axes.y, w: 0 }, { x: 0, y: 0, z: 1, w: 0 }, "glove y axis");
approxQuaternion({ ...glove.axes.z, w: 0 }, { x: 1, y: 0, z: 0, w: 0 }, "glove z axis");
assertDeepFrozen(glove, "transformed glove is deeply frozen");
assertDeepFrozen(saberCapsuleGeometry, "canonical saber descriptor is deeply frozen");
assertDeepFrozen(gloveObbGeometry, "canonical glove descriptor is deeply frozen");

const canonicalConfigJson = '{"a":1,"z":{"b":2}}';
const identityInputV2 = equipmentConfigIdentityInput({
  configSchema: "aerobeat/equipment_config",
  configVersion: 2,
  canonicalConfigJson
});
const identityInputV3 = equipmentConfigIdentityInput({
  configSchema: "aerobeat/equipment_config",
  configVersion: 3,
  canonicalConfigJson
});
const identityInputV4 = equipmentConfigIdentityInput({
  configSchema: "aerobeat/equipment_config",
  configVersion: 4,
  canonicalConfigJson
});
assert.equal(identityInputV2, '{"schema":"aerobeat/equipment_config_identity_input","version":1,"configSchema":"aerobeat/equipment_config","configVersion":2,"geometryIdentities":["aerobeat/saber_capsule_v1","aerobeat/glove_obb_v1"],"canonicalConfigJson":"{\\"a\\":1,\\"z\\":{\\"b\\":2}}"}', "v2 identity bytes remain unchanged");
assert.equal(identityInputV3, '{"schema":"aerobeat/equipment_config_identity_input","version":1,"configSchema":"aerobeat/equipment_config","configVersion":3,"geometryIdentities":["aerobeat/saber_capsule_v1","aerobeat/glove_obb_v1"],"canonicalConfigJson":"{\\"a\\":1,\\"z\\":{\\"b\\":2}}"}', "v3 identity records truthful configVersion 3");
assert.equal(identityInputV4, '{"schema":"aerobeat/equipment_config_identity_input","version":1,"configSchema":"aerobeat/equipment_config","configVersion":4,"geometryIdentities":["aerobeat/saber_capsule_v1","aerobeat/glove_obb_v1"],"canonicalConfigJson":"{\\"a\\":1,\\"z\\":{\\"b\\":2}}"}', "v4 identity records truthful configVersion 4");
assert.equal(new Set([identityInputV2, identityInputV3, identityInputV4]).size, 3, "analogous v2/v3/v4 configs have distinct identity bytes");
const identityShaV2 = createHash("sha256").update(identityInputV2, "utf8").digest("hex");
const identityShaV3 = createHash("sha256").update(identityInputV3, "utf8").digest("hex");
const identityShaV4 = createHash("sha256").update(identityInputV4, "utf8").digest("hex");
assert.equal(identityShaV2, "2a8bdbcc16e4d7b0222eb3ebcc389b822ad865eaffd16663dcc3bc98cec1521e", "v2 identity SHA remains locked");
assert.equal(identityShaV3, "2e966a4723ee2e3cc5dfbb6f4ed7ac80bfab55109f9df86c4f139b8df04f4d80", "v3 identity SHA remains locked");
assert.equal(identityShaV4, "6251053c644f192c80355ad7ee2be5c9f1f08442977c0b010343b54e9ef04160", "v4 identity SHA is locked");
assert.equal(new Set([identityShaV2, identityShaV3, identityShaV4]).size, 3, "analogous v2/v3/v4 configs have distinct SHA-256 identities");
for (const configVersion of [1, 5, "4", null]) {
  assert.throws(() => equipmentConfigIdentityInput({
    configSchema: "aerobeat/equipment_config",
    configVersion,
    canonicalConfigJson
  }), /equipment_config_identity_input_invalid/u, `config version ${String(configVersion)} rejects`);
}
assert.throws(() => equipmentConfigIdentityInput({
  configSchema: "aerobeat/equipment_config",
  configVersion: 3,
  canonicalConfigJson,
  extra: true
}), /equipment_config_identity_input_invalid/u, "identity input rejects extra keys");
assert.equal(isEquipmentConfigIdentity(configIdentity), true);
assert.deepEqual(createEquipmentConfigIdentity(configIdentity), configIdentity);
assertDeepFrozen(createEquipmentConfigIdentity(configIdentity), "config identity is deeply frozen");
assert.equal(isEquipmentConfigIdentity({ ...configIdentity, extra: true }), false);
assert.throws(() => equipmentConfigIdentityInput({
  configSchema: "aerobeat/equipment_config",
  configVersion: 2,
  canonicalConfigJson: '{"z":{"b":2},"a":1}'
}), /equipment_config_identity_json_not_canonical/u);

const malformedPoses = [
  { ...flowPose, extra: true },
  { ...flowPose, rotationZDeg: 0 },
  { ...flowPose, scale: Number.NaN },
  { ...flowPose, scale: 0 },
  { ...flowPose, anchor: { x: 0, y: 0, z: Number.POSITIVE_INFINITY } },
  { ...flowPose, orientation: { x: 0, y: 0, z: 0, w: 0 } },
  { ...flowPose, orientation: { x: 0, y: 0, z: 0, w: 2 } },
  { ...flowPose, geometryIdentity: "aerobeat/glove_obb_v1" },
  { ...flowPose, configIdentity: { ...configIdentity, value: "A".repeat(64) } }
];
for (const malformed of malformedPoses) {
  assert.equal(isResolvedEquipmentPose(malformed), false);
  assert.throws(() => createResolvedEquipmentPose(malformed), /resolved_equipment_pose_invalid/u);
}
const accessorPose = { ...flowPose };
Object.defineProperty(accessorPose, "scale", { enumerable: true, get: () => 1 });
assert.equal(isResolvedEquipmentPose(accessorPose), false, "pose accessors reject");
assert.throws(() => createResolvedEquipmentPose(accessorPose), /resolved_equipment_pose_invalid/u);

for (const malformedQuaternion of [
  { x: 0, y: 0, z: 0, w: 0 },
  { x: Number.NaN, y: 0, z: 0, w: 1 },
  { x: 0, y: 0, z: 0, w: Number.POSITIVE_INFINITY },
  { x: 0, y: 0, z: 0, w: 1, extra: true }
]) {
  assert.equal(isNormalizedEquipmentQuaternion(malformedQuaternion), false);
  assert.throws(() => normalizeEquipmentQuaternion(malformedQuaternion), /equipment_quaternion/u);
}
assert.throws(() => multiplyEquipmentQuaternions(identityQuaternion, { x: 0, y: 0, z: 0, w: 2 }), /equipment_quaternion_not_normalized/u);
assert.throws(() => slerpEquipmentQuaternionShortest(identityQuaternion, identityQuaternion, -0.1), /equipment_slerp_progress_invalid/u);
assert.throws(() => resolveFlowEquipmentOrientation({ headingDeg: 0, baseEulerDeg: { x: 0, y: 0, z: 0 }, animatedEulerDeg: { x: 0, y: 0, z: 0 }, rotationZDeg: 0 }), /flow_equipment_orientation_invalid/u);
assert.throws(() => resolveBoxingEquipmentOrientation({ baseEulerDeg: { x: 0, y: 0, z: 0 }, animatedEulerDeg: { x: 0, y: 0, z: 0 }, extra: true }), /boxing_equipment_orientation_invalid/u);
assert.throws(() => createEquipmentConfigIdentity({ ...configIdentity, extra: true }), /equipment_config_identity_invalid/u);
assert.throws(() => createFixedEquipmentPoseEndpoints(flowPose, glovePose), /equipment_pose_endpoints_identity_mismatch/u);
assert.throws(() => resolveFixedEquipmentPose({ ...poseEndpoints, extra: true }, 0.5), /equipment_pose_endpoints_invalid/u);
assert.throws(() => resolveSaberCapsule(glovePose), /saber_pose_mode_invalid/u);
assert.throws(() => resolveGloveObb(flowPose), /glove_pose_mode_invalid/u);

console.log("Equipment-contracts validation passed.");
