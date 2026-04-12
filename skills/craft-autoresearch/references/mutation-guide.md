# Mutation Guide

A mutation is one bounded change to the target artifact between experiments. The loop's signal comes from attributing score changes to specific mutations — so mutations must be small, labeled, and at a single level.

## Mutation levels

Mutations operate at one of four levels. Picking the right level is usually more important than picking the "right" change.

### Level 1 — Wording

Rephrasing without changing structure or adding/removing rules.

Examples:
- swap a vague adjective for a specific constraint ("briefly" → "under 100 words")
- replace a question with an imperative
- tighten a rule's phrasing so it's unambiguous

When to use: the artifact is structurally sound but scores are flat because instructions are fuzzy.

### Level 2 — Example

Adding, removing, or rewriting an example inside the artifact.

Examples:
- add one concrete example to a section where outputs drift
- replace an overly simple example with one that covers an edge case
- remove an example that contradicts a rule (this is a common hidden bug)

When to use: binary evals fail on form, or outputs vary wildly between runs.

### Example → Rule progression:
If the same kind of failure keeps appearing, promote a successful example pattern into an explicit rule at Level 3.

### Level 3 — Structure

Adding, removing, or reordering sections or steps.

Examples:
- split a Steps section that mixes planning and execution
- add a new Guardrails section when repeated failures share a cause
- remove a section that never earns its keep (see deletion experiments)

When to use: outputs are consistent but the artifact's shape is fighting its job.

### Level 4 — Principle

Changing the underlying claim the artifact makes about the task.

Examples:
- switch from "enumerate every issue" to "surface the top three"
- move from "process-first" ("do X then Y") to "outcome-first" ("produce Z, means are yours")
- change the audience assumption (e.g. for a reviewer instead of an author)

When to use: Levels 1-3 have plateaued and the ceiling looks like the wrong goal. Principle changes are high-leverage but hard to reverse — use deletion experiments aggressively after one.

## One mutation per experiment

Multi-level mutations make outcomes unattributable. If a 3-line change alters wording, adds an example, *and* adds a rule, a score rise tells you nothing about which piece helped. Keep experiments single-purpose even when multiple fixes seem obviously needed — run them as separate experiments.

## Deletion experiments

Every fifth experiment (or sooner if the artifact has grown noticeably), try a deletion: remove a recently added rule, example, or section. If the score holds, keep the deletion — that piece was not pulling its weight.

Deletion experiments are the single most effective guard against prompt bloat. Without them, autoresearch reliably produces artifacts that grow monotonically because "adding" is an easier heuristic than "removing."

Bloat alert: if the target artifact passes 200% of baseline size, stop and run three deletion experiments in a row before resuming normal mutations.

## Picking the next mutation

Use this rough order when choosing:

1. Look at the failing evals. Which one, if fixed, would move the score most?
2. Read 2-3 real failing outputs. What's actually wrong?
3. Choose the lowest level (wording before example before structure before principle) that can plausibly fix it. Low-level mutations are cheaper to reverse.
4. Write down the hypothesis before making the change. "Adding an imperative verb requirement will fix the 3 outputs where recommendations were phrased as questions."
5. After running, check whether the hypothesis held. A score rise that doesn't match the hypothesis is information — log it.

## Anti-patterns

- **Bundling "while I'm in there" edits.** If you see a second thing to fix, note it and run it as the next experiment.
- **Cosmetic mutations after a big win.** Lock in the big win with a stability check (re-run the same inputs), not with cleanup.
- **Level-4 mutations without a deletion pass.** Principle shifts invite bloat; pair them with aggressive deletion experiments.
- **Mutations that narrow to the eval inputs.** The artifact should get better on the test inputs *via* getting better in general — not by referencing the specific inputs.
- **Ignoring the hypothesis.** If you can't state what you expect the mutation to do, the mutation isn't ready.

## Stuck? Try a direction shift

Three consecutive DISCARDs at the same level means that level is exhausted. Move up one level. Three consecutive DISCARDs at Level 4 means the eval suite is probably wrong — revisit the evals instead of mutating further.

Direction shifts belong in `research-log.json`, not `changelog.md`. They are the high-signal entries a human or future loop re-reads when resuming.
