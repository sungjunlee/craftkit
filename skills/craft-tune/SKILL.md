---
name: craft-tune
description: Autonomously sharpen an existing prompt or skill by running a self-converging critique loop — each round re-diagnoses the current artifact, applies minimal-diff edits, and continues without user intervention until the critique itself surfaces no meaningful improvements left (self-LGTM). Use this whenever the user wants to refine, sharpen, tighten, review, audit, or upgrade an existing prompt or skill, says it "feels off" or "behaves inconsistently," asks "what's wrong with this," or wants to make it better. Switch to diagnose-only mode for a one-shot critique with no edits when the user asks to "review only," "diagnose only," or "don't edit yet."
---

# craft-tune

## Purpose

Run an autonomous critique-and-edit loop over an existing prompt or skill until the artifact is good enough by its own critique standard — preserving the original intent throughout.

A working artifact rarely converges in one pass: diagnosis surfaces issues, edits introduce new ones, and the next round of diagnosis depends on the revised text rather than the original. craft-tune keeps cycling on its own: re-critique against the current state, apply minimal-diff edits, re-critique again. The loop terminates when the critique itself has nothing significant left to say (the "self-LGTM" condition) — at which point the user gets the final artifact and the round-by-round trail of how it got there.

This is *not* eval-driven (no scored rubric, no run harness — that's `craft-autoresearch`). It is judgment-driven: the same critique discipline that produced a trusted finding in Round 1 also decides when to stop in Round N.

## Use this when

- a prompt or skill is close but needs sharpening
- a prompt "feels off" or behaves inconsistently across runs
- a working artifact needs review before being generalized or shipped
- the user wants the critique → edit rhythm to run end-to-end without hand-holding
- minimal-diff improvement across multiple rounds is better than rewriting from scratch
- setting up scored evals (the `craft-autoresearch` overhead) isn't worth it for this artifact

Switch to **diagnose-only mode** when the user wants a one-shot critique without edits or iteration — typical signals: "review only," "diagnose only," "what's wrong with this but don't change it yet," "audit before I touch it." See § Diagnose-only mode.

## Inputs

- current artifact (the prompt or skill being tuned)
- target improvement (optional — diagnosis will surface its own scope if not provided)
- hard constraints (e.g. "don't change the output format", "keep under 200 lines")
- optional: examples of failure (specific outputs the artifact produced that were wrong) — when supplied, each round's Diagnostics expands into root-cause hypotheses tied to those outputs
- optional: max rounds override (default cap = 8)

## How the loop runs

Each round is autonomous. Do not pause for user input between rounds — run them back-to-back and present the full trail at the end.

1. **Round 1.** Restate the artifact's current intent (lock it in — this is what every subsequent round must preserve). Diagnose. If convergence is already met (see § Stop conditions), declare it and stop. Otherwise apply the minimal-diff edits.
2. **Round N (N ≥ 2).** Diagnose the *current state* of the artifact — i.e., what Round N-1 produced after its edits. Do not carry Round N-1's Diagnostics list forward; regenerate against the new state. If a previous round's edit introduced or failed to resolve an issue, that's exactly what this round should surface. Tag any item that already appeared in a prior round (and was not resolved) with `[CARRIED]`. Apply edits.
3. **Check stop conditions after each round.** See § Stop conditions. If any fires, exit the loop and produce the final output (§ Final output).
4. **Hard cap.** Stop unconditionally at the max-rounds limit even if convergence wasn't reached. Report the unconverged state truthfully so the user can decide.

The loop is the default behavior. There is no user-keyword stop signal — the skill self-judges. If the user wants to pause mid-loop they can interrupt via chat; that's a chat mechanic, not part of the contract.

## Stop conditions (in priority order)

Exit the loop as soon as any of these fire:

1. **Self-LGTM (the primary condition).** The current round's Diagnostics contains **no `[HIGH]` or `[MED]` items**. Remaining `[LOW]` items, or an empty list, mean the artifact is good enough by its own critique standard. State the rationale in the final output: *"Converged at Round N — no [HIGH]/[MED] findings remain."*
2. **Persistent fixpoint.** The same `[HIGH]` or `[MED]` item appears with `[CARRIED]` tag across **two consecutive rounds**, meaning the current edit strategy isn't resolving it. Stop and surface this in the final output as *"Unresolvable in this loop's vocabulary"* — the user may need to provide additional context, an example, or a different framing.
3. **No-op round.** A round produces an empty Changelog (the Diagnostics found items but no edits were warranted, or all proposed edits would violate hard constraints). Treat as soft convergence — stop and explain.
4. **Hard cap reached.** Default 8 rounds; honor the user's override if supplied. State the cap was hit and list any remaining `[HIGH]`/`[MED]` Diagnostics that weren't resolved.

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

Compact changelog — one line per change in the form *`changed → why (Diagnostics #N) → effect`*. No full three-column table per round; that depth lives in the final output's cumulative changelog. If a round applies no edits (no-op stop condition), write *"No edits — see stop condition."*

## Final output (after convergence)

Once a stop condition fires, append this block. This is what the user reads to take the result away.

### Convergence

One line: *"Converged at Round N — <stop condition>."* Use the exact condition name from § Stop conditions (Self-LGTM / Persistent fixpoint / No-op round / Hard cap).

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

## Diagnose-only mode

When the user explicitly wants diagnosis without edits — *and* without entering the loop — return one round of findings and exit. Triggers: "review only," "diagnose only," "audit," "don't edit yet."

### Output (single block, no loop)

#### Intent preserved
Same bar as default mode.

#### Diagnostics
Same bar as default mode.

#### Recommended changes
Imperative commands. Do not mirror Diagnostics 1:1. Consolidate where two issues share a fix; reprioritize where the cheapest or highest-leverage fix is not the first Diagnostics item. At least one of these must be visible: fewer Rec items than Diagnostics items, a Rec item that addresses two or more, or a Rec order that differs from the Diagnostics order.

#### Failure modes
Distinct recurrence scenarios — how the artifact fails under conditions not already named in Diagnostics. Do not restate Diagnostics in future tense. Each item introduces a new trigger, actor, interaction, or downstream effect.

#### Pointer
Close with: *"Run craft-tune in default mode to enter the autonomous edit loop, optionally pointing at these recommendations as the starting target improvement."*

Do **not** produce a Revised artifact, Changelog, Tradeoffs, or Open items section in this mode.

## Guardrails

- diagnose before editing — every changelog entry must trace to a specific Diagnostics item from the round that introduced it
- minimal-diff per round — do not rewrite everything in any single round
- never exit the loop without naming the stop condition
- a clean Self-LGTM exit requires *no* `[HIGH]`/`[MED]` items in the final round's Diagnostics — do not declare convergence just because edits are getting smaller
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
- producing only negatives in diagnose-only mode and losing the parts that already work

## Example (default mode — full run, abbreviated)

### Input

Current prompt:

> Review my code and tell me what to fix. Be thorough.

Target improvement: consistent reviews across agents, with a stable output shape.

### Round 1

**Intent preserved**
The original job is to get a code review back from an agent — a list of things to fix in code the user already wrote. The "thorough" qualifier signals the user wants more than surface comments, but does not bound what counts as in-scope.

**Diagnostics**
1. `[HIGH]` "Thorough" is undefined — no scope, no rubric, no length cap. Output volume varies run-to-run.
2. `[HIGH]` No output template — different agents (Claude vs Codex) return different shapes for the same prompt.
3. `[MED]` No "review only, don't refactor" guard. The agent occasionally rewrites code it was asked to comment on.

**Edits applied**
- added explicit `<scope>` + non-goal ("don't refactor") → why Diagnostics #3 → effect: review stays a review
- replaced "thorough" with capped, ordered 3-section `<output>` template → why Diagnostics #1, #2 → effect: output volume bounded, cross-agent shape stable
- switched to XML tags for multi-section structure → why Diagnostics #2 → effect: sections parse identically across Claude, GPT, Gemini

### Round 2

**Diagnostics**
1. `[MED]` Slot 3 of the output template ("one question") is underspecified — tends to surface trivia instead of merge-blocking unknowns.
2. `[LOW]` Linter-exclusion clause is wordier than needed.

**Edits applied**
- reframed slot 3 as "one merge-blocking unknown, skip if none" → why Diagnostics #1 → effect: the slot earns its keep or vanishes
- collapsed linter clause to "Exclude: lint-enforced style." → why Diagnostics #2 → effect: cleaner read, same behavior

### Round 3

**Diagnostics**
1. `[LOW]` The `<scope>` list could be alphabetized for skim-readability.
2. `[LOW]` "Top issues (max 5, ordered by severity)" — "by severity" is redundant with "Top issues".

### Convergence

Converged at Round 3 — Self-LGTM (no `[HIGH]`/`[MED]` findings remain; the two `[LOW]` items are below the action threshold).

### Revised artifact

```xml
<task>
Review the code below. Do not refactor or rewrite.
</task>

<scope>
- Correctness and likely bugs
- Security and input validation
- Obvious performance cliffs
- Readability and naming
Exclude: lint-enforced style.
</scope>

<output>
Return exactly three sections:
1. Top issues (max 5, ordered by severity)
2. Minor notes (max 5, one line each)
3. One merge-blocking unknown — a question whose answer would change whether you'd approve. Skip if none.
</output>
```

### Cumulative changelog

| changed | why | effect |
|---|---|---|
| added explicit `<scope>` + "don't refactor" non-goal | R1 Diagnostics #3 | review stays a review; no surprise refactors |
| replaced "thorough" with capped 3-section `<output>` template | R1 Diagnostics #1, #2 | output volume bounded; same shape across agents |
| switched to XML tags for multi-section structure | R1 Diagnostics #2 | sections parse identically across Claude, GPT, Gemini |
| reframed slot 3 as "merge-blocking unknown, skip if none" | R2 Diagnostics #1 | section earns its keep or vanishes; no filler questions |
| collapsed linter clause to "Exclude: lint-enforced style." | R2 Diagnostics #2 | scope reads cleaner; same behavior |

### Tradeoffs
- length ↑ (still under 200 tokens)
- flexibility ↓ — less freedom to surface unusual issues, mitigated by the skip-allowed "merge-blocking unknown" slot
