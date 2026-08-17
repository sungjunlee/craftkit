# System map create and amend

Use this reference when `spec-charter` is writing or updating `spec/system-map.md`. The spine owns routing; this file owns the map workflow.

`spec/system-map.md` is narrower than a generic `ARCHITECTURE.md`: it names project-wide structure, boundaries, flows, storage/external systems, invariants, and pointers to deeper docs.

## Boundary

| File | Role |
|------|------|
| `spec/charter.md` | Why / good state / Objectives / Decisions |
| `spec/system-map.md` | System shape / runtime boundaries / core flows / invariants / pointers |
| `spec/capabilities.md` | Capability-level contracts / Hard Constraints / Learnings |

Do not turn `system-map.md` into exhaustive module documentation, API reference, runbook, ADR log, or implementation notes. Demote subsystem detail to linked docs; promote only project-wide structure or invariants.

## Create

Use when `spec/system-map.md` is absent or the user asks for a first system map.

1. Read bounded signals: `spec/charter.md` if present, `README.md`, `AGENTS.md`/`CLAUDE.md`, top-level directories, package/config files, and existing architecture-related docs.
2. Run a Repo Evidence Pass before drafting. Inspect entrypoints and command surfaces, package/config scripts, runtime boundaries, storage/state, external systems, tests that reveal intended behavior, and recent commit history. Execution logs (e.g. sprint files) when available.
3. Draft from `templates/system-map.md`; keep sections short and link out instead of expanding subsystem detail.
4. Include: System Shape, Runtime Boundaries, Core Flows, Storage And External Systems, Project-Wide Invariants, Candidate Capability Boundaries, Where To Go Next.
5. If the repo is brownfield, mark uncertain boundaries as assumptions rather than inventing detail.
6. Use Candidate Capability Boundaries to hand off concrete, short candidates to `spec-grill`. Each candidate should name evidence, the contract surface it appears to own, and the uncertainty `spec-grill` must resolve.
7. Recommend asking `spec-grill` to review those candidates when the map reveals durable boundaries that are not yet in `spec/capabilities.md`.
8. If the user is landing the full spec axis, point them to `../spec-grill/references/spec-pipeline-ready.md` after the map and at least one accepted capability exist.

The Repo Evidence Pass is an agent checklist, not a new script. Report evidence in the conversation, not as inventory inside `spec/system-map.md`.

## Amend

1. Re-read `spec/system-map.md` and the concrete change evidence.
2. Update only project-wide shape, boundaries, flows, storage/external systems, invariants, or pointers.
3. Move low-level module details, endpoint lists, deployment commands, and temporary implementation notes out of the map.
4. If a change is really a capability contract, route it to `spec-grill`. If it changes why/good-state, route it to charter amend.

## Quality checks

- A reader can understand the project shape in under 5 minutes.
- Every section names current project-wide facts, not aspirational design.
- The map links to deeper docs instead of copying them.
- No subsystem gets more detail than the whole-system flow needs.
- Candidate Capability Boundaries are short handoff candidates, not a module inventory.
- No stale module-level TODOs, endpoint inventories, or runbook commands.
- Brownfield maps are not based only on README/top-level directory skimming; unsupported boundaries are labeled as assumptions.

## Failure modes

- drafting from README and top-level folders alone, skipping the Repo Evidence Pass
- sections drifting into aspirational design instead of current, evidence-backed facts
- endpoint or API inventories creeping into Core Flows or Storage And External Systems
- amend mode absorbing helper functions, single endpoints, or deployment commands
- charter-level or capability-level changes getting edited into the map instead of routed out
