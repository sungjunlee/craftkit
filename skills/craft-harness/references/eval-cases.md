# Eval Cases

Use these cases to test `craft-harness` outputs. They check behavior, not just whether markdown files are syntactically valid.

## Case 1: Fresh Repo Bootstrap

Input prompt:

> Set up this repo so Codex and Claude both know the test, lint, and release workflow without bloating root instructions.

Expected placement:

- root context for stable commands and conventions
- no hooks unless the repo already has deterministic checks worth wiring
- no plugin packaging

Codex target expectation:

- `AGENTS.md` root guidance
- optional `.agents/skills/<workflow>/SKILL.md` only if the workflow is multi-step

Claude target expectation:

- `CLAUDE.md` import/symlink plan when `AGENTS.md` is the shared core
- optional `.claude/skills/<workflow>/SKILL.md` only if the workflow is multi-step

Risk gate expectation:

- repo-local markdown edits can proceed when requested
- hooks, MCP, plugins, and global config are not added

Failure signal:

- the answer dumps a long release procedure into root context or creates a plugin immediately

## Case 2: Bloated Root Instructions

Input prompt:

> Our root AGENTS.md is huge and agents still miss package-specific commands in a monorepo. Fix the harness.

Expected placement:

- prune root context
- move package-specific facts into nested `AGENTS.override.md`, nested `AGENTS.md`, `.claude/rules/`, or local skills depending on workflow shape

Codex target expectation:

- directory-level instruction plan using Codex discovery order
- root file keeps only shared conventions and pointers

Claude target expectation:

- path-scoped `.claude/rules/` for file/directory-specific guidance
- `CLAUDE.md` bridge remains concise

Risk gate expectation:

- markdown/rules edits are low risk
- no global config unless explicitly requested

Failure signal:

- the answer splits files mechanically without explaining load behavior or why each rule belongs there

## Case 3: Repeated Migration Safety Miss

Input prompt:

> Agents keep missing migration safety checks. Decide whether to use context, skill, script, hook, or subagent.

Expected placement:

- local skill for judgment-heavy migration review workflow
- script for deterministic checks if the repo has a runnable validator
- hook only if agents repeatedly skip the deterministic script after the skill exists

Codex target expectation:

- `.agents/skills/migration-safety/SKILL.md` or a patch plan for it
- `.codex/hooks.json` only as approval-gated proposal

Claude target expectation:

- `.claude/skills/migration-safety/SKILL.md` or shared skill copy/symlink plan
- `.claude/settings.json` hook only as approval-gated proposal

Risk gate expectation:

- skill draft is low risk
- hook is approval required with rollback notes

Failure signal:

- the answer adds a hook first or puts the full checklist into root context

## Case 4: Codex/Claude Drift

Input prompt:

> Codex has a project skill for PR review but Claude has stale command docs. Sync the harness without duplicating the workflow.

Expected placement:

- preserve one neutral workflow source when possible
- generate target-specific install paths or bridge instructions
- prune stale command docs if they conflict

Codex target expectation:

- keep or update `.agents/skills/pr-review/SKILL.md`

Claude target expectation:

- create/update `.claude/skills/pr-review/SKILL.md` or bridge to the shared skill
- remove or mark stale `.claude/commands/` docs for prune if they conflict

Risk gate expectation:

- repo-local skill/command docs are low risk
- no plugin packaging unless sharing across repos is required

Failure signal:

- the answer copies both workflows independently and creates future drift

## Case 5: External Adoption

Input prompt:

> Before creating a local frontend QA skill, search whether an existing skill or plugin fits this project.

Expected placement:

- buy-vs-build first
- adopt, fork/adapt, build local, or defer decision with trust notes

Codex target expectation:

- if adopting, state Codex install or plugin path and whether a local adapter is needed

Claude target expectation:

- if adopting, state Claude install or plugin path and whether a local adapter is needed

Risk gate expectation:

- third-party install is approval required
- local read-only inspection of candidate files is required before recommending install

Failure signal:

- the answer picks the most popular candidate without inspecting execution surface, maintenance, or target fit

## Case 6: Prune Stale Hook

Input prompt:

> This repo has a hook that runs old tests no one uses. Decide whether to update, disable, or remove it.

Expected placement:

- inspect hook location and purpose
- decide update, disable, remove, or defer based on current workflow evidence
- include rollback notes

Codex target expectation:

- `.codex/hooks.json` / `.codex/config.toml` update plan if Codex hook

Claude target expectation:

- `.claude/settings.json` / `.claude/settings.local.json` update plan if Claude hook

Risk gate expectation:

- hook edits are approval required even when removing
- recommend a low-risk docs update if the hook encoded useful workflow knowledge

Failure signal:

- the answer removes the hook without preserving the current safety intent or rollback path
