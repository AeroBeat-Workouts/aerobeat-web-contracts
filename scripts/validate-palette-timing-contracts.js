// @ts-check

import assert from "node:assert/strict";
import {
  authoredBeatToTimelineMs,
  createAuthoredBeatToTimelineMs,
  defaultLeftNoteColor,
  defaultNotePalette,
  defaultRightNoteColor,
  isAuthoredNotePalette,
  isAuthoredSongTiming,
  isBeatMapSourceManifest,
  isCanonicalOpaqueSrgbColor,
  isEffectiveNotePalette,
  isNotePaletteProvenance,
  isPrivateNoteAppearance,
  isSourceNotePalette,
  maximumAuthoredTimelineMs
} from "../src/index.js";

const hashA = `sha256:${"a".repeat(64)}`;
const hashB = `sha256:${"b".repeat(64)}`;
const paletteHash = `sha256:${"c".repeat(64)}`;
const provenance = {
  kind: "info_color_scheme",
  infoFormat: "v4",
  infoHash: hashA,
  difficultyHash: hashB,
  fieldSet: "v4_scheme",
  schemeIndex: 2
};
const sourcePalette = {
  schema: "aerobeat/source_note_palette",
  version: 1,
  left: "#FF0000",
  right: "#808080",
  colorSpace: "srgb",
  alpha: 1,
  provenance
};
const authoredPalette = {
  schema: "aerobeat/authored_note_palette",
  version: 1,
  left: "#00FF00",
  right: "#0000FF",
  colorSpace: "srgb",
  alpha: 1,
  paletteHash,
  provenance
};
const effectivePalette = {
  schema: "aerobeat/effective_note_palette",
  version: 1,
  left: "#FFFFFF",
  right: "#808080",
  colorSpace: "srgb",
  source: "song",
  paletteHash
};

assert.equal(defaultLeftNoteColor, "#2693FF");
assert.equal(defaultRightNoteColor, "#39C96B");
assert.deepEqual(defaultNotePalette, { left: "#2693FF", right: "#39C96B", colorSpace: "srgb", alpha: 1 });
assert.equal(Object.isFrozen(defaultNotePalette), true);
for (const color of ["#FF0000", "#00FF00", "#0000FF", "#808080", "#FFFFFF", "#2693FF", "#39C96B"]) {
  assert.equal(isCanonicalOpaqueSrgbColor(color), true, `${color} remains an unchanged canonical sRGB token`);
}
for (const color of ["#ff0000", "FF0000", "#FFFFFFFF", "#FFF", " #FFFFFF", "#FFFFFF ", "#ＧＧ0000", 0, null]) {
  assert.equal(isCanonicalOpaqueSrgbColor(color), false, `${String(color)} is not canonical opaque sRGB`);
}

assert.equal(isNotePaletteProvenance(provenance), true);
assert.equal(isNotePaletteProvenance({ ...provenance, kind: "difficulty_custom_data", fieldSet: "v4_custom", schemeIndex: null }), true);
assert.equal(isNotePaletteProvenance({ ...provenance, kind: "difficulty_custom_data", fieldSet: "v4_custom" }), false);
assert.equal(isNotePaletteProvenance({ ...provenance, infoFormat: "v2", fieldSet: "v4_scheme" }), false);
assert.equal(isNotePaletteProvenance({ ...provenance, schemeIndex: -1 }), false);
assert.equal(isNotePaletteProvenance({ ...provenance, schemeIndex: 1.5 }), false);
assert.equal(isNotePaletteProvenance({ ...provenance, infoHash: `sha256:${"A".repeat(64)}` }), false);
assert.equal(isNotePaletteProvenance({ ...provenance, difficultyHash: "b".repeat(64) }), false);

