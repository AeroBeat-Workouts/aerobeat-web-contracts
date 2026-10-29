// @ts-check

import assert from "node:assert/strict";
import {
  colliderDefaultDepthWu,
  colliderSettingsDefaults,
  isColliderBounds,
  isColliderPoint,
  isColliderSettings,
  isFlowColliderSettings,
  isPointInsideColliderBounds,
  normalizeColliderSettings,
  normalizeFlowColliderSettings,
  resolveColliderBounds
} from "../src/index.js";
import { resolveColliderBounds as subpathResolve } from "@aerobeat/web-contracts/collider-contracts";

assert.equal(subpathResolve, resolveColliderBounds);
for (const normalize of [normalizeColliderSettings, normalizeFlowColliderSettings]) {
  for (const facing of [false, true]) assert.equal(normalize({ colliderDepthBackwardAthleteFacing: facing }).colliderDepthBackwardAthleteFacing, facing);
  for (const invalid of [undefined, null, 0, 1, "true"]) assert.throws(() => normalize({ colliderDepthBackwardAthleteFacing: invalid }), TypeError);
}
assert.equal(normalizeColliderSettings({ colliderScale: 2 }).colliderDepthBackwardAthleteFacing, true);
assert.equal(normalizeFlowColliderSettings({ colliderScale: 2 }).colliderDepthBackwardAthleteFacing, false);
assert.equal(colliderDefaultDepthWu, 1.08);
for (const mode of ["flow", "boxing"]) {
  assert.deepEqual(colliderSettingsDefaults[mode], {
    colliderVisible: false, colliderScale: 1, colliderDepthForward: 1, colliderDepthBackward: 1,
    visibleWristObstacleRadius: false, wristBombColliderScale: 1, colliderDepthBackwardAthleteFacing: mode === "boxing"
  });
  assert.equal(Object.isFrozen(colliderSettingsDefaults[mode]), true);
  assert.deepEqual((mode === "flow" ? normalizeFlowColliderSettings : normalizeColliderSettings)({}), colliderSettingsDefaults[mode]);
}
assert.deepEqual(normalizeColliderSettings({ colliderVisible: true, colliderScale: 2, colliderDepthForward: 3, colliderDepthBackward: 4 }), {
  colliderVisible: true, colliderScale: 2, colliderDepthForward: 3, colliderDepthBackward: 4,
  visibleWristObstacleRadius: false, wristBombColliderScale: 1, colliderDepthBackwardAthleteFacing: true
});
for (const scale of [0, 0.25, 1.5, 2]) {
  const wristSettings = normalizeColliderSettings({ visibleWristObstacleRadius: true, wristBombColliderScale: scale });
  assert.equal(wristSettings.visibleWristObstacleRadius, true);
  assert.equal(wristSettings.wristBombColliderScale, scale);
  assert.equal(wristSettings.colliderVisible, false);
  assert.equal(wristSettings.colliderScale, 1);
  assert.equal(isColliderSettings(wristSettings), true);
  const equipmentBounds = resolveColliderBounds({
    mode: "flow", center: { x: 3, y: 2, z: 0 }, halfWidth: 0.4, halfHeight: 0.2, settings: wristSettings
  });
  assert.deepEqual(equipmentBounds, {
    minX: 2.6, maxX: 3.4, minY: 1.8, maxY: 2.2, minZ: -1.08, maxZ: 1.08
  });
}
const flow = normalizeColliderSettings({ colliderVisible: true, colliderScale: 2, colliderDepthForward: 3 });
const boxing = normalizeColliderSettings({ colliderDepthBackward: 2 });
const zeroRear = normalizeColliderSettings({ colliderDepthBackward: 0 });
assert.equal(zeroRear.colliderDepthBackward, 0, "Flow hilt-origin rear zero is a valid bounded depth");
assert.deepEqual(resolveColliderBounds({ mode: "flow", center: { x: 0, y: 0, z: 0 }, halfWidth: 0.5, halfHeight: 0.5, settings: zeroRear }), { minX: -0.5, maxX: 0.5, minY: -0.5, maxY: 0.5, minZ: -1.08, maxZ: 0 });
assert.equal(isColliderSettings(flow), true);
for (const factor of [0, 0.00001, 1, 9999999, Number.MAX_VALUE]) {
  const settings = normalizeFlowColliderSettings({ colliderScale: factor, colliderDepthForward: factor, colliderDepthBackward: factor });
  assert.equal(isFlowColliderSettings(settings), true, `finite Flow Scale/Depth ${factor} accepted`);
  assert.deepEqual([settings.colliderScale, settings.colliderDepthForward, settings.colliderDepthBackward], [factor, factor, factor]);
}
for (const invalid of [-1, NaN, Infinity, -Infinity]) for (const key of ["colliderScale", "colliderDepthForward", "colliderDepthBackward"]) {
  assert.throws(() => normalizeFlowColliderSettings({ [key]: invalid }), TypeError, `reject ${key} ${invalid}`);
}
assert.throws(() => resolveColliderBounds({ mode: "flow", center: { x: 0, y: 0, z: 0 }, halfWidth: 2, halfHeight: 2, settings: normalizeFlowColliderSettings({ colliderScale: Number.MAX_VALUE }) }), /nonfinite/u, "finite input with unrepresentable derived target geometry fails truthfully");
assert.equal(isColliderSettings(normalizeFlowColliderSettings({ colliderScale: 0, colliderDepthForward: 0 })), true, "Boxing scale zero now shares Flow's finite nonnegative setting contract");
for (const factor of [0, 0.00001, 0.5, 5, 9999999]) {
  const settings = normalizeColliderSettings({ colliderScale: factor });
  assert.equal(isColliderSettings(settings), true, `Boxing scale ${factor} is accepted`);
  const bounds = resolveColliderBounds({ mode: "boxing", center: { x: 0, y: 0, z: 0 }, halfWidth: 0.5, halfHeight: 0.5, settings });
  assert.equal(bounds.minX, factor === 0 ? 0 : -0.5 * factor, `Boxing scale ${factor} changes only target XY`);
  assert.equal(bounds.maxX, 0.5 * factor);
}
for (const invalid of [-1, NaN, Infinity, -Infinity]) {
  assert.throws(() => normalizeColliderSettings({ colliderScale: invalid }), TypeError);
  assert.equal(isColliderSettings({ ...colliderSettingsDefaults.boxing, colliderScale: invalid }), false);
}
for (const key of ["colliderDepthForward", "colliderDepthBackward"]) {
  for (const factor of [0, 0.00001, 0.5, 5, 9999999]) {
    const settings = normalizeColliderSettings({ [key]: factor });
    assert.equal(settings[key], factor, `Boxing ${key} retains ${factor}`);
    assert.equal(isColliderSettings(settings), true);
    const extent = resolveColliderBounds({ mode: "boxing", center: { x: 0, y: 0, z: 0 }, halfWidth: 0.5, halfHeight: 0.5, settings });
    assert.equal(key === "colliderDepthForward" ? extent.minZ : extent.maxZ, factor === 0 ? 0 : (key === "colliderDepthForward" ? -1 : 1) * colliderDefaultDepthWu * factor, `Boxing ${key} moves only its scored Z face`);
  }
  for (const invalid of [-1, NaN, Infinity, -Infinity]) {
    assert.throws(() => normalizeColliderSettings({ [key]: invalid }), TypeError);
    assert.equal(isColliderSettings({ ...colliderSettingsDefaults.boxing, [key]: invalid }), false);
  }
}
assert.throws(() => resolveColliderBounds({ mode: "boxing", center: { x: 0, y: 0, z: 0 }, halfWidth: 0.5, halfHeight: 0.5, settings: normalizeColliderSettings({ colliderDepthForward: Number.MAX_VALUE }), timingWindowMs: 180, speedWuPerMs: 2 }), /nonfinite/u, "nonrepresentable derived Boxing bounds fail rather than clamp");
assert.equal(colliderSettingsDefaults.flow.colliderVisible, false);
assert.equal(colliderSettingsDefaults.boxing.colliderDepthBackward, 1);
assert.equal(Object.isFrozen(flow), true);
const input = { mode: "flow", center: { x: 3, y: 2, z: 0 }, halfWidth: 0.4, halfHeight: 0.2, settings: flow };
const bounds = resolveColliderBounds(input);
assert.deepEqual(bounds, { minX: 2.2, maxX: 3.8, minY: 1.6, maxY: 2.4, minZ: -3.24, maxZ: 1.08 });
assert.equal(Object.isFrozen(bounds), true);
assert.equal(isColliderBounds(bounds), true);
assert.equal(isColliderPoint(input.center), true);
assert.equal(isPointInsideColliderBounds({ x: 3, y: 2, z: bounds.minZ }, bounds), true);
assert.equal(isPointInsideColliderBounds({ x: 3, y: 2, z: -3.25 }, bounds), false);
assert.deepEqual(resolveColliderBounds({ ...input, mode: "boxing", settings: boxing, timingWindowMs: 100, speedWuPerMs: 0.01 }), {
  minX: 2.6, maxX: 3.4, minY: 1.8, maxY: 2.2, minZ: -1, maxZ: 2
});
for (const bad of [
  null, [], "flow", { colliderVisible: "true" }, { colliderScale: -1 },
  { colliderScale: NaN }, { colliderScale: Infinity }, { colliderScale: null },
  { colliderDepthForward: -1 }, { colliderDepthBackward: -1 },
  { colliderVisible: undefined }, { visibleWristObstacleRadius: "true" },
  { visibleWristObstacleRadius: undefined }, { wristBombColliderScale: -0.01 },
  { wristBombColliderScale: 2.01 }, { wristBombColliderScale: NaN },
  { wristBombColliderScale: Infinity }, { wristBombColliderScale: null }, { extra: true },
  { flow: colliderSettingsDefaults.flow, boxing: colliderSettingsDefaults.boxing },
  Object.defineProperty({}, "colliderScale", { get: () => 1, enumerable: true })
]) {
  assert.throws(() => normalizeColliderSettings(bad), TypeError);
}
for (const bad of [
  { ...input, extra: 1 }, { ...input, center: { x: 0, y: 0, z: Infinity } },
  { ...input, halfWidth: 0 }, { ...input, halfHeight: NaN },
  { ...input, settings: { ...flow, extra: true } },
  { ...input, timingWindowMs: 180 },
  { ...input, timingWindowMs: 0, speedWuPerMs: 0.006 },
  { ...input, timingWindowMs: 180, speedWuPerMs: Infinity }
]) {
  assert.throws(() => resolveColliderBounds(bad), TypeError);
}
assert.equal(isColliderBounds({ ...bounds, minZ: Infinity }), false);
assert.throws(() => isPointInsideColliderBounds({ x: NaN, y: 0, z: 0 }, bounds), TypeError);
assert.throws(() => isPointInsideColliderBounds({ x: 0, y: 0, z: 0 }, { ...bounds, minX: 10 }), TypeError);
console.log("Collider geometry contract checks passed.");
