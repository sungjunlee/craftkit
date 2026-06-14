# craft-autoresearch full contract example

This reference keeps a full example out of the always-loaded `SKILL.md` while preserving the complete contract shape.

## Input

Optimize `skills/craft-tune/SKILL.md` so review-and-fix loop outputs are structurally consistent across Claude Code and Codex.

Test inputs: three real "improve this prompt" requests from last week.

Eval criteria:

- Binary: output includes at least one `Round N` trail and a final `Convergence` block.
- Binary: each per-round Diagnostics section contains at most 5 prioritized items with severity tags.
- Binary: every Cumulative changelog entry names all three fields (changed / why / effect).
- Comparative: is the revision more reviewable than baseline? (blind A/B judge)

Budget: 8 experiments. Stop condition: 95% binary pass rate sustained for 3 consecutive kept experiments.

## Output

**Experiment contract**
- target: `skills/craft-tune/SKILL.md`
- inputs: 3 prompts
- evals: 3 binary + 1 comparative
- eval runner: manual replay procedure — for each input, start a fresh agent session, load `skills/craft-tune/SKILL.md` as the operating instruction, paste the input, and save the response under `runs/<input-name>/output.md`
- mutable files: `skills/craft-tune/SKILL.md`; all other files frozen
- evals 4th diagnostic: baseline plausibly returns Changelog rows without `effect`, so the traceability eval has a concrete failing output; baseline also plausibly returns a longer revision that satisfies section shape but is no easier to audit, so the comparative reviewability eval has a concrete failing output
- runner design: manual replay; slower than a command runner, but exact and valid before this repo ships a runner script
- first-mutation hypothesis preview: `## Final output` / Convergence subsection, invoking the Build-step enforcement prior because the first failing output lacks the final-state signal that the current `craft-tune` contract requires
- budget: 8; stop: 95% x 3 consecutive

**Baseline**
Score: 7/12 (58%). Failing: final `Convergence` block is often missing; Diagnostics item count is unbounded; Cumulative changelog entries often omit `effect`.

Representative outputs:
- run 1 ends after `Round 2` edits with no final `Convergence` block
- run 2 includes a changelog row with `changed` and `why`, but no `effect`

**Experiment log**

| # | Hypothesis | Change | Score | Decision | Rationale |
|---|---|---|---|---|---|
| 1 | Tighten final-output spec | Added explicit `Convergence` block requirement | 9/12 | KEEP | fixes missing final-state signal without changing loop scope |
| 2 | Cap Diagnostics list | Added "1-5 items, severity-tagged" | 11/12 | KEEP | removes unbounded review output while preserving priority |
| 3 | Enforce three-field changelog | Added table example + "all three fields per entry" rule | 12/12 | KEEP | makes every accepted change auditable |
| 4 | Deletion check | Removed the added changelog example | 10/12 | DISCARD | score regressed; example carries the changelog behavior |
| 5 | Restore + sharpen example | Restored changelog table with three rows | 12/12 | KEEP | restores the behavior with less wording |
| 6 | Stability check | Re-ran to confirm | 12/12 | KEEP — 3 consecutive hit, STOP | stop condition satisfied |

**Final artifact**
Accepted version: `skills/craft-tune/SKILL.md`. Size note: `skill_lines` held under the 500-line target; folder size unchanged because no references were touched.

**Direction shifts**
- Flipped from "softer wording" to "explicit constraints" after baseline showed agents needed more structure, not less.

**Next steps**
- Add an eval for "every Changelog entry traces to a Diagnostics item" to enforce the diagnose-then-edit chain.
- Re-run in 1 week on fresh inputs to catch eval overfitting.
