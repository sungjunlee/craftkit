# CraftKit

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

CraftKit is a cross-agent toolkit for creating, improving, and operationalizing prompts and skills for coding agents such as Claude Code and Codex.

## Why CraftKit

Prompt assets and agent skills often become fragmented, provider-specific, and hard to reuse. CraftKit exists to keep them file-first, portable, reviewable, and easy to improve over time.

CraftKit is an artifact-quality toolkit: it helps author, critique, tune, and carry forward prompts and skills. It is not a general coding-agent workflow suite, project-management layer, deployment system, or runtime framework. When a workflow needs those things, CraftKit should produce clear files, specs, or handoffs that another tool can use rather than becoming the tool itself.

## 30-second path

Start with the smallest skill that does the job:

| If you need to... | Use |
|---|---|
| write a new prompt or reusable prompt template | `craft-prompt` |
| review an existing prompt or skill without changing it | `craft-critique` |
| improve an existing prompt or skill in place | `craft-tune` |

Reach for the other skills when the job gets more specific:

- `craft-survey` — study prior art before drafting.
- `craft-autoresearch` — run measured iterations with test inputs and an eval runner.
- `craft-skill-spec` — decide the shape of a new skill-like artifact before writing it.
- `craft-harness` — plan or repair repo-local agent guidance and related surfaces.
- `craft-handoff` — end a long session with a durable doc plus a resume prompt.
- `spec-charter`, `spec-system-map`, `spec-grill` — land a brownfield repo spec axis from direction to system shape to capability contracts.

## Install

CraftKit installs as Agent Skills for Claude Code, and each skill is also a plain `SKILL.md` file that can be used by Codex and other compatible agents.

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

## The skills

| Skill | Use when | Side effect |
|---|---|---|
| `craft-prompt` | a new prompt is needed from scratch for any LLM or agent interface | returns copy-pasteable text |
| `craft-skill-spec` | a new skill needs a concrete spec based on current CraftKit skill-radar judgments before writing `SKILL.md` | returns a spec; reads radar references |
| `craft-harness` | a repo's agent guidance needs placement decisions, cleanup, sync, or a gated change plan across Codex and Claude Code | returns a repo-local plan or small markdown/skill edits; gates risky surfaces |
| `craft-critique` | an existing prompt or skill needs a read-only review before editing or shipping | surfaces strengths, prioritized findings, recommendations, and a rewrite plan without editing |
| `craft-tune` | an existing prompt or skill needs sharpening applied | runs an autonomous review-and-fix loop and edits the artifact |
| `craft-survey` | a new skill should be grounded in prior art before drafting | returns read-only recommendations |
| `craft-autoresearch` | a prompt or skill works "sometimes" and needs eval-driven iteration | runs evals and may edit mutable files |
| `craft-handoff` | a session is ending and the next session needs a copy-paste-ready continuation prompt | writes handoff files and may copy to clipboard |
| `spec-charter` | a repo needs a project-wide spec axis for direction, Objectives, Decisions, or stale-spec reassessment | creates or amends `spec/charter.md` |
| `spec-system-map` | a brownfield repo needs high-level system shape, runtime boundaries, flows, invariants, and candidate capability boundaries | creates or amends `spec/system-map.md` |
| `spec-grill` | candidate repo boundaries need to become accepted capability contracts with Behaviors and Hard Constraints | creates or refines `spec/capabilities.md` after evidence review |

When two skills could trigger, choose the least invasive one that answers the request: review-only wording goes to `craft-critique`; apply/fix/improve wording goes to `craft-tune`; repeated measurable failures go to `craft-autoresearch`; prior-art questions go to `craft-survey`; repo harness placement and Codex/Claude setup work goes to `craft-harness`.

Terminology note: `craft-harness` means repo-local agent guidance and provider surfaces. `craft-autoresearch` uses an **eval runner** for replaying test inputs and scoring outputs. Do not use "harness" for both.

The `spec-*` skills form a pipeline: `spec-charter -> spec-system-map -> spec-grill`. Use them when a brownfield repo needs a compact spec axis grounded in real repo evidence instead of a generic architecture document.

Each skill lives at `skills/<skill-name>/SKILL.md` — plain markdown with YAML frontmatter, loadable as a Claude Code skill or copy-pasteable into any other agent.

## Maintainer status

Six skills (`craft-prompt`, `craft-critique`, `craft-tune`, `craft-survey`, `craft-autoresearch`, `craft-handoff`) have been optimized through `craft-autoresearch` passes against eval suites — including `craft-autoresearch` itself (reflexive meta-pass). `craft-skill-spec`, `craft-harness`, and the `spec-*` skills are newer and have maintainer-local or repo-local contract evidence, but have not yet been through full autoresearch passes. Publicly reproducible status and local-maintainer evidence boundaries are tracked in [`docs/status.md`](docs/status.md).

