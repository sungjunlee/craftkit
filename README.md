# CraftKit

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

CraftKit is a cross-agent toolkit for creating, improving, and operationalizing prompts and skills for coding agents such as Claude Code and Codex.

## Why CraftKit

Prompt assets and agent skills often become fragmented, provider-specific, and hard to reuse. CraftKit exists to keep them file-first, portable, reviewable, and easy to improve over time.

## Install

All eight skills install as Agent Skills and are invocable in Claude Code through slash-style skill discovery. They are also plain `SKILL.md` files that can be used by Codex and other compatible agents.

### Via npx skills

```bash
npx skills add sungjunlee/craftkit
```

Add `-g -y` for global install without prompts:

```bash
npx skills add sungjunlee/craftkit -g -y
```

### Via Claude Code Plugin Marketplace

```
/plugin marketplace add https://github.com/sungjunlee/craftkit.git
/plugin install craftkit@craftkit
```

<details>
<summary>Install from a local clone</summary>

```bash
git clone https://github.com/sungjunlee/craftkit.git
cd craftkit
npx skills add . -g -y
```
</details>

For Codex or any other agent, see [Use in other agents](#use-in-other-agents) below.

## The eight skills

| Skill | Use when | Side effect |
|---|---|---|
| `craft-prompt` | a new prompt is needed from scratch for any LLM (Claude, GPT, Gemini, Perplexity, etc.) | returns copy-pasteable text |
| `craft-skill-spec` | a new skill needs a concrete spec based on current CraftKit skill-radar judgments before writing `SKILL.md` | returns a spec; reads radar references |
| `craft-harness` | a project-specific agent harness needs to be built, repaired, synced, pruned, or evolved across Codex and Claude Code | may inspect and edit repo-local harness files; gates risky surfaces |
| `craft-critique` | an existing prompt or skill needs a read-only review before editing or shipping | surfaces strengths, prioritized findings, recommendations, and a rewrite plan without editing |
| `craft-tune` | an existing prompt or skill needs sharpening applied | runs an autonomous review-and-fix loop and edits the artifact |
| `craft-survey` | a new skill should be grounded in prior art before drafting | returns read-only recommendations |
| `craft-autoresearch` | a prompt or skill works "sometimes" and needs eval-driven iteration | runs evals and may edit mutable files |
| `craft-handoff` | a session is ending and the next session needs a copy-paste-ready continuation prompt | writes handoff files and may copy to clipboard |

When two skills could trigger, choose the least invasive one that answers the request: review-only wording goes to `craft-critique`; apply/fix/improve wording goes to `craft-tune`; repeated measurable failures go to `craft-autoresearch`; prior-art questions go to `craft-survey`; repo harness placement and Codex/Claude setup work goes to `craft-harness`.

Each skill lives at `skills/<skill-name>/SKILL.md` — plain markdown with YAML frontmatter, loadable as a Claude Code skill or copy-pasteable into any other agent.

## Status

Six of the eight skills (`craft-prompt`, `craft-critique`, `craft-tune`, `craft-survey`, `craft-autoresearch`, `craft-handoff`) have been optimized through `craft-autoresearch` passes against eval suites — including `craft-autoresearch` itself (reflexive meta-pass). `craft-tune` was reshaped to run an autonomous self-converging review-and-fix loop; the read-only diagnose role stays with the separate `craft-critique` skill. The next autoresearch pass will run against this shape. `craft-skill-spec` and `craft-harness` are new and have not yet been through an autoresearch pass. Per-session baseline → kept-state scores and mutation rationale live in the commit bodies. Run artifacts are preserved at `~/.craftkit/autoresearch/<skill>/<date-slug>/` outside the repo.

| Skill | Eval status | Score source | Known gap |
|---|---|---|---|
| `craft-prompt` | autoresearch pass completed | commit body + `~/.craftkit/autoresearch/craft-prompt/<date-slug>/` | keep volatile provider guidance in guides |
| `craft-critique` | autoresearch pass completed | commit body + `~/.craftkit/autoresearch/craft-critique/<date-slug>/` | re-run on fresh failure examples after major wording changes |
| `craft-tune` | autoresearch pass completed, then reshaped into self-converging loop | commit body + `~/.craftkit/autoresearch/craft-tune/<date-slug>/` | next pass should test the newer loop contract |
| `craft-survey` | autoresearch pass completed | commit body + `~/.craftkit/autoresearch/craft-survey/<date-slug>/` | example must keep proving provenance and edit-target rules |
| `craft-autoresearch` | reflexive autoresearch pass completed | commit body + `~/.craftkit/autoresearch/craft-autoresearch/<date-slug>/` | examples must stay synchronized with the contract fields |
| `craft-skill-spec` | not yet autoresearched | none yet | first pass should test radar-dependent standalone behavior |
| `craft-harness` | not yet autoresearched | none yet | first pass should test lifecycle modes, Codex/Claude target separation, and risk gates |
| `craft-handoff` | autoresearch pass completed | commit body + `~/.craftkit/autoresearch/craft-handoff/2026-05-26-goal-pressure/` | replay against real agent outputs to catch wording failures beyond deterministic checks |

## What belongs in CraftKit

- generating new prompts from scratch (task, research, session handoff, templates)
- prompt design and restructuring
- reusable skill design
- project-specific agent harness design and maintenance
- diagnostic review and minimal-diff editing
- iterative improvement loops
- survey-backed best practices
- time-aware curation of evolving skill-authoring patterns
- copy-pasteable outputs for agent workflows

## Design principles

1. File-first and diff-friendly
2. Small composable units
3. Explicit inputs and outputs
4. Cross-agent portability (core skill spines stay provider-neutral; platform-specific detail stays in guides or reference files)
5. Eval-driven improvement when possible
6. Copy-pasteable results over fancy abstractions

For evolving skill-authoring guidance, the `craft-skill-spec` skill carries its own radar layer at `skills/craft-skill-spec/references/radar/` — start with `current.md` there and consult the dated snapshots only when a `watch` item needs deeper context.

`craft-harness` also ships reviewable hook asset recipes under `skills/craft-harness/assets/hooks/`. They provide shared `.agents/hooks/scripts/` scripts plus Codex and Claude adapter snippets; they are intentionally not auto-installers.

## Use in other agents

CraftKit skills are plain markdown with YAML frontmatter, so they port easily:

1. Open the relevant `SKILL.md`.
2. Paste the body (everything after the frontmatter) into the target agent's system prompt or instructions.
3. Keep the frontmatter `description` line as context so the agent knows when to apply the skill.

See [`docs/examples/tune-a-prompt.md`](docs/examples/tune-a-prompt.md) for a walk-through of diagnosing and tuning an existing prompt, then optionally running a short improvement loop.

## Prior art

- [`sungjunlee/prompt-builder`](https://github.com/sungjunlee/prompt-builder) — predecessor project. Its mature prompt-authoring asset (5-step process, 6 building blocks, platform guides, templates) was absorbed wholesale into `craft-prompt`. Kept on GitHub for reference; new work happens here.
- [`karpathy/autoresearch`](https://github.com/karpathy/autoresearch) — Andrej Karpathy's ML training-loop project that introduced the autoresearch methodology (give an agent a baseline, let it experiment overnight, keep what improves, discard what doesn't). `craft-autoresearch` adapts that loop discipline to prompt and skill artifacts instead of model training code.
- [`byungjunjang/jangpm-meta-skills`](https://github.com/byungjunjang/jangpm-meta-skills) — four-skill meta toolkit for Claude Code and Codex (`blueprint`, `deep-dive`, `reflect`, `autoresearch`). Its `autoresearch` skill contributed implementation patterns — experiment contract shape, the three-eval-type taxonomy (binary / comparative / fidelity), deletion discipline — that `craft-autoresearch` builds on.

## License

MIT — see [LICENSE](LICENSE).
