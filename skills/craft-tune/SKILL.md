---
name: craft-tune
description: Improve an existing prompt or skill in place. Use for refine, sharpen, tighten, fix, upgrade, "feels off", or inconsistent artifact requests.
disable-model-invocation: true
---

# craft-tune

## Purpose

Run an autonomous critique-and-edit loop over an existing prompt or skill until the artifact is good enough by its own critique standard — preserving the original intent throughout.

A working artifact rarely converges in one pass: diagnosis surfaces issues, edits introduce new ones, and the next round of diagnosis depends on the revised text rather than the original. craft-tune keeps cycling on its own: re-critique against the current state, apply minimal-diff edits, re-critique again. The loop terminates when the critique itself has nothing significant left to say (the Self-LGTM condition) — at which point the user gets the final artifact and the round-by-round trail of how it got there.

This is *not* eval-driven (no scored rubric, no eval runner — that's `craft-autoresearch`). It is judgment-driven: the same critique discipline that produced a trusted finding in Round 1 also decides when to stop in Round N.

## Use this when

- a prompt or skill is close but needs sharpening
- a prompt "feels off" or behaves inconsistently across runs
- a working artifact needs review before being generalized or shipped
- the user wants the critique → edit rhythm to run end-to-end without hand-holding
- minimal-diff improvement across multiple rounds is better than rewriting from scratch
- setting up scored evals (the `craft-autoresearch` overhead) isn't worth it for this artifact

craft-tune always edits. When the user wants a one-shot critique *without* edits — "review only," "diagnose only," "what's wrong with this but don't change it yet," "audit before I touch it" — use `craft-critique` instead, which is read-only and stops at findings.

## Inputs

- current artifact (the prompt or skill being tuned)
- target improvement (optional — diagnosis will surface its own scope if not provided)
- hard constraints (e.g. "don't change the output format", "keep under 200 lines")
- optional: examples of failure (specific outputs the artifact produced that were wrong) — when supplied, each round's Diagnostics expands into root-cause hypotheses tied to those outputs
- optional: max rounds override (default cap = 8)

## How the loop runs

Each round is autonomous. Do not pause for user input between rounds — run them back-to-back and present the full trail at the end.

0. **Pre-edit safety.** Before Round 1 edits, inspect the current diff and protect only the files you expect to touch (for example by noting their pre-edit contents or using a file-level checkpoint). If the loop worsens the artifact or must abandon an edit, restore only those touched files. Do not use broad rollback commands that could destroy unrelated user work.
1. **Round 1.** Restate the artifact's current intent (lock it in — this is what every subsequent round must preserve). Diagnose. If convergence is already met (see § Stop conditions), declare it and stop. Otherwise apply the minimal-diff edits.
2. **Round N (N ≥ 2).** Diagnose the *current state* of the artifact — i.e., what Round N-1 produced after its edits. Do not carry Round N-1's Diagnostics list forward; regenerate against the new state. If a previous round's edit introduced or failed to resolve an issue, that's exactly what this round should surface. Tag any item that already appeared in a prior round (and was not resolved) with `[CARRIED]`. Apply edits.
3. **Check stop conditions after each round.** See § Stop conditions. If any fires, exit the loop and produce the final output (§ Final output).
4. **Hard cap.** Stop unconditionally at the max-rounds limit even if convergence wasn't reached. Report the unconverged state truthfully so the user can decide.

The loop is how craft-tune always runs — there is no separate mode and no user-keyword stop signal; the skill self-judges. If the user wants to pause mid-loop they can interrupt via chat; that's a chat mechanic, not part of the contract.

## Stop conditions (in priority order)

Exit the loop as soon as any of these fire:

1. **Self-LGTM (the primary condition).** The current round's Diagnostics contains **no `[HIGH]` or `[MED]` items** (including any `[CARRIED]` items at those severities — `[CARRIED]` does not lower a finding's severity). Remaining `[LOW]` items, or an empty list, mean the artifact is good enough by its own critique standard. State the rationale in the final output: *"Converged at Round N — no [HIGH]/[MED] findings remain."*
2. **Persistent fixpoint.** The same `[HIGH]` or `[MED]` item appears with `[CARRIED]` tag across **two consecutive rounds**, meaning the current edit strategy isn't resolving it. Treat two Diagnostics items as the *same* when they name the same underlying defect — even if the wording shifts between rounds — and would be resolved by the same kind of edit. Stop and surface this in the final output as *"Unresolvable in this loop's vocabulary"* — the user may need to provide additional context, an example, or a different framing.
3. **No-op round.** A round produces an empty Changelog (the Diagnostics found items but no edits were warranted, or all proposed edits would violate hard constraints). Treat as soft convergence — stop and explain.
4. **Hard cap reached.** Default 8 rounds — enough for two compounding edit passes plus margin on a typical-size artifact; raise it for large or unusually resistant artifacts, lower it when running on a tight budget. Honor the user's override if supplied. State the cap was hit and list any remaining `[HIGH]`/`[MED]` Diagnostics that weren't resolved.

The first three are the healthy exits; the fourth is the safety net.

## Per-round output (compact trail)

Each round produces a compact block — enough to audit the run, not so much that the trail buries the final artifact. **Do not** include the full revised artifact per round; that goes in the final output only.

### Round N

A single line: `Round 1`, `Round 2`, etc. — so the user can refer to past rounds by number.

### Intent preserved

One short paragraph, **Round 1 only**. Name the original artifact's concrete job in task-specific terms — reference a detail a reader could use to guess what the input was about. "The original job remains intact" or "improves the existing prompt" fails the bar. Subsequent rounds skip this section entirely (the intent is locked).

### Diagnostics

