# Generic Pose Adapter Contract

`AeroPoseAdapter` is a structural JavaScript/JSDoc boundary. It lets `aerobeat-web-cv` inject MoveNet, MediaPipe, ONNX Runtime, mock, and replay implementations without importing vendor runtime objects.

## Required Surface

Every adapter reports:

- a stable `vendorId`;
- a `model` identity containing vendor/model and optional runtime versions;
- an `idle`, `loading`, `ready`, `failed`, or `disposed` lifecycle `status`;
- `load()`;
- `estimateNormalizedPoseFrame(frameSource?, options?)` returning the existing `NormalizedPoseFrame` contract.

The estimate options preserve the existing source ID, timestamp, mirroring, horizontal flip, and frame-size overrides used by the MoveNet path.

## Optional Surface

Adapters may expose:

- `getExecutionTelemetry()` for actual execution location, provider, fallback detail, and load/estimate durations; adapters may additionally report `runtimeInferenceDurationMs` for the vendor runtime/model call and `postprocessDurationMs` for subsequent decoding/normalization, while `estimateDurationMs` remains the end-to-end adapter estimate;
- `capabilities` for supported execution locations, providers, mirroring, and frame-size overrides;
- `dispose()` for model, worker, and runtime cleanup.

Optional members let simple mock/replay adapters remain small. CV and UI consumers must handle their absence.

## Compatibility Rule

`NormalizedPoseFrame` is unchanged and remains the only pose data shape consumed by gameplay input and scoring. Vendor-native landmarks, tensors, sessions, tasks, and prediction-only data do not cross this contract.
