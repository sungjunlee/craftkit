# PRD: Post-Review Hardening Pass (2026-07)

Status: draft — source document for deriving epics and GitHub issues.
Author: maintainer + multi-model review session 2026-07-06.

## 1. Background

On 2026-07-06 CraftKit went through an essence-level review by three
independent fresh-context reviewers (Codex/GPT-5.x, GLM-5.2, Kimi K2.7)
plus a synthesizing Claude session. The consolidation pass
(`docs/prd-2026-07-consolidation.md`) had already landed its structural
epics (anatomy contract, verify backstop, sizing rule, radar lifecycle),
and the reviewers confirmed the core design is sound. Their consensus
verdict:

> CraftKit's durable, non-commodity value is its *review discipline* —
> loop stop conditions (Self-LGTM / fixpoint / hard cap), the
> baseline-saturation + holdout gate, and the 3-axis predicate test.
> Generic prompt drafting is the commodity edge that platform vendors
> will absorb.

Three drift areas survived the consolidation pass and were flagged by
multiple reviewers independently:

1. **Contract-integrity gap.** `docs/skill-anatomy.md` claims to be
   normative, but 7 known section deviations are baselined as warnings
   in `scripts/verify.mjs` — the contract warns instead of failing.
   The riskiest instance is `craft-handoff`: a file-writing,
   clipboard-mutating skill with no `## Guardrails` or
   `## Output format` section.
2. **Portability leak in spec-\*.** Since the 2026-07-04 ownership move,
   the spec-\* spines still speak dev-backlog/dev-relay vocabulary
   ("relay-learning destination", sprint `component:` frontmatter,
   "relay run") that a standalone `npx skills add sungjunlee/craftkit`
   user cannot resolve.
3. **Ceremony asymmetry.** The sizing-rule pattern (small requests get
   3 sections) landed in `craft-harness` but not in `spec-grill`
   (9 mandatory report sections for a no-arg query) or `spec-charter`
   reassess; `craft-autoresearch` carries eval-design theory in-spine
   at 208/220 lines.

## 2. Goals

- G1: The anatomy contract is trustworthy — zero baselined deviations,
  and new drift fails `npm run verify` instead of warning.
- G2: Every spec-\* spine is fully resolvable by a standalone CraftKit
  user; ecosystem integration lives in references, not the spine.
- G3: Output ceremony is proportional to request size across all
  report-emitting skills, not just `craft-harness`.
- G4: The methodology assets (loop-stop taxonomy, 3-axis predicate
  test) are discoverable without adopting the full suite — they are the
  flagship, and the docs should say so.

## 3. Non-goals

- No skill merges. Reviewer proposals to merge `craft-handoff` into
  `craft-prompt` (2/3) and `craft-skill-spec` into `craft-harness`
  (1/3) are rejected: the handoff pair-write infrastructure is the
  product, and the critique/tune history (merged 2026-04-25, reverted
  2026-05-21) shows behavior-boundary splits should stand.
- No `craft-survey` removal. Flagged as commodity-exposed by one
  reviewer; decision deferred to usage evidence (same bar that removed
  `craft-scaffold`). Watch item, not work item.
- No radar re-architecture. Upkeep concern is real but the lifecycle
  policy from the consolidation pass (cadence + staleness warning) is
  the mitigation; let it run before adding more.
- No overlap with open issues #102/#106/#107 (feedback-loop epic) or
  #122 (replay evidence) — those stand as scoped.

## 4. Findings inventory (evidence)

Reviewer attribution: CX = Codex/GPT-5.x, GL = GLM-5.2, KM = Kimi
K2.7, CL = Claude synthesis. Consensus = flagged independently by ≥3.

### 4.1 Contract integrity

| ID | Finding | Evidence | Flagged by |
|----|---------|----------|------------|
| R1 | `craft-handoff` missing `## Guardrails` and `## Output format`; output shape buried in Workflow steps 3-6 prose. Highest-risk deviation: the skill writes files and mutates the clipboard | `skills/craft-handoff/SKILL.md:113-138`; verify warnings | consensus (CX, GL, KM) |
| R2 | `craft-harness` missing `## Use this when`, `## Guardrails`, `## References` (5 reference files cited inline only) | verify warnings; `docs/skill-anatomy.md` §Not yet mapped | GL, KM, CL |
| R3 | `craft-critique` missing `## References`; `craft-skill-spec` missing `## Use this when` | verify warnings | GL, KM |
| R4 | The anatomy doc claims "normative/canonical" while `knownSectionDeviations` downgrades misses to warnings — the contract cannot be trusted until the baseline is empty and removed | `scripts/verify.mjs:82-87`; `docs/skill-anatomy.md:3` | CX (rated HIGH) |

