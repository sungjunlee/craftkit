# Run Harness — craft-reflect

This harness describes exactly how one run of the target skill is executed and where outputs are saved, so every experiment is comparable.

## Target

- **Skill**: `skills/craft-reflect/SKILL.md`
- **Reference loaded on demand**: `skills/craft-reflect/references/failure-modes.md`

## Execution mode

**Method 1 — Sequential current-agent run**, manual invocation. Node harness (`scripts/run-experiment.mjs`) deferred until real usage reveals the right shape.

## Run procedure

For each `<input-id>` in `{short, medium, long}`:

1. Read `skills/craft-reflect/SKILL.md` fully.
2. Read the input file at `autoresearch-craft-reflect/runs/inputs/<input-id>.<ext>`.
3. Apply the skill as-written: produce the review following the SKILL.md's Steps and Output format.
4. Save the raw review to `autoresearch-craft-reflect/runs/<exp-dir>/<input-id>/output.md`.
5. No post-processing. No reformatting. The saved file is what the skill produced.

Between inputs, do not carry over reasoning — each review should start from the skill's spec, not from the previous review.

## Experiment-directory convention

- `runs/baseline/<input-id>/output.md` — the baseline run before any mutation.
- `runs/exp-N/<input-id>/output.md` — each subsequent experiment's outputs.
- `runs/exp-N/grading.json` — per-eval score for that experiment.

## Test inputs

`craft-reflect`'s declared scope is "prompt or skill" artifacts, so inputs must stay inside that scope. An earlier draft used code files, which produced a scope mismatch — the first research-log entry documents the correction.

- **short**: `runs/inputs/short-prompt.md` — 3 lines. A deliberately vague prompt: *"You are an expert. Review my draft and tell me what's wrong. Be thorough."* Represents the minimal input a reviewer still has to produce a well-structured critique for.
- **medium**: `runs/inputs/medium-skill.md` — 96 lines. Snapshot of `skills/craft-blueprint/SKILL.md` at baseline time. A real CraftKit skill with moderate surface area.
- **long**: `runs/inputs/long-skill.md` — 137 lines. Snapshot of `skills/craft-prompt/SKILL.md` at baseline time. A longer skill (absorbed from prompt-builder) with multiple sections, tables, and reference links.

Each input has enough real surface that a working `craft-reflect` should surface 2-5 meaningful issues per file.

## Evals

See `evals.json` for the scored assertions. Summary:

- **E1** [Tier 1, Structure]: output contains exactly five H2 sections in this order — *What's working*, *Issues*, *Recommended changes*, *Failure modes*, *Minimal rewrite plan*.
- **E2** [Tier 1, Length]: the *Issues* section contains at most five items.
- **E3** [Tier 2, Inclusion]: every item in *Recommended changes* begins with an imperative verb.
- **E4** [Tier 3, Comparative]: is this review more actionable than the baseline? (Skipped on baseline itself; all ties.)

Max binary score per experiment (excluding E4) = 3 evals × 3 inputs × 1 run = **9**.

## Versioning

`git-assisted`. Baseline is committed on a branch:

```bash
git checkout -b autoresearch/craft-reflect
git add skills/craft-reflect/SKILL.md autoresearch-craft-reflect/ \
  && git commit -m "autoresearch: baseline snapshot"
```

KEEP commits stay on the branch. DISCARD rolls back only the touched files:

```bash
git reset --soft HEAD~1
git restore --source=HEAD --staged --worktree -- skills/craft-reflect/SKILL.md
```

Never `git reset --hard`.

## Stop condition

- Budget: 8 experiments.
- Stop early if ≥ 95% binary pass rate sustained across 3 consecutive kept experiments.
- Stop early if harness drift is detected (re-validate before continuing).
