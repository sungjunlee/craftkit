# Migration Notes

This document records which external assets were considered during migration into CraftKit, what was carried in, and what was intentionally left out.

## Source assets surveyed

| Source | Path | Relationship to CraftKit |
|---|---|---|
| `prompt-builder` | `harness-stack/prompt-builder/skills/prompt-builder/` | A mature, prompt-focused skill with a 5-step process, 6 building blocks, sharpening checks, platform guides, and concrete templates. |
| `jangpm-meta-skills` autoresearch | `https://github.com/byungjunjang/jangpm-meta-skills` (`.agents/skills/autoresearch/`) | A Codex-focused implementation of Karpathy's autoresearch methodology for skill optimization. Primary reference for `craft-autoresearch`. |
| `autoloop` | `harness-stack/autoloop/skills/autoloop/` | Autonomous improve-measure-keep loop for generic code metrics (coverage, bundle size, lint). Different target than CraftKit autoresearch — sits alongside as a sibling. |
| `references/autoresearch` | `harness-stack/references/autoresearch/` | An ML training-loop project, not a prompt-authoring asset. Philosophy only. |
| `references/analysis/` | `harness-stack/references/analysis/` | Comparative analysis docs (get-shit-done, claude-octopus, superpowers, multi-agent patterns, etc.). Context reading, not source material. |

## Decisions

### `prompt-builder` — absorbed as `craft-prompt`

An earlier revision of this document kept `prompt-builder` as a separate repo and only copied selected patterns into CraftKit. Real usage showed the core use case of `prompt-builder` — especially **session handoff prompts** for carrying work into the next Claude Code or Codex session — is exactly what CraftKit users need most often. Keeping the two apart made the most-used workflow live outside CraftKit, which defeats the point of a toolkit.

The decision was reversed. `prompt-builder` is now absorbed as `skills/craft-prompt/` with its full structure intact:

- `SKILL.md` (renamed, description rewritten to skill-creator-style trigger wording, non-standard `version` and `triggers` frontmatter fields removed)
- `guides/` — platform-specific tips (claude, gpt, gemini, perplexity, local-models)
- `references/` — components guide, prompt patterns, quality checklist
- `templates/` — session-handoff, system-prompt, image-gen, video-gen

The original `harness-stack/prompt-builder/` repo can now be archived; CraftKit is the canonical home.

### `craft-autoresearch` — eval-driven loop, not prior-art study

The first pass accidentally created a `craft-autoresearch` skill that did "survey comparable assets and extract patterns" — which is prior-art study, not autoresearch. At the same time, a `craft-loop` skill did generic human-in-the-loop iteration. Neither matched Karpathy's autoresearch methodology, which is the eval-driven optimization loop — run the artifact on test inputs, score outputs, mutate the prompt or skill, KEEP improvements, DISCARD regressions.

The two skills were swapped and one was rewritten:

- **`craft-loop` was renamed to `craft-autoresearch`** and its content fully rewritten as an eval-driven loop, adapted from the jangpm `autoresearch` skill. Added `references/eval-guide.md` and `references/mutation-guide.md`.
- **The original `craft-autoresearch` was renamed to `craft-survey`** (initially `craft-research`, later renamed again on 2026-04-13 to avoid a root-word collision with `craft-autoresearch`) because "prior-art survey" is accurate for what it does and is distinct from the eval loop.

The rewrite takes from jangpm's autoresearch:

- experiment contract (target, inputs, evals, harness, budget, stop condition)
- three eval types (binary, comparative, fidelity) and the determinism hierarchy
- KEEP/DISCARD rules keyed on score movement *and* artifact size
- mandatory deletion experiments every five iterations to guard against bloat
- false-positive tracking when eval scores rise but real outputs feel worse

Taken from `harness-stack/autoloop`:

- safety rail on rollback — never `git reset --hard`; roll back only the files touched in the mutation
- explicit resume model when a previous run folder exists

Deliberate differences from jangpm's version:

