---
name: craft-autoresearch
description: Optimize prompts or skills with measured eval loops. Use for repeatable test inputs, eval runners, scoring, bounded mutations, or written stop conditions.
disable-model-invocation: true
metadata:
  related-skills: "craft-critique"
---

# craft-autoresearch

## Purpose

Run an eval-driven autonomous optimization loop on a prompt or skill.

Many prompts and skills feel "mostly fine" until the last 20-30% of failures show up. Re-reading rarely finds those gaps. You find them by running the artifact many times, scoring outputs against a rubric, mutating one thing at a time, and keeping only the changes that measurably move the score.

Unlike judgment-driven improvement — a `craft-critique` pass followed by edits — autoresearch *measures*. Gains come from the loop, not from one clever rewrite.

## Use this when

- a prompt or skill works "sometimes" and needs to work reliably
- measurable quality criteria exist or can be drafted (format rules, pass/fail checks, comparative quality)
- human-driven tuning has hit a plateau
- a skill is about to be shipped and should be benchmarked first
- the user mentions autoresearch, eval-driven optimization, benchmarking, running evals, self-improving prompts, 스킬 개선, 스킬 최적화, 스킬 벤치마크, or 스킬 평가

Do not use this when:

- quality is entirely subjective with no rubric even sketchable — prefer `craft-critique` (read-only findings; apply fixes guided by them on request)
- the eval runner cannot be automated at reasonable cost
- the artifact is too new and has no rough baseline yet

## Invocation posture

Explicit-only and deliberately dormant. Invoke only when the user asks for iterative prompt/skill experimentation or brings a measurable eval problem — ordinary authoring, critique, tuning, implementation, and review never route here. The durable asset is the experiment contract and eval-design methodology; the loop executor is swappable, not a canonical runtime, and low usage is expected — it implies no expansion work. Scope is prompt/skill output quality, not generic code-metric loops (test coverage, bundle size, lint errors).

## Inputs

- **Target artifact** — path to the prompt or skill file to optimize
- **Test inputs** — realistic prompts or scenarios, ideally 6-10, split roughly 70/30 into train and holdout with at least 2 held out. When a split genuinely isn't possible, record a holdout waiver and treat the run's result as limited evidence.
- **Eval criteria** — 3-6 binary checks plus 0-2 comparative quality checks
- **Eval runner** — the exact repeatable command or procedure that runs the artifact on a test input
- **Budget** — max experiments per session (default: 10)
- **Stop condition** — target score, or "plateau for N kept experiments"

If the user provides an `evals.json`, use it directly instead of drafting evals inline.

## Steps

1. **Capture the experiment contract.** Lock in target, train/holdout split or waiver, evals, eval runner, budget, and stop condition *before* running anything. A fuzzy contract produces fuzzy gains — ambiguity at this step compounds with every experiment.
2. **Design the eval suite.** Prefer deterministic checks (regex, section presence, parse success) over LLM-as-judge, and make sure at least one eval measures the outcome the user cares about rather than output shape — see `references/eval-guide.md` for the determinism hierarchy, assertion categories, and the eval quality check. For research, agentic, or high-impact prompts, include grounding, instruction-consistency, missing-context, or action-safety evals when those risks matter.
3. **Establish a baseline.** Snapshot the target artifact, run it on train and holdout (unless waived) through the eval runner, score every output, and record train and holdout totals separately in `results.tsv`. No mutation happens before baseline or the gains are unmeasurable. If the baseline already satisfies the stop condition, "no change needed" is a valid outcome — report it instead of mutating for a delta.
4. **Run the mutation loop.** For each experiment: analyze failing train evals → form one hypothesis → checkpoint the files the change will touch → make one bounded change at one mutation level → run the eval runner on train only → score train → KEEP or DISCARD by the rules below → log. Checkpoint before the edit, never after — a checkpoint taken after mutating captures the mutation. The change may span multiple files only when those files together implement the same hypothesis. See `references/mutation-guide.md` for mutation levels and when each fits.
5. **Respect rollback safety.** Before each mutation, commit (git-assisted mode) or snapshot (file-checkpoint mode) only the files you are about to touch. DISCARD rolls back only those files — never `git reset --hard`, which would destroy unrelated work in the repo.
6. **Treat deletion as a real experiment.** Removing a recently added rule or example is a mutation like any other: if the score holds, keep the deletion. Reach for it when the artifact has grown, or when you want evidence that an accepted rule is what carries the score.
7. **Stop on condition, not on vibes.** Stop when the stop condition is met, when the budget is hit, when the user interrupts, or when the eval runner is no longer trustworthy. The stop condition being satisfied at baseline counts — meeting the target is a legitimate way to finish. What the loop leaves behind at this point is a *candidate*: every KEEP is provisional on the holdout gate in Step 8, and only what clears that gate is the session's accepted artifact.
8. **Accept or reject on holdout.** Before reporting, run a changed candidate on holdout unless waived. A train improvement or simplification becomes accepted only if holdout does not regress vs baseline; an unchanged baseline is not an improvement. If holdout regresses, reject the mutations regardless of the train result — rejection is physical, not just a label:
   - Restore the session's mutable files from the baseline checkpoint taken in Step 3. Restore *only* those files: unrelated edits made in the worktree during the session stay untouched, and no `git reset --hard` or history rewrite.
   - Log the rejection in the experiment log — which mutations were rolled back, the train and holdout numbers that rejected them, and the overfit reading.
   - Report an overfit finding. Never present rejected mutations as accepted ones.

