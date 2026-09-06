---
name: craft-critique
description: Critique prompts or skills and surface what actually needs fixing. Use for review, audit, "feels off" artifacts, or diagnosis before a rewrite; applies fixes only when asked.
metadata:
  related-skills: "craft-autoresearch"
---

# craft-critique

## Purpose

Diagnose a prompt or skill — surface ambiguity, hidden assumptions, weak structure, over-specification, portability issues, and likely failure modes — and say what to do about it, in priority order. The default is read-only: findings and recommendations, no edits.

Critiquing before rewriting matters because most "make this better" requests are better served by structural fixes — often by cutting — than by new wording. A short diagnostic pass exposes what's actually broken, or merely bloated, so the next edit can be surgical.

## Use this when

- a prompt feels messy but the problem is unclear
- a skill works sometimes but not consistently
- a repo asset needs review before being generalized or shipped
- a large rewrite is tempting and a critique should come first

If the user also wants the fixes applied, apply them guided by the findings — smallest diff first, preserving the artifact's intent. No separate protocol is needed; the critique is the plan. (If the ask is purely "make this smaller," that's a simplify pass — same subtractive lens, no findings ceremony.)

## Inputs

- the current prompt or skill, plus what it reaches: its reference files, the surrounding instructions loaded alongside it, and the contracts its callers and output consumers impose
- the desired outcome
- any important constraints
- optional examples of failure (specific outputs the artifact produced that were wrong)

## Steps

1. Identify the artifact's real job. If you can't state it in one sentence, that's already a finding.
2. Read what the artifact actually operates inside, not just the file in front of you: the reference files it points at, the surrounding instructions loaded with it, and the contracts its callers and output consumers impose. Judging a lone prompt against an imagined context is how a critique invents problems and misses real ones.
3. Check whether each part earns its place — sections, rules, or detail that don't carry weight are findings to cut, including instruction a capable model already follows without being told.
4. Find ambiguity, redundancy, and hidden assumptions — the things that silently break reuse. A contradiction you can point at on two lines is established, whether or not anyone has hit it yet.
5. Check cross-agent portability against the agents the artifact actually runs on: provider-specific wording, tool names, or formats that won't travel there.
6. Check whether outputs are concrete enough to act on without guessing, and whether anything downstream — a parser, a caller, a human reader — constrains the shape they can take.
7. Order the findings by leverage, not by discovery order. If the evidence supports no change, say so — an artifact that holds up is a valid result, and manufacturing findings to fill a report is worse than a short one.

## Output format

Shape the write-up to the artifact — a three-line prompt deserves a paragraph, a 200-line skill a structured report. Whatever the shape, a critique must convey three things:

- **Findings, prioritized, with evidence — gaps and excess alike.** What should be cut (a section, rule, or detail that doesn't earn its place) is as much a finding as what's missing. Severity-tag each (`[HIGH]`/`[MED]`/`[LOW]`); for repo assets, back every `[HIGH]` and `[MED]` with a file:line or a quoted phrase. When failure outputs were supplied, tie each `[HIGH]` to the specific failure it explains. Say which kind of evidence each finding rests on. A defect you can point at — a bad output, or a contradiction between two lines you can quote — is established and justifies a fix now; a contradiction proven by inspection needs no production failure first. An effect you expect the wording to have on future behavior is a prediction, and should read like one.
- **What already works.** Name the specific elements worth preserving, so the next edit doesn't flatten them.
- **What to do, in what order, and why that order.** Recommendations with their sequencing rationale — dependency, reach, risk, or reversibility. Consolidate where one fix covers several findings.

## Guardrails

- read-only by default — edit only when the user asks for fixes
- structure before style, and weigh subtraction before addition: don't nitpick wording while the skeleton is broken, and don't prescribe what a capable model already does well
- every significant claim carries evidence a reader can check, and a fix respects what the artifact's consumers and callers already require — don't propose a format, cap, or confirmation step that breaks a contract or removes authorization the user granted
- keep it actionable: a short ordered list beats an exhaustive inventory, and "nothing here needs changing" is a legitimate result rather than a gap to fill

## Failure modes

- turning an unrequested critique into a rewrite
- only ever adding — surfacing gaps to fill while never flagging detail to cut, so applying the critique inflates the artifact
- surfacing only negatives and losing what already works
- severity tags assigned by position or count rather than impact

## When the review feels vague

If findings keep collapsing into "this just feels off," switch to the categorized diagnostic in `references/failure-modes.md` — ambiguity, scope, context, portability, verification, structure — which usually makes the real problem nameable.

## Example

Input: a prompt that asks an agent to "make this better" with no definition of better, plus one failing sample (a longer-but-not-better rewrite).

A proportionate critique — the artifact is one sentence, so the write-up is short:

- `[HIGH]` "better" is undefined, so output varies run-to-run; the supplied failing sample is exactly this failure.
- `[MED]` nothing says preserve the original intent, so scope drifts silently on reuse.
- Working: the improve-intent is clear, and the prompt is short enough to edit safely.
- Fix order: define "better" first (everything else depends on a target), then add an intent-preservation constraint (cheap, prevents drift while iterating). One consolidated edit covers both.

## References

- `references/failure-modes.md` — categorized diagnostic vocabulary (ambiguity, scope, context, portability, verification, structure) for when top-level findings stay fuzzy.
