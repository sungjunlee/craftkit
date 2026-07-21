# PRD: CraftKit De-prescription Pass (2026-07)

Status: draft — source document for deriving epics and GitHub issues.
Author: maintainer + review session 2026-07-21.

## 1. Background

Two forces drive this pass:

1. **Model capability shift.** Fable-class and GPT-5.6-sol-class models
   reproduce multi-round improve loops from a one-sentence direction; the
   protocol scaffolding older models needed spelled out (round templates,
   carry tags, fixed changelog shapes) now constrains output quality more
   than it guarantees it. The authoring direction moves from *prescription*
   (dictate the shape) to *direction-setting* (state the judgment criteria,
   boundaries, and evidence discipline; let the model shape the output).
2. **Confirmed disuse.** The maintainer reports `craft-tune` has zero
   real-world usage. Precedent exists: `craft-scaffold` was removed
   2026-05-15 when its niche collapsed.

Timing is favorable: commit `1066463` extracted
`docs/methodology/loop-stop-conditions.md` as a skill-independent
methodology asset, so `craft-tune`'s durable IP (the stop-condition
taxonomy) already survives deletion of the skill itself.

## 2. Goals

- G1: Remove genuinely unused surface (`craft-tune` and its satellite
  docs) without losing durable IP or breaking family routing.
- G2: Shift `craft-critique` from a format contract to a judgment
  contract — keep the diagnostic vocabulary, severity discipline, and
  evidence requirements; drop the fixed section template and its
  anti-gaming clauses.
- G3: Counterweight the eval methodology so future `craft-autoresearch`
  passes stop re-ratcheting skills toward format prescription.
- G4: Leave the repo coherent after removal — README routing, verify
  checks, anatomy doc, status evidence, and parent workspace docs agree
  on the 10-skill reality.

## 3. Non-goals

- **Not** re-merging `craft-critique` into `craft-tune` — deletion is not
  a merge; the 2026-05-21 split decision stands until the moment of
  removal, then becomes moot.
- No `spec-*` family changes in this pass.
- No other skill removals without usage evidence (`craft-survey` and
  others deferred pending maintainer usage data).
- Methodology docs stay: `docs/methodology/loop-stop-conditions.md`
  remains a flagship asset and the canonical home of the loop discipline.
- No relaxation of verify's *spine anatomy* checks. What relaxes is
  `craft-critique`'s *output* contract (what it produces for the user),
  not the family section contract for SKILL.md files.

## 4. Findings inventory (evidence)

### 4.1 craft-tune — removal case

| ID | Finding | Evidence |
|----|---------|----------|
| T1 | 166-line spine prescribes an 8-round protocol (`[CARRIED]` tags, per-round output templates, 3-column cumulative changelog) that current models reproduce from a direction-level instruction; maintainer confirms zero real usage | `skills/craft-tune/SKILL.md`; maintainer statement 2026-07-21 |
| T2 | Durable IP already extracted: `loop-stop-conditions.md` is written skill-independent ("You can apply it without adopting any CraftKit skill") with a single craft-tune mention (line 84) | `docs/methodology/loop-stop-conditions.md`; commit `1066463` |
| T3 | Removal opens a routing gap: "review *and* apply fixes" requests lose their target; a direction-level line in `craft-critique` (apply the findings directly, no protocol) fills it without reviving loop ceremony | README §Routing checks rows |
| T4 | Blast radius: `scripts/verify.mjs:414-421` mirrored pairs (craft-tune↔craft-critique `failure-modes.md`, craft-tune↔craft-prompt `shared-principles.md`); `craft-autoresearch` worked example targets craft-tune end-to-end (§Example) plus contrast lines (17, 29, 64) and `related-skills`; routing/naming lines in `craft-critique` (16, 26, 76), `craft-prompt` (69, 114), `craft-skill-spec` (30), `craft-survey` (84-86); `README.md` (22-23, 83-84, 104, 163, 171-172); `docs/skill-anatomy.md` (9, 22, 65, 73); `docs/examples/tune-a-prompt.md`; `docs/status.md`; CHANGELOG | grep audit 2026-07-21 |

### 4.2 craft-critique — de-prescription case

| ID | Finding | Evidence |
|----|---------|----------|
| C1 | The 5-section fixed output contract carries anti-gaming clauses ("1-5 items", Minimal rewrite plan "not a numbered subset of Recommended changes", Failure modes "do not restate Diagnostics in future tense", "bare position is not enough") whose provenance is eval-ratchet commits, not reader value | `skills/craft-critique/SKILL.md` §Output format; commits `c04e0d9`, `551d0d3` |
| C2 | Recommended changes / Failure modes / Minimal rewrite plan are defined to be eval-*distinguishable*; by reader value they overlap heavily — three sections answering "what to do about it" | `skills/craft-critique/SKILL.md:53-59` |
| C3 | Judgment assets worth keeping: `references/failure-modes.md` 6-way diagnostic vocabulary, severity tags with file:line evidence for `[HIGH]`/`[MED]`, structure-before-style, strengths preservation, the read-only boundary | `skills/craft-critique/SKILL.md` §Guardrails, §References |

### 4.3 Eval methodology — the ratchet mechanism

| ID | Finding | Evidence |
|----|---------|----------|
| M1 | Binary format evals score compliance cheaply and direction quality expensively, so each autoresearch pass tightens format contracts; without a written counterweight, the next pass re-tightens what this pass relaxes | commit `c04e0d9` ("ratchet section misses to failures"); C1 clauses |
| M2 | The de-theorizing direction already started: contract-field theory was demoted from the autoresearch spine to eval-guide | commit `365b2d7` |

