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

### Build-step enforcement prior (skill optimizations)

For skill optimizations, the highest-yield Level-1 edit is frequently at the section of `SKILL.md` where the agent actually produces output — the `## Output format` subsection, or the `## Steps` entry that hands off to output. Agents execute the build step and re-read it each invocation; they do not reliably re-activate rules stated in distant conceptual prose.

Five autoresearch sessions against CraftKit skills resolved their dominant failure modes with a single edit at this location:

- `craft-critique` (since folded into `craft-tune`) — rewrote every subsection under `## Output format` to demand the specific signal it should carry (severity tags, consolidation, ordering, distinct-dimension failure modes) instead of just the shape.
- `craft-prompt` — added a "Sizing heuristic" block to Step 3 "Build the Prompt" converting two conceptual principles (right-size structure to request, list all varying values as placeholders) into concrete structural rules.
- `craft-scaffold` — tightened `## Output format` to require a drafted `description` frontmatter for skill targets, task-specific purpose clauses, and bounded architectural open questions — all rules previously stated in conceptual sections but unenforced at build time.
- `craft-tune` — tightened `## Output format` §Changelog to require the three explicit `changed / why / expected effect` fields per entry, resolving a silent spec-vs-Example contradiction where the `## Example` block showed bare bullets. Flipped 5 failing evals with a single Level-1 edit.
- `craft-survey` — tightened all six `## Output format` subsections to demand per-item provenance (Reference patterns), per-item rationale (Adopt/Avoid), file-plus-section-plus-verb concreteness (Recommended edits), and non-portable survey-specific risks (Risks). Flipped 13 failing evals across three inputs with a single Level-1 edit.

So before mutating elsewhere, scan the build-step section(s) and ask: *does this section enforce every quality rule the conceptual sections state?* The answer is frequently no. A single tightening edit there can flip multiple failing evals at once, and the mutations tend to be small and lean.

This is a prior, not a law — always let the failing evals and failing outputs lead. But when deciding *where* in `SKILL.md` to intervene, start at the build step.

### Build-step tightenings should state only NEW demands

When the exp-1 tightening is a spec rewrite at `## Output format`, the declarative prose rule of the new demand is what carries the score. Companion material bundled into the same rewrite is demonstrated redundant across three sessions — inline illustrative examples (`"e.g., minimal-diff discipline — craft-tune/SKILL.md §Principles"`), fail/pass exemplar pairs inside the subsection paragraph, `## Example`-block alignment edits that repeat what the new spec already demands, and bullets that re-declare elements already canonicalized in sibling sections of the same skill:

- `craft-tune` (2026-04-12) exp-2 reverted the `## Example`-block changelog-table alignment bundled into exp-1. The spec-level tightening had flipped 5 evals; the Example-block alignment was the cosmetic companion. Deletion held score at 18/18.
- `craft-survey` (2026-04-12) exp-2 stripped the inline illustrative examples (`"e.g., ..."` fragments and fail/pass exemplar pairs) from four tightened subsections while leaving the declarative prose rules intact. Deletion held score at 18/18.
- `craft-autoresearch` (2026-04-12) exp-2 stripped 4 of 8 bullets in the `## Output format § Experiment contract` rewrite — the bullets that re-declared target / test inputs / budget / stop-condition, elements already canonicalized in Step 1 and § Inputs. Only the 4 NEW quality-commitment bullets (mutable files, evals 4th diagnostic, harness design, first-mutation hypothesis preview) remained. Deletion held score at 18/18.

Practical guidance: first-cut `## Output format` tightenings should write only the NEW declarative rule. If the rule feels like it needs an inline example, an Example-block alignment, or a bullet re-listing elements already named in Step 1 / Inputs / a sibling subsection to be understood, the rule is under-specified — sharpen its category-level naming of what passes and what fails, rather than appending supporting material. This keeps the exp-1 edit lean and makes the mandatory deletion experiment cheap.

Scope of claim: specific to build-step `## Output format` tightenings for prompt/skill-shaping skills. Does not generalize to all mutation types — Level-2 example mutations are about adding examples, and this observation is about tightenings that already state a rule, not about Example mutations themselves.

## Anti-patterns

- **Bundling "while I'm in there" edits.** If you see a second thing to fix, note it and run it as the next experiment.
- **Cosmetic mutations after a big win.** Lock in the big win with a stability check (re-run the same inputs), not with cleanup.
- **Level-4 mutations without a deletion pass.** Principle shifts invite bloat; pair them with aggressive deletion experiments.
- **Mutations that narrow to the eval inputs.** The artifact should get better on the test inputs *via* getting better in general — not by referencing the specific inputs.
- **Ignoring the hypothesis.** If you can't state what you expect the mutation to do, the mutation isn't ready.

## Stuck? Try a direction shift

Three consecutive DISCARDs at the same level means that level is exhausted. Move up one level. Three consecutive DISCARDs at Level 4 means the eval suite is probably wrong — revisit the evals instead of mutating further.

Direction shifts belong in `research-log.json`, not `changelog.md`. They are the high-signal entries a human or future loop re-reads when resuming.
