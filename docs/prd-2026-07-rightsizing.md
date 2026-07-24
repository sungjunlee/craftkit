# PRD: CraftKit Right-sizing Pass (2026-07)

Status: draft — source document for deriving epics and GitHub issues.
Author: maintainer + review session 2026-07-24.

## 1. Background

This pass follows the 2026-07 de-prescription pass (`prd-2026-07-deprescription.md`,
PRD-DP). That pass loosened skill *output contracts*; this one applies the
same lens one level up — to the *composition of the toolkit itself*.

The driving observation from the maintainer: as frontier models improve,
CraftKit's marginal utility is drifting down, and some skills should be
removed or lightened. Separating the felt "utility decline" into its two
distinct causes is the core analytical move of this PRD, because conflating
them pushes every doubt toward deletion:

1. **Model erosion.** A better model makes a skill's *prescription*
   redundant — it reproduces the behavior from a direction-level instruction.
   The correct response is almost never deletion; it is *keep the machinery
   and curated knowledge, loosen the prescription*.
2. **Usage.** Independent of model quality, a skill is simply not run.
   Deletion is justified here, and only here — decided by maintainer usage
   data, not by model capability. (`craft-tune` fell to this axis in PRD-DP.)

### Center-of-gravity thesis

The durable value a skill can hold falls into a few kinds: **state/side-effect
machinery** (deterministic paths, clipboard, hooks, archiving — a wiring
problem, not an intelligence problem), **time-sensitive curated knowledge**
(platform surfaces, radar), and **direction-setting** (a short frame that
delegates judgment to the model). Machinery and curation are model-independent;
raw prescription is what erodes.

So the thesis that organizes this pass: **as models improve, CraftKit's center
of gravity should move from "tell the model how to think" toward "give the
model durable state and direction it cannot hold on its own."** Every verdict
below follows from it.

## 2. Goals

- G1: Remove eroded-and-unused surface (`craft-survey`) without breaking
  family routing or losing the one durable pointer worth keeping.
- G2: Right-size `craft-harness` to its real single job; preserve its
  time-sensitive curated assets as references; set an explicit use-or-delete
  checkpoint so an aspirational-but-unused skill is not carried indefinitely.
- G3: Re-aim `craft-critique` so **subtraction is a first-class finding
  class** and it stops over-prescribing what a capable model already does.
- G4: Loosen `craft-handoff`'s content contract while preserving its
  machinery and a minimum orientation floor.
- G5: Leave the repo coherent at 9 skills and record the center-of-gravity
  thesis as durable design guidance.

## 3. Non-goals

- **No `craft-harness` deletion this pass.** The maintainer wants the
  capability; the execution never landed. Shrink + checkpoint, do not remove.
- **No `spec-*` behavior changes.** `spec-*` is actively used and delivers
  real anti-drift value; it is the investment direction, not a target. It
  appears here only as a *candidate input* to a slimmed `craft-harness`, and
  only as a design note — not a feature to build now.
- **Do not build the spec → harness feed** as a full feature in this pass.
  Capture the vision; avoid over-building against a fuzzy target.
