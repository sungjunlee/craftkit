---
name: craft-autoresearch
description: Optimize prompts or skills with measured eval loops. Use for repeatable test inputs, eval runners, scoring, bounded mutations, or written stop conditions.
disable-model-invocation: true
metadata:
  related-skills: "craft-critique, craft-tune"
---

# craft-autoresearch

## Purpose

Run an eval-driven autonomous optimization loop on a prompt or skill.

Many prompts and skills feel "mostly fine" until the last 20-30% of failures show up. Re-reading rarely finds those gaps. You find them by running the artifact many times, scoring outputs against a rubric, mutating one thing at a time, and keeping only the changes that measurably move the score.

Unlike `craft-tune` (judgment-driven autonomous diagnose-and-edit), autoresearch *measures*. Gains come from the loop, not from one clever rewrite.

## Use this when

- a prompt or skill works "sometimes" and needs to work reliably
- measurable quality criteria exist or can be drafted (format rules, pass/fail checks, comparative quality)
- human-driven tuning has hit a plateau
- a skill is about to be shipped and should be benchmarked first
- the user mentions autoresearch, eval-driven optimization, benchmarking, running evals, self-improving prompts, 스킬 개선, 스킬 최적화, 스킬 벤치마크, or 스킬 평가

Do not use this when:

- quality is entirely subjective with no rubric even sketchable — prefer `craft-critique` (read-only findings) or `craft-tune` (the review-and-fix loop)
- the eval runner cannot be automated at reasonable cost
- the artifact is too new and has no rough baseline yet

This skill is for optimizing prompt and skill artifacts against output-quality evals, not for generic code-metric loops (test coverage, bundle size, lint errors).

## Inputs

- **Target artifact** — path to the prompt or skill file to optimize
- **Test inputs** — 6-10 realistic prompts or scenarios, split roughly 70/30 into train and holdout; holdout has at least 2 inputs. If fewer than 6 inputs are possible, record a holdout waiver.
- **Eval criteria** — 3-6 binary checks plus 0-2 comparative quality checks
- **Eval runner** — the exact repeatable command or procedure that runs the artifact on a test input
- **Budget** — max experiments per session (default: 10)
- **Stop condition** — target score, or "plateau for N kept experiments"

If the user provides an `evals.json`, use it directly instead of drafting evals inline.

## Steps

1. **Capture the experiment contract.** Lock in target, train/holdout split or waiver, evals, eval runner, budget, and stop condition *before* running anything. A fuzzy contract produces fuzzy gains — ambiguity at this step compounds with every experiment.
2. **Design the eval suite.** Prefer deterministic checks (regex, section presence, parse success) over LLM-as-judge. Aim for at least half the suite at Tier 1-2 — see `references/eval-guide.md` for the full determinism hierarchy and quality checks; first-time suites skew toward Structure/Length only and saturate, see the Guardrails rule below before locking the suite. For research, agentic, or high-impact prompts, include grounding, instruction-consistency, missing-context, or action-safety evals when those risks matter.
3. **Establish a baseline.** Snapshot the target artifact, run it on train and holdout (unless waived) through the eval runner, score every output, and record train and holdout totals separately in `results.tsv`. No mutation happens before baseline or the gains are unmeasurable. A near-saturated baseline (≥ 95% binary pass rate) is a signal, not a success — stop and strengthen the suite before mutating. See Guardrails below.
4. **Run the mutation loop.** For each experiment: analyze failing train evals → form one hypothesis → make one bounded change at one mutation level → checkpoint the touched files → run the eval runner on train only → score train → KEEP or DISCARD by the rules below → log. The change may span multiple files only when those files together implement the same hypothesis. See `references/mutation-guide.md` for mutation levels and when each fits.
5. **Respect rollback safety.** Before each mutation, commit (git-assisted mode) or snapshot (file-checkpoint mode) only the files you are about to touch. DISCARD rolls back only those files — never `git reset --hard`, which would destroy unrelated work in the repo.
6. **Try deletion every 5th experiment.** Remove recently added rules or examples. If the score holds, keep the deletion. Artifacts that only grow are a smell — bloat hides the real drivers.
7. **Stop on condition, not on vibes.** Stop when the budget is hit, when the stop condition is met (e.g. 95%+ binary pass rate sustained for 3 consecutive kept experiments), when the user interrupts, or when the eval runner is no longer trustworthy. Running out of ideas is not a stop condition — change mutation level first.
8. **Report back.** Before reporting, run the final accepted artifact on holdout unless waived. Report an improvement only if holdout does not regress vs baseline; if train improved but holdout regressed, report an overfit finding, keep the log, and recommend strengthening the suite.

