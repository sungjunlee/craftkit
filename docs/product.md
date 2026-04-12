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

### Blueprint
Convert a rough request into a stable structure.

### Reflect
Find ambiguity, weakness, hidden assumptions, and portability issues.

### Tune
Improve an existing asset with minimal and intentional edits.

### Loop
Run a compact improvement cycle instead of one giant rewrite.

### Autoresearch
Look at comparable assets, extract patterns, and bring back only what is useful.

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
