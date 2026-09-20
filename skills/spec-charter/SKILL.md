---
name: spec-charter
argument-hint: "[create|amend|reassess|map]"
description: "Create or amend spec/charter.md and spec/system-map.md. Use for project direction, Objectives, system shape, stale spec, 기준, 헌장, 방향성, or spec axis."
disable-model-invocation: true
compatibility: Requires git.
metadata:
  related-skills: "spec-grill, dev-backlog, backlog-triage"
---

# spec-charter

Create and amend the spec-axis files this skill owns: `spec/charter.md` (direction) and `spec/system-map.md` (system shape). This skill is rerunnable. It ships no helper scripts: inspect the target repo directly and keep every path target-repo-relative, so a run never analyzes its own installation directory by accident. The single Objectives-vs-Behaviors/Hard-Constraints ownership rule lives in `references/spec-axis.md`.

## Execution contract

### Mode router

Explicit mode words win. Otherwise `create` when neither `spec/charter.md` nor a legacy root `CHARTER.md` exists; `map` when the request is about system shape, architecture, runtime boundaries, flows, invariants, or `spec/system-map.md`; `reassess` when it is a report-only staleness or spec-health check; everything else is `amend`, including the `reset` path when the user describes a concept change rather than an edit. Capability contracts, component boundaries, or `spec/capabilities.md` route to `spec-grill`.

### Completion contract

Every run ends by naming the files created or changed, what was refused or parked (a refused harness pointer counts), and one next action in plain language — "create the system map", "ask `spec-grill` to review candidate boundaries" — never a memorized argument. Done looks like this:

- `create`: `spec/charter.md` exists at revision 1 with the harness pointer proposed, unresolved assumptions are listed, and a brownfield repo still missing `spec/system-map.md` has continued into `map`.
- `amend`: the accepted diff is applied, `last_amended` and `revision` are bumped, and the charter still reads in about five minutes.
- `map`: the map is evidence-backed with low-level detail demoted, charter and capability changes are routed out, and the run ends with `Evidence Read` and `Evidence Missing`.
- `reassess`: nothing was written, and the report ends with one recommended next action or "no change".

## What the files are

Absence is supported. Projects opt in by creating the files; other tools degrade when they are missing. See `references/spec-axis.md` for the legacy root `CHARTER.md` fallback. Keep the charter under a ~5-minute read. Operational HOW-knowledge belongs in `_context.md`.

| File | Question it answers |
|------|---------------------|
| `spec/charter.md` | What good looks like / why (the yardstick) |
| `spec/system-map.md` | How the project is shaped (boundaries, flows, invariants, pointers) |
| `spec/capabilities.md` | What each durable capability owns / never violates (`spec-grill`) |
| `_context.md` | Operational facts you would otherwise rediscover |
| `CLAUDE.md` / `AGENTS.md` | How agents work in this repo. May carry the spec-charter pointer line. |
| `README.md` | Outward-facing introduction |

## 3 tiers

| Tier | Sections | Mutation discipline |
|------|----------|---------------------|
| **1 · Direction** | Problem, Approach, Non-Goals | Human-gated: propose → confirm → apply. |
| **2 · Predicates** | Objectives | Status-free by default. Add/remove is human-gated. IDs are stable and never reused. Retire by deleting the line and adding the ID to a `Retired IDs (never reuse)` line; git keeps the text. |
| **3 · Standing** | Decisions | Human-gated: rewrite a row in place when a decision flips; remove it once the rejection reason no longer holds. |

**Opt-in status ladder.** If a charter already uses status tokens, keep them and apply `references/amendment.md`. Do not add tokens to a lean charter. Reassess on a lean charter judges predicate drift (still true? still directive?), not status promotion.

## Create mode

