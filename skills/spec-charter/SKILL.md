---
name: spec-charter
argument-hint: "[create|amend|reassess]"
description: "Create, amend, or reassess spec/charter.md. Use for project direction, Objectives, Non-Goals, Decisions, stale spec findings, 기준, 헌장, 방향성, or spec axis."
disable-model-invocation: true
compatibility: Requires git.
metadata:
  related-skills: "spec-system-map, spec-grill, dev-backlog, backlog-triage"
---

# spec-charter

Create and amend `spec/charter.md`, the opt-in project reference axis used to measure ongoing execution (e.g. backlog items, sprint plans) and drift. This skill is rerunnable.

`spec/charter.md` is the first layer, not the whole large-repo spec. On existing/brownfield repos, finish create mode by recommending `spec-system-map` for `spec/system-map.md` and `spec-grill` for `spec/capabilities.md` from real repo signals.

## Execution contract

### Mode router

Explicit modes win first:

| User intent | Mode | Boundary |
|-------------|------|----------|
| Create the project axis, baseline, charter, or first spec layer | `create` | Only when neither `spec/charter.md` nor legacy root `CHARTER.md` exists, unless the user explicitly asks to replace it. |
| Update direction, objectives, decisions, or accepted charter wording | `amend` | Applies tier gates and may edit the resolved charter after confirmation. |
| Check whether charter/capabilities/Learnings are stale or should change | `reassess` | Report-only; routes accepted fixes to `spec-charter amend`, `spec-grill`, or a Learning Action. |

When no mode is specified, route by intent first, then use file state only for generic charter requests: prefer `spec/charter.md`; fall back to legacy root `CHARTER.md`; if neither exists, use create mode. If the user asks for capability contracts, component boundaries, or `spec/capabilities.md`, route to `spec-grill`.

### Helper scripts

Do not rely on bundled helper scripts for charter work. Inspect the target repo directly and keep all paths target-repo-relative so the skill never analyzes its own installation directory by accident.

### Completion contract

End every mode with a short summary:

- `create`: created files, unresolved assumptions, and a concrete next natural-language action. On brownfield repos, create `spec/system-map.md` first when absent; recommend `spec-grill` only when capability candidates are evidence-backed.
- `amend`: accepted changes, refused/parked changes, proof cited for status advances, and a charter length check (report the line count; flag when the charter exceeds a ~5-minute read, roughly 150 lines).
- `reassess`: required report sections from the Reassess mode dispatch contract, with one recommended next natural-language action.

When recommending follow-up spec work, do not require users to memorize downstream arguments such as `map`, `fill`, or `audit`. Prefer plain actions like "create the system map" or "ask spec-grill to review candidate capability boundaries." Include 2-5 candidate boundary names only when they are supported by evidence from README, `spec/system-map.md`, scripts, tests, docs, or recent commit scopes.

## What spec/charter.md is

`spec/charter.md` lives in the target repo's project spec directory. It records what good looks like: the problem, approach, explicit non-goals, verifiable objectives, and immutable decision history the backlog is measured against.

Absence is supported. Projects opt in by creating the file; other skills degrade gracefully when it is missing. See `references/spec-axis.md` for the legacy root `CHARTER.md` fallback and migration policy. Keep the charter under a ~5-minute read. Operational know-how does not belong here; put rediscovery-prone HOW-knowledge in `_context.md`.

| File | Question it answers |
|------|---------------------|
| `spec/charter.md` | What good looks like / why (the yardstick) |
| `spec/system-map.md` | How the project is shaped at the system level (boundaries, flows, invariants, pointers) |
| `spec/capabilities.md` | What each durable capability owns / never violates (the middle layer, authored by `spec-grill`) |
| `_context.md` | Operational facts you would otherwise rediscover (HOW-knowledge) |
| `CLAUDE.md` / `AGENTS.md` | How agents work in this repo (development harness; not product authority by default) |
| `README.md` | Outward-facing introduction |

## 3 tiers

