---
name: craft-reflect
description: Critique a prompt or skill and surface ambiguity, hidden assumptions, weak structure, portability issues, and likely failure modes before any rewrite happens. Use this whenever the user asks to review, audit, critique, or improve a prompt or skill, mentions a prompt that "feels off" or behaves inconsistently, or is about to start a large rewrite and should stop to diagnose first — even if they don't explicitly say "reflect" or "review."
---

# craft-reflect

## Purpose

Critique a prompt or skill and surface ambiguity, hidden assumptions, weak structure, portability issues, and likely failure modes.

Reflecting before rewriting matters because most "make this better" requests would be better served by structural fixes than by new wording. A short diagnostic pass exposes what's actually broken so the next edit can be surgical.

## Use this when

- a prompt feels messy but the problem is unclear
- a skill works sometimes but not consistently
- a repo asset needs review before being generalized
- a large rewrite is tempting and a critique should come first

## Inputs

- the current prompt or skill
- the desired outcome
- any important constraints
- optional examples of failure

## Steps

1. Identify the artifact's real job. If you can't state it in one sentence, that's already a finding.
2. Check whether the current structure supports that job. Structural problems show up as sections that don't earn their keep.
3. Find ambiguity, redundancy, and hidden assumptions. These are the things that silently break reuse.
4. Check cross-agent portability. Spot provider-specific wording, tool names, or formats that won't travel.
5. Check whether outputs are concrete and reusable. If an agent can't act on the output without guessing, the skill is leaking work onto the user.
6. Summarize the highest-leverage fixes first. Small, ordered fixes beat a laundry list.

## Output format

### What is working
Short list of strengths worth preserving.

### Issues
Prioritized list of issues with short explanations.

### Recommended changes
Concrete changes, phrased so they can be applied directly.

### Failure modes
Common ways the artifact may fail in practice.

### Minimal rewrite plan
A small-step plan rather than a total rewrite.

## Guardrails

- do not nitpick style before fixing structure
- preserve strengths, not just list problems
- focus on issues that affect actual reuse and execution
- keep the review actionable

## When the review feels vague

If the top-level pass keeps surfacing the same fuzzy complaint ("this just feels off"), switch to the categorized diagnostic in `references/failure-modes.md`. It splits issues into ambiguity, scope, context, portability, and structure — which usually makes the real problem easier to name and fix.

## Failure modes

- turning the critique into a rewrite before the user has reviewed it
- surfacing only negatives and losing the parts that already work
- over-indexing on tone and wording when the real issue is missing structure
- generating a long list of low-priority nits that buries the real fix

## Example

### Input
A prompt that asks the agent to "make this better" without saying what better means.

### Output

**What is working**
- intent to improve is clear
- short enough to be edited easily

**Issues**
1. success criteria are undefined
2. output format is missing
3. there is no instruction to preserve original intent

**Recommended changes**
- define what "better" means
- require a revised version plus changelog
- add a constraint to preserve core intent

**Failure modes**
- agent makes the prompt longer but not better
- agent changes tone or scope unintentionally

**Minimal rewrite plan**
- add goal
- add constraints
- add output template
