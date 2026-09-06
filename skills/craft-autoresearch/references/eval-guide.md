# Eval guide

An autoresearch loop is only as good as its evals. If the evals don't measure what you actually care about, the loop will optimize the wrong thing and produce a prompt that scores 100% but feels worse in real use.

## The golden rule

Every eval must have a stable scoring rule. Not a 1-7 vibe scale. Not an ungrounded impression. If two different agents (or reviewers) couldn't score the same output and mostly agree, the rubric is not explicit enough — tighten it before running baseline.

Preferred order: binary pass/fail > comparative win/tie/loss > fidelity pass/fail between pipeline stages.

## When the baseline scores near the ceiling

A high baseline has two very different causes, and what to do next depends on which one it is.

**The artifact may already meet the bar.** The stop condition is a target, not an obstacle. If the baseline satisfies it, the honest report is "already meets the criteria — no change needed," with the numbers behind it. Mutating anyway to manufacture a delta optimizes the suite rather than the artifact.

**Or the suite may only measure shape.** First-time suites skew toward required sections, item counts, and imperative phrasing, because those are the easiest checks to write — and they are exactly the checks the target trivially satisfies. A suite like that cannot separate a good output from a better one, so a ceiling score says nothing about quality.

Real outputs are what tell the two apart. Read a handful side by side and ask whether the ones you prefer are actually scoring higher. If they are, the score is real. If good and mediocre outputs score identically, the suite is measuring form.

**Questions worth asking before locking a suite:**

- Does at least one eval measure the outcome the user cares about, rather than the form of the answer?
- Is there any category beyond Structure and Length — Logic, Grounding, Consistency, Action safety, Comparative?
- For each non-shape eval, can you name a concrete output the target-as-written would plausibly produce that *fails* it? Not "an output could fail in principle" — one you actually expect. A Logic eval phrased as "≥1 dimension named" passes every category test but still sits at ceiling if the target always names ≥1; the real bar may have been "≥2," or a different dimension entirely.

**Strengthening the suite** — when real outputs show a requirement the evals miss:

1. Name the dimension the evals missed: the thing that makes one output genuinely better than another even though both pass.
2. Add evals for that dimension, as deterministic as the dimension allows.
3. Freeze the criteria and rebaseline. From there the suite stays fixed for the rest of the session.

Two rules keep this honest. **Strengthen on evidence, not on the score** — a ceiling score is not itself evidence that the suite is wrong; an output someone can point at is. And **freeze after strengthening** — criteria that keep moving while the loop runs make every before/after comparison meaningless, and make it easy to keep raising the bar until some mutation looks necessary.

### Historical observations (non-normative)

Two past CraftKit runs, kept as a record of what saturation looked like in practice. They are observations from single sessions, not rules and not evidence about what the next run will find.

- **`craft-critique`, first pass.** A four-assertion binary suite (five-section structure, ≤5 Issues items, imperative-lead Recommended changes, comparative actionability) scored 9/9. Reading the three outputs surfaced dimensions the suite did not touch: recommendations mapped 1:1 to issues with no prioritization or consolidation; the rewrite plan was a subset of the recommendations rather than an ordered sequence; failure modes restated issues in future tense; no severity labels anywhere. Assertions for those dimensions dropped the same baseline to 43%, and a Level-1 mutation moved it back up. The winning mutations encoded the dimensions as fixed format rules, which #150 later removed wholesale — see § The prescription ratchet.
- **`craft-prompt`, 2026-04-12.** A six-assertion suite saturated at 18/18 across three inputs even though its category coverage looked fine. The loose spots were two Logic evals phrased as "≥1 dimension named" and "at least one placeholder" — thresholds the skill always cleared. Stricter bars (proportionality: ≤4 blocks for small requests; breadth: ≥2 placeholders for reusable templates) dropped the baseline to 22/24. #210 later removed the block that fixed them while preserving the underlying signals in an outcome-driven workflow.

## The prescription ratchet

The saturation trap above has a mirror image on the mutation side. Format and structure evals are the cheapest to write and the cheapest to score, so suites over-sample them — and the easiest mutation that flips a failing format eval is a *tighter format rule* in the target's output contract. Run enough passes and the contract accretes fixed section lists, item caps, and anti-gaming clauses ("not a subset of…", "no future-tense restatement"). Every pass ends green; the artifact ossifies. That scaffolding once helped weaker models produce usable shape, but it constrains stronger models, which do better with judgment criteria — a statement of what the output must *convey* — than with a section template.

