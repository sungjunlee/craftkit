# Example report shape

An optional worked example, not a required skeleton. `spec-grill` reports have no fixed sections: the completion contract in `SKILL.md` says what a report must convey, and length follows the run. Use this shape when a wide pass — mapping candidates across a whole repo, or auditing existing capability predicates — benefits from a consistent layout, and drop whatever the run has nothing to say about.

```md
## Capability Report

### Evidence Read
- <file/script/signal and what it proves>

### Evidence Missing
- <missing charter/system-map/tests/docs/surface that weakens confidence>

### Raw Candidates
- <candidate> - raw signal: <surface>; supporting evidence: <docs/code/tests/history>; missing evidence: <gap>

### Accepted / Rejected / Merged / Split Candidates
- Accepted: <candidate> - <reason>
- Rejected: <candidate> - <reason>
- Merged: <candidate A> + <candidate B> -> <candidate C> - <reason>
- Split: <candidate> -> <candidate A>, <candidate B> - <reason>

### Sharp Questions
- <candidate>: <pressure question that must be answered before editing>

### 3-Axis Predicate Findings
- Rejected predicates: <predicate> - failed <axis>
- Rewritten predicates: <before> -> <after>
- Behaviors promoted to constraints: <behavior> -> <constraint>
- Missing proof/evidence: <predicate> - needs <test/doc/runtime invariant/receipt>

### Proposed Next Capability
- <slug and why, or none>

### Recommended Edit
- <specific edit command, "no edit yet", or "stop after charter (plus map on brownfield)">
```
