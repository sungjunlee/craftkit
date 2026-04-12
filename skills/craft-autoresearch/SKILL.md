---
name: craft-autoresearch
description: Eval-driven autonomous optimization loop for a prompt or skill, based on Karpathy's autoresearch methodology. Define eval criteria and a run harness, then iterate — run the artifact on test inputs, score outputs, mutate the prompt or skill, keep improvements, discard regressions, repeat until the stop condition. Use this whenever the user wants to automatically improve a prompt or skill, mentions autoresearch, eval-driven optimization, benchmarking a skill, running evals, self-improving a prompt, or any iterative test-and-refine request — including 스킬 개선, 스킬 최적화, 스킬 벤치마크, 스킬 평가 — even if they don't say "autoresearch."
---

# craft-autoresearch

## Purpose

Run an eval-driven autonomous optimization loop on a prompt or skill. Adapted from Andrej Karpathy's autoresearch methodology for CraftKit artifacts.

Karpathy's core insight is that most prompts and skills work about 70% of the time — the remaining 30% is where vague instructions, brittle rules, and weak examples hide. You cannot find those gaps by re-reading; you find them by running the artifact many times, scoring outputs against a rubric, mutating the artifact, and keeping only the changes that measurably move the score.

Unlike `craft-tune` (single human-driven edit) or `craft-reflect` (diagnostic read), autoresearch *measures*. Gains come from the loop, not from one clever rewrite.

## Use this when

- a prompt or skill works "sometimes" and needs to work reliably
- measurable quality criteria exist or can be drafted (format rules, pass/fail checks, comparative quality)
- human-driven tuning has hit a plateau
- a skill is about to be shipped and should be benchmarked first

Do not use this when:

- quality is entirely subjective with no rubric even sketchable — prefer `craft-reflect` + `craft-tune`
- the run harness cannot be automated at reasonable cost
- the artifact is too new and has no rough baseline yet

For generic code-quality loops (test coverage, bundle size, lint errors), use the sibling `autoloop` skill instead — autoresearch is specifically for optimizing prompt and skill artifacts against output-quality evals.

## Inputs

- **Target artifact** — path to the prompt or skill file to optimize
- **Test inputs** — 3-5 realistic prompts or scenarios
- **Eval criteria** — 3-6 binary checks plus 0-2 comparative quality checks
- **Run harness** — the exact repeatable command or procedure that runs the artifact on a test input
- **Budget** — max experiments per session (default: 10)
- **Stop condition** — target score, or "plateau for N kept experiments"

If the user provides an `evals.json`, use it directly instead of drafting evals inline.

## Steps

1. **Capture the experiment contract.** Lock in target, inputs, evals, harness, budget, and stop condition *before* running anything. A fuzzy contract produces fuzzy gains — ambiguity at this step compounds with every experiment.
2. **Design the eval suite.** Prefer deterministic checks (regex, section presence, parse success) over LLM-as-judge. Aim for at least half the suite at Tier 1-2 — see `references/eval-guide.md` for the full determinism hierarchy and quality checks.
3. **Establish a baseline.** Snapshot the target artifact, run it on every test input through the harness, score every output, record the total in `results.tsv`. No mutation happens before baseline or the gains are unmeasurable.
4. **Run the mutation loop.** For each experiment: analyze failing evals → form one hypothesis → make one bounded change at one mutation level → checkpoint the touched files → run harness → score → KEEP or DISCARD by the rules below → log. See `references/mutation-guide.md` for mutation levels and when each fits.
5. **Respect rollback safety.** Before each mutation, commit (git-assisted mode) or snapshot (file-checkpoint mode) only the files you are about to touch. DISCARD rolls back only those files — never `git reset --hard`, which would destroy unrelated work in the repo.
6. **Try deletion every 5th experiment.** Remove recently added rules or examples. If the score holds, keep the deletion. Artifacts that only grow are a smell — bloat hides the real drivers.
7. **Stop on condition, not on vibes.** Stop when the budget is hit, when the stop condition is met (e.g. 95%+ binary pass rate sustained for 3 consecutive kept experiments), when the user interrupts, or when the harness is no longer trustworthy. Running out of ideas is not a stop condition — change mutation level first.
8. **Report back.** Baseline → final score, total experiments, keep rate, top helpful changes, remaining failure patterns, artifact size change, direction shifts.

## KEEP vs DISCARD

