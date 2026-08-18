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

Create and amend the spec-axis files this skill owns: `spec/charter.md` (direction) and `spec/system-map.md` (system shape). `spec-grill` owns `spec/capabilities.md`. This skill is rerunnable.

## Execution contract

### Mode router

Explicit modes win first:

| User intent | Mode | Boundary |
|-------------|------|----------|
| Create the project axis, baseline, charter, or first spec layer | `create` | Only when neither `spec/charter.md` nor legacy root `CHARTER.md` exists, unless the user explicitly asks to replace it. |
| Update direction, objectives, decisions, or accepted charter wording | `amend` | Applies tier gates and may edit the resolved charter after confirmation. |
| Check whether charter/system-map/capabilities/Learnings are stale | `reassess` | Report-only; routes accepted fixes to `amend`, `map`, `spec-grill`, or a Learning Action. |
| Architecture, system shape, runtime boundaries, flows, invariants, or `spec/system-map.md` | `map` | Create or amend the system map. File-state picks create vs amend. |

When no mode is specified, route by intent first. Generic charter requests: prefer `spec/charter.md`; fall back to legacy root `CHARTER.md`; if neither exists, use create. Capability contracts, component boundaries, or `spec/capabilities.md` route to `spec-grill`.

### Helper scripts

Do not rely on bundled helper scripts. Inspect the target repo directly and keep all paths target-repo-relative so the skill never analyzes its own installation directory by accident.

### Completion contract

- `create`: created files, unresolved assumptions, refused/parked items, and a next natural-language action. Propose the charter write plus a Direction trigger pointer and marker-bounded Mission+Non-Goals projection as one package (`references/spec-axis.md`); write files only after confirm or explicit autonomous authorization. On brownfield repos, if `spec/system-map.md` is absent, continue into `map` mode (do not draft the map from README and folders alone); recommend `spec-grill` only when a consumer, a cross-tree contract, or a 3-axis audit is in play.
- `amend`: accepted changes, refused/parked changes, and a charter length check (flag when it exceeds a ~5-minute read, roughly 150 lines). Cite proof only when the charter uses the opt-in status ladder. Propose the charter diff and harness projection change as one package (`references/spec-axis.md`). After migrating a brownfield root `CHARTER.md`, if `spec/system-map.md` is absent, continue into `map` mode.
- `map`: `Evidence Read` and `Evidence Missing` bullets. Done when the map is evidence-backed, low-level detail has been demoted, and charter/capability changes have been routed out. Brownfield maps fill Runtime Boundaries from repo evidence (`references/spec-axis.md`).
- `reassess`: required report sections from the dispatch contract, with one recommended next action.

Prefer plain follow-ups ("create the system map", "ask spec-grill to review candidate boundaries") over memorized arguments. Name 2-5 candidate boundaries only when README, `spec/system-map.md`, scripts, tests, docs, or recent commits support them.

## What the files are

Absence is supported. Projects opt in by creating the files; other tools degrade when they are missing. See `references/spec-axis.md` for the legacy root `CHARTER.md` fallback. Keep the charter under a ~5-minute read. Operational HOW-knowledge belongs in `_context.md`.

| File | Question it answers |
|------|---------------------|
| `spec/charter.md` | What good looks like / why (the yardstick) |
| `spec/system-map.md` | How the project is shaped (boundaries, flows, invariants, pointers) |
| `spec/capabilities.md` | What each durable capability owns / never violates (`spec-grill`) |
| `_context.md` | Operational facts you would otherwise rediscover |
| `CLAUDE.md` / `AGENTS.md` | How agents work in this repo. May carry a generated Direction projection; the charter remains the mutation home. |
| `README.md` | Outward-facing introduction |

## 3 tiers

| Tier | Sections | Mutation discipline |
|------|----------|---------------------|
| **1 · Direction** | Problem, Approach, Non-Goals | Human-gated: propose → confirm → apply. |
| **2 · Predicates** | Objectives | Status-free by default. Add/remove is human-gated. IDs are stable and never reused. Retire by moving the line to `docs/spec-history.md`. |
| **3 · History** | Decisions | Append-only. Reverse via a new `supersedes` row. |

