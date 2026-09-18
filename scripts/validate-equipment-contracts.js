// @ts-check

import assert from "node:assert/strict";
import {
  equipmentMarkerVisibility,
  gloveGeometry,
  judgeColumnCenters,
  judgeToPresentationPoint,
  presentationColumnCenters,
  saberGeometry
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

console.log("Equipment-contracts validation passed.");
