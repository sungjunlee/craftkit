---
name: spec-grill
argument-hint: "[natural-language request]"
description: "Create or refine spec/capabilities.md from repo signals when a consumer, a cross-tree contract, or a 3-axis audit needs it. Use for capability specs, component contracts, middle-layer specs, repo boundaries, 능력 명세, or grill."
disable-model-invocation: true
compatibility: Requires git.
metadata:
  related-skills: "spec-charter, dev-backlog, backlog-triage"
---

# spec-grill

Author `spec/capabilities.md`, the middle layer between `spec/charter.md` and day-to-day execution work. The file is optional: create it only when a keep condition holds, amend it if it already exists. It is not a file generated from a directory listing, and not the second step of a required pipeline.

## Execution contract

### Intent router

Report by default. Read the request and take the safest reading of it; the user never has to memorize arguments or mode names. Write to `spec/capabilities.md` only on clear edit intent — "write it", "add the missing capability", "문서 적을 건 적고" — or after the user confirms a proposed edit. Everything else — diagnosis, candidate discovery, single-capability review, and an audit that judges existing contracts for stale, overlapping, weak, or unsupported predicates — ends in a report, and when intent is unclear, prefer report-only. Capability slugs are lowercase singular handles; the nuance belongs in Goal/Scope prose, not in the slug.

### Helper scripts

Resolve helper scripts from the installed `spec-grill` skill directory, not from the target repo. In a source checkout, that means the local `scripts/` directory beside this `SKILL.md`. Always pass the target repo explicitly (`--repo-root <target-repo>`) so helpers do not inspect the skill directory by accident.

On a brownfield repo with no `spec/capabilities.md`, or when candidate evidence is requested, run `node <skill-dir>/scripts/extract-signals.js --repo-root <target-repo> --json` first. The script reports raw capability evidence. It never writes `spec/capabilities.md`; admission, merging, splitting, and naming belong to this skill.

Use-or-delete checkpoint 2026-12-20: see `docs/status.md`.

### Completion contract

Close every run with a summary the reader can judge without redoing the search. It names the evidence read (which file or signal, and what it proves) and the evidence missing that weakens confidence; every candidate admitted, merged, split, or refused, each with its raw signal, supporting evidence, and missing evidence kept apart; the predicates rejected or rewritten, constraints added, and any Behavior promoted to a Hard Constraint; the capability blocks created or edited, or that nothing was written; the learnings recorded, and the promotions actually completed versus still proposed; and one recommended edit — a specific edit, "no edit yet", or "stop after charter (plus map on brownfield)" — with the keep conditions below applied to it. There is no fixed section skeleton, and length follows the run: a single-capability review closes in a paragraph, a whole-repo pass needs more. `references/grill-report-template.md` is one worked shape, not a required one.

Diagnosis comes before mutation, even on clear edit intent: state the evidence and the proposed block, then write `spec/capabilities.md` only when the user asked for that edit or confirms it. The one exception is `### Learnings`: an entry that follows the content rule may be added, updated, or deleted without this gate.

## Brownfield signal rules

Signals carry different authority. README, `spec/charter.md`, and issues are product authority; source directories are repo-structure evidence; commit scopes are history; `CLAUDE.md`/`AGENTS.md` are development-harness context that may seed questions about conventions and workflow but never establishes a capability boundary by itself.

Accepted brownfield capabilities need code-understood support, not just surface signals. Normally require at least two evidence classes — system-map boundary plus scripts, source surface plus tests, README/product signal plus command surface, recurring commits plus docs or tests. A single strong user statement may override this, but the report must say so explicitly.

## File shape

`spec/capabilities.md` lives at the target repo root in `spec/`. The single-file shape is intentional while the spec remains compact: target 5-10 capabilities, warn above 12 capabilities or 400 lines, and split only above 500 lines, above 15 capabilities, or when ownership boundaries demand separate review paths. The file's mutation discipline:

- Goal / In-scope / Out-of-scope: human-gated through this skill.
- Expected Behaviors / Hard Constraints: human-gated and must pass the 3-axis predicate test.
- `## Learnings`: not an interview target. Any agent or human may add, update, or delete an entry that follows the content rule stated under each `### Learnings` block in `templates/capabilities.md` (one lesson with its why; no duplicates; delete when wrong). Promoting a Learning to a standing `## Decisions` row or to `spec/charter.md` stays human-gated.
- `## Decisions`: standing decisions, human-gated; rewrite a row in place when a decision flips, remove it once the rejection reason no longer holds; promote cross-cutting decisions to `spec/charter.md` through `spec-charter amend`.

