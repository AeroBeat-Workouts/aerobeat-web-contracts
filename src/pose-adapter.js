// @ts-check

/**
 * Stable lifecycle values shared by all pose adapter implementations.
 *
 * @type {Readonly<{
 *   idle: "idle",
 *   loading: "loading",
 *   ready: "ready",
 *   failed: "failed",
 *   disposed: "disposed"
 * }>}
 */
export const aeroPoseAdapterStatuses = Object.freeze({
  idle: "idle",
  loading: "loading",
  ready: "ready",
  failed: "failed",
  disposed: "disposed"
});

/**
 * @typedef {"idle" | "loading" | "ready" | "failed" | "disposed"} AeroPoseAdapterLifecycleStatus
 */

/**
 * Browser-owned image sources accepted by live pose adapters. Mock and replay
 * adapters may ignore this value, so the adapter method keeps it optional.
 *
 * @typedef {HTMLVideoElement | HTMLImageElement | HTMLCanvasElement | ImageBitmap | ImageData | VideoFrame} AeroPoseFrameSource
 */

/**
 * Vendor-neutral options for one pose estimate.
 *
 * @typedef {Object} AeroPoseEstimateOptions
 * @property {string} [sourceId] Normalized frame source identifier.
 * @property {number} [timestampMs] Capture or media timestamp in milliseconds.
 * @property {boolean} [mirrored] Whether normalized output is mirrored for player-facing display.
 * @property {boolean} [flipHorizontal] Whether detector input/output should be flipped horizontally.
 * @property {number} [frameWidth] Source width override for frame-like objects.
 * @property {number} [frameHeight] Source height override for frame-like objects.
 */

/**
 * Stable vendor and model identity reported without exposing vendor objects.
 *
 * @typedef {Object} AeroPoseModelIdentity
 * @property {string} vendorId Stable vendor package identifier.
 * @property {string} modelId Stable model or model-family identifier.
 * @property {string} [modelVersion] Model artifact/version detail when available.
 * @property {string} [runtimeId] Runtime implementation identifier when distinct from the vendor.
 * @property {string} [runtimeVersion] Runtime package/version detail when available.
 */

/**
 * Optional adapter capability declaration used for truthful selection and UI.
 *
 * @typedef {Object} AeroPoseAdapterCapabilities
 * @property {boolean} supportsMainThread Whether main-thread inference is supported.
 * @property {boolean} supportsWorker Whether worker inference is supported.
 * @property {boolean} supportsMirroring Whether horizontal flip/mirroring is supported.
 * @property {boolean} supportsFrameSizeOverride Whether explicit source dimensions are supported.
 * @property {readonly string[]} executionProviders Supported provider IDs such as webgl, wasm, webgpu, or cpu.
 */

/**
 * Optional execution/provider telemetry for the adapter's actual runtime path.
 *
 * @typedef {Object} AeroPoseExecutionTelemetry
 * @property {"worker" | "main-thread" | "native" | "unknown"} location Actual inference execution location.
 * @property {string} [provider] Actual provider/backend ID such as webgl, wasm, webgpu, or cpu.
 * @property {string} [detail] Human-readable execution, fallback, or failure detail.
 * @property {boolean} [fallback] Whether the requested path fell back to another path.
 * @property {number} [loadDurationMs] Most recent model/runtime load duration in milliseconds.
 * @property {number} [estimateDurationMs] Most recent adapter estimate duration in milliseconds.
 */

/**
 * Vendor-neutral structural boundary consumed by AeroBeat CV. Implementations
 * remain vendor-owned and must return the existing normalized scoring truth.
 *
 * @typedef {Object} AeroPoseAdapter
 * @property {string} vendorId Stable vendor package identifier; must equal model.vendorId.
 * @property {AeroPoseModelIdentity} model Stable vendor/model/runtime identity.
 * @property {AeroPoseAdapterLifecycleStatus} status Current adapter lifecycle status.
 * @property {() => Promise<void>} load Prepares the runtime and model for estimates.
 * @property {(frameSource?: AeroPoseFrameSource, options?: AeroPoseEstimateOptions) => Promise<import("./pose-shapes.js").NormalizedPoseFrame>} estimateNormalizedPoseFrame Produces one existing NormalizedPoseFrame without vendor objects.
 * @property {() => AeroPoseExecutionTelemetry} [getExecutionTelemetry] Reports the actual execution/provider path when available.
 * @property {AeroPoseAdapterCapabilities} [capabilities] Declares optional adapter capabilities.
 * @property {() => void | Promise<void>} [dispose] Releases model, worker, and runtime resources when supported.
 */

/**
 * Pose adapter contracts marker.
 *
 * @type {"aero.contracts.pose-adapter"}
 */
export const poseAdapterContractsId = "aero.contracts.pose-adapter";
