---
name: craft-harness
description: Given a repo, decide where agent guidance belongs and make or propose the smallest useful harness change. Use for AGENTS.md/CLAUDE.md placement, skills, hooks, MCP, plugins, sync, or pruning.
disable-model-invocation: true
---

# craft-harness

## Purpose

Given a repo, decide where agent guidance belongs and make or propose the smallest useful harness change.

A harness is the repo-local guidance and supporting surfaces that help coding agents work well: root context, local context/rules, skills, commands, scripts, and approval-gated candidates such as hooks, subagents, MCP/integrations, plugins, or external assets worth adopting.

This skill is placement judgment, not a "build every surface" workflow: inspect what exists, decide what should stay small, name what should change, and gate anything executable or global.

## Non-goals

- Not a global config manager, installer/plugin publisher, or runtime framework.
- Not a replacement for the user's agent settings UI or marketplace flow.
- Not a full implementation pass for every harness surface; default output is a repo-local plan, small markdown/skill edits, or reviewable asset recipes.

## Use this when

- a repo's agent guidance needs a placement decision (context, skill, command, script, hook, subagent, MCP, or plugin), or `AGENTS.md`/`CLAUDE.md` have drifted apart or bloated with procedure that belongs elsewhere
- repeated agent failures suggest the guidance exists but sits on the wrong surface
- Codex and Claude Code surfaces need syncing after one of them changed
- an external skill, hook, MCP, or plugin is a candidate for adoption instead of local build
- harness surfaces need pruning or reassessment after a model, tool, or workflow change

## How it differs from related skills

- `craft-skill-spec` designs one reusable artifact (skill, suite, subagent, or plugin); `craft-harness` decides what a repo's harness needs overall, where each piece belongs, and hands off artifact design to `craft-skill-spec` when warranted.
- `craft-critique` reviews a prompt or skill without editing. `craft-harness` may use critique-style checks on the harness plan before applying changes.

## Inputs

- the repo or task being supported
- current primary target, if any: Codex, Claude Code, or both
- observed agent failures or desired workflows
- existing harness files and commands
- constraints around edits, installs, hooks, MCP, plugins, or global config

If the user does not state a primary target, default to dual-target output with Codex as the current primary. Claude Code remains a first-class target, not a fallback.

## Required reads

Always inspect existing repo harness files before recommending:

- shared root and local context files
- provider-specific skill, command, hook, subagent, MCP, plugin, and rules locations
- repo workflow files: `package.json`, `Makefile`, CI config, scripts, docs

Then load only the reference matching the branch you're taking — provider paths (`platform-surfaces.md`), dual-target layout (`dual-target-layout.md`), hooks (`hook-patterns.md`), or skill-behavior validation (`eval-cases.md`). Use adjacent CraftKit skills when creating or modifying a prompt/skill artifact directly. Full descriptions live in § References.

Do not inspect user/global config unless the user explicitly asks for personal or global harness work.

## Workflow

1. Name the kind of work in a phrase if it helps (e.g. first setup, fix a repeated miss, sync targets, adopt vs build, prune) — do not pick from a taxonomy. State the primary target; if tradeoffs conflict, prefer the user's current primary agent, otherwise Codex while keeping Claude Code support explicit.
2. Inventory the existing harness. Mark each relevant file or installed surface as `keep`, `update`, `missing`, `risky`, or `prune`.
3. Name the repeated agent jobs that matter (navigation, implementation, review, verification, release, incident, research, handoff, backlog, external-tool, onboarding).
4. Choose the smallest placement for each real need. Do not fill every category; use `no change` when the existing harness is enough — root/local context, skill, command, script, hook, MCP/integration, subagent, plugin, or external adoption per § Placement rules.
5. When a new skill, plugin, MCP, hook, or integration is plausible, run buy-vs-build: search or say why search was skipped; decide `adopt`, `fork/adapt`, `build local`, or `defer`. Hand detailed artifact design to `craft-skill-spec` instead of designing it fully inline.
6. Produce a patch plan before high-risk edits. Low-risk repo-local markdown and skill drafts may be edited when the user asked to make the change.
7. Verify with prompts or commands that exercise the intended behavior, not just static file syntax.

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

