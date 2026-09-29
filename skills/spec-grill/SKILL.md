---
name: spec-grill
argument-hint: "[natural-language request]"
description: "Create, refine, or audit spec/capabilities.md — capability contracts between the charter and day-to-day work — from repo evidence."
disable-model-invocation: true
compatibility: Requires git.
metadata:
  related-skills: "spec-charter, dev-backlog, backlog-triage"
---

# spec-grill

Author `spec/capabilities.md`, the middle layer between `spec/charter.md` and day-to-day execution work. The file is optional: create it only when a keep condition holds, amend it if it already exists. It is not generated from a directory listing and is not a required step after the charter.

## Execution contract

### Intent router

Report by default, taking the safest reading of the request; the user never has to memorize mode names. Write to `spec/capabilities.md` only on clear edit intent ("write it", "add the missing capability", "문서 적을 건 적고") or after the user confirms a proposed edit — and even then, state the evidence and the proposed block first. Diagnosis, candidate discovery, single-capability review, and audits of existing predicates end in a report. The one exception to the write gate is `## Learnings` (below).

### Helper scripts

`node <skill-dir>/scripts/extract-signals.js --repo-root <target-repo> --json` reports raw capability evidence for a whole-repo candidate pass; run it when that seed helps, and resolve it from the installed skill directory, always passing the target repo explicitly. It never writes `spec/capabilities.md` — admission, merging, splitting, and naming stay here. Use-or-delete checkpoint 2026-12-20: see `docs/status.md`.

### Completion contract

Close with a summary the reader can judge without redoing the search: evidence read and evidence missing; each candidate admitted, merged, split, or refused with its supporting and missing evidence kept apart; predicates rejected or rewritten and constraints added; what was written to the file, or that nothing was; learnings recorded and promotions done versus proposed; and one recommended edit — a specific edit, "no edit yet", or "stop after charter (plus map on brownfield)". Length follows the run; `references/grill-report-template.md` is one worked shape for a wide pass.

## Keep conditions

Create `spec/capabilities.md` only when at least one holds: a consumer exists; the contract is cross-tree, not the same as a directory; or the user asked for a 3-axis audit. If the file is absent and none hold, the recommended edit is stop after charter (plus map on brownfield). An existing file may always be amended.

## Evidence and admission

README, `spec/charter.md`, and issues are product authority; source directories are structure evidence; commit scopes are history; `CLAUDE.md`/`AGENTS.md` are harness context that may seed questions but never establish a boundary by themselves.

Admit a capability when it is a repeated decision boundary rather than a directory name or commit scope, with a Goal stated as an observable outcome, a natural home for learnings captured from work, and Behaviors that differ meaningfully from its neighbors. On brownfield repos require at least two evidence classes (for example system-map boundary plus scripts, or README signal plus tests); a single strong user statement may override this if the report says so. Merge candidates that share nearly all predicates; split one that needs more than five Behaviors along the boundary the extra Behaviors describe.

## Per-capability contract

- **Goal** — one sentence naming what the user can observe when this works; checked for plain-language observability, not the 3-axis test.
- **In-scope / Out-of-scope** — what it owns and the boundary it deliberately respects.
- **Expected Behaviors** — verifiable predicates that pass the 3-axis test. About three on a first pass.
- **Hard Constraints** — bright lines never crossed even if asked; anti-Goodhart guards live here. About two on a first pass.

Positive normal outcomes are Behaviors; bright-line negations are Hard Constraints. When both fit, prefer the constraint only when the negative form guards against an optimization or data-loss shortcut.

## The 3-axis predicate test

Every Behavior and Hard Constraint passes all three axes before it is committed; one that fails is rewritten or split, never rubber-stamped. Rationale and a worked example: [`docs/methodology/predicate-test.md`](../../docs/methodology/predicate-test.md).

1. **Authority.** Would the user be unhappy if an agent satisfied this measurably while ignoring their intent? Encode the missing intent as a sharper Behavior or a Hard Constraint.
2. **Distributional.** Does it hold in unseen code areas and workloads? Restate it environment-independently or scope it to where it holds.
3. **Manipulability.** Can an agent satisfy it by editing the measurement channel rather than the system? Add a structural restriction outside the spec, not just sharper prose.

## File discipline

Target 5–10 capabilities in one file; warn above 12 or 400 lines, split only above 15, 500 lines, or when ownership needs separate review paths. On a first accepted edit, copy `templates/capabilities.md` and write only the accepted capability; on rerun, edit only the named block. No revision number — `git blame` is the history.

- Goal, Scope, Behaviors, Hard Constraints: human-gated through this skill.
- `## Learnings`: any agent or human may add, update, or delete an entry that follows the content rule in `templates/capabilities.md` (one lesson with its why; no duplicates; delete when wrong). Not an interview target.
- `## Decisions`: standing, human-gated — rewrite a row in place when a decision flips, remove it once its rejection reason no longer holds. Promoting a Learning to a Decision, or a cross-cutting Decision to the charter via `spec-charter amend`, is human-gated. Echo charter Decisions only when they explain a Behavior or Hard Constraint.

## References

- `references/capabilities.md` — naming, Goal rewrites, 3-axis examples, admission patterns, count budgets.
- `references/grill-report-template.md` — an optional worked report shape.
- `references/spec-pipeline-ready.md` — ready-to-commit checklist when capability contracts are in scope.
- `references/verification.md` — prose test cases for reviewing spine changes.
- `templates/capabilities.md` — the file skeleton copied on a first accepted edit.
- [`../spec-charter/SKILL.md`](../spec-charter/SKILL.md) — the charter layer; the Objectives-vs-Behaviors/Hard-Constraints ownership rule lives in [`../spec-charter/references/spec-axis.md`](../spec-charter/references/spec-axis.md).