Record artifact size (`wc -l <target>`) for every experiment. Apply these defaults unless the user defined stricter rules:

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
Compact record of target, inputs, evals, harness, budget, stop condition.

### Baseline
Score (numerator/denominator), failing evals, 1-2 representative outputs.

### Experiment log
One row per experiment: number, hypothesis, change, score, KEEP/DISCARD, rationale.

### Final artifact
Path to the accepted version and a one-line size note.

### Direction shifts
Meaningful strategy pivots during the run, one line each. Record in `research-log.json` if persisting.

### Next steps
What to run next if the user wants more, or which evals to sharpen.

## Artifact layout

```text
autoresearch-<skill-name>/
├── run-harness.md      # exact harness and contract
├── results.tsv         # one row per experiment
├── changelog.md        # mutation rationale + human insights
├── research-log.json   # direction shifts only, not every edit
├── <target>.baseline   # backup of the starting artifact
└── runs/
    ├── baseline/
    ├── exp-1/
    └── ...
```

## Guardrails

- One mutation per experiment — multi-file changes become unattributable.
- Always run the harness and record the score; never KEEP on "this feels better."
- Deterministic evals first; LLM-as-judge only with a rubric explicit enough that two reviewers would agree.
- Rollback touches only the files in the mutation — never broad reverts.
- Autonomy is batch-based. Set a budget and stop condition up front, not "loop forever."
- If eval scores rise but real outputs feel worse, treat it as a false-positive signal: review 10 real outputs and rebuild the evals before continuing.

## Failure modes

- Starting without a baseline — "improvement" becomes meaningless.
- An eval suite that's entirely LLM-as-judge — scores drift and you optimize noise.
- Mutating many files per experiment — outcomes can't be attributed to specific changes.
- Using `git reset --hard` for rollback — destroys the user's unrelated work.
- Running until "looks good" without a written stop condition — produces prompts that overfit the eval set.
- Declaring victory when score rises but real outputs feel worse — the evals are the problem, not the artifact.
- Treating autoresearch as a one-off — the 1-week re-run against fresh inputs is where overfitting gets caught.

## Example

### Input

Optimize `skills/craft-reflect/SKILL.md` so reviews are structurally consistent across Claude Code and Codex.

Test inputs: three real review prompts from last week.

Eval criteria:

- Binary: output has exactly five sections (What's working, Issues, Recommended changes, Failure modes, Minimal rewrite plan).
- Binary: Issues section contains at most 5 prioritized items.
- Binary: every item in Recommended changes is phrased as an imperative command.
- Comparative: is the review more actionable than baseline? (blind A/B judge)

Budget: 8 experiments. Stop condition: 95% binary pass rate sustained for 3 consecutive kept experiments.

### Output

**Experiment contract**
- target: `skills/craft-reflect/SKILL.md`
- inputs: 3 prompts
- evals: 3 binary + 1 comparative
- harness: `node scripts/run-skill.mjs craft-reflect <input.txt>`
- budget: 8; stop: 95% × 3 consecutive

**Baseline**
Score: 7/12 (58%). Failing: section count varies (3-6); issue count unbounded.

**Experiment log**

| # | Hypothesis | Change | Score | Decision |
|---|---|---|---|---|
| 1 | Tighten section spec | Added "exactly these 5 sections" line | 9/12 | KEEP |
| 2 | Cap issue list | Added "max 5, ordered by severity" | 11/12 | KEEP |
| 3 | Enforce imperative recs | Added example + "commands, not questions" rule | 12/12 | KEEP |
| 4 | Deletion check | Removed the added example | 10/12 | DISCARD (example carries weight) |
| 5 | Restore + sharpen example | Restored example with two cases | 12/12 | KEEP |
| 6 | Stability check | Re-ran to confirm | 12/12 | KEEP — 3 consecutive hit, STOP |

**Direction shifts**
- Flipped from "softer wording" to "explicit constraints" after baseline showed agents needed more structure, not less.

**Next steps**
- Add an eval for "cites file:line in at least one issue" to ground recommendations.
- Re-run in 1 week on fresh inputs to catch eval overfitting.

## References

- `references/eval-guide.md` — Binary, comparative, and fidelity evals; the determinism hierarchy; eval quality check.
- `references/mutation-guide.md` — Mutation levels (wording, example, structure, principle), when each fits, and the deletion discipline.
