# CraftKit

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

CraftKit is a cross-agent toolkit for creating, improving, and operationalizing prompts and skills for coding agents such as Claude Code and Codex.

## Why CraftKit

Prompt assets and agent skills often become fragmented, provider-specific, and hard to reuse. CraftKit exists to keep them file-first, portable, reviewable, and easy to improve over time.

## Install

All six skills install as [Claude Code custom slash commands](https://docs.anthropic.com/en/docs/claude-code/skills).

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

## The six skills

| Skill | Use when |
|---|---|
| `craft-prompt` | a new prompt is needed from scratch for any LLM (Claude, GPT, Gemini, Perplexity, etc.) |
| `craft-scaffold` | a rough idea needs structure — goals, inputs, workflow, outputs — before implementation |
| `craft-critique` | a prompt or skill "feels off" and a diagnostic pass should come before any rewrite |
| `craft-tune` | an existing prompt is close but needs targeted, minimal-diff sharpening |
| `craft-survey` | a new skill should be grounded in prior art, extracting only patterns that carry their weight |
| `craft-autoresearch` | a prompt or skill works "sometimes" and needs eval-driven iteration (Karpathy-style) |

Each skill lives at `skills/<skill-name>/SKILL.md` — plain markdown with YAML frontmatter, loadable as a Claude Code skill or copy-pasteable into any other agent.

## Status

All six skills have been optimized through `craft-autoresearch` passes against eval suites — including `craft-autoresearch` itself (reflexive meta-pass). Per-session baseline → kept-state scores and mutation rationale live in the commit bodies. Run artifacts are preserved at `~/.craftkit/autoresearch/<skill>/<date-slug>/` outside the repo.

## What belongs in CraftKit

- generating new prompts from scratch (task, research, session handoff, templates)
- prompt design and restructuring
- reusable skill design
- diagnostic critique and quality checks
- iterative improvement loops
- survey-backed best practices
- copy-pasteable outputs for agent workflows

## Design principles

1. File-first and diff-friendly
2. Small composable units
3. Explicit inputs and outputs
4. Cross-agent portability (core skill spines stay provider-neutral; platform-specific detail stays in sub-skills like `craft-prompt/guides/`)
5. Eval-driven improvement when possible
6. Copy-pasteable results over fancy abstractions

## Repository layout

```text
.
├─ README.md
├─ AGENTS.md
├─ LICENSE
├─ docs/
│  ├─ product.md
│  ├─ roadmap.md
│  └─ examples/
│     └─ tune-a-prompt.md
├─ skills/
│  ├─ craft-prompt/
│  │  ├─ SKILL.md
│  │  ├─ guides/       (platform-specific tips: claude, gpt, gemini, perplexity, local)
│  │  ├─ references/   (components, patterns, quality checklist)
│  │  └─ templates/    (session-handoff, system-prompt, image-gen, video-gen)
│  ├─ craft-scaffold/
│  │  └─ SKILL.md
│  ├─ craft-critique/
│  │  ├─ SKILL.md
│  │  └─ references/
│  │     └─ failure-modes.md
│  ├─ craft-tune/
│  │  └─ SKILL.md
│  ├─ craft-survey/
│  │  └─ SKILL.md
│  └─ craft-autoresearch/
│     ├─ SKILL.md
│     └─ references/
│        ├─ eval-guide.md
│        ├─ mutation-guide.md
│        └─ worked-example.md
└─ package.json
```

## Use in other agents

CraftKit skills are plain markdown with YAML frontmatter, so they port easily:

1. Open the relevant `SKILL.md`.
2. Paste the body (everything after the frontmatter) into the target agent's system prompt or instructions.
3. Keep the frontmatter `description` line as context so the agent knows when to apply the skill.

See [`docs/examples/tune-a-prompt.md`](docs/examples/tune-a-prompt.md) for a walk-through of critiquing an existing prompt, tuning it, and running a short improvement loop.

## Prior art

- [`sungjunlee/prompt-builder`](https://github.com/sungjunlee/prompt-builder) — predecessor project. Its mature prompt-authoring asset (5-step process, 6 building blocks, platform guides, templates) was absorbed wholesale into `craft-prompt`. Kept on GitHub for reference; new work happens here.
- [`karpathy/autoresearch`](https://github.com/karpathy/autoresearch) — Andrej Karpathy's ML training-loop project that introduced the autoresearch methodology (give an agent a baseline, let it experiment overnight, keep what improves, discard what doesn't). `craft-autoresearch` adapts that loop discipline to prompt and skill artifacts instead of model training code.
- [`byungjunjang/jangpm-meta-skills`](https://github.com/byungjunjang/jangpm-meta-skills) — four-skill meta toolkit for Claude Code and Codex (`blueprint`, `deep-dive`, `reflect`, `autoresearch`). Its `autoresearch` skill contributed implementation patterns — experiment contract shape, the three-eval-type taxonomy (binary / comparative / fidelity), deletion discipline — that `craft-autoresearch` builds on.

## License

MIT — see [LICENSE](LICENSE).
