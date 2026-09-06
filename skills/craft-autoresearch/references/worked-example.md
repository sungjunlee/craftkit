# Worked example: one full session

A walk-through of a complete autoresearch cycle, from experiment contract to session acceptance.

**This is an illustrative example, not a record of an actual run.** The target, the inputs, and every number below are invented to show the shape of a session and how the judgments play out. Do not cite these figures as evidence about anything.

The target is an ordinary team asset rather than a CraftKit skill: `prompts/pr-description.md`, a prompt that turns a diff into a pull-request description. For a `SKILL.md` target the loop shape is the same, but the edit unit and a few of the judgments differ — see `SKILL.md` § "When the target is a skill (vs a prompt)".

## Experiment contract

- **target**: `prompts/pr-description.md`
- **mutable files**: `prompts/pr-description.md`; everything else frozen
- **run directory**: all inputs, outputs, and checkpoints live outside the repo being tuned, in one task-local directory:

  ```bash
  RUN_DIR="$HOME/.craftkit/autoresearch/pr-description/2026-05-04-verification-clarity"
  mkdir -p "$RUN_DIR/inputs"
  ```

- **inputs**: 8 real merged diffs from the last month — 6 train, 2 holdout, staged as `$RUN_DIR/inputs/<id>.diff`. The holdout pair covers the same failure territory as train (one multi-file refactor, one behavior change with a migration), not easier cases.
- **holdout commitment**: diffs 7-8 stay sealed during the loop; accept the session only if the final holdout score does not regress below the baseline holdout score
- **evals**:
  - E1 [binary, outcome]: the description names the user-visible behavior change, not just the files touched.
  - E2 [binary, outcome]: it states how the change was verified, or says plainly that it wasn't.
  - E3 [binary, form proxy]: every claim about behavior points at a file or symbol that appears in the diff. Nothing downstream parses the description, so this proxy has no consumer behind it — it guards against unattributed claims and never leads a KEEP. It also cannot see whether the diff *supports* a claim; presence of an attribution is all it tests.
  - E4 [comparative]: is this more useful to a reviewer than the baseline description for the same input? Rubric: a reviewer could decide what to look at first without opening the diff.
- **runner design**: one run per input, scored by a second pass with the rubric pasted in.

  ```bash
  node tools/run-prompt.mjs --prompt prompts/pr-description.md \
    --input "$RUN_DIR/inputs/<id>.diff" > "$RUN_DIR/<exp>/<id>.md"
  ```

  `tools/run-prompt.mjs` is this team's own two-file helper, not something CraftKit ships — any repeatable command works. Executor: it calls one mid-tier chat model at temperature 0, sending the prompt file and the diff and nothing else (no repo context, no tools). Cost: about 40 seconds and roughly a cent per input on that model's published per-token price, so a full train pass is ~4 minutes and ~6 cents. The runner and the four evals are frozen together for the session; changing either means rebaselining.
- **versioning**: file-checkpoint mode (see below)
- **budget**: 8 experiments
- **stop condition**: train score ≥ 22 of 24

**Scoring.** Six train inputs. E1, E2, and E3 are binary — 1 for pass, 0 for fail — so they contribute at most 6 points each, 18 in all. E4 scores win = 1, tie = 0.5, loss = 0 against the baseline output for the *same* input, so it contributes 0-6. Train max is **24**; holdout max, on 2 inputs, is 8. These are small numbers: good enough to tell a broken output from a working one, and not good enough to make a one-point difference mean anything.

## Checkpoint and rollback

File-checkpoint mode — copy the file *before* you touch it, restore that copy on DISCARD. A checkpoint taken after the edit records the edit:

```bash
mkdir -p "$RUN_DIR/exp-2"
cp prompts/pr-description.md "$RUN_DIR/exp-2/checkpoint.md"   # before mutating
cp "$RUN_DIR/exp-2/checkpoint.md" prompts/pr-description.md   # on DISCARD
```

Git-assisted mode works the same way with a commit per kept experiment. Roll back a DISCARD by restoring the file from the last kept commit:

```bash
git restore --source=HEAD -- prompts/pr-description.md
```

Never `git reset --hard`, and don't rewrite history to make the log look clean. Run records stay outside the repo in `$RUN_DIR`; only the mutable target changes appear in the worktree.

## Experiment log

### Baseline (exp 0) · train 11/24 · holdout 4/8 · 34 lines

Per-eval: E1 2/6 + E2 1/6 + E3 5/6 + E4 3.0 = **11/24**.

- E1 failed on 4 of 6 — descriptions summarized the diff ("updated `auth.ts` and three tests") without ever saying what changed for a user.
- E2 failed on 5 of 6 — no mention of testing at all, in either direction.
- E3 passed on 5 of 6 — one output asserted a performance improvement while naming no file or symbol from the diff. What the check caught is the missing attribution; whether the diff would have supported the claim is beyond what it can see.
- E4 is 3.0 by construction: at baseline every comparison is an output against itself, so six ties × 0.5.

The baseline leaves clear room, so there is something for the loop to learn. Had it come back at 23/24 instead, the honest first move would have been to read the outputs and decide between "this prompt already does the job" and "these evals only measure form" — not to start mutating.

