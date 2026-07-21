# craft-autoresearch full contract example

This reference keeps a full example out of the always-loaded `SKILL.md` while preserving the complete contract shape.

## Input

Optimize `skills/craft-handoff/SKILL.md` so session handoffs are resumable across Claude Code and Codex without re-deriving state from the conversation.

Test inputs: seven real end-of-session handoff requests from last week, split 5 train / 2 holdout.

Eval criteria:

- Binary: output includes both artifacts — the rich handoff doc and the resume prompt.
- Binary: the resume prompt names the current branch, dirty or untracked files, and the exact next command to run.
- Binary: the handoff names the blocking decision or open question when the session has one.
- Comparative: is the resume prompt easier to resume from than baseline? (blind A/B judge)

Budget: 8 experiments. Stop condition: 95% binary pass rate sustained for 3 consecutive kept experiments.

## Output

**Experiment contract**
- target: `skills/craft-handoff/SKILL.md`
- inputs: 7 session transcripts (5 train / 2 holdout)
- evals: 3 binary + 1 comparative
- eval runner: manual replay procedure — for each input, start a fresh agent session, load `skills/craft-handoff/SKILL.md` as the operating instruction, paste the session transcript, and save the response under `runs/<input-name>/output.md`
- mutable files: `skills/craft-handoff/SKILL.md`; all other files frozen
- holdout commitment: hold out sessions 6-7; accept the session only if final holdout score is >= the 5/8 baseline holdout score
- evals 4th diagnostic: baseline plausibly emits a resume prompt that names touched files but omits branch and dirty-file state, so the required-signals eval has a concrete failing output; baseline also plausibly emits a fluent handoff that leaves the next command implicit, so the comparative resumability eval has a concrete failing output
- runner design: manual replay; slower than a command runner, but exact and valid before this repo ships a runner script
- first-mutation hypothesis preview: `## Workflow` step 4 (Compose the resume prompt), invoking the Build-step enforcement prior because the failing outputs drop git-state signals the conceptual sections already demand
- budget: 8; stop: 95% x 3 consecutive

**Baseline**
Train score: 14/20 (70%). Holdout baseline: 5/8 (62.5%). Failing: resume prompts often omit branch and dirty-file state; the next command is left implicit; the blocking decision sometimes stays buried in the doc without surfacing in the prompt.

Representative outputs:
- run 2's resume prompt lists touched files but never names the branch or the command to continue with
- run 4's handoff records an unresolved schema question in the doc, but the resume prompt doesn't mention it

**Experiment log**

| # | Hypothesis | Change | Train score | Decision | Rationale |
|---|---|---|---|---|---|
| 1 | Enforce required signals at the build step | Compose step now lists the signals every resume prompt must carry (branch, dirty files, next command, blocking decision) | 20/20 | KEEP | one build-step edit flips every failing eval |
| 2 | Deletion check | Removed the required-signals list | 14/20 | DISCARD | regression confirms the list carries the behavior |
| 3 | Stability check | Re-ran on the train split | 20/20 | KEEP | target hit holds |
| 4 | Stability check | Re-ran to confirm | 20/20 | KEEP — 3 consecutive hit, STOP | stop condition satisfied |

**Session acceptance**
Final holdout score: 8/8 vs 5/8 baseline; accept. If holdout regressed, report an overfit finding, keep the log, and do not present the artifact as improved.

**Final artifact**
Accepted version: `skills/craft-handoff/SKILL.md`. Size note: `skill_lines` stayed within the 160-220 line complex-skill band and below the 220-line release gate; folder size unchanged because no references were touched.

**Direction shifts**
- Confirmed the Build-step enforcement prior: the whole gain came from one compose-step tightening, not from distributed wording edits.

**Next steps**
- Suite saturated at 100% — add 2-3 quality-dimension assertions (doc/prompt pair consistency, resume-prompt skimmability) before any further mutation.
- Re-run in 1 week on fresh inputs to detect drift.