Use when neither `spec/charter.md` nor a legacy root `CHARTER.md` exists; if only the root file exists, this is an amend that migrates it via `references/spec-axis.md`, not a second charter. Draft from product signals first — `README.md`, open issues, `CHANGELOG.md` — before harness files (`CLAUDE.md`, `AGENTS.md`), which inform workflow but are not product authority unless they explicitly describe product boundaries; surface conflicts in the interview instead of picking silently. Interview until Problem, Approach, Non-Goals, and the initial Objectives are concrete (`references/create.md`). A non-interactive create is allowed when the user asked for autonomous progress and the evidence is strong — mark inferred claims `src: inferred` and list what stayed unresolved; that authorization covers the harness pointer unless the user explicitly refused it. Propose `spec/charter.md` from `templates/charter.md` (`revision: 1`, today's `last_amended`) together with the pointer line as one confirm, and write only after that confirm or explicit autonomous authorization. Seed Decisions only from existing ADRs or notable merged PRs, and only choices that still stand; whatever lands is a standing decision from revision 2 on. On a brownfield repo with no `spec/system-map.md`, continue into Map mode rather than writing a stub.

Objectives are verifiable predicates, not tasks: `O<n>` IDs, never reused, written lean as `- O1 — <predicate> · src: user`, with provenance `user`, `inferred`, or `execution`. Mixed rigor is fine. Keep structural labels in English and otherwise follow the language README and the user signal; see `references/objectives.md`.

## Amend mode

Use when a charter exists or the user says `amend`. A legacy root `CHARTER.md` is migrated deliberately via `references/spec-axis.md` rather than forked into a second charter; if that leaves a brownfield repo without `spec/system-map.md`, continue into Map mode. Tier 1 and any objective add or remove go through challenge → propose diff → confirm → apply. A lean Tier 2 gets no status advances; retire an objective by deleting its line and adding the ID to the `Retired IDs (never reuse)` line (git keeps the text). If the live charter already uses status tokens, apply `references/amendment.md`; never add tokens to a lean charter. Tier 3 rows are rewritten in place when a decision flips — the rationale keeps one clause on why the previous position was left — or removed once the rejection reason no longer holds, under the same human gate as Tier 1. When the user describes a concept change rather than an edit, take the **reset** path: bump `revision` and rewrite Tier 1–3 under the usual confirm. Two things survive a reset: retired Objective IDs stay retired (keep the `Retired IDs (never reuse)` line), and one metadata line `Previous charter: git <sha>` goes below the Decisions table, outside it, pointing at the last pre-reset revision.

After an accepted amendment always bump `last_amended` and `revision`, propose the harness pointer line in the same confirm (`references/spec-axis.md`), and protect the ~5-minute read. A `backlog-triage` Alignment Check may seed proposals (`references/alignment.md`); this skill applies the gates.

## Map mode

Use when the user asks for system shape, architecture scope, runtime boundaries, flows, invariants, or `spec/system-map.md`. File state picks create vs amend. Draft from `templates/system-map.md`; heuristics and failure modes live in `references/system-map.md`. Run a Repo Evidence Pass before drafting: entrypoints, command and script surfaces, runtime boundaries, storage and state, external systems, tests that reveal intended behavior, and recent commits. Report that evidence in the conversation, not as inventory inside the map. Keep the sections short — System Shape, Runtime Boundaries, Core Flows, Storage And External Systems, Project-Wide Invariants, Where To Go Next — and link out instead of expanding subsystem detail. Fill Runtime Boundaries from existing nested instruction files (`references/spec-axis.md`); a tree with none shows `none` and is listed under Evidence Missing, never invented. Label brownfield uncertainty as an assumption. Add Candidate Capability Boundaries only when a keep condition is in play, and hand those short candidates to `spec-grill` as `- \`<slug>\` - evidence: …; owns: …; uncertainty: …`. The map is not an API reference, runbook, or module inventory.

Amend updates only project-wide shape, boundaries, flows, storage and externals, invariants, or pointers, and refreshes Runtime Boundaries from current nested instruction files. Demote helpers, single endpoints, and deployment commands; route why/good-state changes to charter amend and capability contracts to `spec-grill`.

## Reassess mode

Use when the user asks whether the spec axis is stale, wants a spec health check, or when a major model or tool change could alter how agents read repo context. Reassess never edits files. Read bounded evidence — named charter, system-map, or capability sections, plus at most the latest five execution logs — and say what was absent or skipped rather than widening the scan. The default answer is "no change" unless the evidence says otherwise; anything else is routed out to `amend`, `map`, `spec-grill`, or a human-gated promotion of a Learning to a standing Decision. On a brownfield repo with no system map, recommend `map` before grill. Default to **Evidence**, **No Change**, **Recommended Next Step**; the full report in `references/reassess.md` is reserved for periodic health checks or an explicit ask.

## References

- `references/create.md` — create-mode signals, interview, seed Decisions, harness pointer.
- `references/amendment.md` — challenge checklist, opt-in proof gate, bloat checks.
- `references/alignment.md` — work-to-objective mapping for triage/backlog consumers.
- `references/objectives.md` — predicate examples, rewrite patterns, 30-second test.
- `references/reassess.md` — report-only stale-spec review.
- `references/spec-axis.md` — file boundaries, topology, nested instruction files, harness pointer vs product authority, grill keep/fold, and legacy `CHARTER.md` fallback.
- `references/system-map.md` — map heuristics, quality checks, failure modes.
- `references/verification.md` — prose test cases for reviewing spine changes.
- `templates/charter.md` — starting shape for `spec/charter.md`.
- `templates/system-map.md` — starting shape for `spec/system-map.md`.
- [`../spec-grill/SKILL.md`](../spec-grill/SKILL.md) — companion skill for `spec/capabilities.md`.
- [`../spec-grill/references/spec-pipeline-ready.md`](../spec-grill/references/spec-pipeline-ready.md) — landing checklist when capability contracts are in scope.
