# Worked Example: tightening craft-critique

A walk-through of a full autoresearch cycle against a real CraftKit skill. **This is an illustrative example, not a record of an actual run** — numbers and outputs are plausible, but the loop has not been executed end-to-end. Use it as a concrete reference for the shape of a session and how KEEP/DISCARD judgments play out in practice.

> **Historical note.** The target skill `craft-critique` was later folded into `craft-tune` (which now carries both the diagnose-only role and the edit role) and no longer exists as a standalone skill. The example is preserved because the loop discipline it teaches — one hypothesis per experiment, simplicity judgment on DISCARD, deletion as a real mutation level, comparative evals catching what binary misses — is what matters, not which skill happens to be the target. Read `craft-critique` here as "any skill whose default-mode output has a fixed five-section shape."

## Setup

- **Target skill**: `skills/craft-critique/SKILL.md`
- **Motivation**: review outputs are inconsistent between Claude Code and Codex; section counts drift, issue lists run long, some recommendations come back as questions.
- **Test inputs** (three realistic review prompts stored in `~/.craftkit/autoresearch/craft-critique/<session>/runs/inputs/`):
  1. **Short**: a 15-line auth function with a subtle off-by-one bug
  2. **Medium**: a CI config file with three issues of different severity
  3. **Long**: a 150-line React component mixing concerns
- **Evals**:
  - E1 [Tier 1, Structure]: output contains exactly five H2 sections — *What's working*, *Issues*, *Recommended changes*, *Failure modes*, *Minimal rewrite plan* — in that order. *(grep + ordering check)*
  - E2 [Tier 1, Length]: the *Issues* section contains at most five items. *(regex count)*
  - E3 [Tier 2, Inclusion]: every item in *Recommended changes* begins with an imperative verb (add, remove, require, rename, …). *(structural regex against a verb whitelist)*
  - E4 [Tier 3, Comparative]: is the review more actionable than the baseline? *(LLM judge with explicit rubric: "a review is more actionable when a reader could act on ≥80% of its recommendations without clarifying questions.")*
- **Runs per experiment**: 2
- **Max score per experiment**: (E1 + E2 + E3) × 3 inputs × 2 runs = **18 binary points** + E4 × 3 × 2 = **6 comparative points** = **24 total**
- **Tier 1-2 share**: 3/4 (75%) — above the 50% floor
- **Budget**: 8 experiments
- **Stop condition**: ≥ 95% (23/24 or better) for 3 consecutive kept experiments

## Versioning mode

`git-assisted`:

```bash
git checkout -b autoresearch/craft-critique
git add skills/craft-critique/SKILL.md && git commit -m "autoresearch: baseline snapshot"
```

Every KEEP stays on the branch. Every DISCARD rolls back *only* the touched file:

```bash
git reset --soft HEAD~1
git restore --source=HEAD --staged --worktree -- skills/craft-critique/SKILL.md
```

Never `git reset --hard` — that would destroy unrelated user work.

## Experiment log

Recording both `skill_lines` and `folder_lines` every experiment is what catches bloat before it becomes invisible. In this run only `SKILL.md` changes, so `folder_lines` moves in lockstep with `skill_lines`.

### Baseline (exp 0) · 14/24 (58%) · skill_lines 101 · folder_lines 192

Failure patterns:
- 2 of 6 runs returned 3 sections instead of 5 (E1 fail)
- 4 of 6 runs had 6+ issues, including "minor" nits that should have been cut (E2 fail)
- 2 of 6 runs phrased recommendations as questions (E3 fail)
- E4 tied baseline by definition (6/6 tie → 3 points)

### Exp 1 — KEEP · 18/24 · skill_lines 101 → 104 (+3) · folder_lines 192 → 195 (+3)

**Hypothesis**: section count drifts because the Output format section lists five sections informally rather than requiring exactly five.

**Change** (Level 1, wording): in SKILL.md Output format, replaced the loose section list with `Return *exactly* these five sections in this order:` followed by the explicit bullet list.

**Result**:
- E1: 2/6 → 6/6
- E2: unchanged
- E3: unchanged
- E4: 3/6 (all ties)

**Decision**: +4 points, +3 lines. KEEP (clear improvement with negligible cost).

```bash
git commit -m "autoresearch: require exactly five output sections"
```

### Exp 2 — KEEP · 21/24 · skill_lines 104 → 105 (+1) · folder_lines 195 → 196 (+1)

**Hypothesis**: the *Issues* list is unbounded because the SKILL.md says "prioritized list" without a cap.

**Change** (Level 1): changed "prioritized list of issues" to "prioritized list of at most five issues, highest severity first."

**Result**:
- E2: 2/6 → 6/6
- Others unchanged.

**Decision**: +3 points, +1 line. KEEP.

### Exp 3 — DISCARD · 20/24 · skill_lines 105 → 119 (+14) · folder_lines 196 → 210 (+14)

**Hypothesis**: recommendations drift into questions because the SKILL.md doesn't model the right shape.

