# Spec axis boundary

Use this as the shared boundary reference for `spec-charter` and `spec-grill`. Topology, file ownership, and harness-pointer authority live here so skill spines do not restate them.

## Files

| File | Role | Owned by |
| --- | --- | --- |
| `spec/charter.md` | Why the project exists, what good looks like, Non-Goals, Objectives, and project-wide Decisions. | `spec-charter` |
| `spec/system-map.md` | High-level system shape: runtime boundaries, core flows, storage/external systems, invariants, and pointers. Router: tree → local instruction file. | `spec-charter` (`map` mode) |
| `spec/capabilities.md` | Optional capability contracts: Goal, Scope, Expected Behaviors, Hard Constraints, Learnings, and Decisions. | `spec-grill` |
| `CLAUDE.md` / `AGENTS.md` | Agent harness instructions and local development guardrails; may carry the spec-charter pointer line. | Repository maintainers; `spec-charter` proposes the pointer line and writes only after confirm or explicit autonomous authorization |
| `README.md` | Outward-facing introduction and user-facing entrypoints. | Repository maintainers |

Downstream tools (for example dev-backlog's sprint and triage skills) consume `spec/*` files as read-only yardsticks and document their own file boundaries; they may propose spec changes but must not mutate spec files themselves.

## Topology

Absence is supported. Pick the smallest axis that matches the git topology.

| Topology | Spec axis |
| --- | --- |
| Type-1 (one product; Mission in `AGENTS.md` is enough) | No `spec/` required. CraftKit itself is this class — a classification, not a missing spec. |
| True monorepo (one git, many trees) | Umbrella `spec/charter.md` + `spec/system-map.md` as the router: tree → local instruction file. |
| Sibling git workspace (many repos, one editor folder) | Each repo bootstraps itself. No workspace-umbrella charter. |

**Keep conditions:** a consumer exists, the contract is cross-tree, or the user asked for a 3-axis audit. `spec-grill` stays optional. A bare invocation may still report; it does not by itself authorize creating `spec/capabilities.md`. Once that file exists, `spec-grill` may amend it. Directory names alone are not a reason to generate the file.

**Fold condition (document only):** if almost no installed consumers still need `spec/capabilities.md`, `spec-grill` may later become a `spec-charter` mode. Leave it a separate skill until that fold condition holds.

## Harness pointer

On create or amend, `spec-charter` proposes, in the same confirm (or explicit autonomous authorization) as the charter write, one pointer line in `AGENTS.md` (create the file if absent): `Read spec/charter.md before proposing scope, direction, or Non-Goal changes.` — a condition plus a path, never a copy of charter text. If an equivalent pointer already exists, propose nothing; the pointer is a no-op on every later amend.

If `CLAUDE.md` exists and neither file imports or symlinks the other, also propose adding one `@AGENTS.md` import line to `CLAUDE.md`; do not move content. The pointer is optional — the user may refuse it (including "do not mention harness files"); record a refusal under refused/parked and do not re-propose it in the same run. Harness files remain not product authority.

## Nested local instruction files

Nested instruction files are not a portable "closest wins" contract — hosts differ (Claude `CLAUDE.md` chains, Codex git-root→cwd, Cursor path-scoped). `spec/system-map.md` is an index the agent is told to Read, not an engine guarantee.

`spec-charter` map mode records existing nested `AGENTS.md` / `CLAUDE.md` in the Runtime Boundaries table from repo evidence. A tree with no instruction file shows `none` and is listed under Evidence Missing. Do not invent a nested file unless the user asked.

When a nested instruction file is proposed or written:

- First line declares scope, e.g. `Scope: packages/foo/**`.
- The file holds **how** (commands, local convention) plus a pointer at umbrella Non-Goals in `spec/charter.md`. Do not copy Non-Goals into the nested file.

## Rules

- `spec/*` files are durable project, system, and capability contracts.
- Objectives live only in spec-charter skill/templates (`spec/charter.md`). Expected Behaviors and Hard Constraints live only in spec-grill skill/templates (`spec/capabilities.md`). Do not copy those sections into the other skill.
- Agent harness files can inform workflow and guardrails, but they are not product authority unless they explicitly describe product boundaries.
- `spec/charter.md` is the canonical charter path. A legacy root `CHARTER.md` may be read only when `spec/charter.md` is absent, as a compatibility fallback for older repos; never edit or create new root charters. Migrate from root `CHARTER.md` to `spec/charter.md` deliberately, as an explicit accepted change rather than a silent side effect.
- Spec skills may read consumer evidence (task acceptance criteria, sprint notes, tests, docs, and commit history) to understand reality, but they must not copy tool-specific or issue-specific acceptance criteria into durable specs.
- When `spec/capabilities.md` exists, Hard Constraints stay there. Do not fork the same constraint into package `AGENTS.md`.
- `## Decisions` in `spec/charter.md` and `spec/capabilities.md` holds standing decisions, not a history ledger: a flipped decision is rewritten in place (rationale keeps one clause on why the previous position was left), and a row is removed once its rejection reason no longer holds. Git is the archive; after a reset amend the only in-file history is one `Previous charter: git <sha>` line below the charter's Decisions table.