### 4.2 spec-\* portability

| ID | Finding | Evidence | Flagged by |
|----|---------|----------|------------|
| R5 | "It owns a primary relay-learning destination" in the capability admission test — undefined term inside CraftKit | `skills/spec-grill/SKILL.md:93` | CL, CX |
| R6 | "Capability slugs are strict routing handles used by sprint `component:` frontmatter" — assumes dev-backlog sprint files | `skills/spec-grill/SKILL.md:33` | CL, CX, KM |
| R7 | Tier-2 proof gate cites "relay run whose Done Criteria match" — assumes dev-relay | `skills/spec-charter/SKILL.md:104,133` | CL |
| R8 | `spec-system-map` thinnest of the family: no `Use this when`, no `Failure modes`, no `Inputs`; "Repo Evidence Pass" is one step doing implicit work | `skills/spec-system-map/SKILL.md` (89 lines) | GL |

### 4.3 Ceremony / right-sizing

| ID | Finding | Evidence | Flagged by |
|----|---------|----------|------------|
| R9 | `spec-grill` mandates 9 report sections in order even for a no-arg ambiguous query; an agent will follow this brittlely and inflate one-line questions into full reports | `skills/spec-grill/SKILL.md:53-57` | consensus (CX, GL, KM) |
| R10 | `spec-charter` reassess mandates 8 report sections with no size gate | `skills/spec-charter/SKILL.md:121-126` | CX |
| R11 | `craft-autoresearch` spine teaches eval-suite *theory* in-spine ("evals 4th diagnostic", "first-mutation hypothesis preview" justification rules) at 208/220 lines; the depth duplicates what `references/eval-guide.md` and `contract-example.md` carry | `skills/craft-autoresearch/SKILL.md:91-97` | GL, KM |

### 4.4 Discovery / standalone usability

| ID | Finding | Evidence | Flagged by |
|----|---------|----------|------------|
| R12 | `craft-harness` frontmatter description is a surface catalog (8 nouns), not a trigger — says where to look, not what the skill does | `skills/craft-harness/SKILL.md:3` | GL |
| R13 | `craft-handoff` invokes `node <skill-dir>/scripts/gather-state.mjs` and a sed pipeline without defining how `<skill-dir>` resolves; a copy-paste standalone user cannot run it | `skills/craft-handoff/SKILL.md:36,123` | KM |
| R14 | The methodology assets (3-axis predicate test, loop-stop taxonomy) are buried inside individual skill spines; a non-adopter cannot discover CraftKit's non-commodity value without installing the suite | `skills/spec-grill/SKILL.md:114-124`; `skills/craft-tune/SKILL.md:50-59` | GL (CX double-down concurs) |

### Watch items — no action this pass

- `craft-survey` usage evidence: apply the craft-scaffold bar (remove
  when the niche demonstrably collapses); revisit at next review.
- `craft-handoff` platform-absorption pressure: add "what survives
  vs platform-native continuation features" as an eval question in its
  next autoresearch pass (fold into existing status.md known gap).
- Radar upkeep cost: mitigated by the landed lifecycle policy; verify
  staleness warning is the tripwire.

## 5. Workstreams (epic candidates)

### E1 — Anatomy baseline burn-down and ratchet (G1) · highest priority

- **E1.1** `craft-handoff`: add `## Guardrails` (redact secrets; never
  overwrite the rich doc without archiving; clipboard failure is
  non-fatal and reported; never invent test status) and lift the
  prompt/doc pair shape out of Workflow prose into `## Output format`.
  While in the file, define `<skill-dir>` resolution in `## Inputs`
  (R13 — same file, same commit). (R1, R13)
