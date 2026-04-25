---
name: craft-tune
description: Diagnose and improve an existing prompt or skill in one pass — surface the issues that are actually blocking the goal, then apply targeted minimal-diff edits that preserve the original intent. Use this whenever the user wants to refine, sharpen, tighten, review, audit, or upgrade an existing prompt or skill, says it "feels off" or "behaves inconsistently," asks "what's wrong with this," or wants to make it better. Defaults to diagnose-and-edit; switch to diagnose-only mode when the user wants the findings before any rewrite (asks to "review only," "diagnose only," or "don't edit yet").
---

# craft-tune

## Purpose

Diagnose an existing prompt or skill and apply targeted edits that preserve its core intent.

A pass over a working artifact is two jobs in one: figure out what's actually broken, then change only what's blocking the goal. Diagnosis without edits leaves the user holding the bag; edits without diagnosis silently drift the artifact's scope and lose the lessons its phrasing already encodes. craft-tune does both in one pass and lets the user stop after diagnosis when that's what they need.

## Use this when

- a prompt or skill is close but needs sharpening
- a prompt "feels off" or behaves inconsistently across runs
- a working artifact needs review before being generalized or shipped
- a large rewrite is tempting and a diagnostic pass should anchor the next edit
- minimal-diff improvement is better than rewriting from scratch

Switch to **diagnose-only mode** when the user explicitly wants findings without edits — typical signals: "review only," "diagnose only," "what's wrong with this but don't change it yet," "audit before I touch it." See § Diagnose-only mode.

## Inputs

- current artifact
- target improvement (skip in diagnose-only mode — diagnosis sets its own scope)
- hard constraints
- optional: examples of failure (specific outputs the artifact produced that were wrong) — when supplied, Diagnostics expands into root-cause hypotheses tied to those outputs

## Steps

1. **Restate the artifact's current intent.** Lock it in before diagnosing or changing anything — this is what every subsequent decision must preserve.
2. **Diagnose against the intent.** Find ambiguity, redundancy, hidden assumptions, structural mismatches, portability issues, and likely failure modes. If the top pass keeps surfacing the same fuzzy complaint, switch to the categorized vocabulary in `references/failure-modes.md` (ambiguity / scope / context / portability / structure).
3. **Prioritize the highest-leverage fixes.** Prefer one or two structural edits over many surface tweaks. If two issues share a fix, consolidate.
4. **Stop here in diagnose-only mode.** Otherwise continue.
5. **Preserve good parts unless they directly block the goal.** Resist the urge to "clean up" working text.
6. **Rewrite only the sections that need improvement.** Leave the rest untouched so the diff is legible.
7. **Produce a revised version, changelog, and tradeoffs.** Each entry in the changelog must be reviewable on its own.

## Output format (default mode — diagnose-and-edit)

### Intent preserved
One short paragraph naming the original artifact's concrete job in task-specific terms — reference a detail a reader could use to guess what the input was about. "The original job remains intact" or "improves the existing prompt" fails the bar.

### Diagnostics
Prioritized list, 1-5 items. Each item carries an explicit severity tag (`[HIGH]`, `[MED]`, `[LOW]`) OR the section begins with "Ordered highest severity first." Bare position is not enough — make the priority signal visible. When failure outputs were supplied as input, each `[HIGH]` item must name the specific failure it explains.

### Revised artifact
The updated prompt or skill. Every substantive change must serve a Diagnostics item or the stated target improvement; no "while I'm in there" additions. When cutting content, cut in the Principle 3 order (verbose role → restated context → hedging) and preserve examples, success criteria, and output-format rules.

### Changelog
One entry per distinct change. Every entry names all three fields — not just "changed":

- **changed** — what was edited (added / removed / rewrote)
- **why** — the specific Diagnostics item or gap this edit fixes
- **effect** — the behavior change a reader should expect

Use a list-of-groups per entry, or a three-column table. A bare bullet naming only the change fails the spec; bundling unrelated changes into one entry fails the spec. The Changelog must not introduce changes that no Diagnostics item or stated target justifies.

### Tradeoffs
Name at least one concrete cost with a direction (length ↑, flexibility ↓, specificity ↑, adaptability ↓). "No tradeoffs" is acceptable only when paired with a one-line justification of why the edit carries no cost; vague acknowledgments ("small tradeoff in clarity") fail.

## Diagnose-only mode

When the user wants diagnosis without edits, return only:

### Intent preserved
Same bar as above.