## When the target is a skill (vs a prompt)

The loop shape is the same, but the *edit unit* differs. A prompt is a single file; a skill is a folder with `SKILL.md`, `references/`, sometimes `scripts/` and `templates/`. That changes four things (size tracking is covered in `## KEEP vs DISCARD` below):

1. **Target selection.** For a prompt, the target is a single file path. For a skill, decide up front what the target covers — usually `SKILL.md` alone, but a mutation may legitimately touch `references/<file>.md` too. Write it into the experiment contract: *"mutable files: SKILL.md, references/eval-guide.md. All other files are frozen."*
2. **Mutation locus.** Mutation levels stay the same (wording / example / structure / principle), but for skills a sixth question appears before applying them: *which file?* Prefer editing `SKILL.md` for skill-spine changes and `references/` for deep-detail changes. Adding a new reference file counts as a Level-3 (structural) mutation — it shifts the skill's shape, not just its wording.
3. **Mutation safety.** A prompt mutation touches one file, so checkpoint and rollback are trivial. A skill mutation may touch several — record the exact file list in the experiment's checkpoint, and on DISCARD restore *only those files*. Never rollback the whole folder; unrelated files may hold accepted prior-experiment state.
4. **Fidelity evals (multi-skill pipelines).** If the target is a skill that feeds another skill's input (e.g. `spec-charter` → `spec-grill`, where charter Objectives must survive into capability contracts), add fidelity evals that check stage-to-stage consistency. Not applicable for single-file prompts.

Everything else — experiment contract, baseline discipline, KEEP/DISCARD rules, deletion experiments, stop conditions — works identically for prompts and skills.

## KEEP vs DISCARD

Record artifact size for every experiment. For prompts, `wc -l <file>` is enough. For skills, record both `skill_lines` (`SKILL.md` only) and `folder_lines` (the whole skill folder) — keep `skill_lines` under CraftKit's 220-line release gate, with normal skills around 100-160 lines and complex loop/orchestration skills around 160-220; `folder_lines` is secondary and can grow more before bloat becomes a concern. KEEP/DISCARD uses the train score only; holdout inputs stay sealed until session acceptance. Apply these defaults unless the user defined stricter rules:

| Score change | Artifact size change | Default decision |
|---|---|---|
| Improved meaningfully | Any reasonable change | KEEP |
| Improved marginally | Large growth | DISCARD unless the gain fixes an important failure |
| Flat | Shorter or simpler | KEEP |
| Flat | Longer or more complex | DISCARD |
| Worse | Any | DISCARD |

Additional guardrails:

- If a previously passing eval now fails, lean toward DISCARD even if the total score rose — a regression hidden by aggregate gain is still a regression.
- On ties, prefer the shorter artifact.
- If the mutation changes user-facing behavior, diff representative outputs before keeping it.

