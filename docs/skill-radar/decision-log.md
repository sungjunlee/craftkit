# Skill Radar Decision Log

Record only durable judgment changes here. Do not duplicate full snapshot content.

## 2026-04-16

### Decision: `current.md` is the default runtime source

- status: `accepted`
- rationale: Downstream skill-design workflows need a stable canonical view, not a requirement to re-read the full history on every run.
- consequence: Snapshots provide evidence; `current.md` provides today's judgment.

### Decision: snapshots stay time-scoped and mostly append-only

- status: `accepted`
- rationale: A monthly or event snapshot should preserve what looked true at that time. Rewriting old snapshots would erase the trend line this system is supposed to keep.
- consequence: Corrections belong in a newer snapshot plus, when needed, a note here.

### Decision: every notable pattern must end in `adopt`, `avoid`, or `watch`

- status: `accepted`
- rationale: A radar that only lists ideas does not reduce ambiguity. The value comes from classification, not collection.
- consequence: Snapshots may contain nuance, but they still need a terminal judgment.

### Decision: `watch` is the default holding state for promising but unstable patterns

- status: `accepted`
- rationale: This prevents CraftKit from overfitting to a single documentation wave or product moment.
- consequence: Promotion from `watch` to `adopt` should usually require either repeated support or one strong primary-source shift plus a clear CraftKit fit call.
