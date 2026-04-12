# Eval Guide

An autoresearch loop is only as good as its evals. If the evals don't measure what you actually care about, the loop will optimize the wrong thing and produce a prompt that scores 100% but feels worse in real use.

## Eval types

### Binary evals (pass / fail)

Hard rules the output must satisfy. Each binary eval scores 1 for pass, 0 for fail. These are the backbone of autoresearch because they produce stable, reviewer-agnostic scores.

Examples:
- output contains exactly five H2 sections
- output is valid JSON
- output stays under 500 words
- every recommendation begins with an imperative verb

### Comparative evals (win / tie / loss)

A/B comparisons on subjective quality dimensions. Each comparative eval scores 1 for win, 0.5 for tie, 0 for loss against a fixed reference (typically the baseline).

Examples:
- is the review more actionable than the baseline?
- is the handoff prompt easier to skim?
- is the reasoning clearer at equal length?

Use comparative evals sparingly — two per suite is usually enough. They require an LLM judge with an explicit rubric, and the judge itself is a moving part that can drift.

### Fidelity evals (multi-skill only)

For pipelines of multiple skills, fidelity evals check that stage N's output is consistent with stage N-1's input. Same shape as binary evals (pass/fail), just applied across boundaries.

Examples:
- `craft-blueprint` output fully covers the user's original request
- `craft-tune` output preserves all constraints from the reflection step

## Scoring

- Binary pass = 1, fail = 0
- Comparative win = 1, tie = 0.5, loss = 0
- Fidelity pass = 1, fail = 0
- `max_score = sum(eval_weights) × runs_per_experiment`

Record numerator and denominator, not just a percentage. `11/12` is interpretable; `91.7%` loses the sample-size signal.

## Determinism hierarchy

Prefer the highest-determinism check available. More determinism means more stable scores and less optimization of noise.

### Tier 1 — Deterministic checks

- regex match, required section presence, file existence
- JSON or YAML parse success
- character or item counts with bounds

### Tier 2 — Structural validation

- heading hierarchy
- table shape consistency
- code-block formatting or schema-level structure

### Tier 3 — LLM-as-judge

- tone, usefulness, completeness, quality, or any subjective criterion that cannot be checked programmatically

**Target at least half of the eval suite at Tier 1 or Tier 2.** If most evals are Tier 3, scores will drift between runs and the loop will chase noise.

## Eval quality check

Before locking the suite, run this three-question test on every eval:

1. Would two different reviewers likely score the same output the same way?
2. Could the artifact game this check without actually becoming better?
3. Does this check capture something the user actually cares about?

If any answer is weak, tighten or replace the eval before running the baseline. An eval that fails this check will contaminate the rest of the loop.

## Anti-patterns

- **All-LLM-as-judge suites.** Scores drift, the loop chases noise, and the judge itself becomes a bias.
- **Evals that encode specific wording.** The skill will overfit to that wording instead of the underlying quality. Prefer principle-level checks.
- **Hidden-weight scoring.** If some evals matter more, state the weights explicitly. Equal-weight is a valid choice — but make it a *choice*.
- **No comparative eval at all.** If nothing in the suite captures quality beyond structure, a well-formatted but shallow output scores full marks.
- **Letting the eval suite grow unbounded.** Every new eval adds noise surface. Six to eight evals cover most skills well.

## When the scores look fine but real use does not

This is the false-positive scenario. The loop has optimized for the evals, not the underlying quality. Recovery:

1. Collect 10+ real outputs from the accepted version.
2. For each, note whether it feels genuinely better than baseline.
3. Where the evals said "pass" but the output feels worse, identify the quality dimension the evals missed.
4. Add or replace evals to cover that dimension.
5. Re-run from a fresh baseline.

False-positive tracking is part of a healthy autoresearch cycle, not a failure mode. The first eval suite is almost always incomplete.
