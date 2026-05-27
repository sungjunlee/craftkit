---
name: craft-harness
description: Build, repair, sync, prune, and evolve a project-specific agent harness for Codex and Claude Code. Use when a user wants to set up or improve repo agent guidance, AGENTS.md/CLAUDE.md, local skills, commands, hooks, subagents, MCP/integrations, plugins, or adoption choices; when agents keep repeating mistakes in a repo; when Codex and Claude setup drift; or when deciding whether to build, adopt, or remove harness components.
---

# craft-harness

## Purpose

Build and maintain the agent harness around a real repo.

A harness is the set of files and installed capabilities that help coding agents work well in a project: root context, local context/rules, skills, commands, scripts, hooks, subagents, MCP/integrations, plugins, and external assets worth adopting.

This skill is not only for first setup. Use it across the harness lifecycle: bootstrap, task-fit, repair, sync, adopt, prune, and maintain.

## How it differs from related skills

- `craft-skill-spec` designs one reusable artifact: a skill, skill suite, subagent, or plugin.
- `craft-harness` decides what a repo's agent harness needs, where each piece belongs, and what to create, adopt, update, defer, or remove.
- `craft-survey` studies prior art. `craft-harness` uses prior-art search as one step when buy-vs-build matters.
- `craft-critique` reviews a prompt or skill without editing. `craft-harness` may use critique-style checks on the harness plan before applying changes.

## Inputs

- the repo or task being supported
- current primary target, if any: Codex, Claude Code, or both
- observed agent failures or desired workflows
- existing harness files and commands
- constraints around edits, installs, hooks, MCP, plugins, or global config

If the user does not state a primary target, default to dual-target output with Codex as the current primary. Claude Code remains a first-class target, not a fallback.

## Required reads

Before making recommendations:

1. Inspect existing repo harness files first:
   - shared root and local context files
   - provider-specific skill, command, hook, subagent, MCP, plugin, and rules locations
   - repo workflow files: `package.json`, `Makefile`, CI config, scripts, docs
2. Read `references/platform-surfaces.md` when a recommendation touches provider-specific paths, hooks, subagents, MCP, plugins, or install locations.
3. Read `references/eval-cases.md` when drafting or validating `craft-harness` changes.
4. Read adjacent CraftKit skills only when the recommendation would create or modify a prompt/skill artifact.

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
4. Choose placement for each need:
   - root context for stable rules every task needs
   - local context or path-scoped rules for directory-specific facts
   - skill for reusable judgment workflow
   - command for explicit manual shortcut
   - script for deterministic checks that should be run on demand
   - hook for deterministic lifecycle automation that has earned its risk
   - MCP/integration for structured access to an external system
   - subagent for isolated exploration, review, or role separation
   - plugin for installable multi-surface packaging
   - external adoption when a maintained asset fits better than local invention
   - no change when the existing harness is enough
5. Run buy-vs-build when a new skill, plugin, MCP server, hook, or integration is plausible. Search or explicitly say why search was skipped. Use `adopt`, `fork/adapt`, `build local`, or `defer`.
6. Produce a patch plan before high-risk edits. Low-risk repo-local markdown and skill drafts may be edited when the user asked to make the change.
7. Verify the harness with prompts or commands that exercise the intended behavior, not just static file syntax.

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

When proposing a hook, include rollback notes. When proposing third-party adoption, inspect the files that execute or steer tools before recommending install.

## Output format

### Harness mode
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

For each candidate:

- source
- decision: `adopt`, `fork/adapt`, `build local`, or `defer`
- trust notes
- why it fits or fails

Trust checklist:

- provenance: who maintains it and where it comes from
- execution: whether it runs scripts, hooks, MCP servers, or shell commands
- permissions: what tools, files, credentials, or external systems it touches
- freshness: whether it matches current Codex/Claude behavior
- portability: whether it works for both targets or needs an adapter
- rollback: how to remove or disable it if it hurts the repo

### Proposed edits
Table with:

- path or target
- action
- risk gate: `none`, `approval required`, or `defer`
- rationale

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
- Prefer a hook over a script only when timing matters and repeated misses justify lifecycle automation.
- Prefer a subagent only when isolated context, parallel work, or a constrained role improves output quality.
- Prefer a plugin only when installation, versioning, bundled integrations, or marketplace distribution are part of the value.
- Prefer no change when the existing harness already supports the job.

## Verification prompts

Use these as starter evals. For full expected placement, target, risk, and failure checks, see `references/eval-cases.md`.

1. "Set up this repo so Codex and Claude both know the test, lint, and release workflow without bloating root instructions."
2. "Agents keep missing migration safety checks in this repo. Decide whether to use context, skill, script, hook, or subagent."
3. "Codex has a project skill for PR review but Claude has stale command docs. Sync the harness without duplicating the workflow."
4. "Before creating a local frontend QA skill, search whether an existing skill or plugin fits this project."
5. "This repo has a hook that runs old tests no one uses. Decide whether to update, disable, or remove it."
6. "This monorepo has conflicting package conventions. Decide what belongs at root and what belongs in local overrides."

Checks:

- output inventories existing harness before edits
- provider-neutral decisions are separate from Codex and Claude target paths
- at least one operating/maintenance case is handled, not only bootstrap
- buy-vs-build is present or explicitly skipped
- hooks, MCP, plugins, global config, and write-capable subagents have risk gates
- verification includes behavior evidence, not only file syntax

## Failure modes

- over-generating every possible harness surface instead of solving the repeated job
- treating Codex and Claude paths as a mechanical one-to-one migration
- putting long workflow procedures into `AGENTS.md` or `CLAUDE.md`
- skipping external search and rebuilding a maintained asset
- recommending third-party install without trust and maintenance checks
- avoiding hooks even when the miss is deterministic, recurring, and timing-sensitive
- adding hooks or MCP config without rollback or approval notes

## Example

### Input

"Agents keep missing our migration safety process. We use Codex more lately, but some teammates use Claude Code too."

### Output sketch

**Harness mode**
- mode: `repair`
- primary target: Codex current-primary, Claude Code first-class target
- why: the issue is a repeated agent miss in an operating repo

**Pain / need map**
| need | repeated agent job | evidence | placement | promotion trigger |
|---|---|---|---|---|
| migration safety checklist | verification/review | repeated misses during DB work | repo-local skill plus short root pointer | promote to hook only if agents still skip deterministic checks |

**Proposed edits**
| path or target | action | risk gate | rationale |
|---|---|---|---|
| shared root context | add one-line pointer to migration skill | none | root gets the trigger, not the full procedure |
| Codex repo-local skill path | create Codex skill draft | none | reusable workflow with examples |
| Claude Code repo-local skill path | create Claude-compatible copy or symlink plan | none | same workflow for Claude users |
| Codex hook config | propose post-edit migration check | approval required | hook timing may help, but execution needs trust |

**Verification**
- Prompt: "Review this migration change and tell me what safety checks apply."
- Expected evidence: agent finds the migration skill and names rollback, idempotency, data-size, and test checks.
- Failure signal: agent only says "run tests" or misses rollback/data safety.

**Deferred / prune**
- plugin packaging: defer until the skill proves useful across more than one repo.
