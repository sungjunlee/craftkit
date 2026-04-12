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

## Step 1 — Reflect

Invoke `craft-reflect` on the prompt. Expected output shape:

```text
What is working:
- intent to review is clear
- short and easy to edit

Issues:
1. "Thorough" is undefined — no scope, no rubric, no length cap
2. No success criteria → agent doesn't know when to stop
3. No output template → format varies between runs
4. No "only review, don't refactor" constraint → scope creep
5. No context about the code (language, conventions, style guide)

Recommended changes:
- define what "review" covers and what it does not
- add an output template
- add an explicit non-goal: do not refactor

Failure modes:
- agent rewrites code instead of reviewing it
- output varies between Claude and Codex because structure is implicit
```

If the review still feels fuzzy, open `skills/craft-reflect/references/failure-modes.md` and classify each issue as **ambiguity**, **scope**, **context**, **portability**, or **structure**. That vocabulary usually makes the next edit obvious — in this case, the prompt has clear ambiguity (what does "thorough" mean?) and scope (no "don't refactor" guard) failures.

## Step 2 — Tune

Invoke `craft-tune` with the reflection as input. Target improvement: *consistent reviews across agents, with a stable output shape.*

Expected revised prompt:

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

Changelog:

- added explicit scope + non-goal (don't refactor)
- replaced "thorough" with a capped, ordered output template
- switched to XML tags for cross-agent portability

Tradeoffs:

- longer prompt (still under 200 tokens)
- less freedom for the agent to surface unusual issues — mitigated by the "one question" slot

## Step 3 — Autoresearch (optional)

Tune alone usually does most of the work. Reach for `craft-autoresearch` when the prompt is about to be reused across a team and you want to eliminate the remaining "sometimes" failures systematically.

Autoresearch is an eval-driven loop, so it needs three things you did not need for tune:

1. **A small set of test inputs** — three real code snippets the prompt should review.
2. **Eval criteria** — for this prompt, e.g. *exactly 3 sections present*, *Top issues ≤ 5*, *every issue cites file:line*, plus one comparative eval: *is this review more actionable than the baseline?*
3. **A run harness** — the exact command that runs the prompt on each input and captures outputs.

With those in place, autoresearch establishes a baseline score, then runs mutation experiments: one bounded change per iteration, rescored, KEEP if it helped, DISCARD otherwise. It stops when the stop condition is hit (e.g. 95% binary pass rate sustained over three kept experiments) or the budget runs out. See `skills/craft-autoresearch/SKILL.md` for the full loop and `references/eval-guide.md` / `references/mutation-guide.md` for the deep detail.

If you cannot write evals cheaply, skip this step. Autoresearch pays off at scale; for a one-off prompt, it is overhead.

## Aside — Research before you start (optional)

If several teams in the org already have code-review prompts, run `craft-research` *before* Step 1. It surveys those prompts, extracts patterns worth adopting (common severity labels, standard scope lists), flags patterns to avoid (hard-coded linter rules that duplicate tooling), and feeds the result into the reflect/tune pass. Skip research when there is no prior art to learn from.

## What to take from this example

- **Reflect before rewriting.** One diagnostic pass usually reveals whether the fix is structural or cosmetic.
- **Tune with minimal diffs.** The final prompt is recognizable as an evolution of the original, not a replacement.
- **Research is opt-in prior art.** It grounds the design when comparable assets exist.
- **Autoresearch is opt-in measurement.** It pays off when you have evals and a harness; for a one-off prompt, it is overhead.