**Change** (Level 2, example): added a 15-line "Recommended changes: good vs bad examples" block.

**Result**:
- E3: 4/6 → 5/6 (one extra pass)
- E4: **one loss** — the judge flagged the long example block as making reviews "feel formulaic"
- Total: -1 point

**Decision**: −1 net, +14 lines, and a comparative regression. DISCARD. A small binary gain that costs a comparative point and 14 lines of prompt bloat is a bad trade.

```bash
git reset --soft HEAD~1
git restore --source=HEAD --staged --worktree -- skills/craft-critique/SKILL.md
```

### Exp 4 — KEEP · 23/24 · skill_lines 105 → 107 (+2) · folder_lines 196 → 198 (+2)

**Hypothesis**: same target as exp 3, but a lighter intervention — one-line rule instead of a 15-line example block.

**Change** (Level 1): added one sentence to Output format: *"Each Recommended change is phrased as an imperative command, not a question."*

**Result**:
- E3: 4/6 → 6/6
- E4: 4/6 wins + 2/6 ties (5/6 points, no regression)
- Others unchanged.

**Decision**: +2 points, +2 lines. KEEP. Demonstrates that a principle statement can outperform a bigger example when the target audience is an agent that already understands the concept.

### Exp 5 — KEEP (deletion experiment) · 23/24 · skill_lines 107 → 103 (−4) · folder_lines 198 → 194 (−4)

Running the scheduled deletion experiment early because the artifact has already grown.

**Hypothesis**: the SKILL.md's *"When the review feels vague"* paragraph may duplicate `references/failure-modes.md` without adding signal of its own.

**Change** (Level 3, deletion): removed the four-line *When the review feels vague* paragraph.

**Result**: all evals unchanged. Outputs still cite the failure-modes reference when appropriate via the reference link that remains.

**Decision**: 0 net, −4 lines. KEEP (same score, shorter artifact — the paragraph was dead weight).

### Exp 6 — KEEP (stability check) · 23/24 · skill_lines 103 (unchanged) · folder_lines 194 (unchanged)

**Change**: none — re-ran the same inputs to confirm the score is stable, not a lucky single run.

**Result**: 23/24 again. Three consecutive kept experiments at ≥ 95% (exp 4, 5, 6). Stop condition triggered.

## Final

```
Score:         14/24 (58%) → 23/24 (96%)  (+9 raw, +38 percentage points)
Experiments:   6 (5 keep, 1 discard)
skill_lines:   101 → 103  (+2%, essentially zero bloat)
folder_lines:  192 → 194  (+1%, essentially zero bloat)
Budget used:   6/8
```

### Git log

```
b7c8d9e autoresearch: delete redundant 'when vague' paragraph
f1a2b3c autoresearch: require imperative phrasing for recommendations
9e8d7c6 autoresearch: cap issues section to five items
4d5e6f7 autoresearch: require exactly five output sections
a0b1c2d autoresearch: baseline snapshot
```

Exp 3 (DISCARD) is absent — `git reset --soft` + `git restore` removed it from history cleanly.

## What this example illustrates

- **One hypothesis per experiment keeps deltas attributable.** When exp 3's total score moved, the +14 lines and the E4 regression were both visible and traceable to a single change. Bundled changes would have hidden that.
- **Simplicity judgment prevents bloat.** The +1 point on E3 in exp 3 was *tempting*; the 14-line cost and the E4 loss made it the wrong call. Defending that DISCARD is a core skill.
- **Deletion is a real mutation level.** Exp 5 held the score while shrinking the artifact — evidence that the deleted paragraph was load-bearing only in the author's imagination.
- **Comparative evals catch what binary misses.** E3's binary gain in exp 3 was real; E4's comparative loss was the honest signal that the change made the artifact worse on the axis users actually feel.
- **Stop early.** Six experiments hit the stop condition out of a budget of eight. Burning the remaining two "just in case" would have risked overfitting without upside.
- **Baseline is a signal, not a score to beat.** This example starts at 58% — leaving clear room for the loop to learn. If your baseline scores near 100%, the suite is probably too loose; see `eval-guide.md` § "If your baseline scores near 100%" before mutating.

## Simplifications from a real run

- Running and judging E4 requires an explicit rubric and, ideally, a fixed judge model. See `eval-guide.md` § "Drafting evals with an agent" and `eval-guide.md` § "The golden rule."
- A Node run harness (`scripts/run-experiment.mjs`) would take the three inputs × two runs automatically. This example assumes the runs are invoked manually and outputs saved by hand into `~/.craftkit/autoresearch/craft-critique/<session>/runs/exp-N/<input-id>/`.
- The full artifact layout (`results.tsv`, `changelog.md`, `research-log.json`, `run-harness.md`) is referenced but not shown — see the SKILL.md § "Artifact layout" for the folder shape.
- Real runs will see more noise in Tier 3 evals than this example shows. Plan for it — run three times instead of two if the comparative evals feel jittery.
