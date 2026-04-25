# Eval Guide

An autoresearch loop is only as good as its evals. If the evals don't measure what you actually care about, the loop will optimize the wrong thing and produce a prompt that scores 100% but feels worse in real use.

## The golden rule

Every eval must have a stable scoring rule. Not a 1-7 vibe scale. Not an ungrounded impression. If two different agents (or reviewers) couldn't score the same output and mostly agree, the rubric is not explicit enough — tighten it before running baseline.

Preferred order: binary pass/fail > comparative win/tie/loss > fidelity pass/fail between pipeline stages.

## If your baseline scores near 100%, your suite is probably too loose

First-time eval suites skew toward *shape* — required sections, item counts, imperative phrasing — because those are the easiest checks to write. The agent following the target skill trivially produces that shape, so the binary suite saturates on the first run. A 100% baseline feels like success; it is almost always a warning that the suite doesn't measure the quality dimensions a real reviewer cares about. Mutating against a saturated suite optimizes noise — the loop cannot learn when every signal sits at ceiling.

**Quick diagnostic — before locking the suite, check:**

- Does the suite have any category beyond Structure and Length?
- Is there at least one Logic or Comparative assertion?
- Is there any severity or priority signal anywhere (e.g. ordering, labels, ranked items)?
- For each Logic or Comparative eval you drafted, can you name a concrete output the skill-as-written would plausibly produce that *fails* this check? Not "an output could fail" in principle — an output you actually expect the agent to generate from the baseline spec.

If two or more of the first three answers are "no," or the fourth question has no plausible failing output for any Logic eval you wrote, assume the suite is shape-only and will saturate. The first three catch missing categories; the fourth catches loose thresholds inside the right category. A Logic eval phrased as "≥1 dimension named" passes all category tests but still saturates if the skill always names ≥1 — the real quality bar might have been "≥2," or a different dimension entirely.

**Recovery path** (also applies if baseline already came back near 100%):

1. Read 3-5 real outputs from the saturated baseline side-by-side.
2. Name the quality dimensions the binary evals missed — the things that make one output genuinely better than another even though both "pass."
3. Add 2-3 new evals targeting those dimensions, at Tier 1-2 where possible (ordering checks, cross-section consistency, presence of severity labels, distinct-dimension checks).
4. Rebaseline. Proceed to the mutation loop only if the new baseline leaves real room to improve.

**Real example.** A first-pass autoresearch run against `craft-critique` (since folded into `craft-tune`) scored 9/9 (100%) on a four-assertion binary suite (five-section structure, ≤5 Issues items, imperative-lead Recommended changes, comparative actionability). Qualitative inspection of the three outputs surfaced four quality gaps the suite missed:

- Recommended-changes items mapped 1:1 to Issues items — no prioritization or consolidation.
- Minimal-rewrite-plan was a subset of Recommended-changes, not an ordered, prioritized sequence.
- Failure-modes frequently restated Issues in future tense instead of naming a distinct dimension.
- No severity or priority labels anywhere in Issues.

The fix was to add four new assertions targeting those dimensions before mutating — not to celebrate the 100%. After strengthening, the same baseline dropped to 43% on the new suite and a single Level-1 mutation (tightening the Output-format subsection descriptions) flipped it to 100%, confirmed by a deletion experiment that held score while shortening the spec.

