// @ts-check

/** Canonical opaque sRGB token used when authored song colors are unavailable. */
export const defaultLeftNoteColor = "#2693FF";
/** Canonical opaque sRGB token used when authored song colors are unavailable. */
export const defaultRightNoteColor = "#39C96B";

/**
 * The pair-atomic AeroBeat fallback. Consumers must select this complete record;
 * they must never combine one authored side with one default side.
 *
 * @type {Readonly<AeroNotePalettePair>}
 */
export const defaultNotePalette = Object.freeze({
  left: defaultLeftNoteColor,
  right: defaultRightNoteColor,
  colorSpace: "srgb",
  alpha: 1
});

/** @typedef {"info_color_scheme" | "difficulty_custom_data"} AeroNotePaletteProvenanceKind */
/** @typedef {"v2" | "v4"} AeroNotePaletteInfoFormat */
/** @typedef {"v2_scheme" | "v2_custom" | "v4_scheme" | "v4_custom"} AeroNotePaletteFieldSet */

/**
 * Private archive-authority evidence. This record may be retained in source and
 * authored package integrity data, but must not be projected into public runtime
 * snapshots, events, telemetry, history, score records, or iframe messages.
 *
 * @typedef {Object} AeroNotePaletteProvenance
 * @property {AeroNotePaletteProvenanceKind} kind Selected archive authority.
 * @property {AeroNotePaletteInfoFormat} infoFormat Info.dat family, independent of beatmap format.
 * @property {string} infoHash Lowercase `sha256:<64 hex>` hash of inspected Info.dat bytes.
 * @property {string} difficultyHash Lowercase `sha256:<64 hex>` hash of the exact difficulty bytes.
 * @property {AeroNotePaletteFieldSet} fieldSet Exact schema-specific field family.
 * @property {number | null} schemeIndex Selected non-negative scheme index, or null for custom data.
 */

/**
 * @typedef {Object} AeroNotePalettePair
 * @property {string} left Canonical uppercase opaque `#RRGGBB` sRGB token.
 * @property {string} right Canonical uppercase opaque `#RRGGBB` sRGB token.
 * @property {"srgb"} colorSpace Color encoding; no gamma conversion has occurred.
 * @property {1} alpha Opaque alpha.
 */

/**
 * Difficulty-scoped, provider-neutral palette retained by source inspection.
 *
 * @typedef {AeroNotePalettePair & {
 *   schema: "aerobeat/source_note_palette",
 *   version: 1,
 *   provenance: AeroNotePaletteProvenance
 * }} AeroSourceNotePalette
 */

/**
 * Immutable authored-package palette. `paletteHash` binds the canonical palette
 * and private provenance into package integrity; it is presentation integrity,
 * not scoring identity. Shape validation does not authenticate this hash: the
 * package-authoring/integrity owner must recompute it from canonical bytes.
 *
 * @typedef {AeroNotePalettePair & {
 *   schema: "aerobeat/authored_note_palette",
 *   version: 1,
 *   paletteHash: string,
 *   provenance: AeroNotePaletteProvenance
 * }} AeroAuthoredNotePalette
 */

/**
 * Runtime-effective palette. Deliberately excludes archive provenance. Its hash
 * is structural here; the downstream content integrity owner must recompute it
 * before constructing or trusting an effective record.
 *
 * @typedef {Object} AeroEffectiveNotePalette
 * @property {"aerobeat/effective_note_palette"} schema Schema ID.
 * @property {1} version Schema version.
 * @property {string} left Canonical uppercase opaque `#RRGGBB` sRGB token.
 * @property {string} right Canonical uppercase opaque `#RRGGBB` sRGB token.
 * @property {"srgb"} colorSpace Color encoding.
 * @property {"song" | "aerobeat_default"} source Bounded effective source.
 * @property {string} paletteHash Lowercase `sha256:<64 hex>` integrity hash.
 */

/**
 * Private content-to-renderer appearance seam. It intentionally carries only the
 * effective fill token and cannot disclose palette source or provenance.
 *
 * @typedef {Object} AeroPrivateNoteAppearance
 * @property {string} appearanceColor Canonical uppercase opaque `#RRGGBB` sRGB fill token.
 */

const sha256TokenPattern = /^sha256:[0-9a-f]{64}$/u;
const canonicalColorPattern = /^#[0-9A-F]{6}$/u;

/**
 * @param {unknown} value
 * @returns {value is string}
 */
