# Changelog

All notable changes to CraftKit are documented here. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); CraftKit adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- **New skill `craft-skill-spec`** — designs a new skill spec from a rough idea using CraftKit's internal `skill-radar` layer instead of starting from fresh web research every time. Produces a concrete skill thesis, radar-based adopt/avoid/watch judgment, file plan, trigger draft, and first eval plan. Positioned as the decision layer between a vague skill idea and drafting the actual `SKILL.md`.
- **New skill `craft-handoff`** — wraps up the current session and produces a copy-paste-ready continuation prompt for the next session. Gathers git state via inline shell (`!`git status`` etc.), distills decisions/blockers from conversation, writes the prompt to `~/.craftkit/handoff/pending.md`, and copies it to the system clipboard via a cross-platform wrapper (`pbcopy` → `wl-copy` → `xclip` → `xsel` → `clip.exe`). Ships with an optional `SessionStart`-hook installer (`references/auto-load-hook.md` + `scripts/load-pending-hook.mjs`) that auto-injects the handoff into the post-`/clear` session, eliminating the manual paste step. Built on the platform finding that built-in commands like `/clear` cannot be triggered from the Skill tool, but `SessionStart` with `matcher: "clear"` can return `additionalContext` to bridge the gap.
- `## Prior art` section in README crediting the three projects CraftKit grew out of: `sungjunlee/prompt-builder` (predecessor — its prompt-authoring asset was absorbed into `craft-prompt`), `karpathy/autoresearch` (ML training-loop project that introduced the autoresearch methodology), and `byungjunjang/jangpm-meta-skills` (four-skill meta toolkit for Claude Code and Codex whose `autoresearch` skill contributed implementation patterns to `craft-autoresearch`).
- AGENTS.md absorbs the operational notes that previously lived in CLAUDE.md (`## craft-autoresearch workflow` and `## Commit prefixes`) so both Claude Code and Codex agents see the same conventions.
- `docs/skill-radar/` — new time-aware curation layer for evolving skill-authoring patterns. Adds a baseline snapshot (`2026-04.md`), a canonical judgment file (`current.md`), a durable `decision-log.md`, and a reusable `TEMPLATE.md` so future meta-skills can read stable guidance without re-browsing the full web every time.

### Changed

- `skills/craft-autoresearch/SKILL.md` § Purpose — Karpathy credit now links to the source [`karpathy/autoresearch`](https://github.com/karpathy/autoresearch) repo, not just "the methodology."
- `CLAUDE.md` is now a symbolic link to `AGENTS.md`. Single source of truth for repo conventions; Claude Code and Codex both read the same content. (Windows users without `core.symlinks=true` will see `CLAUDE.md` as a text file containing the path `AGENTS.md` — open `AGENTS.md` directly.)

### Removed

- `docs/migration.md` — internal history of how CraftKit absorbed earlier assets (`prompt-builder`, `craft-loop`, etc.) and renamed pre-v0.1.0 skills. The file served as a design diary during bootstrap; for a public reader it was noise. External attribution that previously lived here (the `jangpm-meta-skills` autoresearch implementation that informed `craft-autoresearch`'s spine) is now credited inline in `skills/craft-autoresearch/SKILL.md` and listed in the new README `## Prior art` section.
- `docs/product.md` and `docs/roadmap.md` — bootstrap-era artifacts. Product notes mostly duplicated README + per-skill `description:` fields; roadmap phases 0–3 were complete and phase 4 was speculative. The genuinely useful piece (the worked walkthrough at `docs/examples/tune-a-prompt.md`) is kept.
- README `## Repository layout` tree — for a docs-first toolkit the standard `skills/<name>/SKILL.md` convention is documented in AGENTS.md and adds no surprise; the tree was a maintenance burden every reorganization.
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
