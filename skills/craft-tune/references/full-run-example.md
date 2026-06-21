# craft-tune full-run example

Load this reference when a compact `SKILL.md` example is not enough to show the full review-and-fix trail.

## Input

Current prompt:

> Review my code and tell me what to fix. Be thorough.

Target improvement: consistent reviews across agents, with a stable output shape.

## Round trail

### Round 1

**Intent preserved**
The original job is to get a code review back from an agent: a list of things to fix in code the user already wrote. The word "thorough" asks for more than surface comments but does not define scope.

**Diagnostics**
1. `[HIGH]` "Thorough" is undefined; output volume varies run-to-run.
2. `[HIGH]` No output template; different agents return different shapes.
3. `[MED]` No "review only, don't refactor" guard.

**Edits applied**
- added explicit `<scope>` and a "do not refactor" non-goal -> why Diagnostics #3 -> effect: review stays a review
- replaced "thorough" with a capped 3-section `<output>` template -> why Diagnostics #1, #2 -> effect: output volume and shape stabilize
- switched to XML tags -> why Diagnostics #2 -> effect: sections travel across agents

### Round 2

**Diagnostics**
1. `[MED]` Slot 3 of the output template is underspecified and can invite filler questions.
2. `[LOW]` Linter-exclusion wording is longer than needed.

**Edits applied**
- reframed slot 3 as "one merge-blocking unknown, skip if none" -> why Diagnostics #1 -> effect: the slot earns its keep or vanishes
- collapsed linter clause to "Exclude: lint-enforced style." -> why Diagnostics #2 -> effect: cleaner read, same behavior

### Round 3

**Diagnostics**
1. `[LOW]` The `<scope>` list could be alphabetized.
2. `[LOW]` "Top issues (max 5, ordered by severity)" has a small redundancy.

**Edits applied**
No edits — both items are `[LOW]` and below the action threshold; Self-LGTM fires.

## Final output

**Convergence**
Converged at Round 3 — Self-LGTM.

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
Exclude: lint-enforced style.
</scope>

<output>
Return exactly three sections:
1. Top issues (max 5, ordered by severity)
2. Minor notes (max 5, one line each)
3. One merge-blocking unknown — a question whose answer would change whether you'd approve. Skip if none.
</output>
```

**Cumulative changelog**

| changed | why | effect |
|---|---|---|
| added explicit `<scope>` and "don't refactor" non-goal | R1 Diagnostics #3 | review stays a review |
| replaced "thorough" with capped output template | R1 Diagnostics #1, #2 | output volume and shape stabilize |
| switched to XML tags | R1 Diagnostics #2 | sections travel across agents |
| reframed slot 3 as "merge-blocking unknown, skip if none" | R2 Diagnostics #1 | no filler questions |
| collapsed linter clause | R2 Diagnostics #2 | cleaner read, same behavior |

**Tradeoffs**
- length up, still under 200 tokens
- flexibility down, mitigated by the skip-allowed merge-blocking unknown slot
