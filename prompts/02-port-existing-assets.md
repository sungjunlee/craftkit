Review the current workspace for existing prompt-builder assets, meta-skills, or related prompt/skill documents that can be migrated into CraftKit.

Goal:
Port the reusable parts into CraftKit without dragging in accidental complexity.

Tasks:
1. Inspect existing assets that overlap with Blueprint, Reflect, Tune, Loop, or Autoresearch.
2. Identify what should be:
   - adopted
   - renamed
   - merged
   - rewritten
   - dropped
3. Update the relevant CraftKit skill files under `skills/<skill-name>/SKILL.md` with the best reusable patterns. Preserve the YAML frontmatter and trigger-oriented `description` field.
4. Create `docs/migration.md` summarizing:
   - source asset
   - what was reused
   - what was changed
   - what was intentionally not carried over
5. Keep terminology aligned with the CraftKit top-level model.

Constraints:
- Prefer synthesis over direct copying.
- Prefer stable concepts over source-specific naming.
- Keep provider-specific wording out of core assets unless clearly isolated.
- Preserve provenance notes in `docs/migration.md`.

Final output:
- concise migration summary
- files changed
- remaining migration candidates
- any naming conflicts or unresolved choices