## Output format

### Experiment contract

A compact record of target, inputs, train/holdout split or waiver, evals, eval runner, budget, and stop condition. Three commitments have to be concrete enough for someone else to act on, not just labelled:

- **mutable files** — explicit list of the files the session may modify. All other files are frozen. This list is the mutation unit: it is what gets checkpointed before each edit, what a DISCARD restores, and what a holdout rejection restores from baseline. Mandatory whenever the target is a folder rather than a single file.
- **holdout commitment** — which inputs are held out and the session acceptance rule: final holdout score must not regress vs baseline holdout. When a split is not possible, record `holdout: waived (<reason>)` and treat the session's result as limited evidence.
- **runner design** — enough for someone who wasn't in the session to reproduce a run: the exact command or replay procedure, what executes it (model and the settings that affect output, such as temperature or reasoning effort), and which instructions, files, or tools are loaded when that matters to the result. State the cost per run; if it isn't knowable, say so and give an estimate with its basis rather than inventing a figure. A bare command string is not a runner design. The runner is frozen alongside the eval criteria — changing it mid-session invalidates every comparison, so a change means rebaselining.

### Baseline
Train score and holdout score (or waiver), failing evals, 1-2 representative outputs.
### Experiment log
One row per experiment: number, hypothesis, change, train score, KEEP/DISCARD, rationale.
### Final artifact
Path to the accepted version, holdout gate result, and a one-line size note; if holdout regressed, report overfit instead.
### Direction shifts
Meaningful strategy pivots during the run, one line each. Record in `research-log.json` if persisting.
### Next steps
What to run next if the user wants more, or which evals to sharpen.

## Artifact layout

Run artifacts live in `~/.craftkit/`, not in the target repo. This keeps run records out of `git status`, makes runs worktree-agnostic, and avoids accumulating audit dirs in the project being tuned. Findings that justify a spec change belong in the commit message body, not in committed run artifacts.

```text
~/.craftkit/autoresearch/<skill-name>/<YYYY-MM-DD-slug>/
├── eval-runner.md      # exact runner and contract for this session
├── evals.json          # eval suite used
├── results.tsv         # one row per experiment
├── changelog.md        # mutation rationale + human insights
├── research-log.json   # direction shifts only, not every edit
├── <target>.baseline   # backup of the starting artifact at session start
└── runs/               # inputs/, baseline/, exp-1/, exp-2/, ... — one dir per experiment
```

The `<YYYY-MM-DD-slug>` naming (e.g. `2026-04-12-output-format-tightening`) prevents collisions when the same skill is tuned in multiple sessions and gives each session a human-readable anchor. Treat the folder shape above as the convention, and copy findings back into the repo only when they justify a spec change, usually as an inline quote or a commit-message note rather than committed run artifacts.

## Guardrails

- One hypothesis per experiment. The accepted change may touch more than one file only when those files implement the same mutation and are checkpointed as a unit.
- Always run the eval runner and record the score; never KEEP on "this feels better."
- Keep holdout inputs sealed during the mutation loop; they are for session acceptance, not experiment selection. That includes the baseline holdout run: record its score, and keep its failing outputs out of what picks the next mutation. If holdout outputs are read to diagnose a further iteration, that holdout is spent — stop calling it sealed, and either draw a fresh holdout for later acceptance or report the acceptance as made against an exposed holdout.
- Deterministic evals first; LLM-as-judge only with a rubric explicit enough that two reviewers would agree.
- Rollback touches only the files in the mutation — never broad reverts.
- Autonomy is batch-based. Set a budget and stop condition up front, not "loop forever."
- A score at or near ceiling is information, not a mandate. It can mean the artifact already meets the bar — a legitimate stop — or that the suite only measures shape. Read real outputs to tell the two apart, and strengthen the suite only when they show a requirement the suite misses. Once you strengthen it, freeze the criteria and rebaseline; criteria that shift mid-loop make every comparison meaningless. See `references/eval-guide.md` § "When the baseline scores near the ceiling."
- Small suites make small deltas noisy. Record numerator and denominator, and do not call a one- or two-point move on a handful of runs significant.
- A format check leads a KEEP only when a real consumer requires that format — a parser, a schema, a downstream stage that breaks without it. Then the format *is* the outcome. Stylistic proxies with no consumer behind them (section counts, phrasing conventions, item caps) stay floor checks: they guard regressions, and outcome/comparative evals decide KEEP/DISCARD. When a fix would tighten the target's output contract with no consumer asking for it, prefer a judgment requirement (what the output must convey). See `references/eval-guide.md` § "The prescription ratchet."
- If eval scores rise but real outputs feel worse, treat it as a false-positive signal: review real outputs and rebuild the evals before continuing.

