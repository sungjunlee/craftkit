---
name: craft-critique
description: Critique a prompt or skill and surface ambiguity, hidden assumptions, weak structure, portability issues, and likely failure modes — a read-only review that never edits the artifact. Use this whenever the user asks to review, audit, critique, or diagnose a prompt or skill, mentions a prompt that "feels off" or behaves inconsistently, or wants the findings before deciding on a rewrite — even if they don't say "critique." For the review-and-fix loop that actually applies edits, use craft-tune instead.
---

# craft-critique

## Purpose

Critique a prompt or skill and surface ambiguity, hidden assumptions, weak structure, portability issues, and likely failure modes — and stop there. craft-critique is read-only: it diagnoses and recommends, it never edits the artifact.

Critiquing before rewriting matters because most "make this better" requests would be better served by structural fixes than by new wording. A short diagnostic pass exposes what's actually broken so the next edit can be surgical.

This is the `/review`-style half of the pair: run craft-critique to *see* what's wrong; run `craft-tune` when you want the autonomous critique-and-edit loop to *fix* it. Keeping the review separate means you can audit an artifact, decide, and only then choose whether to edit.

## Use this when

- a prompt feels messy but the problem is unclear
- a skill works sometimes but not consistently
- a repo asset needs review before being generalized or shipped
- a large rewrite is tempting and a critique should come first
- you want findings to act on yourself, not an agent editing the file

If the user wants the artifact actually edited — "fix it," "sharpen it," "make it better and apply the changes" — use `craft-tune`, which runs the autonomous review-and-fix loop.

## Inputs

- the current prompt or skill
- the desired outcome
- any important constraints
- optional examples of failure (specific outputs the artifact produced that were wrong)

## Steps

1. Identify the artifact's real job. If you can't state it in one sentence, that's already a finding.
2. Check whether the current structure supports that job. Structural problems show up as sections that don't earn their keep.
3. Find ambiguity, redundancy, and hidden assumptions. These are the things that silently break reuse.
4. Check cross-agent portability. Spot provider-specific wording, tool names, or formats that won't travel.
5. Check whether outputs are concrete and reusable. If an agent can't act on the output without guessing, the skill is leaking work onto the user.
6. Summarize the highest-leverage fixes first. Small, ordered fixes beat a laundry list.

## Output format

### What is working
Short list of strengths worth preserving. Name the specific element, not a generic positive.

### Diagnostics
Prioritized list, 1-5 items. Each item carries an explicit severity tag (`[HIGH]`, `[MED]`, `[LOW]`). When reviewing repo assets, prompts in files, or skills, cite concrete evidence for every `[HIGH]` and `[MED]` item — file path plus section or line when available. When failure outputs were supplied as input, each `[HIGH]` item must name the specific failure it explains. Bare position is not enough — make the priority signal visible.

### Recommended changes
Imperative commands. Prefer useful consolidation and reprioritization over mechanically mirroring Diagnostics 1:1. Consolidate where two issues share a fix; reprioritize where the cheapest or highest-leverage fix is not the first Diagnostics item. A direct 1:1 mapping is fine when that is clearest, but do not force one finding to become one recommendation just to preserve shape.

### Failure modes
Distinct recurrence scenarios — how the artifact fails under conditions not already named in Diagnostics. Do not restate Diagnostics in future tense. Each item introduces a new trigger, actor, interaction, or downstream effect (e.g. a recurrence scenario after a fix, a cross-effect with another system, a misuse pattern Diagnostics did not surface).

### Minimal rewrite plan
An ordered sequence with explicit sequencing or priority rationale — not a numbered subset of Recommended changes. State why items go in this order: dependency, reach, risk, or reversibility.

## Guardrails

- read-only — produce findings, recommendations, and a plan; never a revised artifact
- do not nitpick style before fixing structure
- preserve strengths, not just list problems
- focus on issues that affect actual reuse and execution
- back significant repo/file findings with concrete evidence
- keep the review actionable

## When the review feels vague

If the top-level pass keeps surfacing the same fuzzy complaint ("this just feels off"), switch to the categorized diagnostic in `references/failure-modes.md`. It splits issues into ambiguity, scope, context, portability, verification, and structure — which usually makes the real problem easier to name.

## Common mistakes

- turning the critique into a rewrite — produce findings, not a revised artifact (that's `craft-tune`'s job)
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

**Diagnostics**
1. `[HIGH]` success criteria are undefined — "better" is unbounded, so output varies run-to-run
2. `[HIGH]` output format is missing — no template, so different agents return different shapes
3. `[MED]` no instruction to preserve original intent — the agent may quietly change scope

**Recommended changes**
- define what "better" means and add an output template (covers Diagnostics 1 and 2)
- add a constraint to preserve core intent

**Failure modes**
- agent makes the prompt longer but not better
- agent changes tone or scope unintentionally on a later reuse

**Minimal rewrite plan**
1. add the goal — everything else depends on a defined target
2. add intent-preservation constraint — cheap, prevents scope drift during the next two edits
3. add the output template — highest reach, but only meaningful once the goal exists