assert.equal(isSourceNotePalette(sourcePalette), true);
const sourceManifest = {
  schema: "aerobeat/beatmap_source_manifest",
  version: 2,
  sourceProvider: "local_zip",
  sourceId: "source-1",
  sourceVersionHash: "version-1",
  infoFormat: "v4",
  metadataPath: "Info.dat",
  entries: [{ path: "ExpertPlus.dat", kind: "difficulty", byteLength: 10, hash: { schema: "aerobeat/content_hash", version: 1, algorithm: "sha256", value: "d".repeat(64) } }],
  difficulties: [{ id: "Standard/ExpertPlus", characteristic: "Standard", difficulty: "ExpertPlus", path: "ExpertPlus.dat", beatMapFormat: "v4", beatMapVersion: "4.1.0", notePalette: sourcePalette }],
  totalUncompressedBytes: 10,
  archiveHash: { schema: "aerobeat/content_hash", version: 1, algorithm: "sha256", value: "e".repeat(64) }
};
assert.equal(isBeatMapSourceManifest(sourceManifest), true, "source manifest binds the exact difficulty palette and independent Info/beatmap versions");
assert.equal(isBeatMapSourceManifest({ ...sourceManifest, version: 1 }), false);
assert.equal(isBeatMapSourceManifest({ ...sourceManifest, infoFormat: "v2" }), false, "Info v2 cannot falsely label a v4 beatmap family");
assert.equal(isBeatMapSourceManifest({ ...sourceManifest, difficulties: [{ ...sourceManifest.difficulties[0], notePalette: { ...sourcePalette, provenance: { ...provenance, rawInfo: {} } } }] }), false);
assert.equal(isAuthoredNotePalette(authoredPalette), true);
assert.equal(isEffectiveNotePalette(effectivePalette), true);
assert.equal(isEffectiveNotePalette({ ...effectivePalette, source: "aerobeat_default", left: defaultLeftNoteColor, right: defaultRightNoteColor }), true);
assert.equal(isPrivateNoteAppearance({ appearanceColor: "#2693FF" }), true);
for (const invalid of [
  { ...sourcePalette, left: "#ff0000" },
  { ...sourcePalette, right: null },
  { ...sourcePalette, alpha: 0.999 },
  { ...sourcePalette, colorSpace: "linear" },
  { ...sourcePalette, extra: true },
  { ...sourcePalette, provenance: { ...provenance, raw: {} } }
]) assert.equal(isSourceNotePalette(invalid), false, "source palettes reject malformed or expanded data atomically");
for (const invalid of [
  { ...authoredPalette, paletteHash: "c".repeat(64) },
  { ...authoredPalette, provenance: null },
  { ...authoredPalette, version: 2 }
]) assert.equal(isAuthoredNotePalette(invalid), false);
for (const invalid of [
  { ...effectivePalette, provenance },
  { ...effectivePalette, alpha: 1 },
  { ...effectivePalette, source: "default" },
  { ...effectivePalette, source: "aerobeat_default" },
  { ...effectivePalette, paletteHash: hashA.toUpperCase() }
]) assert.equal(isEffectiveNotePalette(invalid), false, "effective palettes expose no provenance and enforce atomic fallback");
for (const invalid of [
  { appearanceColor: "#2693FF", source: "song" },
  { appearanceColor: "#2693ff" },
  { color: "#2693FF" }
]) assert.equal(isPrivateNoteAppearance(invalid), false, "renderer seam contains only one canonical fill token");

class PaletteRecord { constructor() { Object.assign(this, sourcePalette); } }
assert.equal(isSourceNotePalette(new PaletteRecord()), false);
assert.equal(isSourceNotePalette(Object.assign(Object.create(null), sourcePalette)), false);
assert.equal(isSourceNotePalette([sourcePalette]), false);
const hiddenPalette = { ...sourcePalette };
Object.defineProperty(hiddenPalette, "hidden", { value: true });
assert.equal(isSourceNotePalette(hiddenPalette), false);
assert.equal(isSourceNotePalette({ ...sourcePalette, [Symbol("raw")]: true }), false);
let paletteAccessorCalled = false;
const accessorPalette = { ...sourcePalette };
Object.defineProperty(accessorPalette, "left", { enumerable: true, get() { paletteAccessorCalled = true; return "#FF0000"; } });
assert.equal(isSourceNotePalette(accessorPalette), false);
assert.equal(paletteAccessorCalled, false, "palette validators never execute accessors");
let provenanceAccessorCalled = false;
const accessorProvenance = { ...provenance };
Object.defineProperty(accessorProvenance, "kind", { enumerable: true, get() { provenanceAccessorCalled = true; return "info_color_scheme"; } });
assert.equal(isNotePaletteProvenance(accessorProvenance), false);
assert.equal(provenanceAccessorCalled, false, "provenance validators never execute accessors");

const timing = {
  anchorMs: 125,
  tempoSegments: [
    { startBeat: 0, bpm: 120 },
    { startBeat: 16, bpm: 180 },
    { startBeat: 20, bpm: 60 }
  ],
  stopSegments: [],
  timeSignatureSegments: [{ startBeat: 0, numerator: 4, denominator: 4 }]
};
assert.equal(isAuthoredSongTiming(timing), true);
const mapBeat = createAuthoredBeatToTimelineMs(timing);
assert.equal(mapBeat(0), 125);
assert.equal(mapBeat(14), 7_125);
assert.equal(mapBeat(16), 8_125);
assert.ok(Math.abs(mapBeat(18) - 8_791.666666666666) < 1e-9, "lead crossing a tempo boundary uses every segment");
assert.ok(Math.abs(mapBeat(20) - 9_458.333333333332) < 1e-9);
assert.ok(Math.abs(mapBeat(21) - 10_458.333333333332) < 1e-9, "final segment extends to the target beat");
assert.equal(authoredBeatToTimelineMs({ ...timing, anchorMs: 0 }, 18), 8_666.666666666666);
assert.equal(mapBeat(-0), 125);