- Shorter SKILL.md (skill-creator's <500-line target). Depth pushed into two reference files instead of seven.
- No dashboard artifact in v1 (platform-specific HTML adds maintenance cost without pulling its weight yet).
- Clear separation from `autoloop`: CraftKit autoresearch targets prompt and skill *output quality*; `autoloop` targets generic code metrics. They coexist.

### Provider-specific material is OK inside `craft-prompt`

CraftKit's "core assets stay provider-neutral" rule applies to the design/critique/improve skills (`craft-scaffold`, `craft-critique`, `craft-tune`, `craft-survey`, `craft-autoresearch`). `craft-prompt`'s value *is* platform-aware prompt authoring, so its `guides/` directory containing Claude/GPT/Gemini/Perplexity-specific notes is expected and not a violation of the portability principle. The rule is "don't leak provider specifics into the core spine," not "no provider specifics anywhere."

### Patterns from `prompt-builder` that also fed the improvement skills

Before the full absorption, a handful of reusable spines were already extracted from `prompt-builder` into the other CraftKit skills. Those still stand:

- **Failure-mode taxonomy.** The "Deep Check by failure mode" table in `prompt-builder`'s `quality-checklist.md` became `skills/craft-critique/references/failure-modes.md`, generalized to cover both prompts and skills.
- **Sharpening principles.** *Context > instruction*, *outcome over process*, *cut in this order*, *right-sized beats thorough-looking*. Folded into `skills/craft-tune/SKILL.md` as a "Principles" section.
- **Worktree-relative path policy.** Promoted to a shared convention in `AGENTS.md` since it applies to every CraftKit skill, not just prompt authoring.

These extractions now sit alongside the full `craft-prompt` skill. Some overlap is fine: an agent using `craft-tune` benefits from the Principles section without having to invoke `craft-prompt`, and vice versa.

### `references/autoresearch` (the ML training-loop project)

- **Philosophy of measured iteration.** The training-loop mindset — baseline, one change, re-evaluate, keep the winner — is structurally the same idea as `craft-autoresearch`. Informed the "change one main thing at a time" guardrail. No code ported; this is an ML training project, not a prompt-authoring asset.

## Intentionally not carried over

- **The custom `triggers:` frontmatter field from `prompt-builder`.** Claude Code's skill invocation is driven by the `description` field, not a separate triggers list. The Korean and English triggers previously listed were merged into the `craft-prompt` description so the actual invocation mechanism gets the signal.
- **The `version:` frontmatter field.** Neither skill-creator nor Claude Code require it, and none of the other CraftKit skills use it. Removed from `craft-prompt` for consistency.
- **`prompt-builder/refs/*` external reference repos** (claude-code-prompt-improver, claude-skill-prompt-architect, jeffallan-claude-skills, etc.). These are research inputs, not authored assets. They belong in a future `craft-survey` pass rather than being copied into the skill.
- **jangpm's dashboard and seven reference files.** The dashboard is useful but platform-specific HTML adds maintenance cost without clear early payoff. The reference files were condensed into two: `eval-guide.md` (eval types, determinism, quality check) and `mutation-guide.md` (mutation levels, deletion discipline). Execution-guide, pipeline-guide, and worked-example material was either folded into `SKILL.md` directly or deferred to real usage.

## Relationship map

```
CraftKit (one toolkit)
  │
  ├── craft-prompt        → generate a new prompt from scratch
  ├── craft-scaffold      → design a new prompt or skill structure
  ├── craft-critique      → critique an existing artifact
  ├── craft-tune          → edit an existing artifact with minimal diff
  ├── craft-survey        → one-shot prior-art survey and pattern synthesis
  └── craft-autoresearch  → eval-driven autonomous optimization loop

Sibling:
  autoloop (separate repo)   → generic code-metric optimization loop
                               (coverage, bundle size, lint, perf)
```

Generation lives next to improvement, so the toolkit covers the full artifact lifecycle inside one repo. `autoloop` stays separate because its target is code metrics, not prompt/skill output quality.

## Naming

- Brand name: `CraftKit`.
- Skill prefix: `craft-` (chosen so skill names read as verb-phrases: "craft a prompt," "craft a scaffold"). The prefix differs from the brand on purpose — `craft-prompt-builder` would be too long, and `craftkit-prompt` is harder to say aloud.
- `craft-survey` vs `craft-autoresearch` — `survey` is a one-shot prior-art study; `autoresearch` is the autonomous eval-driven loop. The two names were given distinct roots on purpose so neither reads like a variant of the other (earlier names `craft-research` / `craft-autoresearch` shared a root and kept confusing readers — renamed 2026-04-13). The distinction is also called out in both descriptions so the right one triggers.
- Skill names are orthogonal to any vocabulary inside `craft-prompt` (Role / Context / Task / Rules / Format / Examples), so both can coexist without term overloading.

## Remaining migration candidates

- `references/analysis/21-multi-agent-patterns.md` and `22-orchestration-patterns.md` — may inform a future `craft-orchestrate` skill, but only after the six current skills have settled through real usage.
- `prompt-builder/refs/*` — worth a dedicated `craft-survey` pass once real usage reveals gaps in `craft-prompt`.
- jangpm's `blueprint`, `deep-dive`, and `reflect` skills — worth comparing against the current CraftKit versions (`craft-scaffold`, `craft-critique`, etc.) in a future iteration. Not a blocker; current skills are coherent on their own terms.
- Moving the autoresearch run harness from "describe in SKILL.md" to a real Node script (e.g. `scripts/run-experiment.mjs`) once real usage produces a repeatable harness pattern.
