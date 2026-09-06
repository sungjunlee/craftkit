# Mutation guide

A mutation is one bounded change to the target artifact between experiments. The loop's signal comes from attributing score changes to specific mutations — so mutations must be small, labeled, and at a single level.

## Mutation levels

Mutations operate at one of four levels. Picking the right level is usually more important than picking the "right" change.

### Level 1 — Wording

Rephrasing without changing structure or adding/removing rules.

Examples:
- swap a vague adjective for a specific constraint ("briefly" → "under 100 words")
- replace a question with an imperative
- tighten a rule's phrasing so it's unambiguous
- replace broad persistence language ("be thorough", "use tools aggressively") with criteria for when extra work is warranted

When to use: the artifact is structurally sound but scores are flat because instructions are fuzzy.

### Level 2 — Example

Adding, removing, or rewriting an example inside the artifact.

Examples:
- add one concrete example to a section where outputs drift
- replace an overly simple example with one that covers an edge case
- remove an example that contradicts a rule (this is a common hidden bug)

When to use: binary evals fail on form, or outputs vary wildly between runs.

### Example → rule progression
If the same kind of failure keeps appearing, promote a successful example pattern into an explicit rule at Level 3.

### Level 3 — Structure

Adding, removing, or reordering sections or steps.

Examples:
- split a Steps section that mixes planning and execution
- add a new Guardrails section when repeated failures share a cause
- add a verification or missing-context checkpoint when repeated failures share grounding or premature-finalization causes
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

A deletion experiment removes a recently added rule, example, or section. If the score holds, keep the deletion — that piece was not pulling its weight.

Deletion is the most effective guard against prompt bloat, because "adding" is an easier heuristic than "removing" and an unchecked loop grows the artifact monotonically. Reach for it when the artifact has grown noticeably, when a recent KEEP bundled more than its rule, or when you want evidence that an accepted change is what carries the score.

## Picking the next mutation

Use this rough order when choosing:

1. Look at the failing evals. Which one, if fixed, would move the score most?
2. Read 2-3 real failing outputs. What's actually wrong?
3. Choose the lowest level (wording before example before structure before principle) that can plausibly fix it. Low-level mutations are cheaper to reverse.
4. Write down the hypothesis before making the change. "Adding an imperative verb requirement will fix the 3 outputs where recommendations were phrased as questions."
5. After running, check whether the hypothesis held. A score rise that doesn't match the hypothesis is information — log it.

### Where past skill optimizations landed (historical, non-normative)

The notes below record what five CraftKit sessions found; they are single-session observations, not a rule to invoke and not a prediction about the next run. Nothing in the loop requires citing them.

Those sessions kept resolving their dominant failure mode with one edit at the section of `SKILL.md` where the agent actually produces output — the `## Output format` subsection, or the `## Steps` entry that hands off to output. The offered explanation was that agents re-read the build step each invocation and do not reliably re-activate rules stated in distant conceptual prose.

- `craft-critique` — rewrote every subsection under `## Output format` to demand the specific signal it should carry (severity tags, consolidation, ordering, distinct-dimension failure modes) instead of just the shape. (That fixed-template contract was later replaced by a judgment contract in #150 — the signals survived, the section template didn't; see `eval-guide.md` § "The prescription ratchet.")
- `craft-prompt` — added a "Sizing heuristic" block to Step 3 "Build the Prompt" converting two conceptual principles (right-size structure to request, list all varying values as placeholders) into concrete structural rules. (#210 later removed the block with the six-block method; the proportionality and placeholder-breadth signals survive in the outcome-driven workflow.)
- `craft-scaffold` (since removed) — tightened `## Output format` to require a drafted `description` frontmatter for skill targets, task-specific purpose clauses, and bounded architectural open questions — all rules previously stated in conceptual sections but unenforced at build time.
- `craft-tune` (since removed) — tightened `## Output format` §Changelog to require the three explicit `changed / why / expected effect` fields per entry, resolving a silent spec-vs-Example contradiction where the `## Example` block showed bare bullets. Flipped 5 failing evals with a single Level-1 edit.
- `craft-survey` (since removed) — tightened all six `## Output format` subsections to demand per-item provenance (Reference patterns), per-item rationale (Adopt/Avoid), file-plus-section-plus-verb concreteness (Recommended edits), and non-portable survey-specific risks (Risks). Flipped 13 failing evals across three inputs with a single Level-1 edit.

Worth a look, then, when a conceptual rule isn't showing up in outputs: does the section that produces output say anything about it? Let the failing evals and failing outputs pick the locus — this is one place they often point, not a default to justify away from.

### Bundled companion material in past build-step tightenings (historical)

When a tightening was a spec rewrite at `## Output format`, the declarative rule of the new demand is what moved the score in these three sessions; the material bundled alongside it did not — inline illustrative examples (`"e.g., minimal-diff discipline — craft-tune/SKILL.md §Principles"`, quoted from the since-removed craft-tune's session), fail/pass exemplar pairs inside the subsection paragraph, `## Example`-block alignment edits that repeat what the new spec already demands, and bullets that re-declare elements already canonicalized in sibling sections of the same skill:

- `craft-tune` (2026-04-12, since removed) exp-2 reverted the `## Example`-block changelog-table alignment bundled into exp-1. The spec-level tightening had flipped 5 evals; the Example-block alignment was the cosmetic companion. Deletion held score at 18/18.
- `craft-survey` (2026-04-12, since removed) exp-2 stripped the inline illustrative examples (`"e.g., ..."` fragments and fail/pass exemplar pairs) from four tightened subsections while leaving the declarative prose rules intact. Deletion held score at 18/18.
- `craft-autoresearch` (2026-04-12) exp-2 stripped 4 of 8 bullets in the `## Output format § Experiment contract` rewrite — the bullets that re-declared target / test inputs / budget / stop-condition, elements already canonicalized in Step 1 and § Inputs. Only the 4 NEW quality-commitment bullets (mutable files, evals 4th diagnostic, runner design, first-mutation hypothesis preview) remained. (Two of those four — the 4th diagnostic and the hypothesis preview — have since been retired from the contract; that is a later change, not what this run kept.) Deletion held score at 18/18.

What to take from it: when a tightening writes a new declarative rule, the supporting material around it is a separate hypothesis and deserves its own experiment rather than a free ride. If the rule seems to need an inline example to be understood, that may mean the rule is under-specified — sharpening what passes and what fails is cheaper to test than appending material.

Scope: three sessions, all build-step `## Output format` tightenings on prompt/skill-shaping skills. It says nothing about Level-2 example mutations, where adding the example *is* the hypothesis.

## Anti-patterns

- **Bundling "while I'm in there" edits.** If you see a second thing to fix, note it and run it as the next experiment.
- **Cosmetic mutations after a big win.** Lock in the big win with a stability check (re-run the same inputs), not with cleanup.
- **Level-4 mutations without a deletion pass.** Principle shifts invite bloat; pair them with aggressive deletion experiments.
- **Mutations that narrow to the eval inputs.** The artifact should get better on the test inputs *via* getting better in general — not by referencing the specific inputs.
- **Ignoring the hypothesis.** If you can't state what you expect the mutation to do, the mutation isn't ready.

## Stuck? Try a direction shift

Repeated DISCARDs at one level are a signal that the level is exhausted — the fix probably isn't reachable by rephrasing if rephrasing keeps failing. Move up a level, or, when even principle-level changes stop moving anything, suspect the eval suite rather than the artifact and go re-read real outputs.

Direction shifts belong in `research-log.json`, not `changelog.md`. They are the high-signal entries a human or future loop re-reads when resuming.