## When the target is a skill (vs a prompt)

The loop shape is the same, but the *edit unit* differs. A prompt is a single file; a skill is a folder with `SKILL.md`, `references/`, sometimes `scripts/` and `templates/`. That changes four things (size tracking is covered in `## KEEP vs DISCARD` below):

1. **Target selection.** For a prompt, the target is a single file path. For a skill, decide up front what the target covers — usually `SKILL.md` alone, but a mutation may legitimately touch `references/<file>.md` too. Write it into the experiment contract: *"mutable files: SKILL.md, references/eval-guide.md. All other files are frozen."*
2. **Mutation locus.** Mutation levels stay the same (wording / example / structure / principle), but for skills a sixth question appears before applying them: *which file?* Prefer editing `SKILL.md` for skill-spine changes and `references/` for deep-detail changes. Adding a new reference file counts as a Level-3 (structural) mutation — it shifts the skill's shape, not just its wording.
3. **Mutation safety.** A prompt mutation touches one file, so checkpoint and rollback are trivial. A skill mutation may touch several — record the exact file list in the experiment's checkpoint, and on DISCARD restore *only those files*. Never rollback the whole folder; unrelated files may hold accepted prior-experiment state.
4. **Fidelity evals (multi-skill pipelines).** If the target is a skill that feeds another skill's input (e.g. `craft-skill-spec` → `craft-tune`), add fidelity evals that check stage-to-stage consistency. Not applicable for single-file prompts.

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

A compact record of target, inputs, train/holdout split or waiver, evals, eval runner, budget, stop condition. In addition, state these quality commitments explicitly, not just as labels:

- **mutable files** — explicit list of the files the session may modify. All other files are frozen. Mandatory for skill targets; every skill has more than one file even when references are not planned to change.
- **holdout commitment** — which inputs are held out and the session acceptance rule: final holdout score must not regress vs baseline holdout. If the suite has fewer than 6 inputs, record `holdout: waived (<reason>)` instead.
- **evals 4th diagnostic** — for every non-shape eval, name a plausible-failing-output the target would produce; see `references/eval-guide.md` § "Contract fields" for what qualifies and why it matters.
- **runner design** — the named eval-runner category plus its trade-off against alternatives. A bare command string is not a runner design.
- **first-mutation hypothesis preview** — the predicted mutation locus, plus a justification invoking the Build-step enforcement prior by name or arguing why a non-build-step locus is warranted; see `references/eval-guide.md` § "Contract fields" for the full prior and when it doesn't apply.

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

Run artifacts live in `~/.craftkit/`, not in the target repo. This keeps `git status` clean, makes runs worktree-agnostic, and avoids accumulating audit dirs in the project being tuned. Findings that justify a spec change belong in the commit message body, not in committed run artifacts.

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
- Keep holdout inputs sealed during the mutation loop; they are for session acceptance, not experiment selection.
- Deterministic evals first; LLM-as-judge only with a rubric explicit enough that two reviewers would agree.
- Rollback touches only the files in the mutation — never broad reverts.
- Autonomy is batch-based. Set a budget and stop condition up front, not "loop forever."
- **If the baseline binary pass rate is ≥ 95%, do NOT start the mutation loop.** A saturated baseline means the suite only measures output shape, not quality — mutating against it produces noise. Strengthen the evals first: read 3-5 real outputs, name the quality dimensions the suite missed, add 2-3 new Tier 1-2 assertions, rebaseline. See `references/eval-guide.md` § "If your baseline scores near 100%."
- If eval scores rise but real outputs feel worse, treat it as a false-positive signal: review 10 real outputs and rebuild the evals before continuing.

## Failure modes