Prioritized list, 1-5 items, against the *current state* of the artifact. Each item carries an explicit severity tag (`[HIGH]`, `[MED]`, `[LOW]`). When failure outputs were supplied as input, each `[HIGH]` item must name the specific failure it explains. From Round 2 onward, tag any item already raised in a prior round (and not resolved) as `[CARRIED]` and explain in one phrase why the prior edit did not resolve it.

### Edits applied

Compact changelog — one line per change in the form *`changed → why (Diagnostics #N) → effect`*. No full three-column table per round; that depth lives in the final output's cumulative changelog. **Never omit this section.** If a round applies no edits (no-op stop, or Self-LGTM with only `[LOW]` items below the action threshold), write *"No edits — <one-line reason>."* This keeps the per-round trail uniform and auditable.

## Final output (after convergence)

Once a stop condition fires, append this block. This is what the user reads to take the result away.

### Convergence

One line: *"Converged at Round N — <stop condition>."* Use the exact condition name from § Stop conditions (Self-LGTM / Persistent fixpoint / No-op round / Hard cap).

On a Self-LGTM exit, before shipping, publishing, or generalizing the tuned artifact beyond this session, run an independent second pass — `craft-critique` in a fresh context, or ordinary PR review. The loop judges its own output, and a same-context re-read shares the loop's blind spots.

### Revised artifact

The fully revised prompt or skill at its final state. Copy-pasteable as a standalone replacement.

### Cumulative changelog

Full table of every distinct change across all rounds. Every entry names all three fields:

- **changed** — what was edited (added / removed / rewrote)
- **why** — the specific Diagnostics item from the round that introduced it, in the form *"R<N> Diagnostics #M"*
- **effect** — the behavior change a reader should expect

Use a three-column table. Bare bullets fail the spec; bundling unrelated changes into one entry fails the spec. The cumulative changelog must not introduce changes that no Diagnostics item from any round justifies.

### Tradeoffs

Name at least one concrete cost with a direction (length ↑, flexibility ↓, specificity ↑, adaptability ↓). "No tradeoffs" is acceptable only when paired with a one-line justification of why the run carries no cost; vague acknowledgments ("small tradeoff in clarity") fail.

### Open items (only when stop condition ≠ Self-LGTM)

If the loop exited on Persistent fixpoint, No-op round, or Hard cap, list the `[HIGH]`/`[MED]` Diagnostics that remain unresolved, one per line, each with a one-line note on why the loop couldn't resolve it. Omit this section entirely on a clean Self-LGTM exit.

## Guardrails

- diagnose before editing — every changelog entry must trace to a specific Diagnostics item from the round that introduced it
- protect touched files before editing, and rollback only those files if a round must be abandoned
- minimal-diff per round — do not rewrite everything in any single round
- never exit the loop without naming the stop condition
- a clean Self-LGTM exit requires *no* `[HIGH]`/`[MED]` items in the final round's Diagnostics — do not declare convergence just because edits are getting smaller
- Self-LGTM is convergence of the loop's own judgment, not external validation — same-context review shares the loop's blind spots, so treat the tuned artifact as unverified by anyone outside the loop
- preserve strengths, not just list problems
- keep the final revised artifact copy-pasteable
- prefer structural clarity over clever wording

## Principles

These four ideas do most of the work behind a good minimal-diff edit. When a round feels stuck, check that the edit respects all four.

1. **Context beats instruction.** When token budget is tight, richer background usually helps more than more rules. A simple instruction with strong context outperforms elaborate instructions with none.
2. **Outcome over process.** Say what success looks like, not every step to get there. Modern agents are good at means; they need clarity on ends.
3. **Cut in this order.** When the artifact is too long, cut verbose role definitions first, then restated context, then hedging language. Do not cut examples, success criteria, or output-format specs — those change behavior the most.
4. **Right-sized beats thorough-looking.** A 50-token instruction for a simple task is a feature, not a defect. Do not inflate to look rigorous.

## When the diagnosis feels vague

If a round's Diagnostics keeps surfacing the same fuzzy complaint ("this just feels off"), switch to the categorized diagnostic in `references/failure-modes.md`. It splits issues into ambiguity, scope, context, portability, verification, and structure — which usually makes the real problem easier to name and fix in the next round.

## Failure modes

- declaring Self-LGTM with `[HIGH]` or `[MED]` items still in the final Diagnostics — the only clean exit requires the list to be empty or `[LOW]`-only
- carrying Diagnostics forward without re-deriving them against the current artifact state — defeats the point of a re-critique loop
- silently drifting the artifact's scope during "cleanup" across rounds
- adding length to look thorough when the original was already tight
- piling on ALWAYS/NEVER rules instead of explaining the underlying reason
- producing a diff so large any single round is effectively a rewrite without admitting it
- editing past the diagnosis — changelog entries that no Diagnostics item justifies
- looping past the hard cap by reframing what "converged" means

## Example

Input: tune `Review my code and tell me what to fix. Be thorough.` so reviews are consistent across agents.

Output sketch:

- Round 1 diagnoses undefined "thorough", missing output shape, and missing "review only" guard; edits add scope, non-goal, and a capped output template.
- Round 2 diagnoses a weak "one question" slot; edits turn it into "one merge-blocking unknown, skip if none".
- Round 3 has only `[LOW]` items; no edits are applied and Self-LGTM fires.
- Final output includes the revised prompt, cumulative changed / why / effect table, and tradeoffs.

For the expanded round trail and final artifact, load `references/full-run-example.md`.

## References

- `references/failure-modes.md` — categorized diagnostic vocabulary for vague or repeated findings.
- `references/full-run-example.md` — compact full-loop example with rounds, revised artifact, changelog, and tradeoffs.
