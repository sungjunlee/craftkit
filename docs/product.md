# CraftKit Product Notes

## One-line definition

CraftKit is a docs-first toolkit for creating, refining, and reusing prompts and skills across coding agents.

## Primary audience

- developers using Claude Code, Codex, and similar coding agents
- people who maintain reusable prompt assets
- teams that want skill-like workflows without heavy tooling

## Problems to solve

1. Good prompts and skills are scattered across repos and personal notes.
2. Assets are often tied too tightly to one provider.
3. Improvement work is ad hoc and hard to review.
4. Existing assets are not packaged in a reusable, file-first form.

## Product shape

CraftKit should feel like a portable workshop:

- blueprint something new
- reflect on quality
- tune with targeted edits
- loop through small iterations
- research strong patterns before changing core assets

## Core concepts

### Prompt
Generate a new, copy-paste-ready prompt from scratch — including task prompts, session handoffs, and reusable templates. Covered by the `craft-prompt` skill, absorbed from the mature `prompt-builder` asset.

### Blueprint
Convert a rough request into a stable structure for a new prompt or skill.

### Reflect
Find ambiguity, weakness, hidden assumptions, and portability issues.

### Tune
Improve an existing asset with minimal and intentional edits.

### Research
Look at comparable assets, extract patterns, and bring back only what is useful. One-shot prior-art study, not an iterative loop.

### Autoresearch
Eval-driven autonomous optimization loop. Define eval criteria and a run harness, then iterate — run the artifact on test inputs, score outputs, mutate the prompt or skill, keep improvements, discard regressions. Based on Karpathy's autoresearch methodology. Distinct from Research (one-shot survey) and from generic metric loops like the sibling `autoloop` skill (which targets code metrics such as test coverage or bundle size rather than prompt/skill output quality).

Skill prefix: every skill is named `craft-<verb>`, chosen because it reads naturally as "craft a prompt," "craft a blueprint," etc. The `CraftKit` brand name stays on the repo and documentation; skills use the shorter `craft-` prefix.

## Bootstrap scope

Included:

- markdown-first skill files
- examples embedded in skill docs
- prompt files for repository bootstrap and migration
- lightweight package metadata

Excluded for now:

- complex runtime
- evaluation harness code
- provider-specific execution adapters
- UI

## Success criteria

- a new user can understand CraftKit by reading the docs
- a coding agent can create or improve a skill with the provided prompts
- core skill files are reusable outside this repository
- terminology stays stable across docs and assets
