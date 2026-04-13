# Changelog

All notable changes to CraftKit are documented here. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); CraftKit adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- `## Prior art` section in README crediting the three projects CraftKit grew out of: `sungjunlee/prompt-builder` (predecessor — its prompt-authoring asset was absorbed into `craft-prompt`), `karpathy/autoresearch` (ML training-loop project that introduced the autoresearch methodology), and `byungjunjang/jangpm-meta-skills` (four-skill meta toolkit for Claude Code and Codex whose `autoresearch` skill contributed implementation patterns to `craft-autoresearch`).

### Changed

- `skills/craft-autoresearch/SKILL.md` § Purpose — Karpathy credit now links to the source [`karpathy/autoresearch`](https://github.com/karpathy/autoresearch) repo, not just "the methodology."

### Removed

- `docs/migration.md` — internal history of how CraftKit absorbed earlier assets (`prompt-builder`, `craft-loop`, etc.) and renamed pre-v0.1.0 skills. The file served as a design diary during bootstrap; for a public reader it was noise. External attribution that previously lived here (the `jangpm-meta-skills` autoresearch implementation that informed `craft-autoresearch`'s spine) is now credited inline in `skills/craft-autoresearch/SKILL.md` and listed in the new README `## Prior art` section.
- References to the `autoloop` sibling project (README `## Related tools` section, `craft-autoresearch/SKILL.md` scope paragraph, `docs/product.md` Autoresearch entry). The project isn't public yet; pointing readers at an inaccessible repo is worse than omitting it. The conceptual distinction — autoresearch targets prompt/skill output quality, not code metrics — is preserved inline where it still helps the reader.

## [0.1.1] — 2026-04-13

### Changed

- **Renamed three skills** for clearer invocation semantics and to end a root-word collision:
  - `craft-reflect` → **`craft-critique`** — matches what users actually type ("critique this," "review this") instead of the softer, more ambiguous "reflect."
  - `craft-research` → **`craft-survey`** — ends the root-word collision with `craft-autoresearch`, which does eval-driven optimization (not prior-art research). Distinct verbs now signal distinct skills.
  - `craft-blueprint` → **`craft-scaffold`** — matches the established programming "scaffolding" metaphor used by frameworks like Rails and Yeoman.
- In-body terminology in the three renamed skills was updated to match (e.g. `### Blueprint` → `### Scaffold`, `Reflecting before rewriting` → `Critiquing before rewriting`, `Research target` → `Survey target`). Output-format rules and eval-driven scoring behavior are unchanged.
- Cross-references updated throughout `craft-autoresearch` (SKILL.md and its `eval-guide.md` / `mutation-guide.md` / `worked-example.md`), README, AGENTS.md, `docs/product.md`, `docs/roadmap.md`, `docs/examples/tune-a-prompt.md`, `docs/migration.md`, and the plugin marketplace manifest.

### Migration

If you referenced the old skill names in your own setup, update to the new names. There is no compat shim — the directories and frontmatter `name:` fields are the authoritative trigger mechanism, and the `description:` fields still include the old trigger words (e.g. "blueprint," "reflect," "research") as aliases so natural-language invocation keeps working.

## [0.1.0] — 2026-04-13

Initial public-ready release.

### Added

- Six `craft-*` skills for prompt and skill authoring: `craft-prompt` (generate), `craft-blueprint` (design), `craft-reflect` (critique), `craft-tune` (edit), `craft-research` (prior-art survey), `craft-autoresearch` (eval-driven optimization loop).
- All six skills optimized through `craft-autoresearch` eval-driven passes against scored rubrics. Baseline → kept-state scores and mutation rationale live in the commit history.
- Claude Code plugin manifest at `.claude-plugin/marketplace.json` — installable via `/plugin marketplace add` and `/plugin install craftkit@craftkit`.
- `npx skills` compatibility — installable via `npx skills add sungjunlee/craftkit`.
- `AGENTS.md` with shared conventions (Node-first tooling, XML-tag structure, English tag names, no provider-specific tool names in skill spines).
- `docs/product.md`, `docs/roadmap.md`, `docs/migration.md`, `docs/examples/tune-a-prompt.md`.
- MIT license.

[0.1.1]: https://github.com/sungjunlee/craftkit/releases/tag/v0.1.1
[0.1.0]: https://github.com/sungjunlee/craftkit/releases/tag/v0.1.0
