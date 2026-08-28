# Embeddable Game Host Contract

**Status:** Accepted  
**Date:** 2026-08-28

## Decision

The only public product root is `aero-game`. The previous `aerobeat-app` registry name is removed rather than aliased.

Each connected element owns one service graph and fills its parent content box. Container dimensions, visibility, fullscreen and capabilities are explicit snapshots; no service assumes viewport or browser-history ownership. Multiple elements may coexist while a process-level assembly lease arbitrates camera/audio ownership.

Direct hosts use versioned commands and events. Cross-origin iframe hosts use version 1 of `aerobeat/iframe_message`, bound by assembly to the immediate parent `Window` and the origin observed during handshake. The child owns fullscreen requests.

Iframe payloads are JSON-like structured records only. Normalized landmarks, calibrated anchors, content/import progress and gameplay telemetry may cross. Raw frames, pixels, screenshots, `VideoFrame`, image bitmaps, streams/tracks, ZIP bytes and audio bytes are forbidden at every payload depth.

## Consequences

- Bridge validation rejects unknown top-level fields, unsupported versions, cyclic/class/binary payloads and forbidden media/archive keys.
- BeatSaver download, conversion, audio decoding and camera resources remain child-local.
- Teardown and reconnect create fresh instance state while preserving only explicitly persisted content handles.
