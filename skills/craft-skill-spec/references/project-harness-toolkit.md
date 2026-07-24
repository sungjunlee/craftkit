# Project Harness Toolkit Seed

## Summary

Use this reference when a user wants a project- or task-specific agent harness, not just a new skill. A harness is the repo-local guidance and supporting surfaces that make agents work well in a real project: root context, local context, skills, commands, scripts, and approval-gated candidates such as hooks, subagents, MCP/integrations, plugins, or adoption choices.

This is the design seed that produced `craft-harness`. `craft-skill-spec` can still use this reference to decide whether a project-harness request should stay a placement decision, hand off to `craft-harness`, or become a detailed skill/subagent/plugin spec.

## Boundary with craft-skill-spec

`craft-skill-spec` designs one reusable artifact: a skill, skill suite, subagent, or plugin.

`craft-harness` should decide placement and propose gated repo-local harness changes around a real repo. It may recommend several artifacts at once, but it should not fully spec every part inline. When a local skill, subagent, or plugin needs detailed design, hand that part back to `craft-skill-spec`.

Good `craft-harness` output:

> Agents keep missing migration safety checks. Add a Codex skill candidate and a Claude skill candidate with the same workflow, plus a gated hook proposal. Use `craft-skill-spec` for the skill body before writing `SKILL.md`.

Bad `craft-harness` output:

> Here are full `SKILL.md`, subagent, hook, plugin, and MCP server implementations for everything in one pass.

## Artifact class

- proposed class: `single skill`
- name: `craft-harness`
- default target priority: dual-target by default; Codex is the current primary only when the user gives no other preference
- escalation note: promote to a plugin only if bundled skills, hooks, agents, MCP config, and marketplace setup become the reusable product

## Artifact thesis

- job: inspect a repo and task, decide the smallest useful placement for project-specific harness changes, and keep Codex and Claude Code aligned without fighting the user's existing setup
- non-goals: agent-team architecture factory, full plugin packaging by default, unmanaged hook installation, broad repo audit unrelated to agent workflow
- target users or agents: maintainers who alternate between Codex and Claude Code and want project-specific skills, commands, hooks, subagents, context files, and integrations to stay aligned
- success condition: output names what to create, adopt, update, or defer; separates Codex and Claude target files; and keeps high-risk changes behind explicit gates

## Platform surfaces

Keep volatile Codex and Claude Code path details out of this seed. Use
`skills/craft-harness/references/platform-surfaces.md` as the current source for:

- root and local context files
- skills and commands
- hooks and hook trust behavior
- subagents/custom agents
- MCP/integration config
- plugin and marketplace packaging

This seed records the artifact decision. The platform reference records current target
paths and load/trust differences.

## Workflow seed

1. Inspect existing harness files before proposing changes:
   - shared context: `AGENTS.md`, `CLAUDE.md`, `.claude/CLAUDE.md`, `.claude/rules/`
   - Codex: `.agents/`, `.codex/`, `~/.codex` only when the user asks for personal/global changes
   - Claude: `.claude/`, `.mcp.json`, `~/.claude` only when the user asks for personal/global changes
   - repo commands: `package.json`, `Makefile`, CI config, scripts, docs
2. Map needs by repeated agent job: navigation, implementation, review, verification, release, incident work, research, handoff, backlog work, or external-tool work.
3. Choose the smallest placement:
   - root context for stable rules every task needs
   - local context or path-scoped rules for directory-specific facts
   - skill for reusable judgment workflow
   - command for explicit manual shortcut
   - script or hook for deterministic checks and context injection
   - MCP/integration for structured access to an external system
   - subagent for isolated exploration, review, or role separation
   - plugin for installable multi-surface packaging
   - no artifact when the project already has enough harness
4. Run buy-vs-build before generating local assets when research is allowed:
   - search existing `npx skills` / open Agent Skills catalogs for matching skills
   - inspect Codex plugin directory or marketplace docs when relevant
   - inspect Claude official/community/plugin marketplaces when relevant
   - rate candidates on fit, trust, maintenance, portability, install cost, and security posture
5. Produce a patch plan before editing. Apply only approved changes for hooks, subagents, plugins, MCP, or global/user-scope files.
6. Verify with eval prompts or commands that exercise the chosen placement, not just static syntax.

## Output seed

Use these sections for `craft-harness` output:

### Harness thesis

- repo/task
- repeated agent jobs
- Codex priority or Claude priority
- success condition

### Existing harness inventory

- keep
- update
- risky or stale
- missing

### Needs map

| Need | Placement | Why | Promotion trigger |
|---|---|---|---|

### Buy vs build

| Candidate | Source | Decision | Reason |
|---|---|---|---|

### Proposed changes

| Path or target | Action | Risk gate |
|---|---|---|

### Codex target

- files to create or update
- commands to run
- manual trust/reload steps

### Claude target

- files to create or update
- commands to run
- manual trust/reload steps

### Verification prompts

- prompt
- expected evidence
- failure signal

### Deferred

- item
- why now is too early
- reassessment trigger

## Placement rules

- Prefer `AGENTS.md` plus `CLAUDE.md` symlink or short bridge only when both agents should read the same stable core. Do not assume identical loading behavior.
- Keep root context small. Move procedures into skills, commands, scripts, or hooks.
- For Claude, consider `.claude/rules/` when guidance is path-scoped and not useful to Codex.
- For Codex, consider nested `AGENTS.override.md` when a subdirectory should override broader guidance.
- Generate parallel Codex and Claude skills from one neutral workflow when both agents need the same repeated procedure.
- Prefer a script over prose when the rule is deterministic and easy to run.
- Prefer a hook over a script only when timing matters and repeated misses justify lifecycle automation.
- Prefer a subagent only when isolated context, parallel work, or a constrained role improves output quality.
- Prefer a plugin only when installation, versioning, bundled integrations, or marketplace distribution are part of the value.

## Risk gates

Require explicit approval before:

- editing user/global config under `~/.codex` or `~/.claude`
- adding or enabling hooks
- adding MCP servers or external integrations
- installing third-party plugins or marketplaces
- creating subagents with write tools
- packaging a plugin

For third-party adoption, inspect the files that will execute or steer tools. A popular skill or plugin is not automatically safe.

## Eval plan

### Prompts

1. "Set up this repo so Codex and Claude both know the test, lint, and release workflow without bloating root instructions."
2. "Agents keep missing migration safety checks. Decide whether to use context, skill, hook, or subagent."
3. "Find existing skills or plugins before creating a local PR review workflow for this project."
4. "Create dual-target harness changes, using Codex as current primary unless I say otherwise."
5. "This monorepo has conflicting package conventions. Decide what belongs at root and what belongs in local overrides."

### Checks

- output inventories existing harness before proposing edits
- output separates provider-neutral decisions from Codex and Claude targets
- external adoption is considered before local generation when research is allowed
- hooks, MCP, plugins, and write-capable subagents have explicit risk gates
- recommendations include verification prompts or commands
- root context remains concise

## Likely failure patterns

- over-generating every possible harness surface instead of solving the repeated job
- treating Codex and Claude paths as a mechanical one-to-one migration
- installing or recommending third-party plugins without trust and maintenance assessment
- putting long workflow procedures into `AGENTS.md` or `CLAUDE.md`
- avoiding hooks even when the miss is deterministic and recurring

## Open questions

- Whether `craft-harness` should eventually edit files directly by default, or stay proposal-first with an explicit apply step.
- Whether external marketplace search should live inside `craft-harness` or use `craft-skill-spec`'s radar as a required input.
