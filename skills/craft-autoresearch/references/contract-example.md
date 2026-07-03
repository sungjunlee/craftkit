# craft-autoresearch full contract example

This reference keeps a full example out of the always-loaded `SKILL.md` while preserving the complete contract shape.

## Input

Optimize `skills/craft-tune/SKILL.md` so review-and-fix loop outputs are structurally consistent across Claude Code and Codex.

Test inputs: seven real "improve this prompt" requests from last week, split 5 train / 2 holdout.

Eval criteria:

- Binary: output includes at least one `Round N` trail and a final `Convergence` block.
- Binary: each per-round Diagnostics section contains at most 5 prioritized items with severity tags.
- Binary: every Cumulative changelog entry names all three fields (changed / why / effect).
- Comparative: is the revision more reviewable than baseline? (blind A/B judge)

Budget: 8 experiments. Stop condition: 95% binary pass rate sustained for 3 consecutive kept experiments.

## Output

**Experiment contract**
- target: `skills/craft-tune/SKILL.md`
- inputs: 7 prompts (5 train / 2 holdout)
- evals: 3 binary + 1 comparative
- eval runner: manual replay procedure — for each input, start a fresh agent session, load `skills/craft-tune/SKILL.md` as the operating instruction, paste the input, and save the response under `runs/<input-name>/output.md`
- mutable files: `skills/craft-tune/SKILL.md`; all other files frozen
- holdout commitment: hold out prompts 6-7; accept the session only if final holdout score is >= the 5/8 baseline holdout score
- evals 4th diagnostic: baseline plausibly returns Changelog rows without `effect`, so the traceability eval has a concrete failing output; baseline also plausibly returns a longer revision that satisfies section shape but is no easier to audit, so the comparative reviewability eval has a concrete failing output
- runner design: manual replay; slower than a command runner, but exact and valid before this repo ships a runner script
- first-mutation hypothesis preview: `## Final output` / Convergence subsection, invoking the Build-step enforcement prior because the first failing output lacks the final-state signal that the current `craft-tune` contract requires
- budget: 8; stop: 95% x 3 consecutive

**Baseline**
Train score: 12/20 (60%). Holdout baseline: 5/8 (62.5%). Failing: final `Convergence` block is often missing; Diagnostics item count is unbounded; Cumulative changelog entries often omit `effect`.

Representative outputs:
- run 1 ends after `Round 2` edits with no final `Convergence` block
- run 2 includes a changelog row with `changed` and `why`, but no `effect`

**Experiment log**

| # | Hypothesis | Change | Train score | Decision | Rationale |
|---|---|---|---|---|---|
| 1 | Tighten final-output spec | Added explicit `Convergence` block requirement | 15/20 | KEEP | fixes missing final-state signal without changing loop scope |
| 2 | Cap Diagnostics list | Added "1-5 items, severity-tagged" | 18/20 | KEEP | removes unbounded review output while preserving priority |
| 3 | Enforce three-field changelog | Added table example + "all three fields per entry" rule | 20/20 | KEEP | makes every accepted change auditable |
| 4 | Deletion check | Removed the added changelog example | 17/20 | DISCARD | train score regressed; example carries the changelog behavior |
| 5 | Restore + sharpen example | Restored changelog table with three rows | 20/20 | KEEP | restores the behavior with less wording |
| 6 | Stability check | Re-ran train to confirm | 20/20 | KEEP — 3 consecutive hit, STOP | stop condition satisfied |

**Session acceptance**
Final holdout score: 8/8 vs 5/8 baseline; accept. If holdout regressed, report an overfit finding, keep the log, and do not present the artifact as improved.

**Final artifact**
Accepted version: `skills/craft-tune/SKILL.md`. Size note: `skill_lines` stayed within the 160-220 line complex-skill band and below the 220-line release gate; folder size unchanged because no references were touched.

**Direction shifts**
- Flipped from "softer wording" to "explicit constraints" after baseline showed agents needed more structure, not less.

**Next steps**
- Add an eval for "every Changelog entry traces to a Diagnostics item" to enforce the diagnose-then-edit chain.
- Re-run in 1 week on fresh inputs to detect drift.
