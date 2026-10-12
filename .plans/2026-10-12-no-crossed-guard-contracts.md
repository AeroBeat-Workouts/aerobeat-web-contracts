# Remove crossed guard from public map contracts

**Status:** approved next-version work; owner web-contracts, Bead `aerobeat-web-assembly-ndl9` in assembly ledger (no local Beads DB). Parent assembly plan `.plans/2026-10-12-boxing-guards-nose-parallax-next-version.md`. No live release/route changes.

**Diagnosis:** `src/content-contracts.js` admits `crossed_guard` as map modifier, `src/gameplay-contracts.js` admits it as Boxing action. Derrick forbids the concept in authored/resolved/persisted AeroBeat maps, not merely swapping shield colors. Existing legacy signed packages must fail closed/reimport from verified source, never have hashed bytes silently mutated.

**Implementation/acceptance:** Remove crossing from public modifier/action enums and validators; replace old allowed fixture expectations with negative crossing input and standard same-side guard positive. Keep unrelated modifiers, strict validation/privacy, ordinary guard two-hand scoring contract. Run normal unit/type gates, clear README; show focused fix-disabled failure/restored pass if feasible. Commit/push coherent source, give exact SHA/tree and downstream test migration notes to authoring/content/gameplay/renderer/assembly. Parent audits cross-repo pins; do not repoint private/public previews.
