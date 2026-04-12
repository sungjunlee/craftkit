---
name: craftkit-blueprint
description: Turn a rough idea into a structured prompt or skill blueprint with explicit objective, inputs, workflow, outputs, and a concrete file plan. Use this whenever the user wants to design a new prompt or skill, scaffold a skill-like workflow, mentions "blueprint," "structure," or "plan" for a prompt, or arrives with a vague request that needs to be shaped before implementation — even if they don't explicitly ask for a blueprint.
---

# craftkit-blueprint

## Purpose

Turn a rough idea into a structured prompt or skill blueprint that is easy to implement, review, and reuse.

Blueprinting matters because vague requests produce vague artifacts. Separating goals, inputs, workflow, and outputs *before* writing the artifact makes the resulting prompt or skill far more reusable and far less brittle.

## Use this when

- the request is still vague
- a new skill or prompt family is being started
- a stable file plan is needed before editing the repo
- the current artifact mixes goals, constraints, and output shape

## Inputs

- brief idea or request
- intended agent or agents
- expected outcome
- constraints
- existing references if available

## Steps

1. Extract the real objective behind the request. Rough wording usually hides a cleaner goal — surface it in one sentence.
2. Separate goals, constraints, assumptions, and non-goals. Mixing these is the most common source of prompt drift.
3. Propose a clean structure for the target prompt or skill. Favor the simplest shape that can survive reuse.
4. Define the expected inputs, steps, and outputs. Be explicit enough that another agent could implement the artifact without guessing.
5. Suggest files to create or update. A concrete file list converts the blueprint into work.
6. Call out any unresolved decisions briefly. Only surface decisions that materially change the design.

## Output format

### Summary
A short paragraph describing what is being built and why.

### Blueprint
- objective
- target users or agents
- inputs
- workflow
- output format
- guardrails
- non-goals

### Files to create or update
A concrete file list with one-line purpose per file.

### Open questions
Only include questions that materially affect the design.

## Guardrails

- prefer the simplest structure that can survive reuse
- do not create too many top-level concepts
- keep the blueprint implementation-oriented
- avoid provider lock-in in the core structure

## Failure modes

- writing a blueprint so abstract that nobody knows how to start
- inventing a plugin system or framework before the asset itself works
- drowning the user in open questions instead of making reasonable assumptions
- copying another repo's structure instead of shaping one for the actual task

## Example

### Input
Create a reusable skill that helps improve prompts for Claude Code and Codex.

### Output

**Summary**
Create a cross-agent tuning skill that revises existing prompts with small, explicit edits.

**Blueprint**
- objective: improve prompts without rewriting them from scratch
- target agents: Claude Code, Codex
- inputs: current prompt, target improvement, constraints
- workflow: inspect, critique, edit, summarize changes
- output format: revised prompt, changelog, risks
- guardrails: keep intent stable, keep diffs minimal
- non-goals: provider-specific hacks

**Files to create or update**
- `skills/craftkit-tune/SKILL.md`
- `docs/product.md`

**Open questions**
- Should examples live inside each skill file or in a shared examples folder?
