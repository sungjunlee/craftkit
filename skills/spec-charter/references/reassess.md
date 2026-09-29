# Reassess mode

Use this reference for `spec-charter reassess`: a report-only review of whether the spec axis is stale. It helps the user decide between `spec-charter amend`, `spec-charter map`, `spec-grill`, or nothing.

Reassess diagnoses; it never writes. It does not edit charter direction, capability contracts, or harness files (`AGENTS.md` / `CLAUDE.md`), and "no change" is a legitimate — usually the default — answer. Do not manufacture churn because a reassessment was requested.

## When it is worth running

- A major model, coding-agent tool, or harness change affects how agents read instructions or preserve context.
- An active project has gone 3–6 months without a spec health review.

## Evidence

Start narrow and widen only when the evidence asks for it: the spec sections the question is about, capability blocks the evidence names, optional repo helpers (for example a `component-lint.js --json` routing check, when a backlog tool provides one), and a handful of recent execution logs such as completed sprint files. Read harness files only when the question is about harness behavior; they are development context, not product authority.

A missing script is skipped and said so. A missing `spec/charter.md`, `spec/system-map.md`, or `spec/capabilities.md` is an opt-in state with a next-step recommendation, not an error.

## Report

Keep evidence (what was observed) separate from recommendation (what the user may choose to do). A quick reassess for a narrow question conveys the evidence, what still holds, and one recommended next step. A periodic health check or explicit request for the full report may also list candidates by destination. One worked shape:

```md
## Reassess Report

### Evidence
- <file or script signal and what it means>

### No Change
- <area that still matches current evidence>

### Candidates
- map: <area> — evidence: <signal>; suspected change: <shape/boundary/flow/invariant/pointer>
- grill: <capability> — evidence: <signal>; suspected change: <contract area>
- amend: <charter item> — evidence: <signal>; suspected change: <direction/objective/decision>

### Missing Evidence
- <what was absent or skipped>

### Recommended Next Step
- <one command or human action>
```

## Where a finding routes

- **No change** — Learnings are sparse, recent, and consistent with the contracts, and helper output shows no drift, unless the user supplied contrary context.
- **`spec-grill <capability>`** — repeated Learnings show a new durable behavior or constraint; current Behaviors cannot explain how recent work succeeded; a Hard Constraint keeps being worked around; the capability is over budget because contract text and Learnings are mixed; or the capability visibly owns work its Scope does not mention. Name the block and the suspected edit; do not rewrite it.
- **`spec-charter map`** — runtime boundaries changed across capabilities; a core flow gained a step, owner, or external system; a project-wide invariant is missing, stale, or contradicted; or the map has absorbed module detail that should be linked out.
- **`spec-charter amend`** — a repeated Learning changes multiple capabilities; an Objective no longer holds or no longer directs work (or, on an opt-in ladder charter, reads `validated` on implementation proof alone); a Non-Goal is repeatedly violated by accepted work; or a capability Decision is cross-cutting. Never weaken an Objective so the available proof looks sufficient.

Learnings themselves are agent-writable under their content rule; reassess does not recommend ordinary Learning edits. It flags only a Learning ready to *promote* to a standing Decision — a Grill Candidate for a capability rule, an Amend Candidate when it spans capabilities. Promotion is human-gated.

## Failure modes

- **Churn generator** — every reassess proposes edits. Allow "no change"; require evidence.
- **Semantic overreach** — counts from a script treated as proof of stale content. Label them signals, not conclusions.
- **Silent self-editing** — reassess edits while diagnosing. Route through amend, map, or grill.
- **Harness file as authority** — harness text treated as product truth, or rewritten during reassess.
- **Unbounded scan** — the whole repo read and drift invented. Start from the named sections and a bounded log window.