- **E1.2** `craft-harness`: add `## Use this when` trigger bullets
  (keep "How it differs" as supplement), a compact `## Guardrails`,
  and a final `## References` indexing all 5 reference files. Spine is
  at 212/220 — offset growth by tightening §Non-goals or §Placement
  rules prose. (R2)
- **E1.3** `craft-critique`: add final `## References` (1 file).
  `craft-skill-spec`: add `## Use this when`. (R3)
- **E1.4** Empty `knownSectionDeviations` in `scripts/verify.mjs` and
  delete the baseline mechanism (or keep it as an empty ratchet that
  fails when non-empty and stale). Update `docs/skill-anatomy.md`
  §Current deviations to all-checked. Do this last, after E1.1-E1.3
  land. (R4)

### E2 — spec-\* standalone portability (G2)

- **E2.1** Neutralize ecosystem vocabulary in spec-\* spines:
  - `spec-grill:93` "primary relay-learning destination" → "a primary
    destination for captured learnings" (or equivalent
    consumer-neutral phrasing);
  - `spec-grill:33` sprint `component:` frontmatter → "downstream
    tools (e.g. sprint tooling) may use slugs as routing handles";
  - `spec-charter:104,133` "relay run" → "an agent run whose recorded
    Done Criteria match the predicate".
  Keep dev-backlog/dev-relay as *named examples* in references
  (`spec-charter/references/alignment.md` already exists for this),
  never as undefined load-bearing terms in the spine. (R5, R6, R7)
- **E2.2** Add a terminology-table entry in `scripts/verify.mjs`
  (mechanism landed in the consolidation pass): forbid bare
  `relay-learning` / `component:` frontmatter references in
  `skills/spec-*/SKILL.md` so the leak cannot recur. (R5, R6)
- **E2.3** `spec-system-map` parity: add `Use this when` triggers and
  a `Failure modes` section (candidates from amend-mode drift:
  aspirational sections, endpoint inventories, README-only maps).
  Keep it the smallest spec-\* spine — parity of required sections,
  not of length. (R8)

### E3 — Output-contract right-sizing (G3)

- **E3.1** `spec-grill`: gate the 9-section Grill Report behind the
  candidate-discovery and audit routes. No-arg/ambiguous routes emit a
  short diagnostic (Evidence Read / Evidence Missing / Recommended
  next action) — mirror the `craft-harness` sizing-rule wording so the
  pattern reads identically across the repo. (R9)
- **E3.2** `spec-charter` reassess: same sizing rule — a quick "is
  this stale?" question gets Evidence / No Change / Recommended Next
  Step; the full 8-section report is reserved for periodic health
  checks or multi-file drift. (R10)
- **E3.3** `craft-autoresearch`: keep the contract *field names* in
  `## Output format`, move the theory (what a plausible-failing-output
  is, Build-step enforcement prior justification rules) into
  `references/eval-guide.md` §contract-fields. Target spine ≤190
  lines. Per repo rule, SKILL.md + references move in one commit. (R11)

### E4 — Discovery and description quality (G4)

- **E4.1** Rewrite `craft-harness` description to lead with the job:
  "Decide where agent guidance belongs in a repo and propose the
  smallest harness change" + trigger nouns second. Re-run README
  §Routing checks afterward. (R12)
- **E4.2** Extract the two methodology assets into standalone docs:
  `docs/methodology/predicate-test.md` (3-axis test, authored from
  `spec-grill` §The 3-axis predicate test) and
  `docs/methodology/loop-stop-conditions.md` (Self-LGTM / persistent
  fixpoint / no-op / hard cap taxonomy, from `craft-tune` §Stop
  conditions). Skills cite the docs; docs do not depend on the skills.
  Add a short "The methodology" pointer in README after the 30-second
  path. Mirrored-content risk: register both as guarded references or
  make the skill sections summaries-with-links, not copies. (R14)

## 6. Sequencing and priorities

1. **P0:** E1.1 (riskiest skill, small diff), E2.1 (external users hit
   this today).
2. **P1:** E1.2, E1.3 → E1.4 (burn-down before ratchet), E2.2 (guard
   right after the wording lands), E3.1, E3.2 (one pattern, three
   files — do together).