Worked example: the craft-critique run above. Its four added assertions named real quality gaps (prioritization, ordering rationale, distinct failure dimensions, severity labels), but the winning mutations encoded them as fixed format rules in the output contract, and follow-up passes tightened those further. By 2026-07 the accumulated template was removed wholesale and replaced with a judgment contract (#150; `docs/skill-anatomy.md` § Output judgment contracts). The quality dimensions were right; freezing them into shape rules was the ratchet.

Two rules keep a loop out of it:

- **Separate required formats from stylistic proxies.** When a real consumer requires a format — a parser, a schema, a downstream stage that breaks without it — producing that format *is* an outcome, and a check on it can lead a KEEP like any other outcome check. Repairing a genuine JSON/schema/interface failure is real work, not shape work. What stays a floor check is the arbitrary proxy with nobody behind it: section counts, heading templates, phrasing conventions, item caps. Those catch regressions and ride along as guards, but they never *lead* a KEEP — outcome and comparative evals do (is the output more actionable, more resumable, easier to review).
- **Prefer conveyance fixes over shape fixes when nothing requires the shape.** When the obvious mutation is "add a format rule to the output contract," first ask who consumes that format. If someone does, write the rule to their requirement and move on. If nobody does, check whether a judgment requirement — naming the signal the output must carry and letting shape scale with the artifact — flips the same failing eval. If the target already carries a judgment contract, don't score section shape at all; score whether each required signal is conveyed.

## Eval types

### Binary evals (pass / fail)

Hard rules the output must satisfy. Each binary eval scores 1 for pass, 0 for fail. These are the backbone of autoresearch because they produce stable, reviewer-agnostic scores.

Examples: output contains exactly five H2 sections; output is valid JSON; output stays under 500 words; every recommendation begins with an imperative verb.

### Comparative evals (win / tie / loss)

A/B comparisons on subjective quality dimensions. Win = 1, tie = 0.5, loss = 0 against a fixed reference (typically the baseline). Use sparingly — two per suite is usually enough. They require an LLM judge with an explicit rubric, and the judge itself can drift.

Examples: is the review more actionable than baseline? is the handoff prompt easier to skim? is the reasoning clearer at equal length?

**Only compare outputs from the same input.** Comparing mutated prompt A on input X against baseline on input Y tells you nothing.

### Fidelity evals (multi-skill pipelines only)

Pipeline-stage consistency. Same pass/fail shape as binary, applied across boundaries — e.g. `spec-charter` output defines each Objective before `spec-grill` admits capabilities against them; `craft-handoff`'s resume prompt carries every signal its rich doc records as blocking.

## Scoring

- Binary pass = 1, fail = 0
- Comparative win = 1, tie = 0.5, loss = 0
- Fidelity pass = 1, fail = 0
- `max_score = Σ(eval_weights) × runs_per_experiment × num_inputs`

Record numerator and denominator, not just a percentage. `11/12` keeps the sample-size signal that `91.7%` loses.

Suites this size do not establish statistical significance, and nothing in the loop should be reported as if they did. A handful of inputs times a handful of assertions is a working signal for KEEP/DISCARD, not a measurement with error bars — so report raw counts, describe a one- or two-point move as what it is (noise-sized), and let a re-run on the same inputs settle whether a small delta is stable.

## Train/holdout split

Small-suite score deltas are noise-dominated. If the loop optimizes and accepts against the same inputs, it can learn the quirks of those examples instead of the underlying quality bar. Use the train split for cheap KEEP/DISCARD decisions, keep holdout sealed during mutation, then run the final accepted artifact on holdout before reporting an improvement.

Sizing: 6-10 realistic inputs is a good working range, split roughly 70/30. Holdout needs at least 2 inputs, and those inputs should cover the same failure modes as train rather than easier happy paths. Example: 7 inputs usually means 5 train / 2 holdout; 10 inputs usually means 7 train / 3 holdout.

Acceptance rule: establish baseline train and holdout scores separately. During the mutation loop, run only train. At session end, run the final accepted artifact on holdout and accept the session as an improvement only if holdout does not regress against the baseline holdout score. If train improves but holdout regresses, the mutations are rejected: restore the mutable files from the baseline checkpoint, keep the log, report an overfit finding, and do not present the artifact as improved.

The holdout is spent once you look at it that way. Reading the failing holdout outputs is often the right call — it is what tells you whether the next move is a different mutation direction or a stronger suite — but those inputs are no longer sealed afterwards. Do not accept a later iteration against them while still calling them a holdout: either draw fresh inputs for the next acceptance gate, or report the acceptance and say plainly that the holdout was exposed during diagnosis. The same applies to baseline holdout failures: record the score, and keep the details out of what selects mutations.

Waiver: when a split genuinely isn't possible, record `holdout: waived (<reason>)` in the experiment contract. The cost is real and belongs in the report — with no sealed inputs there is no structural overfit gate, so the session's result is limited evidence about the artifact in general, however clean the train numbers look. A later re-run on fresh inputs is the cheapest way to check, if and when fresh inputs exist.

## Determinism hierarchy

Prefer the highest-determinism check available. More determinism means more stable scores and less optimization of noise.

- **Tier 1 — Deterministic**: regex, required-section presence, file existence, JSON/YAML parse, char/item counts with bounds.
- **Tier 2 — Structural**: heading hierarchy, table shape, code-block formatting, schema-level structure.
- **Tier 3 — LLM-as-judge**: tone, usefulness, completeness, quality, or any subjective criterion that cannot be checked programmatically.

Take the highest tier each criterion honestly supports. Some of what matters is genuinely Tier 3, and a forced-deterministic proxy for it measures the proxy. But a suite that is mostly Tier 3 will drift between runs, so if that is where you land, expect noisy deltas and say so rather than reading them as gains.

## Assertion categories

When drafting evals, pull from these categories. You don't need all of them — pick the ones that matter for your skill. This is orthogonal to the determinism hierarchy: "category" is *what* you're checking, "tier" is *how reliably* you can check it.

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

### Grounding
- Factual claims trace to provided context, retrieved sources, or named evidence?
- Citations or URLs support the claims they are attached to?
- Recency requirements are satisfied for time-sensitive claims?

A deterministic check here can only see *form* — that a citation is present, that a label was used. Whether the source actually supports the claim needs a reader or a judge. Treat presence checks as floor checks against unattributed claims, and don't report them as evidence that the output is grounded.

### Consistency
- Rules, examples, and exceptions agree with each other?
- Output follows the stated instruction hierarchy?
- Changelog or recommendation entries trace to diagnosed issues?

### Missing context
- Output asks a minimal clarifying question when required facts are unavailable?
- Output labels assumptions when proceeding without required facts?
- Output uses the expected lookup or source-check step before guessing?

### Action safety
- Destructive, published, or shared-system actions stay inside what the caller authorized, and unauthorized ones stop for confirmation? (Score the authorization, not the presence of a confirmation prompt — a workflow the user asked to run unattended should pass, and re-confirming it is the failure.)
- Any gate the task actually requires — a named approval, a dry run, a backup — is performed before the action?
- Tool or subagent use follows stated criteria instead of blanket persistence?
- The output distinguishes partially complete work from fully verified completion?

### Comparative (for any skill with subjective quality)
- Output better than baseline on one specific dimension (layout appeal, tone consistency, code readability, information hierarchy)?

**How to use**: scan each category and ask "does this apply to my skill?" Extract 3-6 binary checks from the relevant categories. For research and agentic prompts, usually include at least one Grounding, Missing context, or Action safety check. If your skill has subjective quality, also add 0-2 comparative checks — those push quality beyond rule compliance.

## Turning subjective criteria into binary checks

The hardest part of eval design: your real quality standards *feel* subjective. Here's how to decompose them.

**The technique**: ask *"what would I point to if I had to prove this to someone?"*

| Subjective criterion | Binary decomposition |
|---|---|
| "Professional tone" | No emoji + max 1 exclamation mark + no casual contractions (gonna, wanna) |
| "Well-structured" | 3+ H2 headings + each section has 2+ paragraphs |
| "References the source material" | Cites the reference file's own terms or sections rather than paraphrasing around it |
| "Grounded research" | Every factual claim in the recommendation paragraph carries either a cited source or a "not verified" label (a form check — whether the source supports the claim still needs a reader) |
| "Safe agentic behavior" | Every destructive, published, or shared-system action is either covered by the authorization the caller gave or stopped for confirmation, and each gate the task names (approval, dry run, backup) happens before the action |
| "No instruction conflicts" | No example contradicts a rule; every exception names the rule it overrides |
| "Engaging opening" | First sentence contains a specific claim, story, or question (not a generic statement) |
| "Actionable content" | Contains 3+ concrete steps the reader can do today |
| "Appropriate length" | Total word count between 1500-3000 |
| "Natural Korean writing" | No em dash + uses ~해요 체 + no direct English loan-phrases where Korean equivalents exist |

**Warning**: you'll never capture a subjective quality completely through binary checks — that's OK. The decomposition is a proxy: it makes the criterion scoreable, it doesn't make it measured. Human review catches what the proxies miss, and a proxy that the target can satisfy without getting better is worse than no eval at all.

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
- 6-10 test prompts covering different scenarios (common case, edge case,
  complex case, previously-failing case, reference-file-required case),
  split roughly 70/30 into train and holdout with at least 2 holdout prompts.
- 4-6 binary assertions per prompt. Every assertion must be judgeable
  as true/false.
- Tag each assertion with a category from: structure, length, inclusion,
  exclusion, format, logic, grounding, consistency, missing_context,
  action_safety.
- Convert any subjective criteria into specific, observable signals using
  the "what would I point to to prove this?" technique.
- For research, agentic, or high-impact prompts, include at least one
  assertion covering grounding, missing context, or action safety when relevant.
- Optionally add 1-2 comparative assertions for subjective quality.
- At least one assertion must measure the outcome the prompt exists for,
  not the shape of its answer.

SKILL.md:
<paste SKILL.md here>
```

The agent's draft won't be perfect. Review it against the Eval quality check before running baseline. The human review phase of the main loop will also surface evals that don't work in practice.

## evals.json schema

Structure evals as JSON for reuse and potential automation. Input paths are relative to the session run directory under `~/.craftkit/autoresearch/<target>/<YYYY-MM-DD-slug>/`, not to the repo being tuned:

```json
{
  "skill_name": "craft-handoff",
  "evals": [
    {
      "id": 1,
      "prompt": "Wrap up this refactoring session into a handoff doc and resume prompt.",
      "inputs": ["inputs/refactor-session.txt"],
      "assertions": [
        {
          "text": "Output contains both artifacts: the rich handoff doc and the resume prompt.",
          "type": "binary",
          "category": "structure",
          "tier": 1,
          "pass": "Both artifacts present and clearly separated",
          "fail": "Either artifact missing or merged into one undifferentiated block"
        },
        {
          "text": "The resume prompt names the current branch, dirty or untracked files, and the exact next command to run.",
          "type": "binary",
          "category": "inclusion",
          "tier": 1
        },
        {
          "text": "The handoff names the blocking decision or open question when the session has one.",
          "type": "binary",
          "category": "inclusion",
          "tier": 2
        },
        {
          "text": "Is the resume prompt easier to resume from than baseline?",
          "type": "comparative",
          "category": "comparative",
          "tier": 3,
          "rubric": "A resume prompt is 'easier to resume from' when a fresh agent can continue without re-deriving state from the conversation — no missing branch, file, or next-step signals."
        }
      ]
    }
  ]
}
```

Design guidelines:

| Field | Recommendation | Reason |
|---|---|---|
| Test prompts | 6-10 | Enough variety to support train/holdout without excessive cost |
| Holdout prompts | ≥2 | A final non-regression gate against train overfitting |
| Assertions per prompt | 4-6 | Coverage without overwhelm |
| Scored checks | 24-60 | Enough coverage to see a pattern after the split — not a significance threshold |
| Assertion text | Natural-language yes/no | So an agent grader can judge it |

## Anti-patterns

- **All-LLM-as-judge suites.** Scores drift, the loop chases noise, the judge becomes a bias.
- **Evals that encode specific wording.** The skill will overfit to that wording instead of the underlying quality. Prefer principle-level checks.
- **Hidden-weight scoring.** If some evals matter more, state the weights. Equal-weight is a valid choice — but make it a *choice*.
- **No comparative eval at all.** If nothing captures quality beyond structure, a well-formatted but shallow output scores full marks.
- **No grounding or safety evals for research/agentic prompts.** The loop may optimize format while preserving unsupported claims, premature finalization, or risky action behavior.
- **Unbounded eval count.** Every new eval dimension adds noise surface. Six to eight dimensions cover most skills well; more than ten usually means you're over-specifying.
- **Overfitting evals (teaching to the test).** If evals are too specific to the test inputs, the skill gets better at those scenarios and worse at everything else. Write evals at the principle level, not the micro-rule level.
- **Overlapping evals.** "Is it grammatically correct?" + "Any spelling errors?" double-counts. Each eval should test something distinct.

## When the scores look fine but real use does not

This is the false-positive scenario. The loop has optimized for the evals, not the underlying quality. Recovery:

1. Collect real outputs from the accepted version — enough to see a pattern rather than one bad run.
2. For each, note whether it feels genuinely better than baseline.
3. Where the evals said "pass" but the output feels worse, identify the quality dimension the evals missed.
4. Add or replace evals to cover that dimension. Tag the new evals with `"source": "false-positive-correction"` so the history is readable.
5. Re-run from a fresh baseline.

False-positive tracking is part of a healthy autoresearch cycle, not a failure mode. The first eval suite is almost always incomplete; that's fine as long as you keep revising it against real outputs.

**When to run the check**: once enough real-world outputs have accumulated to carry a signal — not after every experiment. Account for external factors such as model upgrades.
