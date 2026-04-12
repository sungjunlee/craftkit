# Migration Notes

This document records which external assets were considered during migration into CraftKit, what was carried in, and what was intentionally left out.

## Source assets surveyed

| Source | Path | Relationship to CraftKit |
|---|---|---|
| `prompt-builder` | `harness-stack/prompt-builder/skills/prompt-builder/` | A mature, prompt-focused skill with a 5-step process, 6 building blocks, sharpening checks, platform guides, and concrete templates. |
| `references/autoresearch` | `harness-stack/references/autoresearch/` | An actual ML training-loop project, not a prompt-authoring asset. Philosophy only. |
| `references/analysis/` | `harness-stack/references/analysis/` | Comparative analysis docs (get-shit-done, claude-octopus, superpowers, multi-agent patterns, etc.). Context reading, not source material. |

## Decisions

### `prompt-builder` — absorbed as `craft-prompt`

An earlier revision of this document kept `prompt-builder` as a separate repo and only copied selected patterns into CraftKit. Real usage showed the core use case of `prompt-builder` — especially **session handoff prompts** for carrying work into the next Claude Code or Codex session — is exactly what CraftKit users need most often. Keeping the two apart made the most-used workflow live outside CraftKit, which defeats the point of a toolkit.

The decision was reversed. `prompt-builder` is now absorbed as `skills/craft-prompt/` with its full structure intact:

- `SKILL.md` (renamed from `prompt-builder` to `craft-prompt`, description rewritten to skill-creator-style trigger wording, non-standard `version` and `triggers` frontmatter fields removed)
- `guides/` — platform-specific tips (claude, gpt, gemini, perplexity, local-models)
- `references/` — components guide, prompt patterns, quality checklist
- `templates/` — session-handoff, system-prompt, image-gen, video-gen

The original `harness-stack/prompt-builder/` repo can now be archived; CraftKit is the canonical home.

### Provider-specific material is OK inside `craft-prompt`

CraftKit's "core assets stay provider-neutral" rule applies to the five design/critique/improve skills (`craft-blueprint`, `craft-reflect`, `craft-tune`, `craft-loop`, `craft-autoresearch`). `craft-prompt`'s value *is* platform-aware prompt authoring, so its `guides/` directory containing Claude/GPT/Gemini/Perplexity-specific notes is expected and not a violation of the portability principle. The rule is "don't leak provider specifics into the core spine," not "no provider specifics anywhere."

### Patterns from `prompt-builder` that also fed the improvement skills

Before the full absorption, a handful of reusable spines were already extracted from `prompt-builder` into the other CraftKit skills. Those still stand:

- **Failure-mode taxonomy.** The "Deep Check by failure mode" table in `prompt-builder`'s `quality-checklist.md` became `skills/craft-reflect/references/failure-modes.md`, generalized to cover both prompts and skills.
- **Sharpening principles.** *Context > instruction*, *outcome over process*, *cut in this order*, *right-sized beats thorough-looking*. Folded into `skills/craft-tune/SKILL.md` as a "Principles" section.
- **Worktree-relative path policy.** Promoted to a shared convention in `AGENTS.md` since it applies to every CraftKit skill, not just prompt authoring.

These extractions now sit alongside the full `craft-prompt` skill. Some overlap is fine: an agent using `craft-tune` benefits from the Principles section without having to invoke `craft-prompt`, and vice versa.

### `references/autoresearch`

- **Philosophy of measured iteration.** The training-loop mindset — baseline, one change, re-evaluate, keep the winner — matches `craft-loop` exactly. Informed the "change one main thing at a time" guardrail. No code ported; this is an ML training project, not a prompt-authoring asset.

## Intentionally not carried over

- **The custom `triggers:` frontmatter field from `prompt-builder`.** Claude Code's skill invocation is driven by the `description` field, not a separate triggers list. The Korean and English triggers previously listed were merged into the `craft-prompt` description so the actual invocation mechanism gets the signal.
- **The `version:` frontmatter field.** Neither skill-creator nor Claude Code require it, and none of the other CraftKit skills use it. Removed from `craft-prompt` for consistency.
- **`prompt-builder/refs/*` external reference repos** (claude-code-prompt-improver, claude-skill-prompt-architect, jeffallan-claude-skills, etc.). These are research inputs, not authored assets. They belong in a future `craft-autoresearch` pass rather than being copied into the skill.

## Relationship map

```
CraftKit (one toolkit)
  │
  ├── craft-prompt        → generate a new prompt from scratch
  ├── craft-blueprint     → design a new prompt or skill structure
  ├── craft-reflect       → critique an existing artifact
  ├── craft-tune          → edit an existing artifact with minimal diff
  ├── craft-loop          → iterate with small, measured changes
  └── craft-autoresearch  → study comparable assets and synthesize
```

Generation lives next to improvement, so the toolkit covers the full artifact lifecycle inside one repo.

## Naming

- Brand name: `CraftKit`.
- Skill prefix: `craft-` (chosen so skill names read as verb-phrases: "craft a prompt," "craft a blueprint"). The prefix differs from the brand on purpose — `craft-prompt-builder` would be too long, and `craftkit-prompt` is harder to say aloud.
- Skill names are orthogonal to any vocabulary inside `craft-prompt` (Role / Context / Task / Rules / Format / Examples), so both can coexist without term overloading.

## Remaining migration candidates

- `references/analysis/21-multi-agent-patterns.md` and `22-orchestration-patterns.md` — may inform a future `craft-orchestrate` or expanded `craft-loop`, but only after the six current skills have settled through real usage.
- `prompt-builder/refs/*` — worth a dedicated `craft-autoresearch` pass once real usage reveals gaps in `craft-prompt`.
