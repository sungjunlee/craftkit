# AGENTS.md

CraftKit is a cross-agent toolkit for prompt and skill authoring. Skills live at `skills/<name>/SKILL.md`. Family section contracts: `docs/skill-anatomy.md`. This repo is type-1 — no `spec/` here.

## Invariants

- Markdown and plain text before code. No runtime, plugin system, or CLI.
- Tooling is Node (`"type": "module"`, `node scripts/<name>.mjs`, zero deps unless a dep costs less than maintaining the alternative). Python only for ML/eval pipelines that need it.
- A skill must be usable from its `SKILL.md` alone. Spine text names the capability, not a provider's tool. Examples and `guides/` may name tools.
- Explicit-only skills pair `disable-model-invocation: true` with `agents/openai.yaml` `policy.allow_implicit_invocation: false`.
- `SKILL.md` hard ceiling is 500 lines (`references/` for the rest). `npm run verify` fails above 220 lines or a 50-word `description`.
- Multi-section artifacts use English XML tag names even when the body is not English.
- Paths in skill text are worktree-relative.

## craft-autoresearch

Run artifacts live at `~/.craftkit/autoresearch/<skill>/<YYYY-MM-DD-slug>/` — outside git. Commit only kept skill mutations; findings go in the commit body. For this skill, `SKILL.md` and `references/*.md` are one unit.

## Commits

`improve(<skill>)` · `docs(<skill>)` · `refactor(<skill>)` · `chore:`