## 5. Workstreams (epic candidates)

### E1 — craft-tune retirement (G1) · highest priority

- **E1.1** Delete `skills/craft-tune/` and `docs/examples/tune-a-prompt.md`;
  update `scripts/verify.mjs` mirrored pairs in the same commit (canonical
  homes: `failure-modes.md` → craft-critique, `shared-principles.md` →
  craft-prompt; drop or re-point the pairs) and any 11-skill assumptions in
  verify config. CHANGELOG "Removed (BREAKING)" entry following the
  craft-scaffold precedent: why usage collapsed, where the durable IP lives
  (`loop-stop-conditions.md`). Atomic — verify must pass at every commit.
  (T1, T2, T4)
- **E1.2** Re-target the `craft-autoresearch` worked example off craft-tune
  (candidate targets: `craft-critique` or `craft-handoff`); update
  `related-skills`, the judgment-driven contrast line, and the
  fidelity-eval pipeline example. (T4)
- **E1.3** Skill-spine cross-reference sweep: `craft-critique` routing
  lines, `craft-prompt` "shared with craft-tune" naming, `craft-skill-spec`
  boundary line, `craft-survey` reference-pattern citations. (T4)

### E2 — craft-critique de-prescription (G2)

- **E2.1** Replace the fixed 5-section output contract with judgment
  requirements — every critique must convey: (a) prioritized findings with
  severity and evidence, (b) strengths worth preserving, (c) fix ordering
  with rationale. Collapse the three overlapping "what to do" sections;
  strip the anti-gaming clauses; let output shape scale with artifact
  size. Absorb the routing gap (T3): when the user wants fixes applied,
  apply them guided by the findings — no separate protocol. Keep
  `references/failure-modes.md` vocabulary and the read-only default.
  Target spine ≤80 lines. (C1, C2, C3, T3)
- **E2.2** Anatomy-doc follow-through: record the judgment-contract
  precedent (output contracts state what must be *conveyed*, not a fixed
  section list) so future passes don't re-impose the template; resolve the
  "Common mistakes" naming exemption, which loses its collision rationale
  once the output template's Failure modes section goes. (C1)

### E3 — eval methodology counterweight (G3)

- **E3.1** `craft-autoresearch`: name *prescription ratchet* as an
  eval-design failure mode. Eval-guide gets the substance (format evals
  are floor checks; KEEP/DISCARD led by outcome/comparative evals; the
  critique contract as worked example); the spine gets one paragraph
  within its ≤190-line budget. SKILL.md + references move in one commit
  per repo rule. (M1, M2)

### E4 — docs and identity alignment (G4)

- **E4.1** Repo docs: README skill count and family description, routing
  and negative-boundary tables, invocation-policy row; `docs/skill-anatomy.md`
  skill list, related-skills triangle, loop-shaped decomposition exemption,
  Steps/Workflow naming alternative; `docs/status.md` evidence rows;
  `docs/methodology/loop-stop-conditions.md:84` reworded past-tense/generic.
  (T4)
- **E4.2** Parent workspace `CLAUDE.md`: craftkit line (11 → 10 skills,
  drop craft-tune from the list). The parent directory is not a git repo —
  file edit only, no commit there. (T4)

## 6. Sequencing and priorities

1. **P0:** E1.1 (deletion + verify + CHANGELOG, atomic) → E1.3 sweep in
   the same PR where practical.
2. **P1:** E1.2 (worked-example re-target), E2.1 (critique rewrite against
   the final 10-skill shape).
3. **P2:** E3.1 (counterweight must land before the next autoresearch pass
   touches craft-critique), E2.2.
4. **P3:** E4.1, E4.2.

Rationale: removal first so the critique rewrite happens against the final
family shape; the eval counterweight before any new autoresearch pass, or
the ratchet undoes E2.

## 7. Acceptance criteria

- `skills/` contains 10 skills; `npm run verify` passes at every commit
  with updated mirror pairs.
- `grep -r craft-tune` returns only allow-listed historical records:
  CHANGELOG, dated radar snapshots/decision-log, backlog archive, and the
  reworded methodology line.
- `craft-critique` spine states judgment requirements instead of a fixed
  section template, retains `references/failure-modes.md`, and lands at
  ≤80 lines with the fix-application routing line present.
- `craft-autoresearch` worked example targets an existing skill; eval-guide
  names the prescription-ratchet failure mode and states that KEEP/DISCARD
  is led by outcome/comparative evals.
- README, skill-anatomy, status, and parent `CLAUDE.md` agree on 10 skills
  and current routing.

## 8. Risks

- **Losing the loop discipline with the skill** — mitigated: the taxonomy's
  canonical home is `loop-stop-conditions.md`; the CHANGELOG removal entry
  points there explicitly.
- **Critique relaxation degrades eval-ability** — comparative evals still
  work on judgment requirements; format floor checks remain for
  frontmatter/H1/spine anatomy. Named in eval-guide so suites are designed
  around it rather than against it.
- **Next autoresearch pass re-tightens the contract** — E3.1 counterweight
  plus the judgment-contract precedent recorded in the anatomy doc (E2.2).
- **Blast-radius stragglers** — acceptance grep with explicit allow-list.
- **Verify breakage mid-flight** — E1.1 is atomic; mirror-pair update and
  deletion land in one commit.
