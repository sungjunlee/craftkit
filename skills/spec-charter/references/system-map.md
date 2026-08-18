# System map heuristics

Use this reference when `spec-charter` is writing or updating `spec/system-map.md`. The spine owns the operating path; this file carries heuristics and failure modes.

`spec/system-map.md` is narrower than a generic `ARCHITECTURE.md`: it names project-wide structure, boundaries, flows, storage/external systems, invariants, and pointers to deeper docs.

## Boundary

| File | Role |
|------|------|
| `spec/charter.md` | Why / good state / Objectives / Decisions |
| `spec/system-map.md` | System shape / runtime boundaries / core flows / invariants / pointers |
| `spec/capabilities.md` | Capability-level contracts / Hard Constraints / Learnings |

Do not turn `system-map.md` into exhaustive module documentation, API reference, runbook, ADR log, or implementation notes. Demote subsystem detail to linked docs; promote only project-wide structure or invariants.

Candidate lines that `spec-grill` can parse:

```text
- `<slug>` - evidence: <flow/boundary/invariant>; owns <contract surface>; uncertainty: <what needs grill>
```

## Quality checks

- A reader can understand the project shape in under 5 minutes.
- Every section names current project-wide facts, not aspirational design.
- The map links to deeper docs instead of copying them.
- No subsystem gets more detail than the whole-system flow needs.
- Candidate Capability Boundaries are short handoff candidates, not a module inventory. Prefer handing a candidate to `spec-grill` when it has at least two evidence classes, a distinct contract surface, and Behaviors/Hard Constraints that would differ from neighbors — and only when grill is in scope.
- Link `capabilities.md` from Where To Go Next only when that file exists or grill is in scope.
- No stale module-level TODOs, endpoint inventories, or runbook commands.
- Brownfield maps are not based only on README/top-level directory skimming; unsupported boundaries are labeled as assumptions.
- Brownfield maps require the Runtime Boundaries table (`tree | owns | local instructions | do not`). Greenfield or single-tree maps may still use it; one row is enough.
- Multi-tree brownfield maps without named local instruction files in Runtime Boundaries are under-evidenced. A tree with no instruction file may show `none`.

## Failure modes

- drafting from README and top-level folders alone, skipping the Repo Evidence Pass
- sections drifting into aspirational design instead of current, evidence-backed facts
- endpoint or API inventories creeping into Core Flows or Storage And External Systems
- amend mode absorbing helper functions, single endpoints, or deployment commands
- charter-level or capability-level changes getting edited into the map instead of routed out
- omitting the Runtime Boundaries table on a brownfield map
- treating nested harness closest-wins as portable — hosts differ; the map is an index to Read, not a load-order guarantee
- inventing CONTEXT-MAP.md or a new instruction-file format
