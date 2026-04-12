# CraftKit

CraftKit is a cross-agent toolkit for creating, improving, and operationalizing prompts and skills for coding agents such as Claude Code and Codex.

## Why CraftKit

Prompt assets and agent skills often become fragmented, provider-specific, and hard to reuse. CraftKit exists to keep them file-first, portable, reviewable, and easy to improve over time.

## What belongs in CraftKit

- generating new prompts from scratch (task, research, session handoff, templates)
- prompt design and restructuring
- reusable skill design
- reflective critique and quality checks
- iterative improvement loops
- research-backed best practices
- copy-pasteable outputs for agent workflows

## What does not belong in CraftKit

- giant monolithic prompts with unclear intent
- hidden logic that cannot be inspected in files
- unnecessary frameworks when markdown is enough

## Core skills

All skills use the `craft-` prefix so they read naturally as "craft a prompt," "craft a blueprint," etc. The `CraftKit` brand stays on the repo; skill names are short.

- `craft-prompt`: generate a new prompt from scratch for any LLM (absorbed from the mature `prompt-builder`)
- `craft-blueprint`: turn a rough idea into a structured prompt or skill plan
- `craft-reflect`: critique a prompt or skill and identify weaknesses
- `craft-tune`: improve a prompt or skill with targeted edits
- `craft-research`: one-shot prior-art study — survey comparable assets and extract patterns
- `craft-autoresearch`: eval-driven autonomous optimization loop for a prompt or skill (Karpathy-style)

Each skill lives under `skills/<skill-name>/SKILL.md` and follows the Claude Code skill format (YAML frontmatter + markdown body), so it can be loaded as a skill directly or copy-pasted into other agent environments.

## Design principles

1. File-first and diff-friendly
2. Small composable units
3. Explicit inputs and outputs
4. Cross-agent portability (core skill spines stay provider-neutral; platform-specific detail stays in sub-skills like `craft-prompt/guides/`)
5. Eval-driven improvement when possible
6. Copy-pasteable results over fancy abstractions

## Repository layout

```text
.
├─ README.md
├─ AGENTS.md
├─ LICENSE
├─ docs/
│  ├─ product.md
│  ├─ roadmap.md
│  ├─ migration.md
│  └─ examples/
│     └─ tune-a-prompt.md
├─ skills/
│  ├─ craft-prompt/
│  │  ├─ SKILL.md
│  │  ├─ guides/       (platform-specific tips: claude, gpt, gemini, perplexity, local)
│  │  ├─ references/   (components, patterns, quality checklist)
│  │  └─ templates/    (session-handoff, system-prompt, image-gen, video-gen)
│  ├─ craft-blueprint/
│  │  └─ SKILL.md
│  ├─ craft-reflect/
│  │  ├─ SKILL.md
│  │  └─ references/
│  │     └─ failure-modes.md
│  ├─ craft-tune/
│  │  └─ SKILL.md
│  ├─ craft-research/
│  │  └─ SKILL.md
│  └─ craft-autoresearch/
│     ├─ SKILL.md
│     └─ references/
│        ├─ eval-guide.md
│        ├─ mutation-guide.md
│        └─ worked-example.md
├─ prompts/
│  ├─ 01-bootstrap-repo.md
│  ├─ 02-port-existing-assets.md
│  └─ 03-quality-pass.md
└─ package.json
```

## Quickstart

### Use a CraftKit skill in Claude Code

Each skill is a standard Claude Code skill file. To make one available in a project:

1. Copy the skill directory into the project's skills location. Two common layouts:
   - **Repo-scoped**, so the skill only loads in this project:
     ```bash
     mkdir -p .claude/skills
     cp -R /path/to/craftkit/skills/craft-prompt .claude/skills/
     ```
   - **User-scoped**, so the skill is available in every project:
     ```bash
     mkdir -p ~/.claude/skills
     cp -R /path/to/craftkit/skills/craft-prompt ~/.claude/skills/
     ```
2. Restart the Claude Code session (or open a new one) so the skill is picked up.
3. Invoke the skill by describing the task — for example, *"build me a handoff prompt for the next session"* will match `craft-prompt` via its description.

### Use a CraftKit skill in Codex or another agent

CraftKit skills are plain markdown with YAML frontmatter, so they port easily:

1. Open the relevant `SKILL.md`.
2. Paste the body (everything after the frontmatter) into the target agent's system prompt or instructions.
3. Keep the frontmatter `description` line as context so the agent knows when to apply the skill.

### Example end-to-end flow

See [`docs/examples/tune-a-prompt.md`](docs/examples/tune-a-prompt.md) for a walk-through of reflecting on an existing prompt, tuning it, and running a short improvement loop.

## Relationship to other tools

CraftKit bundles both **generation** (`craft-prompt`) and **improvement** (`craft-blueprint`, `craft-reflect`, `craft-tune`, `craft-research`, `craft-autoresearch`) into one toolkit. It does not replace any specific agent framework — it sits alongside them as a place to design, create, critique, and iterate on the prompt and skill artifacts those frameworks consume.

For generic code-metric loops (test coverage, bundle size, lint errors), see the sibling [`autoloop`](../autoloop/) repo — `craft-autoresearch` is specifically for optimizing prompt and skill output quality against evals, while `autoloop` targets measurable code properties.

See `docs/migration.md` for what was carried over from prior assets and why the original `prompt-builder` repo was absorbed rather than kept separate.

## Status

This repository is currently in bootstrap phase.
