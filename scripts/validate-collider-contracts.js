// @ts-check

import assert from "node:assert/strict";
import {
  colliderDefaultDepthWu,
  colliderSettingsDefaults,
  isColliderBounds,
  isColliderPoint,
  isColliderSettings,
  isPointInsideColliderBounds,
  normalizeColliderSettings,
  resolveColliderBounds
} from "../src/index.js";
import { resolveColliderBounds as subpathResolve } from "@aerobeat/web-contracts/collider-contracts";

assert.equal(subpathResolve, resolveColliderBounds);
assert.equal(colliderDefaultDepthWu, 1.08);
for (const mode of ["flow", "boxing"]) {
  assert.deepEqual(colliderSettingsDefaults[mode], {
    colliderVisible: false, colliderScale: 1, colliderDepthForward: 1, colliderDepthBackward: 1,
    visibleWristObstacleRadius: false, wristBombColliderScale: 1
  });
  assert.equal(Object.isFrozen(colliderSettingsDefaults[mode]), true);
  assert.deepEqual(normalizeColliderSettings({}), colliderSettingsDefaults[mode]);
}
assert.deepEqual(normalizeColliderSettings({ colliderVisible: true, colliderScale: 2, colliderDepthForward: 3, colliderDepthBackward: 4 }), {
  colliderVisible: true, colliderScale: 2, colliderDepthForward: 3, colliderDepthBackward: 4,
  visibleWristObstacleRadius: false, wristBombColliderScale: 1
});
for (const scale of [0, 0.25, 1.5, 2]) {
  const wristSettings = normalizeColliderSettings({ visibleWristObstacleRadius: true, wristBombColliderScale: scale });
  assert.equal(wristSettings.visibleWristObstacleRadius, true);
  assert.equal(wristSettings.wristBombColliderScale, scale);
  assert.equal(wristSettings.colliderVisible, false);
  assert.equal(wristSettings.colliderScale, 1);
  assert.equal(isColliderSettings(wristSettings), true);
}
const flow = normalizeColliderSettings({ colliderVisible: true, colliderScale: 2, colliderDepthForward: 3 });
const boxing = normalizeColliderSettings({ colliderDepthBackward: 2 });
assert.equal(isColliderSettings(flow), true);
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
  null, [], "flow", { colliderVisible: "true" }, { colliderScale: 0 },
  { colliderScale: NaN }, { colliderScale: Infinity }, { colliderScale: null },
  { colliderDepthForward: 0.9 }, { colliderDepthBackward: -1 },
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