3. **P2:** E3.3, E2.3, E4.1.
4. **P3:** E4.2 (needs a settled view of what the methodology docs
   should claim; don't rush the flagship statement).

Rationale: contract trust (E1) and portability (E2) are correctness
fixes; ceremony (E3) is behavior tuning; discovery (E4) is positioning.
E1.4 must land last in E1 or verify fails mid-stream.

## 7. Acceptance criteria

- `npm run verify` passes with **zero** baselined-deviation warnings;
  `knownSectionDeviations` is empty or removed; a synthetic missing
  section fails (not warns).
- `grep -rn "relay\|sprint" skills/spec-*/SKILL.md` returns only
  consumer-neutral phrasing or `metadata.related-skills` lines; the
  new terminology-table entry proves it mechanically.
- `spec-grill` no-arg route and `spec-charter` reassess quick route
  each documented with an explicit sizing rule; full report reserved
  for named routes.
- `craft-autoresearch` spine ≤190 lines with contract field names
  intact; `references/eval-guide.md` updated in the same commit.
- All 11 spines still ≤220 lines; README routing checks still route
  correctly after the `craft-harness` description change.
- `docs/methodology/` exists with both docs; README points to it;
  verify guards the skill↔doc mirror if content is duplicated.

## 8. Risks

- **Normalization churn (again).** E1/E2 edits are section and wording
  changes only; guard with before/after README routing checks, same as
  the consolidation pass.
- **Sizing rules teach agents to under-report.** Mirror the
  craft-harness wording exactly ("risk gates still apply in full at
  every size") so trimming ceremony never trims gates.
- **Methodology docs drift from skill behavior.** Either make skill
  sections cite the doc as source of truth, or register the pair in
  verify's mirrored-reference check; do not maintain two unguarded
  copies.
- **Vocabulary neutralization weakens the dev-backlog integration
  story.** Keep the integration explicit in references and README
  (consumer example), just not load-bearing in spines.

## 9. Epic/issue derivation table

Ready to register via `gh issue create` (labels follow the existing
`craft-review` convention; epic issues get `type: epic`).

| # | Title | Type | Labels | Priority | PRD ref |
|---|-------|------|--------|----------|---------|
| 1 | Epic: Anatomy baseline burn-down and ratchet | epic | craft-review, area: skills | high | E1 |
| 2 | craft-handoff: add Guardrails + Output format; define skill-dir resolution (E1.1) | task | craft-review, area: skills | high | E1.1 |
| 3 | craft-harness: add Use this when + Guardrails + References index (E1.2) | task | craft-review, area: skills | high | E1.2 |
| 4 | craft-critique References index; craft-skill-spec Use this when (E1.3) | task | craft-review, area: skills | medium | E1.3 |
| 5 | verify: empty knownSectionDeviations, escalate section misses to failures (E1.4) | task | craft-review, area: ops | high | E1.4 |
| 6 | Epic: spec-* standalone portability | epic | craft-review, area: skills | high | E2 |
| 7 | spec-* spines: neutralize relay/sprint vocabulary; keep integrations in references (E2.1) | task | craft-review, area: skills | high | E2.1 |
| 8 | verify: terminology-table guard for ecosystem vocabulary in spec-* spines (E2.2) | task | craft-review, area: ops | medium | E2.2 |
| 9 | spec-system-map: add Use this when + Failure modes (E2.3) | task | craft-review, area: skills | medium | E2.3 |
| 10 | Epic: output-contract right-sizing | epic | craft-review, area: skills | medium | E3 |
| 11 | spec-grill: sizing rule — short diagnostic for no-arg routes, full report for discovery/audit (E3.1) | task | craft-review, area: skills | medium | E3.1 |
| 12 | spec-charter: sizing rule for reassess quick route (E3.2) | task | craft-review, area: skills | medium | E3.2 |
| 13 | craft-autoresearch: demote contract-field theory to eval-guide; spine ≤190 (E3.3) | task | craft-review, area: skills | medium | E3.3 |
| 14 | craft-harness: description leads with placement judgment, not surface nouns (E4.1) | task | craft-review, area: skills | low | E4.1 |
| 15 | Extract methodology docs: predicate-test.md + loop-stop-conditions.md, README pointer (E4.2) | task | craft-review, area: docs | low | E4.2 |