| Tier | Sections | Mutation discipline | Rationale |
|------|----------|---------------------|-----------|
| **1 · Direction** | Problem, Approach, Non-Goals | Human-gated: propose -> confirm -> apply. Slowest-moving: the core that survives if scope shrinks. | A stable core is what makes the moving parts meaningful. |
| **2 · Predicates** | Objectives | Status advance to `validated` requires **proof**. Deferral requires a cited parking or scope-change rationale. Adding/removing an objective is human-gated. | You cannot evolve the axis to declare victory; you must prove it. |
| **3 · History** | Decisions | **Append-only.** Never edit or delete a row; reverse via a new `supersedes` row. | Provenance is immutable. |

This tiering prevents the axis from self-evolving into a rubber-stamp: direction changes are gated, objective status requires proof, and history is frozen.

## Create mode

Use create mode when neither `spec/charter.md` nor legacy root `CHARTER.md` exists, or when invoked as `spec-charter create` and no charter exists.

1. Draft from repo signals: product/user-facing signals (`README.md`, open epics/issues, `CHANGELOG.md`) before development-harness signals (`CLAUDE.md`, `AGENTS.md`). Harness files may inform workflow conventions, local commands, and repo-specific guardrails, but they do not override README, charter, issues, code structure, or user interview answers for product/capability authority unless they explicitly describe product boundaries. When signals conflict, surface the conflict in the interview rather than picking silently.
2. Interview the user to fill and sharpen Problem, Approach, Non-Goals, and initial Objectives. Follow the checklist in `references/create.md`: Problem framing options, the wedge test for Approach, Non-Goals elicitation, and Objective framing that cites `references/objectives.md`. If the user asked for autonomous progress and repo evidence is strong enough, non-interactive create mode may draft without blocking on interview; mark inferred claims and Objectives with `src: inferred`, list unresolved assumptions, and recommend `spec-charter amend` for later human correction.
3. Create `spec/` if needed, then write `spec/charter.md` from `templates/charter.md` with `revision: 1` and today's `last_amended`. The Decisions table may be left empty. Seed 3-5 rows only when prior design docs, ADRs, or notable merged PRs already record direction; whatever lands becomes immutable from revision 2.
4. If the target repo is brownfield, use the create-mode completion contract to choose the next spec-axis action. Brownfield signals include existing source roots (`src/`, `app/`, `lib/`, `packages/`, `skills/`), commit history, tests/scripts/config, open issues, or multiple top-level feature/workflow surfaces.

Objective conventions:

- State objectives as verifiable predicates, not tasks.
- Mixed rigor is allowed: a runnable check is ideal, but an observable statement is acceptable.
- Use `O<n>` IDs for traceability.
- Never reuse a removed objective ID; new objectives take the next free number.
- Record provenance with `src:` (`user`, `inferred`, or `execution`).

Language conventions:

- Default to the language signaled by README, AGENTS/CLAUDE, and the user's request.
- Prefer the repo ecosystem language when it improves maintainability or matches existing docs.
- Keep structural labels and XML-style tags in English when cross-agent parsing matters.

See `references/objectives.md` for worked examples, rewrite patterns, and a 30-second predicate test.

## Amend mode

Use amend mode when `spec/charter.md` exists, legacy root `CHARTER.md` exists, or when invoked as `spec-charter amend`.

First re-read `spec/charter.md`. If it is absent but root `CHARTER.md` exists, apply the legacy fallback and migration policy in `references/spec-axis.md`: read the legacy file, state that the canonical path is now `spec/charter.md`, and recommend migrating before or during the accepted amendment. Direct hand-edits are allowed because it is the user's file; this skill is the disciplined path for applying the tier gates.

Apply the 3-tier discipline:

- Tier 1 plus objective add/remove: surface stale or weak items, challenge them, propose concrete diffs, confirm with the user, then apply. Do not rubber-stamp.
- Tier 2 status advance: require proof for `active` -> `validated`; cite a merged PR, passing check, or a recorded agent run whose Done Criteria match the predicate. For `active` -> `deferred`, require a cited parking or scope-change rationale. Without the required evidence or rationale, refuse the advance and flag it.
- Tier 3 Decisions: append only. Never edit or delete an existing row; a reversal is a new row with `supersedes`.

After applying an accepted amendment, bump `last_amended` to today and increment `revision`. Re-read the result and protect the ~5-minute-read property by collapsing long `deferred` lists, oversized Decisions rationale, or operational HOW-knowledge.

Amend mode can take a `backlog-triage` Alignment Check report as a seed of proposed changes. The report proposes; this skill applies through the gates.

