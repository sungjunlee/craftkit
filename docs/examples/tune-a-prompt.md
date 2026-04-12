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

Invoke `craftkit-reflect` on the prompt. Expected output shape:

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

If the review still feels fuzzy, open `skills/craftkit-reflect/references/failure-modes.md` and classify each issue as **ambiguity**, **scope**, **context**, **portability**, or **structure**. That vocabulary usually makes the next edit obvious — in this case, the prompt has clear ambiguity (what does "thorough" mean?) and scope (no "don't refactor" guard) failures.

## Step 2 — Tune

Invoke `craftkit-tune` with the reflection as input. Target improvement: *consistent reviews across agents, with a stable output shape.*

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

## Step 3 — Loop

Invoke `craftkit-loop` with the tuned prompt as baseline. Criteria: *consistent structure, no scope creep, works on both Claude and Codex.* Iteration limit: 2.

Expected loop log:

```text
Baseline assessment:
Structure is stable, but the "Top issues" section still varies in granularity.

Iteration 1:
- change: added "one sentence per issue" hint in the template
- why: agents were writing paragraph-length items, compressing detail unpredictably
- observed: more consistent length, easier to scan

Iteration 2:
- change: added "cite file:line for each top issue"
- why: without grounding, issues drifted into generic advice
- observed: fewer vague comments, each issue now actionable
```

Stop here — gains have flattened and the prompt is still short.

## Step 4 — Autoresearch (optional)

If the prompt is going to be reused across a team, invoke `craftkit-autoresearch`. It's worth the effort only when a handful of comparable prompts already exist in the repo or team wiki. Otherwise skip.

Expected output: a short list of patterns worth adopting (e.g., severity labels, standard review checklists) and patterns to avoid (e.g., hard-coded linter rules that duplicate tooling).

## What to take from this example

- **Reflect before rewriting.** One diagnostic pass usually reveals whether the fix is structural or cosmetic.
- **Tune with minimal diffs.** The final prompt is recognizable as an evolution of the original, not a replacement.
- **Loop stops early on purpose.** Two iterations that flatten is a success signal, not a failure to try harder.
- **Autoresearch is opt-in.** It pays off with scale; for a one-off prompt, it's overhead.