- `craft-autoresearch` stays dormant/explicit-only exactly as PRD-DP left it.
- No new eval-suite runs (that is #155, a separate dedicated session).
- No relaxation of verify's *spine anatomy* checks. What loosens are skills'
  *output/content* contracts, not the family section contract for SKILL.md.

## 4. Findings inventory (evidence)

### 4.1 craft-survey — removal case (usage axis)

| ID | Finding | Evidence |
|----|---------|----------|
| S1 | Near-zero real usage, and the maintainer reports it does not work as desired | maintainer statement 2026-07-24 |
| S2 | No machinery to justify the skill as an entry point — `refs:0 scripts:0`; the whole job is "point the model at doing a survey", which a search-enabled frontier model does from a one-line instruction | `skills/craft-survey/` inventory |
| S3 | The residual "structured prior-art" job is already partially covered by `craft-skill-spec`'s internal radar (time-aware curation instead of fresh web research each time), so removal loses no capability if a pointer is left | `skills/craft-skill-spec/references/radar/` |

Same profile as `craft-tune`: zero usage + no machinery + native-able.

### 4.2 craft-harness — shrink case (usage axis, aspiration intact)

| ID | Finding | Evidence |
|----|---------|----------|
| H1 | The capability is wanted — per-project skill/hook setup — but practice is zero; the maintainer suspects it was never faithfully built | maintainer statement 2026-07-24 |
| H2 | Root cause is over-prescription: a 218-line spine layers a 7-mode lifecycle taxonomy (`bootstrap`/`task-fit`/`repair`/`sync`/`adopt`/`prune`/`maintain`) — it regulates an entire management lifecycle before the *first* use has landed, so entry cost is high and payoff is unclear | `skills/craft-harness/SKILL.md` (218 lines) |
| H3 | The load-bearing, model-independent asset is the curated knowledge, not the lifecycle: platform surfaces and the reviewable hook asset pack are time-sensitive and worth preserving on any shrink | `skills/craft-harness/references/platform-surfaces.md`; hook asset pack |
| H4 | Completion-vision candidate: the recurring cost is re-deriving "what this project is" every time; a slimmed harness could consume `spec-*` outputs (`charter`/`system-map`/`capabilities`) as input — the skill the maintainer *uses* feeding the one they *want* | `spec-*` outputs; maintainer intent |

### 4.3 craft-critique — re-aim case (model-erosion axis)

| ID | Finding | Evidence |
|----|---------|----------|
| C1 | Critique has an **additive bias**: a reviewer naturally produces "missing X, handle Y, consider Z" (candidate additions); "cut this, it doesn't earn its place" is rarer because absence is harder to notice and a subtractive critique *feels* like it found less. Run critique → apply in a loop and the artifact monotonically grows — the opposite of right-sizing. Same shape as the prescription ratchet, one level up | maintainer doubt 2026-07-24; `docs/methodology/` ratchet framing |
| C2 | In the current 80-line spine the subtractive lens exists but is buried — Step 2 "sections that don't earn their keep", Step 3 "redundancy" — and is not a first-class output class; the three must-convey items (findings / what-works / what-to-do) omit "what to cut" | `skills/craft-critique/SKILL.md:34-47` |
| C3 | No guardrail against prescribing what a capable model already does well — the exact behavior that turns a critique into over-detail on a modern model | `skills/craft-critique/SKILL.md` §Guardrails |
| C4 | Open design tension: the maintainer's felt need may be a *simplify* verb (bias toward "what can go"), which is the opposite bias from critique ("what's wrong"). Resolve by baking the subtractive lens into the single skill, not by adding a mode (a mode is itself prescription) | maintainer framing 2026-07-24 |

### 4.4 craft-handoff — loosen case (model-erosion axis)

| ID | Finding | Evidence |
|----|---------|----------|
| D1 | The maintainer uses it well but feels the content contract over-constrains. The machinery is model-independent state wiring and must stay: `gather-state.mjs`, the paired doc+prompt layout, archive-before-overwrite, cross-platform clipboard, the auto-load hook | `skills/craft-handoff/scripts/`; SKILL.md §5 |
| D2 | The over-specified part is content prescription a capable model can be trusted with: the exact "Chat return, in order 1-5" contract and the per-section inclusion tests in §2 Distill | `skills/craft-handoff/SKILL.md:76-86, 128-143` |
| D3 | Counter-constraint: the handoff is consumed by *another agent* under fresh/compacted context, so a fully free-form artifact risks dropping orientation. A minimum floor (branch, next step, doc-read instruction) must remain must-convey | `skills/craft-handoff/SKILL.md` §Output format |

### 4.5 spec-* — keep and invest (state axis, no change this pass)

| ID | Finding | Evidence |
|----|---------|----------|
| P1 | Actively used; delivers felt value in large projects — keeping direction from drifting, catching and updating quickly ("without it, it feels overwhelming") | maintainer statement 2026-07-24 |
| P2 | The value is a **durable direction anchor that survives context loss** — a state/continuity problem, not an intelligence problem — so it is model-independent and holds or rises as models improve. This is the toolkit's investment direction | thesis §1 |

## 5. Workstreams (epic candidates)

### E1 — Trim the erodible and unused edges (G1, G2) · Epic A

- **E1.1** Remove `craft-survey`: delete `skills/craft-survey/`; strip
  README routing/family/count, `docs/skill-anatomy.md` scope list and counts,
  and any cross-references in other skill spines; leave one pointer (prior-art
  needs → `craft-skill-spec` radar). CHANGELOG "Removed (BREAKING)" entry
  following the `craft-tune`/`craft-scaffold` precedent. Update
  `scripts/verify.mjs` and `test/verify.test.mjs` for any survey/9-skill
  assumptions. Atomic — verify green at every commit. (S1, S2, S3)
- **E1.2** Right-size `craft-harness`: drop the 7-mode lifecycle taxonomy;
  rewrite the spine around one job — *given this project, propose and install
  a minimal, concrete harness (the specific skills + hooks worth adding).*
  Keep platform surfaces and the hook asset pack in a reference role, not
  deleted. CHANGELOG "Changed". (H1, H2, H3)
- **E1.3** Harness completion note + checkpoint: a short design note
  capturing the `spec-*` → harness feed as the completion vision (no
  implementation), plus a dated use-or-delete checkpoint recorded in the
  sprint record — if the slimmed skill is still unused next cycle, delete it.
  (H4)

### E2 — Loosen prescription on the keepers (G3, G4) · Epic B

- **E2.1** Re-aim `craft-critique` toward subtraction: elevate "what should
  not exist / what to cut" to a first-class finding class in Steps and in the
  Output format must-convey list; add a guardrail — *don't prescribe what a
  capable model already does well.* Keep the ≤80-line judgment-contract spine,
  the severity+evidence discipline, the read-only default, and
  `references/failure-modes.md`. Note the critique-vs-simplify tension (C4) in
  the commit body / anatomy doc; do not add a mode. (C1, C2, C3, C4)
- **E2.2** Loosen `craft-handoff` content contract: convert the ordered
  "Chat return 1-5" contract and the §2 Distill per-section inclusion tests
  to must-convey judgment requirements; state explicitly that the machinery
  (scripts, paired layout, archiving, clipboard, hook) is unchanged; keep the
  orientation floor (branch, next step, doc-read) as must-convey. CHANGELOG
  "Changed". (D1, D2, D3)

### E3 — Alignment and release (G5) · Epic C

- **E3.1** Repo-wide coherence: README skill count (10 → 9), family
  descriptions and routing; `docs/skill-anatomy.md` scope list and counts;
  `docs/status.md` evidence rows; parent workspace `CLAUDE.md` (10 → 9, drop
  `craft-survey`; file edit only, not a git repo). Record the center-of-gravity
  thesis as a durable design principle (README Key Design Principles +
  skill-anatomy). Run `npm run verify` **and** `npm test`. Cut `0.3.0`
  (version bump + CHANGELOG release section + link ref). (G5)

## 6. Sequencing and priorities

1. **P0:** E1.1 (survey removal + verify/test, atomic).
2. **P1:** E1.2 (harness shrink), E2.1 (critique re-aim), E2.2 (handoff loosen)
   — independent, parallelizable across skills.
3. **P2:** E1.3 (harness completion note + checkpoint).
4. **P3:** E3.1 (alignment + release), last, against the final 9-skill shape.

Rationale: removal first so downstream alignment runs against the final
family shape; the release is cut only after every skill change has landed and
verify + npm test are green.

## 7. Acceptance criteria

- `skills/` contains 9 skills; `npm run verify` and `npm test` pass at every
  commit.
- `grep -r craft-survey` returns only allow-listed historical records
  (CHANGELOG, dated radar snapshots, backlog archive).
- `craft-harness` spine drops the lifecycle-mode taxonomy and states a single
  job; platform surfaces and the hook asset pack survive as references; a
  design note captures the spec-feed vision and a dated use-or-delete
  checkpoint exists.
- `craft-critique` spine names subtraction as a first-class finding class and
  carries the "don't prescribe what the model already does" guardrail; stays
  ≤80 lines with the judgment-contract shape and `references/failure-modes.md`.
- `craft-handoff` machinery is unchanged; the content contract reads as
  must-convey with a preserved orientation floor.
- README, skill-anatomy, status, and parent `CLAUDE.md` agree on 9 skills;
  the center-of-gravity principle is recorded; `0.3.0` is released.

## 8. Risks

- **Shrinking harness loses its curated knowledge** — mitigated: platform
  surfaces and the hook asset pack are kept as references, not deleted.
- **The slimmed harness still goes unused** — mitigated: an explicit dated
  use-or-delete checkpoint, so it is not carried on aspiration indefinitely.
- **Subtractive re-aim over-corrects into "delete everything"** — mitigated:
  subtraction is a finding *class* weighed by leverage and evidence, not a
  mandate; the ordering-by-leverage rule stays.
- **Handoff loosening drops orientation for the next agent** — mitigated: the
  orientation floor stays must-convey.
- **Blast-radius stragglers on survey removal** — acceptance grep allow-list.
- **Verify/test breakage mid-flight** — survey removal is atomic; run
  `npm test`, not only `npm run verify` (PRD-DP lesson).
