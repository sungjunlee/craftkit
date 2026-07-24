---
name: craft-harness
description: Decide where agent guidance belongs in a repo and propose the smallest harness change. Use for AGENTS.md/CLAUDE.md, hooks, subagents, MCP, plugins, sync, or pruning.
disable-model-invocation: true
---

# craft-harness

## Purpose

Decide where agent guidance belongs in a real repo and propose the smallest useful harness change.

A harness is the repo-local guidance and supporting surfaces that help coding agents work well in a project: root context, local context/rules, skills, commands, scripts, and approval-gated candidates such as hooks, subagents, MCP/integrations, plugins, or external assets worth adopting.

This skill is not a "build every surface" workflow. Its job is placement judgment: inspect what exists, decide what should stay small, name what should change, and gate anything executable or global.

## Non-goals

- Not a global config manager, installer/plugin publisher, or runtime framework.
- Not a replacement for the user's agent settings UI or marketplace flow.
- Not a full implementation pass for every possible harness surface; default output is a repo-local plan, small markdown/skill edits, or reviewable asset recipes.

## Use this when

- a repo's agent guidance needs a placement decision (context, skill, command, script, hook, subagent, MCP, or plugin), or `AGENTS.md`/`CLAUDE.md` have drifted apart or bloated with procedure that belongs elsewhere
- repeated agent failures suggest the guidance exists but sits on the wrong surface
- Codex and Claude Code surfaces need to be synced after one of them changed
- an external skill, hook, MCP, or plugin is a candidate for adoption instead of local build
- harness surfaces need pruning or reassessment after a model, tool, or workflow change

## How it differs from related skills

- `craft-skill-spec` designs one reusable artifact (a skill, skill suite, subagent, or plugin); `craft-harness` decides what a repo's harness needs overall, where each piece belongs, and hands off artifact design to `craft-skill-spec` when warranted.
- `craft-critique` reviews a prompt or skill without editing. `craft-harness` may use critique-style checks on the harness plan before applying changes.

## Inputs

- the repo or task being supported
- current primary target, if any: Codex, Claude Code, or both
- observed agent failures or desired workflows
- existing harness files and commands
- constraints around edits, installs, hooks, MCP, plugins, or global config

If the user does not state a primary target, default to dual-target output with Codex as the current primary. Claude Code remains a first-class target, not a fallback.

## Required reads

Always inspect existing repo harness files before making recommendations:

- shared root and local context files
- provider-specific skill, command, hook, subagent, MCP, plugin, and rules locations
- repo workflow files: `package.json`, `Makefile`, CI config, scripts, docs

Then load only the reference matching the branch you're taking — provider-specific paths (`platform-surfaces.md`), dual-target layout (`dual-target-layout.md`), hooks (`hook-patterns.md`), or skill-behavior validation (`eval-cases.md`); use adjacent CraftKit skills instead when creating or modifying a prompt/skill artifact directly. Full descriptions live in § References.

Do not inspect user/global config unless the user explicitly asks for personal or global harness work.

## Lifecycle modes

Choose one primary mode and mention secondary modes when useful:

- `bootstrap` - create the smallest useful harness for a repo with little setup.
- `task-fit` - add harness support for a specific task, PR, workflow, or team convention.
- `repair` - fix repeated agent failures by moving guidance to the right surface.
- `sync` - align Codex and Claude Code surfaces when they drift.
- `adopt` - evaluate external skills, plugins, MCPs, or integrations before building locally.
- `prune` - remove stale, bloated, duplicated, or conflicting harness guidance.
- `maintain` - reassess after model, tool, repo, or workflow changes.

## Workflow

1. State the harness mode and primary target. If tradeoffs conflict, prefer the user's current primary agent; otherwise prefer Codex while keeping Claude Code support explicit.
2. Inventory the existing harness. Mark each relevant file or installed surface as `keep`, `update`, `missing`, `risky`, or `prune`.
3. Name the repeated agent jobs: navigation, implementation, review, verification, release, incident work, research, handoff, backlog work, external-tool work, or project onboarding.
4. Choose the smallest placement for each need. Do not fill every category; use `no change` when the existing harness is enough:
   - root context for stable rules every task needs; local context or path-scoped rules for directory-specific facts
   - skill for reusable judgment workflow; command for explicit manual shortcut
   - script for deterministic checks that should be run on demand
   - hook for deterministic lifecycle automation: either a community-proven guardrail candidate or a project-specific repeated miss where timing matters
   - MCP/integration for structured access to an external system; subagent for isolated exploration, review, or role separation
   - plugin for installable multi-surface packaging; external adoption when a maintained asset fits better than local invention
   - no change when the existing harness is enough
5. Hand off detailed artifact design when needed. Use `craft-skill-spec` for a new skill/subagent/plugin body instead of fully designing it inline.
6. Run buy-vs-build when a new skill, plugin, MCP server, hook, or integration is plausible. Search or explicitly say why search was skipped. Use `adopt`, `fork/adapt`, `build local`, or `defer`.
7. Produce a patch plan before high-risk edits. Low-risk repo-local markdown and skill drafts may be edited when the user asked to make the change.
8. Verify the harness with prompts or commands that exercise the intended behavior, not just static file syntax.

## Risk gates

Low-risk repo-local edits may be made when the user asks for implementation:

- repo-local markdown guidance
- `AGENTS.md` / `CLAUDE.md` bridge updates
- repo-local skill drafts
- repo-local docs and verification prompts

Require explicit approval before:

- adding or enabling hooks or hook scripts
- adding MCP servers or external integrations
- installing plugins or adding marketplaces
- editing user/global config
- creating write-capable subagents or custom agents
- adding commands that affect secrets, auth, deployment, or CI behavior

