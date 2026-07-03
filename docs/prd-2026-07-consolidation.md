# PRD: CraftKit Consolidation Pass (2026-07)

Status: draft — source document for deriving epics and GitHub issues.
Author: maintainer + review session 2026-07-03.

## 1. Background

CraftKit has grown from 7 `craft-*` skills to 11 skills across two families
(`craft-*` artifact skills, `spec-*` repo-spec skills). A full review pass
(2026-07-03) found the core design healthy — least-invasive routing, enforced
spine budgets, honest evidence tracking in `docs/status.md` — but surfaced
drift in three areas:

1. **Feedback-loop ceiling.** `craft-autoresearch` is structurally sound
   (its loop is isomorphic to Microsoft SkillOpt: rollout → reflect →
   bounded edit → validate) but under-powered: 3-5 test inputs and no
   held-out validation make KEEP/DISCARD noise-dominated and overfit-prone.
   Known lessons (Self-LGTM misses issues that a second review pass catches,
   2026-05-15 dogfood) are not yet fed back into the skill bodies.
2. **Cross-skill consistency drift.** Two section-template families, three
   names for the same validation concept, frontmatter field divergence, and
   unguarded content duplication between spines.
3. **Documentation/identity drift.** README wedge statement vs `spec-*`
   scope, stale parent-workspace docs, incomplete reference indexes, and a
   radar layer whose freshness contract is undefined.

## 2. Goals

- G1: Make the improvement loop trustworthy — changes kept by
  `craft-autoresearch` should generalize, and convergence claims by
  `craft-tune` should carry the right caveat.
- G2: One predictable skill anatomy per family, so a reader (or a future
  tune/autoresearch pass) can navigate any skill without re-learning its
  layout.
- G3: Encode consistency rules in `npm run verify`, not in prose — drift
  should fail CI, not wait for the next human review.
- G4: Reduce always-loaded and maintainer-carried weight (no-op sections,
  unguarded duplication, unbounded radar growth) without losing behavior.

## 3. Non-goals

- No new skills; no re-merging `craft-critique` into `craft-tune` (settled
  2026-05-21).
- No runtime framework, CLI, or auto-installer (bootstrap non-goals stand).
- Not replacing `craft-autoresearch` with SkillOpt wholesale — pilot first,
  decide from evidence.
- No renaming of top-level skills (only section headings and internal shape).

## 4. Findings inventory (evidence)

### 4.1 Feedback loop

| ID | Finding | Evidence |
|----|---------|----------|
| F1 | No held-out validation in autoresearch; overfit detection is post-hoc only ("1-week re-run") | `skills/craft-autoresearch/SKILL.md` §Inputs (3-5 test inputs), §Failure modes |
| F2 | Self-LGTM is self-graded; dogfood showed a PR-review second pass catches what convergence missed, but the skill does not say so | `skills/craft-tune/SKILL.md` §Stop conditions; 2026-05-15 PR #9 experience |
| F3 | SkillOpt (microsoft.github.io/SkillOpt) adds exactly what F1 lacks: held-out accept gate + programmatic rollout volume | external; loop shape otherwise matches craft-autoresearch |
| F4 | Eval-suite design is the real bottleneck (the ≥95% baseline guardrail exists because suites saturate) | `skills/craft-autoresearch/SKILL.md` §Guardrails |

### 4.2 Consistency / duplication

| ID | Finding | Evidence |
|----|---------|----------|
| C1 | Two heading-template families and mixed heading case: `craft-*` sentence case ("Use this when") vs `spec-*` Title Case ("Execution Contract") | all 11 spines |
| C2 | Three names for the same validation-section concept: "Verification prompts" (craft-harness), "Eval Prompts" (spec-system-map), "Pressure Prompts" (spec-grill) | respective SKILL.md files |
| C3 | `craft-prompt` spine has no Purpose, Guardrails, Failure modes, or Example section (uses Process/Principles); violates repo DoD item 2 at spine level | `skills/craft-prompt/SKILL.md`; `CLAUDE.md` §Definition of done |
| C4 | `craft-critique` names its meta section "Common mistakes" while all other skills use "Failure modes" (partly justified: its *output contract* already has a "Failure modes" section) | `skills/craft-critique/SKILL.md` |
| C5 | `craft-prompt` §Principles ≈ `craft-tune` §Principles (same 4 ideas, different prose) — content duplication invisible to the mirror check, which only guards byte-identical pairs | both spines; `scripts/verify.mjs` checkMirroredReferences |
| C6 | Frontmatter divergence: `spec-*` carry `argument-hint`, `compatibility`, `metadata.related-skills`; no `craft-*` skill does, including moded/related ones | frontmatter audit |
| C7 | `spec-grill` §References indexes only 1 file while the body cites `references/capabilities.md` (file exists, unindexed) | `skills/spec-grill/SKILL.md:166,176` |
| C8 | Invocation-policy asymmetry: `craft-survey` (read-only) is explicit-only while `craft-critique` (read-only) is implicit — stated policy says implicit is for low-risk read-only skills | README §Invocation policy; frontmatter audit |
| C9 | Terminology guard in verify covers exactly one file and two phrases — ad-hoc rather than a rule | `scripts/verify.mjs` checkTerminology |

