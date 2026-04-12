# Migration Notes

This document records which external assets were considered during the Phase 2 migration, what was carried into CraftKit, and what was intentionally left out.

## Source assets surveyed

| Source | Path | Relationship to CraftKit |
|---|---|---|
| `prompt-builder` | `harness-stack/prompt-builder/skills/prompt-builder/` | Closest overlap — a mature, prompt-focused skill with a 5-step process, 6 building blocks, sharpening checks, and a quality checklist. |
| `references/autoresearch` | `harness-stack/references/autoresearch/` | An actual ML training-loop project, not a prompt-authoring asset. Philosophy only. |
| `references/analysis/` | `harness-stack/references/analysis/` | Comparative analysis docs (get-shit-done, claude-octopus, superpowers, multi-agent patterns, etc.). Context reading, not source material. |

## Adopted

### From `prompt-builder`

- **Failure-mode taxonomy.** The "Deep Check by failure mode" table in `quality-checklist.md` (Ambiguity / Scope / Context / Target-LLM failures) is a genuinely reusable diagnostic spine. Generalized and ported into `skills/craftkit-reflect/references/failure-modes.md`.
- **Sharpening principles.** Four ideas carry their weight across any prompt *or* skill: *context > instruction*, *outcome over process*, *cut in this order* (verbose roles → restated context → hedging; never cut examples or success criteria), *right-sized over thorough-looking*. Folded into `skills/craftkit-tune/SKILL.md` as a "Principles" section.
- **Worktree-relative path policy.** Core to any coding-agent artifact, not prompt-specific. Called out as a shared convention in `AGENTS.md`.
- **"The artifact is the product" stance.** Deliver polished text, not meta-commentary. Implicit in every CraftKit skill's "Output format" section — reinforced by the copy-pasteability criterion in `AGENTS.md`.

### From `references/autoresearch`

- **Philosophy of measured iteration.** The training-loop mindset — baseline, one change, re-evaluate, keep the winner — matches `craftkit-loop` exactly. Informed the "change one main thing at a time" guardrail; no code ported.

## Intentionally not carried over

- **Platform-specific guides** (`guides/claude-guide.md`, `gpt.md`, `gemini.md`, `perplexity.md`, `local-models.md`). CraftKit's core assets must stay provider-neutral. Users who need platform-specific prompt tuning should reach for `prompt-builder` directly.
- **Image/video generation templates.** Too narrow for a meta-layer toolkit. They belong with `prompt-builder`.
- **Session-handoff and system-prompt templates.** Useful, but they're concrete prompt templates, not prompt *authoring* tools. Out of scope for CraftKit's five core skills.
- **The 6 building blocks table.** Valuable for prompt authoring specifically, but CraftKit's blueprint skill is broader (prompts *and* skills). Forcing the same block list on skill design would be a cargo-cult.
- **Korean trigger keywords in frontmatter.** `prompt-builder` uses a custom `triggers:` field. CraftKit follows standard Claude Code skill-creator conventions — triggers live inside the `description` string, which is the actual mechanism Claude uses for skill invocation.
- **`prompt-builder` itself.** Left as a standalone repo. CraftKit sits one level above: it helps you design or improve prompts/skills, including prompt-builder if needed. Merging would dilute both.

## Relationship map

```
CraftKit (meta-layer: design, critique, tune, loop, research)
   │
   ├── can help improve → prompt-builder (prompt authoring)
   ├── can help improve → any skill repo
   └── can help design  → new skills from scratch
```

## Naming and terminology

No conflicts detected. CraftKit's five-skill vocabulary (blueprint / reflect / tune / loop / autoresearch) is orthogonal to `prompt-builder`'s building-block vocabulary (Role / Context / Task / Rules / Format / Examples), so both can coexist without overloading any term.

## Remaining migration candidates

- `references/analysis/21-multi-agent-patterns.md` and `22-orchestration-patterns.md` — may inform a future `craftkit-orchestrate` or expanded `craftkit-loop`, but only after the five core skills have settled.
- `prompt-builder/refs/*` (claude-code-prompt-improver, claude-skill-prompt-architect, etc.) — worth a dedicated `craftkit-autoresearch` pass once real usage reveals gaps in the current skills.
