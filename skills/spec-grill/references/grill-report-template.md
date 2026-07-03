# Grill Report Template

Use this skeleton for the no-arg, ambiguous, candidate-discovery, and audit routes of `spec-grill` whenever the user has not asked for a shorter answer. The contract rules that govern when this shape applies live in `spec-grill/SKILL.md` under `## Execution Contract → ### Grill Report Contract`.

```md
## Grill Report

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
- <slug> - <why this is the next safest contract to write or revise>

### Recommended Edit
- <specific edit command or "no edit yet">
```