### 4.3 Weight / no-op candidates

| ID | Finding | Evidence |
|----|---------|----------|
| W1 | Radar layer is 1,402 lines across 10 files for one consuming skill; `current.md` last reviewed 2026-05-01 (2 months stale); no refresh cadence or snapshot retention rule anywhere | `skills/craft-skill-spec/references/radar/` |
| W2 | `craft-harness` output contract mandates 8 sections regardless of request size; spine sits at 219/220 lines | `skills/craft-harness/SKILL.md` §Output format |
| W3 | `spec-grill` keeps routing table + 3 contracts + admission test + interview flow + 3-axis test all in-spine; uses references least of any skill | `skills/spec-grill/SKILL.md` (178 lines / ~1,770 words) |
| W4 | `craft-prompt` ships 5 platform guides with no freshness ownership (guides rot faster than radar) | `skills/craft-prompt/guides/` |

### 4.4 Identity / docs

| ID | Finding | Evidence |
|----|---------|----------|
| D1 | README wedge ("not a project-management layer") vs `spec-*` pipeline scope; relationship to dev-backlog's `backlog-charter` undocumented | `README.md:11`; parent `CLAUDE.md` |
| D2 | Parent workspace `CLAUDE.md` still says "7 craft-* skills" and stale skill names | `../CLAUDE.md`; known memory item |
| D3 | `spec-*`, `craft-skill-spec`, `craft-harness` lack replay/autoresearch evidence (tracked honestly as known gaps) | `docs/status.md` |

### Already guarded — no action

`verify.mjs` already enforces: spine ≤220 lines, description ≤50 words,
frontmatter validity, byte-identical mirrored references
(failure-modes.md pair), and `disable-model-invocation` ↔
`agents/openai.yaml` pairing (audited: consistent across all 11 skills).

## 5. Workstreams (epic candidates)

### E1 — Feedback-loop hardening (G1) · highest priority

- **E1.1** Add held-out discipline to `craft-autoresearch`: raise minimum
  test inputs (e.g. 6-10), split train/holdout, KEEP decided on train,
  session-level acceptance requires holdout non-regression. Update
  `references/eval-guide.md` and the contract example in the same commit.
  (F1, F3)
- **E1.2** Add a convergence caveat to `craft-tune` §Final output:
  Self-LGTM is self-graded; recommend an independent second pass
  (`craft-critique` in a fresh context, or PR review) before shipping the
  tuned artifact. (F2)
- **E1.3** SkillOpt pilot: run SkillOpt once against one machine-scorable
  skill (`craft-critique` — its output contract is regex-checkable) and
  write a short adopt/fork/defer decision, radar-style. Explicitly compare
  cost (scorer authoring, task setup) vs agent-in-the-loop autoresearch.
  (F3, F4)
- **E1.4** Reposition `craft-autoresearch` docs: the durable value is the
  experiment contract + eval-design methodology; the loop executor is
  swappable (agent-run today, SkillOpt-run when scoreable). One paragraph
  in Purpose, not a rewrite. (F3, F4)

### E2 — Skill anatomy normalization (G2)

- **E2.1** Define one canonical section contract per family and write it
  down (e.g. `docs/skill-anatomy.md`): craft-* = Purpose / Use this when /
  Inputs / Steps-or-Workflow / Output format / Guardrails / Failure modes /
  Example / References; spec-* = router-contract variant. Fix heading case
  to sentence case everywhere. (C1)