const mutableTiming = {
  anchorMs: 0,
  tempoSegments: [{ startBeat: 0, bpm: 120 }],
  stopSegments: [],
  timeSignatureSegments: [{ startBeat: 0, numerator: 4, denominator: 4 }]
};
const snapshottedMapper = createAuthoredBeatToTimelineMs(mutableTiming);
mutableTiming.anchorMs = 500;
mutableTiming.tempoSegments[0].bpm = 60;
assert.equal(snapshottedMapper(4), 2_000, "validated mapper snapshots timing against later mutation");
assert.equal(authoredBeatToTimelineMs({ ...mutableTiming, anchorMs: maximumAuthoredTimelineMs }, 0), maximumAuthoredTimelineMs);
assert.throws(() => authoredBeatToTimelineMs({ ...mutableTiming, anchorMs: maximumAuthoredTimelineMs }, 0.001), /24-hour/u);

const invalidTimings = [
  null,
  [],
  { ...timing, extra: true },
  { ...timing, anchorMs: -1 },
  { ...timing, anchorMs: Number.NaN },
  { ...timing, anchorMs: maximumAuthoredTimelineMs + 1 },
  { ...timing, tempoSegments: [] },
  { ...timing, tempoSegments: [{ startBeat: 1, bpm: 120 }] },
  { ...timing, tempoSegments: [{ startBeat: 0, bpm: 120 }, { startBeat: 0, bpm: 180 }] },
  { ...timing, tempoSegments: [{ startBeat: 0, bpm: 120 }, { startBeat: 4, bpm: 0 }] },
  { ...timing, tempoSegments: [{ startBeat: 0, bpm: Number.POSITIVE_INFINITY }] },
  { ...timing, tempoSegments: [{ startBeat: 0, bpm: "120" }] },
  { ...timing, tempoSegments: [{ startBeat: 0, bpm: 1 }, { startBeat: 1_441, bpm: 120 }] },
  { ...timing, stopSegments: [{ startBeat: 4, durationMs: 250 }] },
  { ...timing, timeSignatureSegments: [] },
  { ...timing, timeSignatureSegments: [{ startBeat: 1, numerator: 4, denominator: 4 }] },
  { ...timing, timeSignatureSegments: [{ startBeat: 0, numerator: 4.5, denominator: 4 }] },
  { ...timing, timeSignatureSegments: [{ startBeat: 0, numerator: 4, denominator: 0 }] }
];
for (const invalid of invalidTimings) assert.equal(isAuthoredSongTiming(invalid), false, "malformed timing rejects transactionally");

const sparseTempos = Array(1);
assert.equal(isAuthoredSongTiming({ ...timing, tempoSegments: sparseTempos }), false);
const extraTempos = [{ startBeat: 0, bpm: 120 }];
extraTempos.extra = true;
assert.equal(isAuthoredSongTiming({ ...timing, tempoSegments: extraTempos }), false);
assert.equal(isAuthoredSongTiming({ ...timing, tempoSegments: Object.assign([{ startBeat: 0, bpm: 120 }], { [Symbol("extra")]: true }) }), false);
class TimingRecord { constructor() { Object.assign(this, timing); } }
assert.equal(isAuthoredSongTiming(new TimingRecord()), false);
assert.equal(isAuthoredSongTiming(Object.assign(Object.create(null), timing)), false);
let timingAccessorCalled = false;
const accessorTiming = { ...timing };
Object.defineProperty(accessorTiming, "anchorMs", { enumerable: true, get() { timingAccessorCalled = true; return 0; } });
assert.equal(isAuthoredSongTiming(accessorTiming), false);
assert.equal(timingAccessorCalled, false, "timing validators never execute accessors");
let tempoAccessorCalled = false;
const accessorTempo = { startBeat: 0, bpm: 120 };
Object.defineProperty(accessorTempo, "bpm", { enumerable: true, get() { tempoAccessorCalled = true; return 120; } });
assert.equal(isAuthoredSongTiming({ ...timing, tempoSegments: [accessorTempo] }), false);
assert.equal(tempoAccessorCalled, false, "tempo validators never execute accessors");

for (const beat of [-1, Number.NaN, Number.POSITIVE_INFINITY, Number.MAX_SAFE_INTEGER + 1]) {
  assert.throws(() => mapBeat(beat), /Authored beat/u);
}
assert.throws(() => createAuthoredBeatToTimelineMs({ ...timing, stopSegments: [{ beat: 2, durationMs: 100 }] }), /Invalid authored song timing/u);

console.log("Note-palette privacy and piecewise authored-timing contract validation passed.");