See `references/amendment.md` for deep challenge and proof-gate heuristics.

## Reassess mode

Use reassess mode when the user asks whether `spec/charter.md`, `spec/system-map.md`, or `spec/capabilities.md` is stale, asks to review Learnings, wants a periodic spec health check, or when major model/tool/harness changes could alter how agents interpret repo context.

Reassess never edits files. It diagnoses drift and recommends next actions; accepted fixes must run through `spec-charter amend`, `spec-system-map amend`, `spec-grill <capability>`, or a separate user-approved Learning Action.

If reassess finds that `spec/system-map.md` is missing on a brownfield repo, recommend creating the system map before capability grilling. If `spec/system-map.md` exists and `spec/capabilities.md` is missing or thin, recommend asking `spec-grill` to review the candidate capability boundaries. Name concrete candidates only when evidence supports them; otherwise say which evidence is missing.

Dispatch contract:

1. Start with bounded file evidence: named charter, system-map, or capability sections, recent execution logs (e.g. an active sprint file) when present, and at most the latest five completed execution logs.
2. Use repo-local helper scripts such as `capabilities-doctor.js --json` or `component-lint.js --json` only when they are present in the target repo. If unavailable, list them under **Missing Evidence** and continue with bounded file reads.
3. **Sizing rule**: default to a quick reassess when the user asks a narrow staleness question about one file or section — emit only **Evidence**, **No Change**, **Recommended Next Step**. Reserve the full reassess report — **Evidence**, **No Change**, **System Map Candidates**, **Grill Candidates**, **Amend Candidates**, **Learning Actions**, **Missing Evidence**, **Recommended Next Step** — for periodic health checks, multi-file drift review, or when the user explicitly asks for the full report. A quick-reassess finding that would need a trimmed section gets one line under Recommended Next Step pointing to a full reassess instead. Reassess discipline applies in full at every size: quick reassess is still report-only (never edits) and still routes accepted fixes through `spec-charter amend`, `spec-system-map amend`, or `spec-grill`; it only trims what gets written down.
4. Use `references/reassess.md` as the source of truth for evidence order, report shape, recommendation rules, Learning Actions, and stale-spec failure modes.

## Verification prompts

Use these as quick pressure tests when changing this skill or a generated charter:

- "Create a charter for a repo with no README and a vague objective list." Expected: interview until Problem/Approach/Non-Goals are concrete; refuse to accept objectives that aren't verifiable predicates.
- "Mark this objective validated because the team believes it's done." Expected: refuse the status advance without a cited merged PR, passing check, or recorded agent run; keep it `active`.
- "Add a Non-Goal that's really just an unstated risk." Expected: sharpen it into a concrete boundary statement, or push back that it isn't a non-goal.
- "Edit a past Decisions row to fix a typo in the rationale." Expected: refuse; append a new row instead, since Decisions are append-only.
- "This charter hasn't been amended in a year — is it stale?" Expected: route to reassess mode rather than silently rewriting Tier 1 content.
- "Skip the interview and draft objectives non-interactively from repo signals." Expected: allowed only when the user asked for autonomous progress; mark objectives `src: inferred` and list unresolved assumptions.

## References

- `references/create.md` — create-mode signals priority, conflict handling, interview checklist, seed-Decisions guidance.
- `references/amendment.md` — challenge checklist, proof-gate rules, no-rubber-stamp discipline, and bloat checks.
- `references/alignment.md` — shared work-to-objective mapping logic consumed by `backlog-triage` and `dev-backlog`.
- `references/objectives.md` — verifiable-predicate examples, common rewrite patterns, 30-second test.
- `references/reassess.md` — report-only stale-spec reassessment: evidence sources, sizing gate, output shape, Learning Actions, and failure modes.
- `references/spec-axis.md` — spec-axis file boundaries, ownership, and the legacy root `CHARTER.md` fallback policy.
- [`../spec-system-map/SKILL.md`](../spec-system-map/SKILL.md) — companion skill for authoring `spec/system-map.md`.
- [`../spec-grill/SKILL.md`](../spec-grill/SKILL.md) — companion skill for authoring `spec/capabilities.md`.
- [`../spec-grill/references/spec-pipeline-ready.md`](../spec-grill/references/spec-pipeline-ready.md) — final checklist for landing the full spec axis.