export function isCanonicalOpaqueSrgbColor(value) {
  return typeof value === "string" && canonicalColorPattern.test(value);
}

/**
 * @param {unknown} value
 * @returns {value is AeroNotePaletteProvenance}
 */
export function isNotePaletteProvenance(value) {
  if (!hasExactDataObject(value, ["kind", "infoFormat", "infoHash", "difficultyHash", "fieldSet", "schemeIndex"])) return false;
  if ((value.kind !== "info_color_scheme" && value.kind !== "difficulty_custom_data") ||
      (value.infoFormat !== "v2" && value.infoFormat !== "v4") ||
      typeof value.infoHash !== "string" || !sha256TokenPattern.test(value.infoHash) ||
      typeof value.difficultyHash !== "string" || !sha256TokenPattern.test(value.difficultyHash)) return false;

  const expectedFieldSet = `${value.infoFormat}_${value.kind === "info_color_scheme" ? "scheme" : "custom"}`;
  if (value.fieldSet !== expectedFieldSet) return false;
  return value.kind === "info_color_scheme"
    ? Number.isSafeInteger(value.schemeIndex) && Number(value.schemeIndex) >= 0
    : value.schemeIndex === null;
}

/**
 * @param {unknown} value
 * @returns {value is AeroSourceNotePalette}
 */
export function isSourceNotePalette(value) {
  return hasExactDataObject(value, ["schema", "version", "left", "right", "colorSpace", "alpha", "provenance"]) &&
    value.schema === "aerobeat/source_note_palette" && value.version === 1 &&
    isCanonicalPair(value) && isNotePaletteProvenance(value.provenance);
}

/**
 * @param {unknown} value
 * @returns {value is AeroAuthoredNotePalette}
 */
export function isAuthoredNotePalette(value) {
  return hasExactDataObject(value, ["schema", "version", "left", "right", "colorSpace", "alpha", "paletteHash", "provenance"]) &&
    value.schema === "aerobeat/authored_note_palette" && value.version === 1 &&
    isCanonicalPair(value) && typeof value.paletteHash === "string" && sha256TokenPattern.test(value.paletteHash) &&
    isNotePaletteProvenance(value.provenance);
}

/**
 * @param {unknown} value
 * @returns {value is AeroEffectiveNotePalette}
 */
export function isEffectiveNotePalette(value) {
  return hasExactDataObject(value, ["schema", "version", "left", "right", "colorSpace", "source", "paletteHash"]) &&
    value.schema === "aerobeat/effective_note_palette" && value.version === 1 &&
    isCanonicalOpaqueSrgbColor(value.left) && isCanonicalOpaqueSrgbColor(value.right) && value.colorSpace === "srgb" &&
    (value.source === "song" || value.source === "aerobeat_default") &&
    typeof value.paletteHash === "string" && sha256TokenPattern.test(value.paletteHash) &&
    (value.source !== "aerobeat_default" || (value.left === defaultLeftNoteColor && value.right === defaultRightNoteColor));
}

/**
 * @param {unknown} value
 * @returns {value is AeroPrivateNoteAppearance}
 */
export function isPrivateNoteAppearance(value) {
  return hasExactDataObject(value, ["appearanceColor"]) && isCanonicalOpaqueSrgbColor(value.appearanceColor);
}

/** @param {Readonly<Record<string, unknown>>} value */
function isCanonicalPair(value) {
  return isCanonicalOpaqueSrgbColor(value.left) && isCanonicalOpaqueSrgbColor(value.right) && value.colorSpace === "srgb" && value.alpha === 1;
}

/**
 * Require an ordinary Object-prototype record with exactly the named enumerable
 * own data properties. Descriptors are checked before values are read, so an
 * attacker-controlled accessor is never executed.
 *
 * @param {unknown} value
 * @param {readonly string[]} expectedKeys
 * @returns {value is Readonly<Record<string, unknown>>}
 */
function hasExactDataObject(value, expectedKeys) {
  if (typeof value !== "object" || value === null || Array.isArray(value) || Object.getPrototypeOf(value) !== Object.prototype) return false;
  const keys = Reflect.ownKeys(value);
  return keys.length === expectedKeys.length && keys.every((key) => {
    if (typeof key !== "string" || !expectedKeys.includes(key)) return false;
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    return descriptor !== undefined && descriptor.enumerable && "value" in descriptor;
  });
}
