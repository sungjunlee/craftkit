# Changelog — autoresearch-craft-reflect

## baseline (2026-04-12)

- **Score**: 9/9 binary (100%). skill_lines 100, folder_lines 191.
- **Inputs**: short (3-line vague prompt), medium (craft-blueprint SKILL.md, 115 lines), long (craft-prompt SKILL.md, 137 lines).
- **Finding**: baseline saturates the binary evals, which means the evals only check shape (section count, issue count, imperative phrasing). Qualitative inspection shows real gaps the evals don't catch:
  - Recommended-changes items map 1:1 to Issues items — no prioritization or consolidation.
  - Minimal-rewrite-plan is a subset of Recommended-changes rather than a prioritized sequence.
  - Failure-modes often restate Issues in future tense rather than adding a distinct dimension.
  - No severity or priority labels anywhere.
- **Decision**: stop before running any mutations. Mutating against a saturated suite would produce noise. Strengthen the evals first.
- **Next**: see `research-log.json` direction shift #2.
