---
name: spec-charter
argument-hint: "[create|amend|reassess|map]"
description: "Create, amend, or reassess spec/charter.md (project direction) and spec/system-map.md (system shape)."
disable-model-invocation: true
compatibility: Requires git.
metadata:
  related-skills: "spec-grill, dev-backlog, backlog-triage"
---

# spec-charter

Own `spec/charter.md` (direction: what good looks like and why) and `spec/system-map.md` (system shape: boundaries, flows, invariants, pointers). Capability contracts in `spec/capabilities.md` belong to `spec-grill`. File roles, topology, the harness pointer, and the legacy root `CHARTER.md` fallback live in `references/spec-axis.md`. This skill ships no scripts: inspect the target repo directly and keep paths target-repo-relative.

The charter stays under a ~5-minute read; operational how-to belongs in harness files or an operational notes file (such as `_context.md`), not the charter. Absence is supported — projects opt in by creating the files.

## Execution contract

### Mode router

Explicit mode words win. Next, intent: `map` for system shape, architecture, runtime boundaries, flows, invariants, or `spec/system-map.md`; `reassess` for a report-only staleness or spec-health check. Only then file state: `create` when neither `spec/charter.md` nor a legacy root `CHARTER.md` exists, otherwise `amend` — taking the `reset` path when the user describes a concept change rather than an edit. Capability contracts route to `spec-grill`.

### Completion contract

Every run names the files created or changed, what was refused or parked (a refused harness pointer counts), and one next action in plain language — never a memorized argument. Done means:

- `create`: the charter exists at revision 1, unresolved assumptions are listed, and a brownfield repo without a system map has continued into `map`.
- `amend`: only the confirmed diff is applied, `last_amended` and `revision` are bumped, and the charter still reads in about five minutes.
- `map`: the map is evidence-backed, charter and capability changes are routed out, and the run ends with `Evidence Read` and `Evidence Missing`.
- `reassess`: nothing was written; the report ends with one recommended next action or "no change".

## Mutation discipline

| Tier | Sections | Discipline |
|------|----------|------------|
| **1 · Direction** | Problem, Approach, Non-Goals | Human-gated: challenge → propose diff → confirm → apply. |
| **2 · Predicates** | Objectives | Adding or removing is human-gated. IDs are stable and never reused; retire by deleting the line and listing the ID under `Retired IDs (never reuse)` — git keeps the text. |
| **3 · Standing** | Decisions | Human-gated. Rewrite a row in place when a decision flips (one clause on why the old position was left); remove it once its rejection reason no longer holds. |

Objectives are verifiable predicates, not tasks, written lean as `- O1 — <predicate> · src: user|inferred|execution` (`references/objectives.md`). They are status-free by default; if a charter already uses status tokens, keep them and follow `references/amendment.md`, but never add tokens to a lean charter. Keep structural labels in English; otherwise follow the repo's README language and the user.

Every charter write — create or amend — goes in one confirm together with any harness pointer proposal (`references/spec-axis.md`), and only confirmed changes are applied. A user's explicit request for autonomous progress counts as that confirm; mark inferred claims `src: inferred` and list what stayed unresolved.

## Modes

**Create.** Draft from product signals — README, issues, changelog, shipped behavior. Harness files (`CLAUDE.md`, `AGENTS.md`) inform workflow but are not product authority unless they explicitly describe product boundaries. When signals conflict, surface the conflict rather than picking silently. Settle Problem, Approach, Non-Goals, and initial Objectives with the user (`references/create.md` has signal and framing notes), then propose from `templates/charter.md`. Seed Decisions only from choices that still stand in existing ADRs or merged PRs.

**Amend.** Apply the tier discipline above. A legacy root `CHARTER.md` is migrated deliberately, not forked; a brownfield repo still without a system map then continues into `map`. On **reset**, bump `revision` and rewrite Tier 1–3 under the usual confirm; retired Objective IDs stay retired, and one line `Previous charter: git <sha>` goes below the Decisions table. A `backlog-triage` Alignment Check may seed proposals (`references/alignment.md`); this skill applies the gates.

**Map.** Build the map from repo evidence and the resolved charter, not from directory names; report the evidence in the conversation, not as inventory inside the map. Sections, from `templates/system-map.md`: System Shape, Runtime Boundaries, Core Flows, Storage And External Systems, Project-Wide Invariants, Where To Go Next — short, linking out rather than expanding subsystem detail. Runtime Boundaries come from existing nested instruction files; a tree with none shows `none` under Evidence Missing and is never invented. Label brownfield uncertainty as an assumption. Add Candidate Capability Boundaries only when a `spec-grill` keep condition holds, as `- \`<slug>\` - evidence: …; owns: …; uncertainty: …`. On amend, change only project-wide shape and demote helpers, single endpoints, and deploy commands. The map is not an API reference, runbook, or module inventory (`references/system-map.md`).

**Reassess.** Report only; never edit. Read bounded evidence — the named spec sections plus a handful of recent execution logs — and say what was skipped rather than widening the scan. The default verdict is "no change"; anything else routes to `amend`, `map`, `spec-grill`, or a human-gated promotion of a Learning to a standing Decision. On a brownfield repo without a system map, recommend `map` before grill. `references/reassess.md` has a fuller report shape for periodic health checks.

## References

- `references/spec-axis.md` — file boundaries, topology, harness pointer, nested instruction files, grill keep/fold, legacy `CHARTER.md` fallback.
- `references/create.md` — create-mode signals, framing notes, seed Decisions.
- `references/amendment.md` — challenge checklist, opt-in status gate, bloat checks.
- `references/objectives.md` — predicate examples, rewrite patterns, 30-second test.
- `references/alignment.md` — work-to-objective mapping for triage/backlog consumers.
- `references/system-map.md` — map heuristics, quality checks, failure modes.
- `references/reassess.md` — report-only stale-spec review.
- `references/verification.md` — prose test cases for reviewing spine changes.
- `templates/charter.md` — starting shape for `spec/charter.md`.
- `templates/system-map.md` — starting shape for `spec/system-map.md`.
- [`../spec-grill/SKILL.md`](../spec-grill/SKILL.md) — companion skill for `spec/capabilities.md`.
- [`../spec-grill/references/spec-pipeline-ready.md`](../spec-grill/references/spec-pipeline-ready.md) — landing checklist when capability contracts are in scope.