## Failure modes

- Starting without a baseline — "improvement" becomes meaningless.
- An eval suite that's entirely LLM-as-judge — scores drift and you optimize noise.
- Mutating several unrelated things in one experiment — outcomes can't be attributed to specific changes.
- Using `git reset --hard` for rollback — destroys the user's unrelated work.
- Running until "looks good" without a written stop condition or holdout gate — produces prompts that overfit the train split.
- Declaring victory when score rises but real outputs feel worse — the evals are the problem, not the artifact.
- Presenting rejected mutations as accepted — when the final holdout regresses, the session's result is an overfit finding, not an improved artifact.

## Example

### Input

Optimize `skills/craft-handoff/SKILL.md` against 7 realistic end-of-session handoff requests, split 5 train / 2 holdout. Evals: 3 binary required-signals checks plus 1 comparative resumability check. Budget: 8 experiments. Stop: all 3 binary evals pass on all 5 train inputs.

### Output

Illustrative figures — the shape of a session report, not a record of one. For a full mutation session end to end, load `references/worked-example.md`.

**Experiment contract**
- target: `skills/craft-handoff/SKILL.md`; mutable files: that file alone, everything else frozen
- inputs: 7 transcripts, 5 train / 2 holdout; sessions 6-7 stay sealed through the loop
- evals: 3 binary + 1 comparative, so train max = 3 × 5 + 5 = **20** and holdout max = 3 × 2 + 2 = **8**
- runner design: manual replay — fresh agent session per input, `SKILL.md` pasted in as the operating instruction with no other project files loaded, transcript pasted, response saved under the session's run directory; scored by a second pass with the rubric pasted in. Executor: the agent the skill ships against, default settings. No separate API charge on this plan, so cost is wall clock: ~4 minutes per input, ~20 minutes per train pass.
- budget: 8; stop: all 3 binary evals pass on all 5 train inputs; accept only if the final holdout does not regress below baseline holdout

**Baseline**: train **17.5/20** — binary 15/15, comparative 2.5/5 (the baseline compared against itself is five ties by definition, which is why the stop condition is stated on the binary checks alone). Holdout **7/8** — binary 6/6, comparative 1/2.

The stop condition is satisfied at baseline. Inspection of the train outputs confirms that their state matches the transcripts and the next actions address the pending work. No missed requirement is found, so no mutation is warranted.

**Experiment log**: empty — no mutation was run. Budget used 0/8.

**Final artifact**: `skills/craft-handoff/SKILL.md`, unchanged. No candidate was produced, so there is nothing to accept or reject; holdout 7/8 is recorded as the next session's baseline.

**Direction shifts**: none.

**Next steps**: this is a stop, not a ceiling to attack. If a later batch of real outputs shows a dimension these three checks miss — resume prompts that carry every signal but bury the next command, say — add evals for that dimension, freeze the criteria, and rebaseline before any mutation.

## References

- `references/eval-guide.md` — Binary, comparative, and fidelity evals; the determinism hierarchy; assertion categories; subjective-to-binary decomposition; eval quality check; a prompt template for drafting evals with an agent; `evals.json` schema; false-positive recovery.
- `references/mutation-guide.md` — Mutation levels (wording, example, structure, principle), when each fits, and the deletion discipline.
- `references/worked-example.md` — One illustrative session end to end: experiment contract, baseline, experiments including a DISCARD and a deletion, checkpoint/rollback commands, holdout acceptance, and what the run reported.