## What belongs in CraftKit

- generating new prompts from scratch (task, research, session handoff, templates)
- prompt design and restructuring
- reusable skill design
- repo spec-axis creation for charter, system map, and capability contracts
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

## Skill spine budget

`AGENTS.md` keeps an absolute 500-line format ceiling for each `SKILL.md`, but CraftKit's release gate is stricter: `npm run verify` fails when a skill spine exceeds 220 lines or a frontmatter `description` exceeds 50 words.

- Normal skills: about 100-160 lines.
- Complex loop or orchestration skills: about 160-220 lines.
- Anything growing past that should move examples, platform notes, maintenance commands, or edge-case catalogs into `references/`.

The spine should still be understandable alone: purpose, inputs, steps, output contract, one compact example, limitations, and links to on-demand references. References carry depth; the spine carries the operating path. Mirrored references are allowed only when the verifier guards them against drift.

## Invocation policy

Most CraftKit skills are explicit workflow selectors, not always-on background guidance. Use implicit invocation only when a skill is low-risk and broadly helpful when matched, such as read-only diagnosis or direct prompt drafting.

For explicit-only workflows, pair both platform controls:

```yaml
# SKILL.md frontmatter, used by Claude Code
disable-model-invocation: true
```

```yaml
# agents/openai.yaml, used by Codex
policy:
  allow_implicit_invocation: false
```

Use explicit-only policy for skills that edit files, write artifacts, mutate clipboard state, run eval loops, create spec files, inspect repo harness surfaces, or otherwise turn a broad user request into a higher-ceremony workflow. Keep the `description` concise and useful for manual skill lists even when it is not injected for implicit routing.

## Routing checks

Use these lightweight checks after editing skill descriptions or routing boundaries. They are manual contract checks, not a new runtime.

| Prompt | Expected skill | Failure signal |
|---|---|---|
| "review this skill, don't edit" | `craft-critique` | edits the artifact or routes to `craft-tune` |
| "improve this skill and apply changes" | `craft-tune` | stops at read-only findings |
| "run measured iterations on failures" | `craft-autoresearch` | describes repo harness setup instead of an eval runner |
| "set up Codex + Claude repo guidance" | `craft-harness` | installs or enables hooks/MCP/plugins without an approval gate |
| "write a prompt for GPT" | `craft-prompt` | refuses to deliver a copy-pasteable prompt |

## Use in other agents

CraftKit skills are plain markdown with YAML frontmatter, so they port easily:

1. Open the relevant `SKILL.md`.
2. Paste the body (everything after the frontmatter) into the target agent's system prompt or instructions.
3. For implicit skills, keep the frontmatter `description` line as context so the agent knows when to apply the skill.
4. For explicit-only skills, keep the description in the file for menus and manual selection, but preserve the invocation policy fields above when the target agent supports them.

See [`docs/examples/tune-a-prompt.md`](docs/examples/tune-a-prompt.md) for a walk-through of diagnosing and tuning an existing prompt, then optionally running a short improvement loop.

## Verify

Run the repo-local smoke check before release or packaging changes:

```bash
npm run verify
```

It checks JSON syntax, package boundaries, skill frontmatter, `SKILL.md` line budgets, terminology leaks, required README/status paths, and `npm pack --dry-run`.

## Prior art

- [`sungjunlee/prompt-builder`](https://github.com/sungjunlee/prompt-builder) — predecessor project. Its mature prompt-authoring asset (5-step process, 6 building blocks, platform guides, templates) was absorbed wholesale into `craft-prompt`. Kept on GitHub for reference; new work happens here.
- [`karpathy/autoresearch`](https://github.com/karpathy/autoresearch) — Andrej Karpathy's ML training-loop project that introduced the autoresearch methodology (give an agent a baseline, let it experiment overnight, keep what improves, discard what doesn't). `craft-autoresearch` adapts that loop discipline to prompt and skill artifacts instead of model training code.
- [`byungjunjang/jangpm-meta-skills`](https://github.com/byungjunjang/jangpm-meta-skills) — four-skill meta toolkit for Claude Code and Codex (`blueprint`, `deep-dive`, `reflect`, `autoresearch`). Its `autoresearch` skill contributed implementation patterns — experiment contract shape, the three-eval-type taxonomy (binary / comparative / fidelity), deletion discipline — that `craft-autoresearch` builds on.

## License

MIT — see [LICENSE](LICENSE).
