// @ts-check

import assert from "node:assert/strict";
import {
  aeroPoseAdapterStatuses,
  poseAdapterContractsId
} from "../src/index.js";

/** @typedef {import("../src/pose-adapter.js").AeroPoseAdapter} AeroPoseAdapter */

const subpathModule = await import("@aerobeat/web-contracts/pose-adapter");

assert.equal(poseAdapterContractsId, "aero.contracts.pose-adapter");
assert.equal(subpathModule.poseAdapterContractsId, poseAdapterContractsId);
assert.deepEqual(aeroPoseAdapterStatuses, {
  idle: "idle",
  loading: "loading",
  ready: "ready",
  failed: "failed",
  disposed: "disposed"
});
assert.equal(Object.isFrozen(aeroPoseAdapterStatuses), true);

/** @type {AeroPoseAdapter} */
const adapter = {
  vendorId: "contract-test",
  model: {
    vendorId: "contract-test",
    modelId: "normalized-seven-landmark",
    modelVersion: "1",
    runtimeId: "fixture",
    runtimeVersion: "1"
  },
  status: aeroPoseAdapterStatuses.idle,
  capabilities: {
    supportsMainThread: true,
    supportsWorker: false,
    supportsMirroring: true,
    supportsFrameSizeOverride: true,
    executionProviders: Object.freeze(["fixture"])
  },
  async load() {
    adapter.status = aeroPoseAdapterStatuses.loading;
    adapter.status = aeroPoseAdapterStatuses.ready;
  },
  async estimateNormalizedPoseFrame(_frameSource, options = {}) {
    return {
      sourceId: options.sourceId ?? "contract-test",
      timestampMs: options.timestampMs ?? 0,
      mirrored: options.mirrored ?? false,
      landmarks: Object.freeze([
        Object.freeze({
          name: "nose",
          x: 0.5,
          y: 0.25,
          confidence: 1
        })
      ])
    };
  },
  getExecutionTelemetry() {
    return {
      location: "main-thread",
      provider: "fixture",
      detail: "Structural contract validator",
      fallback: false,
      loadDurationMs: 0,
      estimateDurationMs: 0
    };
  },
  async dispose() {
    adapter.status = aeroPoseAdapterStatuses.disposed;
  }
};

await adapter.load();
assert.equal(adapter.status, aeroPoseAdapterStatuses.ready);
assert.equal(adapter.vendorId, adapter.model.vendorId);
assert.equal(adapter.capabilities?.executionProviders[0], "fixture");

const frame = await adapter.estimateNormalizedPoseFrame(undefined, {
  sourceId: "contract-validator",
  timestampMs: 42,
  mirrored: true,
  flipHorizontal: true,
  frameWidth: 480,
  frameHeight: 640
});
assert.deepEqual(frame, {
  sourceId: "contract-validator",
  timestampMs: 42,
  mirrored: true,
  landmarks: [
    {
      name: "nose",
      x: 0.5,
      y: 0.25,
      confidence: 1
    }
  ]
});
assert.deepEqual(adapter.getExecutionTelemetry?.(), {
  location: "main-thread",
  provider: "fixture",
  detail: "Structural contract validator",
  fallback: false,
  loadDurationMs: 0,
  estimateDurationMs: 0
});

await adapter.dispose?.();
assert.equal(adapter.status, aeroPoseAdapterStatuses.disposed);

console.log("Generic AeroPoseAdapter contract validation passed.");