### Diagnostics
Same bar as above.

### Recommended changes
Imperative commands. Do not mirror Diagnostics 1:1. Consolidate where two issues share a fix; reprioritize where the cheapest or highest-leverage fix is not the first Diagnostics item. At least one of these must be visible: fewer Rec items than Diagnostics items, a Rec item that addresses two or more, or a Rec order that differs from the Diagnostics order.

### Failure modes
Distinct recurrence scenarios — how the artifact fails under conditions not already named in Diagnostics. Do not restate Diagnostics in future tense. Each item introduces a new trigger, actor, interaction, or downstream effect (e.g. a recurrence scenario after a fix, a cross-effect with another system, a misuse pattern Diagnostics did not surface).

### Pointer
Close with: *"Run craft-tune in default mode with these recommendations as the target improvement to apply the edits."*

Do **not** produce a Revised artifact, Changelog, or Tradeoffs section in this mode.

## Guardrails

- diagnose before editing — every Changelog entry must trace to a Diagnostics item or the stated target
- do not rewrite everything by default
- do not add complexity without payoff
- preserve strengths, not just list problems
- keep the result copy-pasteable
- prefer structural clarity over clever wording

## Principles

These four ideas do most of the work behind a good minimal-diff edit. When a tune feels stuck, check that the edit respects all four.

1. **Context beats instruction.** When token budget is tight, richer background usually helps more than more rules. A simple instruction with strong context outperforms elaborate instructions with none.
2. **Outcome over process.** Say what success looks like, not every step to get there. Modern agents are good at means; they need clarity on ends.
3. **Cut in this order.** When the artifact is too long, cut verbose role definitions first, then restated context, then hedging language. Do not cut examples, success criteria, or output-format specs — those change behavior the most.
4. **Right-sized beats thorough-looking.** A 50-token instruction for a simple task is a feature, not a defect. Do not inflate to look rigorous.

## When the diagnosis feels vague

If the Diagnostics pass keeps surfacing the same fuzzy complaint ("this just feels off"), switch to the categorized diagnostic in `references/failure-modes.md`. It splits issues into ambiguity, scope, context, portability, and structure — which usually makes the real problem easier to name and fix.

## Failure modes

- silently drifting the artifact's scope during "cleanup"
- adding length to look thorough when the original was already tight
- piling on ALWAYS/NEVER rules instead of explaining the underlying reason
- producing a diff so large it's effectively a rewrite without admitting it
- editing past the diagnosis — Changelog entries that no Diagnostics item justifies
- producing only negatives in diagnose-only mode and losing the parts that already work

## Example

### Input
Current prompt:

> Review my code and tell me what to fix. Be thorough.

Target improvement: consistent reviews across agents, with a stable output shape.

### Output (default mode)

**Intent preserved**
The original job is to get a code review back from an agent — a list of things to fix in code the user already wrote. The "thorough" qualifier signals the user wants more than surface comments, but does not bound what counts as in-scope.

**Diagnostics**
1. `[HIGH]` "Thorough" is undefined — no scope, no rubric, no length cap. Output volume varies run-to-run.
2. `[HIGH]` No output template — different agents (Claude vs Codex) return different shapes for the same prompt.
3. `[MED]` No "review only, don't refactor" guard. The agent occasionally rewrites code it was asked to comment on.
4. `[LOW]` No context about the code's language, conventions, or style guide.

**Revised artifact**

```xml
<task>
Review the code below. Do not refactor or rewrite.
</task>

<scope>
- Correctness and likely bugs
- Security and input validation
- Obvious performance cliffs
- Readability and naming
Do NOT comment on style preferences already enforced by the linter.
</scope>

<output>
Return exactly three sections:
1. Top issues (max 5, ordered by severity)
2. Minor notes (max 5, one line each)
3. One question you would ask the author before merging
</output>
```

**Changelog**

| changed | why | effect |
|---|---|---|
| added explicit scope + non-goal ("don't refactor") | Diagnostics #3 — agent was rewriting code | review stays a review; no surprise refactors |
| replaced "thorough" with capped, ordered output template | Diagnostics #1, #2 — undefined volume, unstable shape | output volume bounded; same shape across agents |
| switched to XML tags for multi-section structure | Diagnostics #2 — cross-agent portability | sections parse identically across Claude, GPT, Gemini |

**Tradeoffs**
- length ↑ (still under 200 tokens)
- flexibility ↓ — less freedom to surface unusual issues, mitigated by the "one question" slot