- **E2.2** Unify the validation-section name (pick one: "Verification
  prompts") across craft-harness, spec-system-map, spec-grill,
  craft-skill-spec eval plan naming stays as an *output* section. (C2)
- **E2.3** Bring `craft-prompt` to the family contract: add compact
  Purpose + Example + Failure modes (move content, don't grow net lines —
  offset by trimming §Principles per E3.1). (C3)
- **E2.4** Resolve `craft-critique` "Common mistakes" naming — either
  rename to "Failure modes (of this skill)" or document the collision
  exemption in the anatomy doc. (C4)
- **E2.5** Frontmatter parity: add `argument-hint` and
  `metadata.related-skills` where they carry information for craft-*
  skills (e.g. craft-tune ↔ craft-critique ↔ craft-autoresearch triangle);
  decide `compatibility` policy once. (C6)
- **E2.6** Revisit `craft-survey` invocation policy against the stated
  read-only rule — either flip to implicit or document why survey is
  higher-ceremony than critique. (C8)

### E3 — Deduplication (G4)

- **E3.1** Extract the shared 4 principles (context>instruction, outcome
  over process, cut order, right-sized) into one mirrored reference or a
  single canonical location cross-referenced from craft-prompt and
  craft-tune; if mirrored, register the pair in verify. (C5)
- **E3.2** Fix `spec-grill` reference index: list `capabilities.md`;
  while there, demote one in-spine block (candidate: Grill Report
  template) to references to create headroom. (C7, W3)

### E4 — Verify as the consistency backstop (G3)

- **E4.1** Reference-index completeness check: every `references/*.md`
  file must be cited somewhere in its skill's SKILL.md, and every
  `references/` path cited must exist. (Would have caught C7.)
- **E4.2** Section-contract check per family from the E2.1 anatomy doc
  (required headings present, order optional first pass). (C1)
- **E4.3** Generalize the terminology check into a small data table
  (file-glob → forbidden phrases) instead of one hardcoded entry. (C9)
- **E4.4** Radar staleness warning: parse `last reviewed:` in
  `radar/current.md`; warn (not fail) past a configurable age. (W1)

### E5 — Weight reduction (G4)

- **E5.1** Radar lifecycle policy: refresh cadence (e.g. every 2 months or
  after a major harness release), snapshot retention (keep last N dated
  snapshots, fold older ones into decision-log), and do one 2026-07
  refresh applying it. (W1)
- **E5.2** `craft-harness` output sizing rule: small/repair-mode requests
  emit thesis + proposed changes + verification only; full 8-section
  contract reserved for bootstrap/adopt/sync. Frees spine headroom. (W2)
- **E5.3** Guide freshness ownership for `craft-prompt/guides/`: add a
  `last reviewed` line per guide + fold into the E4.4 staleness check, or
  explicitly declare guides best-effort in README. (W4)

### E6 — Identity and docs alignment

- **E6.1** README: state the spec-* boundary explicitly (why a repo spec
  axis belongs in an artifact-quality toolkit — or carve it as a named
  second wedge) and document the relationship to dev-backlog
  `backlog-charter`. (D1)
- **E6.2** Update parent workspace `CLAUDE.md` (skill count, names,
  spec-* family). Separate repo, separate commit. (D2)
- **E6.3** Schedule replay passes for `spec-grill` routes and
  `craft-harness` risk-gating (the two where mis-routing mutates files);
  record in `docs/status.md`. Depends on E1.1 landing first so passes use
  the held-out discipline. (D3)

## 6. Sequencing and priorities

1. **P0:** E1.1, E1.2 (loop trust — small diffs, immediate effect),
   E3.2/C7 fix (one-line), E6.2 (doc lie).
2. **P1:** E2.1 anatomy doc → E4.1/E4.2 verify checks → E2.2-E2.5
   mechanical normalization (in that order: contract before enforcement
   before edits).
3. **P2:** E5.1 radar refresh + policy, E1.3 SkillOpt pilot, E5.2, E6.1.
4. **P3:** E4.3, E4.4, E5.3, E2.6, E6.3.

Rationale: consistency edits (E2) without the verify backstop (E4) will
drift again; verify checks without a written contract (E2.1) encode
accidental current state. Hence contract → checks → edits.

## 7. Acceptance criteria

- `npm run verify` passes and additionally fails on: unindexed reference
  files, missing family-required sections, terminology-table violations.
- `craft-autoresearch` contract template shows train/holdout split;
  `references/eval-guide.md` and `contract-example.md` updated in the same
  commit (per repo rule that skill + references move as one unit).
- `craft-tune` final output spec names the independent-second-pass
  recommendation.
- Radar `current.md` shows a 2026-07 review date and a written cadence +
  retention rule in `radar/policy.md`.
- SkillOpt pilot produces a dated adopt/fork/defer note (radar snapshot or
  decision-log entry), regardless of outcome.
- Every SKILL.md still ≤220 lines after normalization (E2.3, E5.2 must not
  grow spines).
- README and parent CLAUDE.md agree on skill count and family boundaries.

## 8. Risks

- **Normalization churn without behavior change** — mitigate: E2 edits are
  heading/structure-only, verified by before/after routing checks in
  README §Routing checks.
- **Verify over-fitting** (checks that block legitimate future shapes) —
  mitigate: section-contract check starts as presence-only; escalate to
  ordering only if drift recurs.
- **SkillOpt pilot rabbit hole** — timebox: one skill, one suite, one
  decision note; fold learnings into E1.4 wording either way.
- **Radar refresh scope creep** — the 2026-07 refresh applies the new
  policy; it is not a full re-survey of the ecosystem.