- Starting without a baseline — "improvement" becomes meaningless.
- An eval suite that's entirely LLM-as-judge — scores drift and you optimize noise.
- Mutating several unrelated things in one experiment — outcomes can't be attributed to specific changes.
- Using `git reset --hard` for rollback — destroys the user's unrelated work.
- Running until "looks good" without a written stop condition or holdout gate — produces prompts that overfit the train split.
- Declaring victory when score rises but real outputs feel worse — the evals are the problem, not the artifact.
- Treating the 1-week re-run as the overfit defense — holdout is the structural gate; the re-run catches drift and becomes mandatory when holdout was waived.

## Example

### Input

Optimize `skills/craft-tune/SKILL.md` against 7 realistic "improve this prompt" requests split 5 train / 2 holdout. Use 3 binary format/traceability evals plus 1 comparative reviewability eval. Budget: 8 experiments. Stop: 95% binary pass rate sustained for 3 consecutive kept experiments.

### Output

**Experiment contract**
- target: `skills/craft-tune/SKILL.md`; inputs: 7 prompts (5 train / 2 holdout); evals: 3 binary + 1 comparative; eval runner: manual replay procedure; budget: 8; stop: 95% x 3 consecutive
- mutable files: `skills/craft-tune/SKILL.md`; all other files frozen
- holdout commitment: hold out prompts 6-7; accept session only if final holdout score is >= 5/8 baseline
- evals 4th diagnostic: baseline plausibly returns Changelog rows without `effect`, and a longer revision that satisfies section shape but is no easier to audit
- runner design: manual replay; slower than a command runner, but exact and valid before this repo ships a runner script
- first-mutation hypothesis preview: `## Final output` / Convergence subsection, invoking the Build-step enforcement prior because the first failing output lacks the final-state signal that the current `craft-tune` contract requires

**Baseline**: Train score 12/20 (60%). Holdout baseline: 5/8 (62.5%). Failing: final `Convergence` block is often missing; Changelog entries often omit `effect`. Representative output: run 1 ends after `Round 2` edits with no final `Convergence` block.

**Experiment log**

| # | Hypothesis | Change | Train score | Decision | Rationale |
|---|---|---|---|---|---|
| 1 | Tighten final-output spec | Added explicit `Convergence` block requirement | 15/20 | KEEP | fixes missing final-state signal without changing loop scope |
| 2 | Enforce three-field changelog | Added table example + "changed / why / effect" rule | 20/20 | KEEP | makes accepted changes auditable |
| 3 | Deletion check | Removed the added example | 17/20 | DISCARD | train score regressed; example carries behavior |
| 4 | Restore example | Restored compact changelog example | 20/20 | KEEP | target hit resumes after discarded deletion |
| 5 | Stability check | Re-ran on the train split | 20/20 | KEEP | target hit holds |
| 6 | Stability check | Re-ran to confirm | 20/20 | KEEP — 3 consecutive hit, STOP | stop condition satisfied |

**Final artifact**: Accepted version `skills/craft-tune/SKILL.md`. Holdout gate: 8/8 vs 5/8 baseline; accepted. Size note: `skill_lines` stayed within the 160-220 line complex-skill band and below the 220-line release gate.

**Direction shifts**: Flipped from "softer wording" to "explicit constraints" after baseline showed missing structure.

**Next steps**: Add a traceability eval for "every Changelog entry maps to a Diagnostics item." For the full contract example, load `references/contract-example.md`.

## References

- `references/eval-guide.md` — Binary, comparative, and fidelity evals; the determinism hierarchy; assertion categories; subjective-to-binary decomposition; eval quality check; a prompt template for drafting evals with an agent; `evals.json` schema; false-positive recovery.
- `references/mutation-guide.md` — Mutation levels (wording, example, structure, principle), when each fits, and the deletion discipline.
- `references/contract-example.md` — Full experiment contract example with baseline, train-only experiments, holdout acceptance, one DISCARD, and final next steps.
- `references/worked-example.md` — A full illustrative cycle showing baseline, five experiments (including a DISCARD and a deletion), stop condition, and the simplicity judgment behind each KEEP/DISCARD. The original target was `craft-critique`; the loop discipline the example teaches is identical.
