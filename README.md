# CraftKit

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

CraftKit is a cross-agent toolkit for creating, improving, and operationalizing prompts and skills for coding agents such as Claude Code and Codex.

## Why CraftKit

Prompt assets and agent skills often become fragmented, provider-specific, and hard to reuse. CraftKit exists to keep them file-first, portable, reviewable, and easy to improve over time.

CraftKit covers two wedges. The first is artifact quality: author prompts, critique assets, run eval-backed experiments, and carry sessions forward (`craft-*`). The second is the repo spec axis: `spec-charter` then `spec-grill` turns a brownfield repo's direction, system shape, and capability boundaries into reference contracts that other tools can consume — most directly `dev-backlog`, which measures sprints and triage against them.

CraftKit is not a general coding-agent workflow suite, project-management layer, deployment system, or runtime framework. The spec axis defines what good looks like — it does not manage tasks, sprints, or backlog priority; that stays with `dev-backlog`. When a workflow needs those things, CraftKit should produce clear files, specs, or handoffs that another tool can use rather than becoming the tool itself.

## 30-second path

Start with the smallest skill that does the job:

| If you need to... | Use |
|---|---|
| write a new prompt or reusable prompt template | `craft-prompt` |
| review an existing prompt or skill without changing it | `craft-critique` |
| improve an existing prompt or skill in place | `craft-critique`, then apply its findings |

Reach for the other skills when the job gets more specific:

- `craft-autoresearch` — deliberate, eval-backed experimentation when you bring test inputs and measurable criteria; explicit-only, never a default next step.
- `craft-handoff` — end a long session with a durable doc plus a resume prompt.
- `spec-charter`, `spec-grill` — land a brownfield repo spec axis from direction and system shape to capability contracts.

## The methodology

The skills are the delivery vehicle; the durable part is two review disciplines that hold up as models get more capable — a smarter agent is exactly what finds the loophole in a loose contract or talks a loop past "good enough." Both are written up as standalone references you can apply without adopting any skill:

- [`docs/methodology/predicate-test.md`](docs/methodology/predicate-test.md) — the 3-axis test (Authority / Distributional / Manipulability) for deciding whether a written contract is safe for an agent to optimize against. Applied by `spec-grill`.
- [`docs/methodology/loop-stop-conditions.md`](docs/methodology/loop-stop-conditions.md) — falsifiable exit conditions (Self-LGTM / persistent fixpoint / no-op / hard cap) for agent improvement loops. Applied by `craft-autoresearch`.

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
| `craft-critique` | an existing prompt or skill needs a review — read-only by default — before editing or shipping | surfaces strengths, prioritized findings, and fix ordering; applies the fixes only when asked |
| `craft-autoresearch` | a prompt or skill works "sometimes" and needs eval-driven iteration | runs evals and may edit mutable files |
| `craft-handoff` | a session is ending and the next session needs a copy-paste-ready continuation prompt | writes handoff files and may copy to clipboard |
| `spec-charter` | a repo needs direction, Objectives, Decisions, system shape, or stale-spec reassessment | creates or amends `spec/charter.md` and `spec/system-map.md` |
| `spec-grill` | candidate repo boundaries need to become accepted capability contracts with Behaviors and Hard Constraints | creates or refines `spec/capabilities.md` after evidence review |

When two skills could trigger, choose the least invasive one that answers the request: review-only and apply/fix/improve wording both go to `craft-critique` (read-only by default; applies fixes when asked); repeated measurable failures go to `craft-autoresearch`; session wrap-up goes to `craft-handoff`.

Terminology note: `craft-autoresearch` uses an **eval runner** for replaying test inputs and scoring outputs. Do not call that runner a "harness."

The `spec-*` skills form a pipeline: `spec-charter` (charter + system map) then `spec-grill`. Use them when a brownfield repo needs a compact spec axis grounded in real repo evidence instead of a generic architecture document.