Defer by default:

- organization-managed policy
- plugin packaging and publishing
- broad agent-team factories

This skill may propose high-risk surfaces, but it does not install or enable them unless the user explicitly asks for that after seeing the plan. When proposing a hook, name the hook class, dry-run command, false-positive notes, and rollback steps. When proposing third-party adoption, inspect the files that execute or steer tools before recommending install.

## Output format

**Sizing rule**: for a small or `repair`-mode request (a single repeated-failure fix, or a task phrased in a few words), emit only three sections — Harness thesis, Proposed changes, and Verification. Reserve the full section set below for `bootstrap`, `adopt`, and `sync`, where a fuller inventory, buy-vs-build search, or a Codex/Claude target split earn their length. §Risk gates still applies in full at every size — a small report never skips approval or defer rules, it only trims what gets written down.

### Harness thesis
- mode
- primary target
- why this mode fits

### Existing harness
Short inventory grouped as `keep`, `update`, `missing`, `risky`, and `prune`.

### Pain / need map
Table with:

- need
- repeated agent job
- evidence
- placement
- promotion trigger

### Buy vs build
Include when a new skill, plugin, MCP server, hook, or integration is plausible.

For each candidate, name source, decision (`adopt`, `fork/adapt`, `build local`, or `defer`), trust notes, why it fits or fails, and rollback path. Trust notes cover provenance, execution, permissions, freshness, and portability.

### Proposed changes
Table with path/target, action, risk gate (`none`, `approval required`, or `defer`), and rationale.

For hook rows, also include:

- hook class: `community-proven guardrail` or `project-specific`
- dry-run command
- rollback note

### Codex target
List Codex-specific files, commands, trust/reload steps, and caveats.

### Claude target
List Claude-Code-specific files, commands, trust/reload steps, and caveats.

### Verification
List prompts or commands with expected evidence and failure signals.

### Deferred / prune
List work intentionally skipped, why now is too early, and the reassessment trigger.

## Placement rules

- Keep root context small. Move procedures into skills, commands, scripts, or hooks.
- Prefer `AGENTS.md` plus a `CLAUDE.md` import or symlink only when both agents should read the same stable core. Do not assume identical load behavior.
- Prefer a skill over a long root instruction when the guidance is a reusable workflow.
- Prefer a script over prose when the rule is deterministic and easy to run.
- Prefer a hook only when timing matters: a community-proven guardrail candidate during `bootstrap`/`maintain` (deterministic, fast, read-only and no-network by default, low-noise, easy to roll back), or a project-specific hook when repeated repo-specific misses justify lifecycle automation over a plain script.
- Prefer a subagent only when isolated context, parallel work, or a constrained role improves output quality; prefer a plugin only when installation, versioning, bundled integrations, or marketplace distribution are part of the value.
- Prefer no change when the existing harness already supports the job.

## Verification prompts

Use one or two starter evals before shipping changes to this skill. The full case set and expected checks live in `references/eval-cases.md`.

- "Set up this repo so Codex and Claude both know the test, lint, and release workflow without bloating root instructions."
- "Agents keep missing migration safety checks in this repo. Decide whether to use context, skill, script, hook, or subagent."

Pass signal: the output inventories existing harness files first, separates provider-neutral decisions from Codex/Claude targets, risk-gates high-risk surfaces, and verifies behavior rather than only file syntax.

## Guardrails

- inventory existing harness files before recommending anything
- never install or enable hooks/MCP/plugins/global config without explicit approval after showing the plan — §Risk gates applies in full at every output size
- prefer the smallest placement that solves the repeated job; "no change" is a valid answer
- keep provider-neutral decisions separate from Codex/Claude target sections
- verify behavior with prompts or commands, not just file syntax

## Failure modes

- over-generating every possible harness surface instead of solving the repeated job
- designing full skill, subagent, plugin, hook, and MCP implementations in one pass
- treating Codex and Claude paths as a mechanical one-to-one migration
- putting long workflow procedures into `AGENTS.md` or `CLAUDE.md`
- skipping external search and rebuilding a maintained asset
- recommending third-party install without trust and maintenance checks
- avoiding hooks even when the guardrail is deterministic, common, low-noise, and timing-sensitive — or the opposite: installing/enabling them automatically instead of proposing reviewable scripts and target adapters
- adding hooks or MCP config without rollback or approval notes

## Example

Input: "Agents keep missing our migration safety process. We use Codex more lately, but some teammates use Claude Code too."

Output sketch:
- Harness thesis: `repair`; Codex current-primary and Claude Code first-class target; repeated DB review misses justify a repo-local harness change.
- Pain / need map: migration safety checklist -> verification/review job -> repo-local skill plus short root pointer; promote to hook only if agents still skip deterministic checks.
- Buy vs build: build local after checking no maintained repo-specific migration skill fits; rollback is removing the skill and root pointer.
- Verification: prompt "Review this migration change..." should surface rollback, idempotency, data-size, and test checks (failure is generic "run tests" advice); deferred/prune: plugin packaging and hook install wait until the skill proves useful.

For a fuller repair example, load `references/repair-example.md`.

## References

- `references/platform-surfaces.md` — provider-specific paths, hooks, subagents, MCP, plugins, or install locations.
- `references/dual-target-layout.md` — dual Codex/Claude targets, shared `.agents/`, or symlink/copy decisions.
- `references/hook-patterns.md` — hook recommendation, review, pruning, or generation.
- `references/eval-cases.md` — the full case set and expected checks backing § Verification prompts.
- `references/repair-example.md` — fuller worked repair-mode example beyond the compact one in § Example.
