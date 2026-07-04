# Spec axis boundary

Use this as the shared boundary reference for `spec-charter`, `spec-system-map`, and `spec-grill`.

## Files

| File | Role | Owned by |
| --- | --- | --- |
| `spec/charter.md` | Why the project exists, what good looks like, Non-Goals, Objectives, and project-wide Decisions. | `spec-charter` |
| `spec/system-map.md` | High-level system shape: runtime boundaries, core flows, storage/external systems, invariants, and pointers. | `spec-system-map` |
| `spec/capabilities.md` | Capability contracts: Goal, Scope, Expected Behaviors, Hard Constraints, Learnings, and Decisions. | `spec-grill` |
| `CLAUDE.md` / `AGENTS.md` | Agent harness instructions and local development guardrails. | Repository maintainers |
| `README.md` | Outward-facing introduction and user-facing entrypoints. | Repository maintainers |

Downstream tools (for example dev-backlog's sprint and triage skills) consume `spec/*` files as read-only yardsticks and document their own file boundaries; they may propose spec changes but must not mutate spec files themselves.

## Rules

- `spec/*` files are durable project, system, and capability contracts.
- Agent harness files can inform workflow and guardrails, but they are not product authority unless they explicitly describe product boundaries.
- `spec/charter.md` is the canonical charter path. A legacy root `CHARTER.md` may be read only when `spec/charter.md` is absent, as a compatibility fallback for older repos; never edit or create new root charters. Migrate from root `CHARTER.md` to `spec/charter.md` deliberately, as an explicit accepted change rather than a silent side effect.
- Spec skills may read consumer evidence (task acceptance criteria, sprint notes, tests, docs, and commit history) to understand reality, but they must not copy tool-specific or issue-specific acceptance criteria into durable specs.