The spec axis supersedes `dev-backlog`'s retired `backlog-charter` skill (dev-backlog split that surface into the spec-series in its 0.6.0): `spec/charter.md` is the successor home for the project reference axis, and `spec-charter`'s amend mode reads a legacy root `CHARTER.md` as a fallback and migrates it deliberately rather than silently. `dev-backlog` consumes the axis — it measures sprints and triage against `spec/charter.md` — but does not own it.

Each skill lives at `skills/<skill-name>/SKILL.md` — plain markdown with YAML frontmatter, loadable as a Claude Code skill or copy-pasteable into any other agent.

## Maintainer status

Four skills (`craft-prompt`, `craft-critique`, `craft-autoresearch`, `craft-handoff`) have been optimized through `craft-autoresearch` passes against eval suites — including `craft-autoresearch` itself (reflexive meta-pass). The `spec-*` skills have maintainer-local or repo-local contract evidence, but have not yet been through full autoresearch passes. Publicly reproducible status and local-maintainer evidence boundaries are tracked in [`docs/status.md`](docs/status.md).

## What belongs in CraftKit

- generating new prompts from scratch (task, research, templates)
- prompt design and restructuring
- repo spec-axis creation for charter, system map, and capability contracts
- diagnostic review and minimal-diff editing
- iterative improvement loops
- copy-pasteable outputs for agent workflows

## Design principles

1. File-first and diff-friendly
2. Small composable units
3. Explicit inputs and outputs
4. Cross-agent portability (core skill spines stay provider-neutral; platform-specific detail stays in templates or reference files)
5. Eval-driven improvement when possible
6. Copy-pasteable results over fancy abstractions
7. Weight follows durability — as models improve, move each skill's center of gravity from "tell the model how to think" toward "give the model durable state and direction it cannot hold on its own"

Principle 7 is the axis CraftKit is actively re-sized against: machinery (deterministic paths, clipboard, hooks, archiving), time-sensitive curated knowledge, and direction-setting judgment contracts are model-independent and stay; raw prescription erodes as models improve and gets cut.

## Skill spine budget

`AGENTS.md` keeps an absolute 500-line format ceiling for each `SKILL.md`, but CraftKit's release gate is stricter: `npm run verify` fails when a skill spine exceeds 220 lines or a frontmatter `description` exceeds 50 words.

- Normal skills: about 100-160 lines.
- Complex loop or orchestration skills: about 160-220 lines.
- Anything growing past that should move examples, platform notes, maintenance commands, or edge-case catalogs into `references/`.

The spine should still be understandable alone: purpose, inputs, steps, output contract, one compact example, limitations, and links to on-demand references. References carry depth; the spine carries the operating path. Mirrored references are allowed only when the verifier guards them against drift.

See [`docs/skill-anatomy.md`](docs/skill-anatomy.md) for the canonical per-family section contract each skill is normalized against.

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

Use explicit-only policy for skills that edit files, write artifacts, mutate clipboard state, run eval loops, create spec files, or otherwise turn a broad user request into a higher-ceremony workflow. Keep the `description` concise and useful for manual skill lists even when it is not injected for implicit routing.

## Routing checks

Use these lightweight checks after editing skill descriptions or routing boundaries. They are manual contract checks, not a new runtime.

| Prompt | Expected skill | Failure signal |
|---|---|---|
| "review this skill, don't edit" | `craft-critique` | edits the artifact despite the read-only default |
| "improve this skill and apply changes" | `craft-critique` (findings, then apply) | stops at read-only findings despite the apply request |
| "run measured iterations on failures" | `craft-autoresearch` | describes a generic improve loop instead of an eval runner |
| "write a prompt for GPT" | `craft-prompt` | refuses to deliver a copy-pasteable prompt |
| "create a system map for this repo" | `spec-charter` (`map`) | looks for a separate `spec-system-map` skill |

## Use in other agents

CraftKit skills are plain markdown with YAML frontmatter, so they port easily:

1. Open the relevant `SKILL.md`.
2. Paste the body (everything after the frontmatter) into the target agent's system prompt or instructions.
3. For implicit skills, keep the frontmatter `description` line as context so the agent knows when to apply the skill.
4. For explicit-only skills, keep the description in the file for menus and manual selection, but preserve the invocation policy fields above when the target agent supports them.

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
