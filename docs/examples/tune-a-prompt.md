# Example: tune an existing prompt

An end-to-end walkthrough showing how the CraftKit skills compose. The input is a prompt that "works, kind of" — it gets used, but the outputs are inconsistent and nobody remembers why it's shaped the way it is. This is the most common starting point in practice.

The example is deliberately small so you can read every step. Real prompts will have more surface area, but the shape of the workflow is the same.

## Starting prompt

```text
Review my code and tell me what to fix. Be thorough.
```

The user reports:

- sometimes it returns a wall of nits, other times only two issues
- it occasionally adds unrelated refactors
- different agents (Claude vs Codex) give very different outputs

## Step 1 — Tune

Invoke `craft-tune` with the prompt and a target improvement: *consistent reviews across agents, with a stable output shape.*

`craft-tune` returns the diagnosis and the revised artifact in the same pass:

```text
Intent preserved
The original job is to get a code review back from an agent — a list of things
to fix in code the user already wrote. The "thorough" qualifier signals more
than surface comments, but does not bound what counts as in-scope.

Diagnostics
1. [HIGH] "Thorough" is undefined — no scope, no rubric, no length cap.
2. [HIGH] No output template — different agents return different shapes.
3. [MED]  No "review only, don't refactor" guard — agent occasionally rewrites.
4. [LOW]  No context about the code's language or style guide.

Revised artifact
<task>Review the code below. Do not refactor or rewrite.</task>
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

Changelog
- added scope + non-goal       | Diagnostics #3 | review stays a review
- replaced "thorough" w/ template | Diagnostics #1, #2 | bounded volume, stable shape
- switched to XML tags          | Diagnostics #2 | parses identically across agents

Tradeoffs
- length ↑ (still under 200 tokens)
- flexibility ↓ — mitigated by the "one question" slot
```

If the diagnosis still feels fuzzy, open `skills/craft-tune/references/failure-modes.md` and classify each issue as **ambiguity**, **scope**, **context**, **portability**, or **structure**. That vocabulary usually makes the next edit obvious — in this case the prompt has clear ambiguity (what does "thorough" mean?) and scope (no "don't refactor" guard) failures.

### Diagnose-only variant

When you want the findings before any rewrite — for example, to decide whether to rewrite at all, or to share with a collaborator first — invoke `craft-tune` in **diagnose-only mode**. Trigger it with phrasing like *"review only,"* *"diagnose only,"* or *"don't edit yet."* Output drops the Revised artifact / Changelog / Tradeoffs sections and replaces them with `Recommended changes` and `Failure modes` plus a pointer back to default mode when you're ready to apply the edits.

## Step 2 — Autoresearch (optional)

Tune alone usually does most of the work. Reach for `craft-autoresearch` when the prompt is about to be reused across a team and you want to eliminate the remaining "sometimes" failures systematically.

Autoresearch is an eval-driven loop, so it needs three things you did not need for tune:

1. **A small set of test inputs** — three real code snippets the prompt should review.
2. **Eval criteria** — for this prompt, e.g. *exactly 3 sections present*, *Top issues ≤ 5*, *every issue cites file:line*, plus one comparative eval: *is this review more actionable than the baseline?*
3. **A run harness** — the exact command that runs the prompt on each input and captures outputs.

With those in place, autoresearch establishes a baseline score, then runs mutation experiments: one bounded change per iteration, rescored, KEEP if it helped, DISCARD otherwise. It stops when the stop condition is hit (e.g. 95% binary pass rate sustained over three kept experiments) or the budget runs out. See `skills/craft-autoresearch/SKILL.md` for the full loop and `references/eval-guide.md` / `references/mutation-guide.md` for the deep detail.

If you cannot write evals cheaply, skip this step. Autoresearch pays off at scale; for a one-off prompt, it is overhead.

## Aside — Survey before you start (optional)

If several teams in the org already have code-review prompts, run `craft-survey` *before* Step 1. It studies those prompts, extracts patterns worth adopting (common severity labels, standard scope lists), flags patterns to avoid (hard-coded linter rules that duplicate tooling), and feeds the result into the tune pass. Skip the survey when there is no prior art to learn from.

## What to take from this example

- **Diagnose and tune in one pass.** `craft-tune` returns the issues and the revised artifact together; switch to diagnose-only mode when you want findings before edits.
- **Tune with minimal diffs.** The final prompt is recognizable as an evolution of the original, not a replacement. Every Changelog entry traces back to a Diagnostics item.
- **Survey is opt-in prior art.** It grounds the design when comparable assets exist.
- **Autoresearch is opt-in measurement.** It pays off when you have evals and a harness; for a one-off prompt, it is overhead.
