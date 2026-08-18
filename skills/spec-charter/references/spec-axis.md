# Spec axis boundary

Use this as the shared boundary reference for `spec-charter` and `spec-grill`. Topology, file ownership, and harness-projection authority live here so skill spines do not restate them.

## Files

| File | Role | Owned by |
| --- | --- | --- |
| `spec/charter.md` | Why the project exists, what good looks like, Non-Goals, Objectives, and project-wide Decisions. | `spec-charter` |
| `spec/system-map.md` | High-level system shape: runtime boundaries, core flows, storage/external systems, invariants, and pointers. Router: tree → local instruction file. | `spec-charter` (`map` mode) |
| `spec/capabilities.md` | Optional capability contracts: Goal, Scope, Expected Behaviors, Hard Constraints, Learnings, and Decisions. Write only when a consumer exists, the contract is cross-tree, or the user asked for a 3-axis audit. | `spec-grill` |
| `CLAUDE.md` / `AGENTS.md` | Agent harness instructions and local development guardrails. May carry a generated Direction projection; that cache is not independent product authority. | Repository maintainers; `spec-charter` proposes projection and writes only after confirm or explicit autonomous authorization |
| `README.md` | Outward-facing introduction and user-facing entrypoints. | Repository maintainers |

Downstream tools (for example dev-backlog's sprint and triage skills) consume `spec/*` files as read-only yardsticks and document their own file boundaries; they may propose spec changes but must not mutate spec files themselves.

## Topology

Absence is supported. Pick the smallest axis that matches the git topology.

| Topology | Spec axis |
| --- | --- |
| Type-1 (one product; Mission in `AGENTS.md` is enough) | No `spec/` required. CraftKit itself is this class — a classification, not a missing spec. |
| True monorepo (one git, many trees) | Umbrella `spec/charter.md` + `spec/system-map.md` as the router: tree → local instruction file. |
| Sibling git workspace (many repos, one editor folder) | Each repo bootstraps itself. No workspace-umbrella charter. |

`spec-grill` stays optional. Directory names alone are not a reason to generate `spec/capabilities.md`.

## Harness projection

`spec-charter` create/amend may propose a **trigger pointer** (always-loaded, with conditions, not a path-only line) and a **marker-bounded generated cache** of Mission + Non-Goals:

```text
<!-- spec-charter-projection:start revision=<n> -->
<5–8 lines: Mission + Non-Goals excerpt>
<!-- spec-charter-projection:end -->
```

`<n>` matches charter frontmatter `revision:`. Every accepted **charter** revision bump stamps the same integer into existing markers in the same confirm. Refresh excerpt text when Tier 1 changed **or** when the existing excerpt no longer matches live Tier 1. If the only accepted change is aligning a drifted excerpt, do not bump charter `revision:`; keep marker `revision=` and replace the inner text. If no projection exists, propose adding one rather than requiring it. Charter remains the mutation home. If the cache and live Non-Goals disagree, the charter wins; reassess names the drift.

Propose the charter write, the pointer, the marker block, and any load adapter as **one package** before writing. Apply them together after confirm or explicit autonomous authorization. If a write fails, report the failure and do not treat a partial package as success. Write charter without harness only when the user **explicitly refused** the harness half; record that under refused/parked. Do not treat a silent skip or a write failure as a refusal. A refused harness after a revision bump is expected drift; reassess will name it.

- One **projection block**, home always `AGENTS.md` (create it if absent). Never duplicate the block.
- Include a Claude load adapter in the same package when `CLAUDE.md` is missing or does not already import/symlink `AGENTS.md`. Prefer `@AGENTS.md` (a new import-only `CLAUDE.md`, or one import line in an existing file that already has unique instructions). If only `CLAUDE.md` exists, create `AGENTS.md` as the home and add that import line — do not move unique `CLAUDE.md` content. Do not symlink-over a file that has unique instructions; symlink only when the two files are already equivalent.
- Pointers must carry trigger conditions, not only paths. The always-loaded block is a cache of `spec/charter.md`; the charter wins if they disagree.
- A projection block without a live charter is stale cache, not product authority — do not reconstruct the charter from it.
- Nested instruction files are not a portable “closest wins” contract — hosts differ (Claude `CLAUDE.md` chains, Codex git-root→cwd, Cursor path-scoped). `spec/system-map.md` is an index the agent is told to Read, not an engine guarantee.

## Rules

- `spec/*` files are durable project, system, and capability contracts.
- Agent harness files can inform workflow and guardrails, but they are not product authority unless they explicitly describe product boundaries. A generated projection does not change that.
- `spec/charter.md` is the canonical charter path. A legacy root `CHARTER.md` may be read only when `spec/charter.md` is absent, as a compatibility fallback for older repos; never edit or create new root charters. Migrate from root `CHARTER.md` to `spec/charter.md` deliberately, as an explicit accepted change rather than a silent side effect.
- Spec skills may read consumer evidence (task acceptance criteria, sprint notes, tests, docs, and commit history) to understand reality, but they must not copy tool-specific or issue-specific acceptance criteria into durable specs.
- When `spec/capabilities.md` exists, Hard Constraints stay there. Do not fork the same constraint into package `AGENTS.md`.
