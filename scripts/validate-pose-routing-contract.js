// @ts-check

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  aeroPoseRoutingSampleSchema,
  aeroPoseSampleProvenances
} from "../src/index.js";

assert.equal(aeroPoseRoutingSampleSchema, "aerobeat/pose_routing_sample");
assert.deepEqual(aeroPoseSampleProvenances, ["measured", "predicted"]);
assert.equal(Object.isFrozen(aeroPoseSampleProvenances), true);

const poseShapesSource = await readFile(new URL("../src/pose-shapes.js", import.meta.url), "utf8");
const inputShapesSource = await readFile(new URL("../src/input-shapes.js", import.meta.url), "utf8");
assert.match(poseShapesSource, /@property \{string\} routeEpoch/);
assert.match(poseShapesSource, /@property \{string\} measuredSourceFrameId/);
for (const property of ["provenance", "measurementTimestampMs", "predictionHorizonMs", "measuredSourceFrameId", "routeEpoch"]) {
  const optionalOccurrences = inputShapesSource.match(new RegExp(`\\[${property}\\]`, "g")) ?? [];
  assert.equal(optionalOccurrences.length, 2, `${property} must remain optional on both legacy input event contracts`);
}

console.log("Pose routing contract validation passed.");