Defer by default: organization-managed policy, plugin packaging/publishing, broad agent-team factories.

This skill may propose high-risk surfaces, but does not install or enable them unless the user explicitly asks after seeing the plan. When proposing a hook, name the hook class, dry-run command, false-positive notes, and rollback steps. When proposing third-party adoption, inspect the files that execute or steer tools before recommending install.

## Output format

Shape the write-up to the request — a few-word or single-repair ask gets a minimal write-up; a first-time setup, adoption decision, or dual-target sync earns more inventory and buy-vs-build detail. Whatever the shape, the result must convey:

- **Placement decision(s) with rationale.** What belongs where (and what stays put), tied to the repeated jobs and the inventory.
- **Smallest concrete change per real need.** Paths/targets, actions, and why this is enough — including buy-vs-build when a new skill, plugin, MCP, hook, or integration is plausible (`adopt` / `fork/adapt` / `build local` / `defer`, with trust notes).
- **Risk gate on each change.** `none`, `approval required`, or `defer` — § Risk gates still applies in full at every size; a short write-up never skips approval or defer rules.
- **How to verify the behavior.** Prompts or commands with expected evidence and failure signals, not just file syntax.
- **For dual-target repos, the Codex/Claude split.** Provider-specific files, commands, trust/reload steps, and caveats — keep provider-neutral decisions separate from target specifics.

Name what you intentionally skip and the reassessment trigger when that helps, but do not force a fixed subsection skeleton.

## Placement rules

- Keep root context small. Move procedures into skills, commands, scripts, or hooks.
- Prefer `AGENTS.md` plus a `CLAUDE.md` import or symlink only when both agents should read the same stable core. Do not assume identical load behavior.
- Prefer a skill over a long root instruction when the guidance is a reusable workflow.
- Prefer a script over prose when the rule is deterministic and easy to run.
- Prefer a hook only when timing matters: a community-proven guardrail candidate (deterministic, fast, read-only and no-network by default, low-noise, easy to roll back), or a project-specific hook when repeated repo-specific misses justify lifecycle automation over a plain script.
- Prefer a subagent only when isolated context, parallel work, or a constrained role improves output; prefer a plugin only when installation, versioning, bundled integrations, or marketplace distribution are part of the value.
- Prefer no change when the existing harness already supports the job.

## Guardrails

- inventory existing harness files before recommending anything
- never install or enable hooks/MCP/plugins/global config without explicit approval after showing the plan — § Risk gates applies in full at every output size
- prefer the smallest placement that solves the repeated job; "no change" is a valid answer
- keep provider-neutral decisions separate from Codex/Claude target specifics
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

A proportionate write-up — one repeated miss, so keep it short:

- Placement: migration safety is a reusable verification/review job → repo-local skill plus a short root pointer; promote to hook only if agents still skip deterministic checks. Codex current-primary, Claude Code first-class.
- Change: add the skill and pointer; buy-vs-build → build local after checking no maintained repo-specific migration skill fits; rollback is removing the skill and pointer.
- Risk: markdown/skill drafts = none; hook install stays deferred until the skill proves useful.
- Verify: prompt "Review this migration change..." should surface rollback, idempotency, data-size, and test checks (failure is generic "run tests" advice).
- Dual-target: shared skill under the dual-target layout; note any Codex vs Claude load/trust differences.

For a fuller repair walkthrough, load `references/repair-example.md`.

## References

- `references/platform-surfaces.md` — provider-specific paths, hooks, subagents, MCP, plugins, or install locations.
- `references/dual-target-layout.md` — dual Codex/Claude targets, shared `.agents/`, or symlink/copy decisions.
- `references/hook-patterns.md` — hook recommendation, review, pruning, or generation.
- `references/eval-cases.md` — starter eval prompts and expected checks for harness behavior.
- `references/repair-example.md` — fuller worked repair example beyond the compact one in § Example.