A second instance followed 2026-04-12 on `craft-prompt`: a six-assertion suite (structure + two exclusion + two logic + inclusion) saturated at 18/18 across three inputs even though the first three diagnostic questions all passed. The loose spots were two Logic evals phrased as "≥1 dimension named" and "at least one placeholder" — the skill as-written always produced ≥1 of each. The quality bars that actually mattered were proportionality (≤4 blocks for small requests, not 6) and breadth (≥2 placeholders for reusable templates, not 1). Adding E8/E9 at those stricter thresholds dropped the baseline to 22/24 (91.7%); a single Level-1+3 mutation (a new "Sizing heuristic" block in the skill's Build step) flipped both failing evals, and a deletion experiment at exp-2 confirmed the rule is lean. This second instance motivated the fourth diagnostic question above.

## Eval types

### Binary evals (pass / fail)

Hard rules the output must satisfy. Each binary eval scores 1 for pass, 0 for fail. These are the backbone of autoresearch because they produce stable, reviewer-agnostic scores.

Examples: output contains exactly five H2 sections; output is valid JSON; output stays under 500 words; every recommendation begins with an imperative verb.

### Comparative evals (win / tie / loss)

A/B comparisons on subjective quality dimensions. Win = 1, tie = 0.5, loss = 0 against a fixed reference (typically the baseline). Use sparingly — two per suite is usually enough. They require an LLM judge with an explicit rubric, and the judge itself can drift.

Examples: is the review more actionable than baseline? is the handoff prompt easier to skim? is the reasoning clearer at equal length?

**Only compare outputs from the same input.** Comparing mutated prompt A on input X against baseline on input Y tells you nothing.

### Fidelity evals (multi-skill pipelines only)

Pipeline-stage consistency. Same pass/fail shape as binary, applied across boundaries — e.g. craft-scaffold output fully covers the user's original request; craft-tune's Changelog entries each trace to a Diagnostics item from the same pass.

## Scoring

- Binary pass = 1, fail = 0
- Comparative win = 1, tie = 0.5, loss = 0
- Fidelity pass = 1, fail = 0
- `max_score = Σ(eval_weights) × runs_per_experiment × num_inputs`

Record numerator and denominator, not just a percentage. `11/12` keeps the sample-size signal that `91.7%` loses.

## Determinism hierarchy

Prefer the highest-determinism check available. More determinism means more stable scores and less optimization of noise.

- **Tier 1 — Deterministic**: regex, required-section presence, file existence, JSON/YAML parse, char/item counts with bounds.
- **Tier 2 — Structural**: heading hierarchy, table shape, code-block formatting, schema-level structure.
- **Tier 3 — LLM-as-judge**: tone, usefulness, completeness, quality, or any subjective criterion that cannot be checked programmatically.

**Target at least half the eval suite at Tier 1 or Tier 2.** If most evals are Tier 3, scores will drift between runs and the loop will chase noise.

## Assertion categories

When drafting evals, pull from these six categories. You don't need all six — pick the ones that matter for your skill. This is orthogonal to the determinism hierarchy: "category" is *what* you're checking, "tier" is *how reliably* you can check it.

### Structure
- Output contains all required sections/headings?
- Sections in the correct order?
- Markdown/formatting valid (code blocks, lists, tables)?

### Length
- Total length within bounds?
- Each section within its limit?
- Sentences/paragraphs within limits?

### Inclusion
- Required keywords or terms present?
- Specific numbers, data points, or examples included?
- Call-to-action present where required?
- Rules from reference files reflected in the output?

### Exclusion
- Banned words/phrases absent? (e.g. synergy, leverage, game-changer)
- Banned formats absent? (e.g. em dash, emoji)
- AI-isms absent? ("As an AI...", "I'd be happy to...", "Here's the kicker")

### Format
- Output file type correct (JSON, Markdown, .docx)?
- Filename follows naming convention?
- Metadata/frontmatter complete and correct?

### Logic
- Input values accurately reflected in output?
- Calculations correct?
- External data references accurate?

### Comparative (for any skill with subjective quality)
- Output better than baseline on one specific dimension (layout appeal, tone consistency, code readability, information hierarchy)?

**How to use**: scan each category and ask "does this apply to my skill?" Extract 3-6 binary checks from Structure/Length/Inclusion/Exclusion/Format/Logic. If your skill has subjective quality, also add 0-2 comparative checks — those push quality beyond rule compliance.

## Turning subjective criteria into binary checks

The hardest part of eval design: your real quality standards *feel* subjective. Here's how to decompose them.

**The technique**: ask *"what would I point to if I had to prove this to someone?"*

| Subjective criterion | Binary decomposition |
|---|---|
| "Professional tone" | No emoji + max 1 exclamation mark + no casual contractions (gonna, wanna) |
| "Well-structured" | 3+ H2 headings + each section has 2+ paragraphs |
| "References the source material" | Contains 5+ keywords from the reference file |
| "Engaging opening" | First sentence contains a specific claim, story, or question (not a generic statement) |
| "Actionable content" | Contains 3+ concrete steps the reader can do today |
| "Appropriate length" | Total word count between 1500-3000 |
| "Natural Korean writing" | No em dash + uses ~해요 체 + no direct English loan-phrases where Korean equivalents exist |

**Warning**: you'll never capture 100% of a subjective quality through binary checks — that's OK. The human review phase catches what the evals miss. The goal is to automate the 80% that *is* checkable.

## Eval quality check

Before locking the suite, run this three-question test on every eval:

1. Would two different reviewers likely score the same output the same way?
2. Could the artifact game this check without actually becoming better?
3. Does this check capture something the user actually cares about?

If any answer is weak, tighten or replace the eval. An eval that fails this check will contaminate the rest of the loop.

## Drafting evals with an agent

When you're stuck, ask an agent for a draft — but give it the category taxonomy so it doesn't hallucinate structure. Copy-paste template:

```text
Analyze the SKILL.md below and produce an evals.json file.

Requirements:
- 3-5 test prompts covering different scenarios (common case, edge case,
  complex case, previously-failing case, reference-file-required case).
- 4-6 binary assertions per prompt. Every assertion must be judgeable
  as true/false.
- Tag each assertion with a category from: structure, length, inclusion,
  exclusion, format, logic.
- Convert any subjective criteria into specific, observable signals using
  the "what would I point to to prove this?" technique.
- Optionally add 1-2 comparative assertions for subjective quality.
- Target at least half the assertions at Tier 1-2 (deterministic or structural).

SKILL.md:
<paste SKILL.md here>
```

The agent's draft won't be perfect. Review it against the Eval quality check before running baseline. The human review phase of the main loop will also surface evals that don't work in practice.

## evals.json schema

Structure evals as JSON for reuse and potential automation:

```json
{
  "skill_name": "craft-tune",
  "evals": [
    {
      "id": 1,
      "prompt": "Improve this 50-line auth function review prompt so outputs are consistent across agents.",
      "inputs": ["runs/inputs/auth-fn-prompt.txt"],
      "assertions": [
        {
          "text": "Output contains exactly five H2 sections: Intent preserved, Diagnostics, Revised artifact, Changelog, Tradeoffs.",
          "type": "binary",
          "category": "structure",
          "tier": 1,
          "pass": "All five H2 headings present in order",
          "fail": "Missing any heading or out of order"
        },
        {
          "text": "Diagnostics section contains 1-5 items, each with a severity tag (HIGH/MED/LOW).",
          "type": "binary",
          "category": "length",
          "tier": 1
        },
        {
          "text": "Every Changelog entry names all three fields (changed / why / effect).",
          "type": "binary",
          "category": "inclusion",
          "tier": 2
        },
        {
          "text": "Is the revision more reviewable than baseline?",
          "type": "comparative",
          "category": "comparative",
          "tier": 3,
          "rubric": "A revision is 'more reviewable' when a reader can trace each Changelog entry to a specific Diagnostics item without asking clarifying questions."
        }
      ]
    }
  ]
}
```

Design guidelines:

| Field | Recommendation | Reason |
|---|---|---|
| Test prompts | 3-5 | Variety without excessive cost |
| Assertions per prompt | 4-6 | Coverage without overwhelm |
| Total assertions | 15-30 | Statistically meaningful pass rate |
| Assertion text | Natural-language yes/no | So an agent grader can judge it |

## Anti-patterns

- **All-LLM-as-judge suites.** Scores drift, the loop chases noise, the judge becomes a bias.
- **Evals that encode specific wording.** The skill will overfit to that wording instead of the underlying quality. Prefer principle-level checks.
- **Hidden-weight scoring.** If some evals matter more, state the weights. Equal-weight is a valid choice — but make it a *choice*.
- **No comparative eval at all.** If nothing captures quality beyond structure, a well-formatted but shallow output scores full marks.
- **Unbounded eval count.** Every new eval adds noise surface. Six to eight evals cover most skills well; more than ten usually means you're over-specifying.
- **Overfitting evals (teaching to the test).** If evals are too specific to the test inputs, the skill gets better at those scenarios and worse at everything else. Write evals at the principle level, not the micro-rule level.
- **Overlapping evals.** "Is it grammatically correct?" + "Any spelling errors?" double-counts. Each eval should test something distinct.

## When the scores look fine but real use does not

This is the false-positive scenario. The loop has optimized for the evals, not the underlying quality. Recovery:

1. Collect 10+ real outputs from the accepted version.
2. For each, note whether it feels genuinely better than baseline.
3. Where the evals said "pass" but the output feels worse, identify the quality dimension the evals missed.
4. Add or replace evals to cover that dimension. Tag the new evals with `"source": "false-positive-correction"` so the history is readable.
5. Re-run from a fresh baseline.

False-positive tracking is part of a healthy autoresearch cycle, not a failure mode. The first eval suite is almost always incomplete; that's fine as long as you keep revising it against real outputs.

**When to run the check**: after 10+ real-world outputs with performance signal, or monthly — not after every experiment. Account for external factors (seasonal changes, model upgrades).
