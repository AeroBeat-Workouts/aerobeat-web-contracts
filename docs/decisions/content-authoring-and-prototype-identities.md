# Content Authoring and Prototype Identities

**Status:** Accepted  
**Date:** 2026-08-28

## Decision

The approved BeatSaver map pool is regression coverage, not an allowlist. Browser product contracts support arbitrary structurally compatible BeatSaver maps through a replaceable vendor acquisition seam and a provider-neutral content-authoring seam.

Provider DTOs and raw archive entries do not become gameplay contracts. The public boundary contains normalized map summaries, selected version references, inspected source manifests, import-job snapshots and opaque persistence handles.

Every generated playable identity includes map/package/chart hashes, ruleset, conversion recipe, ordered modifiers and provenance. Prototype score identity is partitioned from source/package identity. Composite pause-time variant changes are unranked.

The initial rulesets are `flow_grid_v1`, `boxing_semantic_track_v1`, and `boxing_spatial_grid_v1`. The initial immutable recipes are `row_family_balanced_height_v1` and `cut_family_source_height_v1`. Shadow judgements are diagnostic only.

## Consequences

- Godot and web converters can use different implementations only when golden semantic output remains equivalent.
- Import jobs are abortable and expose safe progress/errors rather than raw provider or archive objects.
- IndexedDB and external package stores are referenced through opaque versioned handles.
- Theme/background suggestions remain optional presentation metadata, not mandatory package-owned environments.