### Exp 1 — KEEP · train 20/24 · 36 lines (+2)

**Hypothesis**: E1 and E2 fail because the prompt asks for "a summary of the changes" — it never says the description has to answer *what changed for a user* and *how do we know it works*.

**Change** (Level 1, wording): replaced "summarize the changes" with a sentence naming the two questions every description must answer.

**Result**: E1 2/6 → 5/6, E2 1/6 → 5/6, E3 unchanged at 5/6, E4 4 wins + 2 ties = 5.0. Total 5 + 5 + 5 + 5.0 = **20/24**.

**Decision**: +9 points over baseline, +2 lines. KEEP. The outcome evals led; the +2 lines are noise-sized. Still short of the 22-point stop.

### Exp 2 — DISCARD · train 19/24 · 51 lines (+15)

**Hypothesis**: the remaining E1 and E2 failures are formatting drift — a required section template would pin them down.

**Change** (Level 3, structure): added a five-section output template with a worked example.

**Result**: E1 and E2 unchanged at 5/6, E3 unchanged at 5/6. E4 turned its two ties into losses — the judge flagged the templated descriptions as padded, with empty sections on small diffs — giving 4 wins + 2 losses = 4.0. Total 5 + 5 + 5 + 4.0 = **19/24**.

**Decision**: −1 point against the kept exp-1 state, +15 lines, comparative regression. DISCARD. This is the shape-fix reflex: the failing evals were about *what the output must convey*, and nothing downstream requires a section shape, so the template answered a question nobody asked. Restored from `$RUN_DIR/exp-2/checkpoint.md`.

### Exp 3 — KEEP (deletion) · train 20/24 · 30 lines (−6)

**Hypothesis**: the prompt's original six-line example predates the exp-1 rule and may now be dead weight.

**Change** (deletion): removed the example.

**Result**: every eval unchanged — E1 5/6, E2 5/6, E3 5/6, E4 5.0. Total **20/24**.

**Decision**: same score, six lines shorter. KEEP — the example was load-bearing only in the author's imagination. A deletion that holds is a real result, not a formality.

### Exp 4 — KEEP · train 23/24 · 31 lines (+1) · STOP

**Hypothesis**: the remaining E1 and E2 failures land on the same input, so they likely share a cause. The prompt says to state how the change was verified but doesn't say what to do when it wasn't, so those outputs drop the whole subject — and with it the behavior statement.

**Change** (Level 1, wording): one sentence — if no verification was run, say so explicitly rather than omitting the section.

**Result**: E2 5/6 → 6/6, E1 5/6 → 6/6 (that one output had been silently dropping both), E3 unchanged at 5/6, E4 6 wins = 6.0. Total 6 + 6 + 5 + 6.0 = **23/24**.

**Decision**: +3 points over the kept exp-3 state, +1 line. KEEP. 23 ≥ 22, so the stop condition is met and the loop ends here — experiment 4 of a budget of 8. Nothing is re-run "to be sure": the condition was written to be checkable, and it checks out.

## Session acceptance

Everything above is a *candidate*. Ran it on the sealed holdout: **7/8 vs 4/8 baseline**. No regression, so the candidate becomes the accepted artifact and the session is reported as an improvement.

Had holdout come back at 3/8, the mutations would have been **rejected**, and rejection would be physical: restore `prompts/pr-description.md` — the one mutable file — from the baseline checkpoint, leave every other file in the worktree alone, log which mutations were rolled back and on what numbers, and report an overfit finding with no claim that anything improved. Reading those failing holdout outputs to plan a next pass is fine, but it spends the holdout: a later acceptance needs fresh inputs, or has to say plainly that it was gated on an exposed holdout.

## Final

```
Train:         11/24 → 23/24
Holdout:       4/8 → 7/8  (acceptance gate: no regression)
Experiments:   4 (3 keep, 1 discard)
Lines:         34 → 31
Budget used:   4/8
```

**Next steps**: one E3 failure remains, and E3 is a form proxy — worth a look at that output, not worth a mutation on its own. If someone wants another pass, read fresh real outputs first and add evals only for a dimension those outputs show is missing.

## What this example illustrates

- **One hypothesis per experiment keeps deltas attributable.** Exp 2's comparative loss and its +15 lines were both traceable to one change. Bundled edits would have hidden which piece cost what.
- **Outcome evals lead; unbacked form proxies ride along.** Every KEEP here was driven by E1/E2/E4. E3 never led a decision — nothing consumes the description's shape, so it stayed a guard. Had a bot parsed these descriptions to a required schema, a check on that schema would have been an outcome check and could have led a KEEP.
- **A tempting binary gain is not automatically worth it.** Exp 2 promised structure and cost a comparative point and fifteen lines.
- **Deletion is a real mutation level.** Exp 3 shrank the artifact without moving the score.
- **The holdout gate decides what gets reported.** Train numbers alone never made this session an improvement; until the gate ran, exp 4's artifact was a candidate.
- **Stop when the condition is met.** Four experiments of a budget of eight. Spending the other four "just in case" would have risked overfitting for no expected gain.
