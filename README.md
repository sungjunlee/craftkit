# CraftKit

CraftKit is a cross-agent toolkit for creating, improving, and operationalizing prompts and skills for coding agents such as Claude Code and Codex.

## Why CraftKit

Prompt assets and agent skills often become fragmented, provider-specific, and hard to reuse. CraftKit exists to keep them file-first, portable, reviewable, and easy to improve over time.

## What belongs in CraftKit

- prompt design and restructuring
- reusable skill design
- reflective critique and quality checks
- iterative improvement loops
- research-backed best practices
- copy-pasteable outputs for agent workflows

## What does not belong in CraftKit

- giant monolithic prompts with unclear intent
- provider-specific hacks mixed into core assets
- hidden logic that cannot be inspected in files
- unnecessary frameworks when markdown is enough

## Core skills

- `craftkit-blueprint`: turn a rough idea into a structured prompt or skill plan
- `craftkit-reflect`: critique a prompt or skill and identify weaknesses
- `craftkit-tune`: improve a prompt or skill with targeted edits
- `craftkit-loop`: run a small iterative improvement cycle
- `craftkit-autoresearch`: study comparable assets and synthesize upgrades

Each skill lives under `skills/<skill-name>/SKILL.md` and follows the Claude Code skill format (YAML frontmatter + markdown body), so it can be loaded as a skill directly or copy-pasted into other agent environments.

## Design principles

1. File-first and diff-friendly
2. Small composable units
3. Explicit inputs and outputs
4. Cross-agent portability
5. Eval-driven improvement when possible
6. Copy-pasteable results over fancy abstractions

## Repository layout

```text
.
├─ README.md
├─ AGENTS.md
├─ docs/
│  ├─ product.md
│  └─ roadmap.md
├─ skills/
│  ├─ craftkit-blueprint/
│  │  └─ SKILL.md
│  ├─ craftkit-reflect/
│  │  └─ SKILL.md
│  ├─ craftkit-tune/
│  │  └─ SKILL.md
│  ├─ craftkit-loop/
│  │  └─ SKILL.md
│  └─ craftkit-autoresearch/
│     └─ SKILL.md
├─ prompts/
│  ├─ 01-bootstrap-repo.md
│  ├─ 02-port-existing-assets.md
│  └─ 03-quality-pass.md
└─ package.json
```

## Near-term goals

- unify reusable patterns from existing prompt-builder and meta-skill assets
- define a stable skill format for cross-agent reuse
- keep the first release markdown-first and lightweight
- make every core skill understandable from a single `SKILL.md`

## Quickstart

### Use a CraftKit skill in Claude Code

Each skill is a standard Claude Code skill file. To make one available in a project:

1. Copy the skill directory into the project's skills location. Two common layouts:
   - **Repo-scoped**, so the skill only loads in this project:
     ```bash
     mkdir -p .claude/skills
     cp -R /path/to/craftkit/skills/craftkit-tune .claude/skills/
     ```
   - **User-scoped**, so the skill is available in every project:
     ```bash
     mkdir -p ~/.claude/skills
     cp -R /path/to/craftkit/skills/craftkit-tune ~/.claude/skills/
     ```
2. Restart the Claude Code session (or open a new one) so the skill is picked up.
3. Invoke the skill by describing the task — for example, *"tune this prompt to produce a changelog"* will match `craftkit-tune` via its description.

### Use a CraftKit skill in Codex or another agent

CraftKit skills are plain markdown with YAML frontmatter, so they port easily:

1. Open the relevant `SKILL.md`.
2. Paste the body (everything after the frontmatter) into the target agent's system prompt or instructions.
3. Keep the frontmatter `description` line as context so the agent knows when to apply the skill.

### Example end-to-end flow

See [`docs/examples/tune-a-prompt.md`](docs/examples/tune-a-prompt.md) for a walk-through of reflecting on an existing prompt, tuning it, and running a short improvement loop.

## Relationship to other tools

CraftKit is a **meta-layer**: it helps you design, critique, and improve prompt and skill artifacts — including artifacts that already live in other repositories. In particular, CraftKit does not replace [`prompt-builder`](../prompt-builder/) (prompt authoring) or any specific agent framework. It operates one level above them: given an existing prompt or skill, CraftKit helps you shape it, review it, and iterate.

See `docs/migration.md` for what was and wasn't carried over from prior assets.

## Status

This repository is currently in bootstrap phase.
