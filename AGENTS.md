# AGENTS.md

This repository is designed to be edited by coding agents.

## Mission

Build CraftKit into a cross-agent toolkit for prompt and skill authoring, improvement, and reuse.

## Ground rules

- Prefer markdown and plain text before code.
- Keep features small, composable, and easy to inspect.
- Do not introduce dependencies unless they clearly reduce maintenance cost.
- Preserve cross-agent compatibility.
- Avoid provider-specific wording in core assets unless clearly isolated.
- Every skill should be understandable by reading its `SKILL.md` alone.
- Prefer additive changes and minimal diffs.
- When ambiguity exists, choose the simpler design and document the assumption.
- Do not rename top-level concepts without updating all references.

## Tooling language

When tooling *is* needed (a script, a CLI, an eval helper), default to **Node.js**. Reach for Python only when it's clearly the better fit — typical cases are ML/eval pipelines that rely on established Python libraries, or notebooks for exploratory analysis.

Why Node is the default:

- Claude Code and Codex CLI already require Node, so every CraftKit user has it installed. Adding Python forces a second runtime and an environment-management story (venv, uv, pyenv) that kills adoption friction.
- Node's standard library plus a small set of zero-dep modules covers most CraftKit needs (file IO, JSON, child processes, CLI parsing).
- A single runtime keeps the repo copy-pasteable and keeps contributors unblocked.

When adding a script:

- use `"type": "module"` (already set in `package.json`)
- prefer zero dependencies; if a dep is required, prefer one with no native build step
- keep scripts self-contained and runnable via `node scripts/<name>.mjs`

## Skill file conventions

Each skill lives at `skills/<skill-name>/SKILL.md` and uses Claude Code skill format:

```markdown
---
name: <skill-name>
description: <one line on what it does + explicit trigger contexts>
---

<markdown body>
```

- The `description` is the triggering mechanism — include both what the skill does and when to use it.
- Keep the body under 500 lines. If it grows, split into `references/` and link from the body.
- Favor imperative form and explain the *why* behind each step rather than rigid ALWAYS/NEVER rules.
- Include at least one concrete example.

## Definition of done for each skill

1. `SKILL.md` clearly states purpose, inputs, steps, outputs, and limitations.
2. At least one concrete example is included.
3. The skill is copy-pasteable into another repo with minimal edits.
4. The skill avoids unnecessary jargon and hidden assumptions.
5. The skill can be used by Claude Code and Codex with only minor wording changes.

## Preferred workflow

1. Read `README.md`, `docs/product.md`, and the relevant skill files.
2. Draft or update the target skill in markdown.
3. Normalize headings and output format.
4. Add an example and a failure-mode note.
5. Run a self-review using the critique mindset.
6. Keep the final diff small and coherent.

## Output style

- Favor short sections and explicit templates.
- Favor examples over abstract explanation.
- Make results directly reusable.
- Prefer crisp prose over marketing language.

## Shared conventions

These conventions apply across every CraftKit skill and example, so they live here instead of being repeated in each skill.

- **Worktree-relative paths.** Treat the current worktree root as the base directory. Prefer paths like `src/auth.ts:45` over `/Users/name/project/src/auth.ts:45`. Use absolute paths only when the user explicitly needs machine-specific commands.
- **XML tags travel best.** When a prompt or skill has multiple sections, XML tags (`<context>`, `<task>`, `<rules>`) parse reliably across Claude, GPT, and Gemini. Plain markdown is fine for simple, single-section artifacts.
- **Tag names stay in English.** If the artifact body is non-English, keep tag names and structural labels in English — all major providers parse English tags regardless of content language.
- **No provider-specific tool names in the skill spine.** Describe the capability, not the tool. Provider-specific wording can live in examples or in platform-specific sub-resources (like `craft-prompt/guides/` which contains Claude/GPT/Gemini/Perplexity-specific tips), but not in the main body of a skill.

## Non-goals for the bootstrap phase

- building a large runtime system
- over-designing a plugin architecture
- adding provider-specific adapters too early
- creating a CLI before the core assets are stable