## Keep conditions

Create `spec/capabilities.md` only when at least one holds:

- a consumer exists
- the contract is cross-tree, not the same as a directory
- the user asked for a 3-axis audit

If the file already exists, this skill may amend it. A bare invocation may still emit a report. If the file is absent and none hold, the recommended edit is stop after charter (plus map on brownfield); do not create the file. Directory names alone are not a keep condition.

## Capability admission test

Admit a capability only when most of these are true:

- It is a repeated decision boundary, not just a directory name or commit scope.
- It is supported by at least two evidence classes in brownfield mode, unless the user explicitly authorizes a single-source capability.
- It owns a primary destination for captured learnings.
- Its Goal can be stated as an observable user or operator outcome.
- Its Behaviors and Hard Constraints differ meaningfully from neighboring candidates.
- If two candidates share nearly all predicates, merge them.
- If one candidate needs more than five Behaviors to feel complete, split it along the contract boundary the extra Behaviors describe.

## Per-capability contract

An accepted capability block carries four things. Three Behaviors and two Hard Constraints are budgets against bloat on a first pass, not an order to walk and not a count to hit — gather them however the conversation runs, and add more on a later rerun.

- **Goal** — one sentence naming what the user can observe when this works. Diagnosis-side framing belongs in the charter. Goals do not go through the 3-axis test; check plain-language observability instead.
- **In-scope / Out-of-scope** — what this capability owns, and the boundary it deliberately respects. Out-of-scope is what prevents creep.
- **Expected Behaviors** — verifiable predicates, each passing the 3-axis test below. Reject and rewrite until they do.
- **Hard Constraints** — bright lines this capability never crosses even if asked. Adversarial-Goodhart defenses live here.

## The 3-axis predicate test

Every Behavior and Hard Constraint must pass all three axes before it is committed; one that fails any axis is rewritten or split, never rubber-stamped. The rationale and a worked example live in [`docs/methodology/predicate-test.md`](../../docs/methodology/predicate-test.md).

1. **Authority axis.** Would the user be unhappy if an agent satisfied this measurably but in a way that ignored their intent? If yes, encode the missing intent as a sharper Behavior or promote it to a Hard Constraint.
2. **Distributional axis.** Does this predicate hold in unseen code areas or unseen workloads? If no, restate it as environment-independent or scope it to the conditions where it holds.
3. **Manipulability axis.** Can an agent satisfy this by editing the measurement channel rather than the system? If yes, add a structural restriction outside the spec, not just sharper prose.

Classify positive normal outcomes as Expected Behaviors. Classify bright-line negations and anti-Goodhart guards as Hard Constraints. When both forms fit, prefer the Hard Constraint only when the negative form protects against an optimization or data-loss shortcut.

## Writing rules

Copy `templates/capabilities.md` to `spec/capabilities.md` at the repo root only when a keep condition holds and the user has accepted a first capability edit, then write only the accepted capability. On rerun, edit only the named capability block and leave the rest of the file untouched. Do not bump a revision number; `git blame` is the source of truth. Echo charter Decisions at capability level only when they explain a Behavior or Hard Constraint, and promote cross-cutting capability Decisions through `spec-charter amend`.

## References

- `references/capabilities.md` — grill heuristics: naming, Goal rewrites, 3-axis examples, admission patterns, count budgets.
- `references/grill-report-template.md` — an optional worked report shape, not a required skeleton.
- `references/spec-pipeline-ready.md` — lightweight ready-to-commit checklist when capability contracts are in scope.
- `references/verification.md` — prose test cases for reviewing spine changes.
- `templates/capabilities.md` — the file skeleton copied into a repo on a first accepted edit.
- [`../spec-charter/SKILL.md`](../spec-charter/SKILL.md) — the charter layer; the single Objectives-vs-Behaviors/Hard-Constraints ownership rule lives in [`../spec-charter/references/spec-axis.md`](../spec-charter/references/spec-axis.md).