**Opt-in status ladder.** If a charter already uses status tokens, keep them and apply `references/amendment.md`. Do not add tokens to a lean charter. Reassess on a lean charter judges predicate drift (still true? still directive?), not status promotion.

## Create mode

Use when neither `spec/charter.md` nor legacy root `CHARTER.md` exists. If only root `CHARTER.md` exists, use Amend mode and migrate via `references/spec-axis.md` rather than writing a second charter; then if the repo is brownfield and `spec/system-map.md` is absent, continue into Map mode.

1. Draft from repo signals: product/user-facing (`README.md`, open issues, `CHANGELOG.md`) before harness files (`CLAUDE.md`, `AGENTS.md`). Harness files may inform workflow; they do not override README, issues, or code for product authority unless they explicitly describe product boundaries. Surface conflicts in the interview rather than picking silently.
2. Interview to sharpen Problem, Approach, Non-Goals, and initial Objectives. Follow `references/create.md`. Non-interactive create is allowed when the user asked for autonomous progress and evidence is strong; mark inferred claims `src: inferred` and list unresolved assumptions. Autonomous authorization covers the harness package unless the user explicitly refused it.
3. Create `spec/` if needed. Propose `spec/charter.md` (from `templates/charter.md`, `revision: 1`, today's `last_amended`) plus the trigger pointer and marker projection as one package (`references/create.md`); write only after confirm or explicit autonomous authorization. Seed Decisions only from existing ADRs or notable merged PRs; whatever lands is immutable from revision 2.
4. On brownfield repos, if `spec/system-map.md` is absent, continue into Map mode instead of writing a stub map.

Objectives are verifiable predicates, not tasks. Mixed rigor is allowed. Use `O<n>` IDs; never reuse a removed ID. Write lean objectives as `- O1 — <predicate> · src: user`. Record provenance with `src:` (`user`, `inferred`, or `execution`). Default to the language signaled by README and the user; keep structural labels in English. See `references/objectives.md`.

## Amend mode

Use when a charter exists or when invoked as `amend`. If only root `CHARTER.md` exists, apply the fallback in `references/spec-axis.md` and migrate deliberately; then if the repo is brownfield and `spec/system-map.md` is absent, continue into Map mode.

- Tier 1 plus objective add/remove: challenge, propose diffs, confirm, then apply.
- Lean Tier 2: no status advances. Retire by moving the line to `docs/spec-history.md`.
- If the live charter already uses status tokens, apply `references/amendment.md`. Do not add tokens to a lean charter.
- Tier 3: append only.

After an accepted amendment, bump `last_amended` and `revision` unless the only accepted change is aligning a drifted projection excerpt (then keep the charter revision and rewrite the inner block). Propose that bump or refresh together with the projection rules in `references/spec-axis.md`. Protect the ~5-minute-read property. A `backlog-triage` Alignment Check may seed proposals; this skill applies the gates.

## Map mode

Use when the user asks for system shape, architecture scope, runtime boundaries, flows, invariants, or `spec/system-map.md`. Create when the file is absent; amend when it exists. Draft from `templates/system-map.md`. Heuristics and failure modes: `references/system-map.md`.

Create:

1. Read bounded signals: `spec/charter.md` if present, else root `CHARTER.md`; then `README.md`, `AGENTS.md`/`CLAUDE.md`, top-level directories, package/config files, and architecture-related docs.
2. Repo Evidence Pass before drafting: entrypoints, command/script surfaces, runtime boundaries, storage/state, external systems, tests that reveal intended behavior, recent commits. Report evidence in the conversation, not as inventory inside the map.
3. Keep sections short: System Shape, Runtime Boundaries, Core Flows, Storage And External Systems, Project-Wide Invariants, Where To Go Next. Add Candidate Capability Boundaries only when a consumer, a cross-tree contract, or a 3-axis audit is in play. Link out instead of expanding subsystem detail. Fill Runtime Boundaries from existing nested instruction files (`references/spec-axis.md`). Do not invent nested files unless the user asked.
4. Label brownfield uncertainty as assumptions. When that section is in play, hand short candidates to `spec-grill` as `- \`<slug>\` - evidence: …; owns: …; uncertainty: …`. Do not turn the map into an API reference, runbook, or module inventory.

Amend: update only project-wide shape, boundaries, flows, storage/externals, invariants, or pointers. Refresh Runtime Boundaries from current nested instruction files. Demote helpers, single endpoints, and deployment commands. Route why/good-state changes to charter amend; route capability contracts to `spec-grill`.

## Reassess mode

Use when the user asks whether the spec axis is stale, wants a spec health check, or when major model/tool changes could alter how agents interpret repo context. Reassess never edits files.

Dispatch:

1. Bounded file evidence: named charter, system-map, or capability sections, plus at most the latest five execution logs when present.
2. Repo-local helpers such as `capabilities-doctor.js --json` only when they exist in the *target* repo. Otherwise list them under **Missing Evidence**.
3. **Sizing rule**: default to **Evidence**, **No Change**, **Recommended Next Step**. Reserve the full report in `references/reassess.md` for periodic health checks or an explicit full-report ask. Discipline is unchanged at every size: report-only; route fixes through `amend`, `map`, or `spec-grill`.

If the system map is missing on a brownfield repo, recommend `map` before grilling. If the map exists and capabilities are missing or thin, recommend `spec-grill` only when a consumer, a cross-tree contract, or a 3-axis audit is in play. If a harness projection block is present, compare its `revision=` and excerpted Non-Goals to the live charter; name drift, do not refresh it here (`references/reassess.md`).

## Verification prompts

- "Create a charter for a repo with no README and a vague objective list." Expected: interview until Problem/Approach/Non-Goals are concrete; refuse objectives that aren't verifiable predicates; write status-free `- O1 — <predicate>` lines.
- "Mark this objective validated because the team believes it's done." Expected: on a lean charter, refuse status tokens; on an opt-in ladder charter, refuse the advance without cited proof.
- "Edit a past Decisions row to fix a typo." Expected: refuse; append a new row.
- "Create a system map after reading only README and top-level folders." Expected: continue the Repo Evidence Pass or label the map as under-evidenced.
- "Map a brownfield repo; `packages/foo` has `AGENTS.md`, `packages/bar` does not." Expected: record foo's path; bar is `none` plus Evidence Missing; do not create `packages/bar/AGENTS.md`.
- "Put this Hard Constraint in `packages/foo/AGENTS.md`; `spec/capabilities.md` exists." Expected: refuse the fork (`references/spec-axis.md`).
- "Update this map with a new helper function and endpoint." Expected: refuse or demote unless it changes a project-wide flow or invariant.
- "This charter hasn't been amended in a year — is it stale?" Expected: reassess; on a lean charter, judge predicate drift, not status promotion.
- "Create a charter; do not mention harness files." Expected: still propose the trigger pointer and marker projection; do not silently edit `AGENTS.md` or `CLAUDE.md`.
- "Reassess a repo whose projection `revision=` is behind the charter." Expected: name projection drift; do not rewrite the harness file.

## References

- `references/create.md` — create-mode signals, interview, seed Decisions, harness projection.
- `references/amendment.md` — challenge checklist, opt-in proof gate, bloat checks, projection refresh.
- `references/alignment.md` — work-to-objective mapping for triage/backlog consumers.
- `references/objectives.md` — predicate examples, rewrite patterns, 30-second test.
- `references/reassess.md` — report-only stale-spec review.
- `references/spec-axis.md` — file boundaries, topology, nested instruction files, harness projection vs product authority, grill keep/fold, and legacy `CHARTER.md` fallback.
- `references/system-map.md` — map heuristics, quality checks, failure modes.
- `templates/system-map.md` — starting shape for `spec/system-map.md`.
- [`../spec-grill/SKILL.md`](../spec-grill/SKILL.md) — companion skill for `spec/capabilities.md`.
- [`../spec-grill/references/spec-pipeline-ready.md`](../spec-grill/references/spec-pipeline-ready.md) — landing checklist when capability contracts are in scope.
