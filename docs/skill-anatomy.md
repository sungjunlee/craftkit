# Skill anatomy

Status: normative. This is the canonical section contract for every `SKILL.md` in CraftKit — what each skill family must contain, not just what skills happen to contain today. Written for Epic #103, workstream E2 (`docs/prd-2026-07-consolidation.md`). Downstream verify checks (#109 reference-index completeness, #110 family section contract) and normalization edits (#111-#113) are built against exactly what this doc says.

It is a contract, not a tutorial: read the family table, then the deviation checklist at the bottom for what still needs to change.

## Scope

- **craft-\*** — artifact skills: `craft-prompt`, `craft-skill-spec`, `craft-critique`, `craft-tune`, `craft-survey`, `craft-autoresearch`, `craft-handoff`, `craft-harness`.
- **spec-\*** — repo spec-pipeline skills: `spec-charter`, `spec-system-map`, `spec-grill`. Router-contract variant, not the craft-* shape.

## Frontmatter contract

Required for every skill, both families: `name` (matches the skill directory exactly) and `description` (states what the skill does and when to use it; ≤50 words, enforced by `scripts/verify.mjs`).

Conditionally required: `disable-model-invocation: true` for explicit-only (higher-ceremony, mutating, or side-effecting) workflows, paired with `skills/<name>/agents/openai.yaml` setting `policy.allow_implicit_invocation: false` (CLAUDE.md "Skill file conventions"; enforced by `checkOpenAiInvocationPolicies`). Already consistent across all 11 skills — no deviations found here.

spec-* only, required (all three carry these identically-shaped today): `argument-hint` (e.g. `"[create|amend|reassess]"`), `compatibility: Requires git.`, `metadata.related-skills`. No craft-* skill carries these fields yet (#113).

**H1 rule**: the H1 is the literal skill slug in its own case, e.g. `# craft-critique`, matching `name` — not a prose title. All craft-* skills already follow this. All three spec-* skills use a prose Title Case H1 (`# Spec Charter`) instead — a deviation.

## Heading case rule

Sentence case everywhere — H1 through H3, including the H1 title itself, both families. `spec-*` currently uses Title Case throughout (`## Execution Contract`, `### Mode Router`, `## Brownfield Signal Rules`); this is a listed deviation, not an accepted family variant.

## craft-* family contract

| Section | Required? | Notes |
|---|---|---|
| Purpose | Required | One short paragraph: what the skill does and why it's a separate step. |
| Use this when | Required | Bullet triggers. May be supplemented (not replaced) by "How it differs from related skills" for explicit-only skills confusable with a close sibling. |
| Inputs | Required | What the skill needs from the user or repo before it runs. |
| Steps *or* Workflow | Required | Exactly one of these two names for the core action sequence — no other name (decision point 3). |
| Output format | Required | The shape of what the skill returns or writes. |
| Guardrails | Required | Ongoing behavioral constraints while operating; distinct from Failure modes (decision point 1). |
| Failure modes | Required | Named recurrence scenarios — how the skill breaks, not restated Guardrails. |
| Example | Required | At least one concrete input/output pair (CLAUDE.md DoD item 2). |
| References | Required if `references/` exists | Dedicated `## References` (or `## References (load on demand)`), always **last**, after Example. Every `references/` file cited there or elsewhere; every cited path must exist. |

Skills may add extra sections for their own mechanics — loop-control (`Stop conditions`, `Per-round output`, `Final output`), mode-routing detail (`Decision rules`, `Lifecycle modes`, `Risk gates`), mandatory pre-reads (`Required reads`, `Non-goals`), or a vagueness escape hatch (`When the review feels vague`). These are additive, not violations. Ordering of required sections is not yet enforced — presence only, per the PRD's de-risking plan (escalate to ordering only if drift recurs).

## spec-* family contract (router-contract variant)

| Section | Required? | Notes |
|---|---|---|
| H1 + intro paragraph(s) | Required | States what the target file (`spec/charter.md`, `spec/system-map.md`, `spec/capabilities.md`) is and its boundary vs sibling spec files. |
| Execution Contract > Mode Router (or Intent Router) | Required | How the skill picks a mode/route from user intent; explicit modes win over file-state inference. |
| Execution Contract > Completion Contract | Required | What the skill reports at the end of each mode/route. |
| Execution Contract > Helper Scripts | Optional | Only when the skill ships bundled scripts (`spec-grill` has one; the other two don't). |
| Domain contract section(s) | Required, ≥1, name varies | Skill-specific write/mutation discipline — e.g. `3 Tiers` (charter), `File Shape` + `Capability Admission Test` (grill), `Quality Checks` (system-map). Name not fixed; content must exist. |
| Verification prompts | Required | Unified name (decision point 6) for the pressure-test / eval-prompt section. Last required section before References. |
| References | Required | Dedicated, last. Must index every `references/*.md` and `templates/*.md` file cited in the body. |

All three currently wrap the router under `## Execution Contract` except `spec-system-map`, which uses a flatter `## Boundary` + `## Mode Router` shape with no wrapper and an extra `## Quality Checks` section the other two lack. This doc treats the Execution Contract wrapper as required and `spec-system-map`'s shape as a deviation to converge (decision point 7), not a second accepted variant.

## Documented exemptions

- **craft-critique "Common mistakes" vs "Failure modes."** Its own meta-section is named "Common mistakes" instead of "Failure modes" because its *output contract* (what it produces for the artifact under review) already has a `### Failure modes` subsection — reusing the name would collide with the output template. Exemption until #111 resolves it (rename to "Failure modes (of this skill)" or keep this documented split).
- **Loop-shaped Output format decomposition.** `craft-autoresearch` and `craft-tune` split "Output format" into multiple named parts (`Experiment contract`/`Baseline`/`Experiment log`/`Final artifact`; `Per-round output`/`Final output`) because a single-shot section can't describe a multi-round artifact. Satisfies the requirement in spirit; no separate top-level "Output format" heading required when the skill is loop-shaped and all parts are present.

## Decision points flagged for maintainer review

Each choice below is already applied in this doc; flip it here and in the tables above if the maintainer disagrees. Restated with alternatives in the final report.

1. Guardrails and Failure modes are **both** required for craft-* (not either/or) — they serve distinct purposes. Alternative: either/or, since 3/8 craft-* skills currently have only one.
2. "Use this when" is required for **every** craft-* skill; "How it differs from related skills" (used instead by `craft-harness`/`craft-skill-spec`) is an allowed *addition*, not a substitute. Alternative: allow substitution for explicit-only skills with a confusable sibling.
3. The core action-sequence section must be named exactly "Steps" or "Workflow" — no other synonym. Alternative: allow descriptive renaming per mechanics (`craft-tune`'s "How the loop runs", `craft-prompt`'s "Process").
4. Example is required for every craft-* skill unconditionally, not only user-facing ones — matches CLAUDE.md DoD item 2 as written, no carve-out for agentic/loop skills.
5. References must be a **dedicated** `## References` section whenever `references/` exists — inline-only citation (current practice in `craft-critique`, `craft-harness`) doesn't satisfy the contract. Alternative: accept inline citation as long as every file is cited somewhere — easier to satisfy, harder for #109 to verify mechanically.
6. spec-*'s validation section unifies to "Verification prompts" (matching `craft-harness`'s existing name), not "Eval Prompts" (`spec-system-map`) or "Pressure Prompts" (`spec-grill`). `spec-charter`, which has none, must add one rather than being exempted.
7. spec-* requires the `## Execution Contract` wrapper (per charter/grill); `spec-system-map`'s flatter shape converges to match rather than standing as a second variant.
8. The sentence-case rule applies to the H1 title too, not only H2/H3 — spec-* H1s move from `# Spec Charter` to `# spec-charter` to match craft-*.

## Current deviations

Exhaustive as of this writing. Every unchecked item is something #109/#110 automation should catch once wired up, and something #111/#112/#113 should burn down. Items not yet mapped to an issue are called out explicitly.

### #111 — validation-section naming + craft-critique collision

- [ ] `spec-system-map`: rename `## Eval Prompts` to `## Verification prompts`
- [ ] `spec-grill`: rename `## Pressure Prompts` to `## Verification prompts`
- [ ] `spec-charter`: add a `## Verification prompts` section (has none today — beyond the PRD's original C2 wording)
- [ ] `craft-critique`: resolve "Common mistakes" vs "Failure modes" collision — rename or keep the documented exemption above
- [ ] `spec-charter`, `spec-system-map`, `spec-grill`: convert H1 from Title Case to the literal lowercase skill slug (extends C1 to the H1, not just H2/H3)
- [ ] `spec-charter`, `spec-system-map`, `spec-grill`: convert all Title Case section headings to sentence case (`Mode Router` -> `Mode router`, `Helper Scripts` -> `Helper scripts`, `Brownfield Signal Rules` -> `Brownfield signal rules`, etc.)
- [ ] `spec-system-map`: converge onto the `## Execution Contract` wrapper used by the other two instead of the flatter `Boundary` + `Mode Router` shape, and rename `## Completion Output` to the contract's `Completion Contract` while doing so (new finding, not in the original C-list)

### #112 — craft-prompt missing Purpose/Example/Failure modes

- [ ] `craft-prompt`: add `## Purpose`
- [ ] `craft-prompt`: add `## Guardrails`
- [ ] `craft-prompt`: add `## Failure modes`
- [ ] `craft-prompt`: add `## Example`
- [ ] `craft-prompt`: add `## Inputs` (missing entirely; new finding beyond the original C3 wording)
- [ ] `craft-prompt`: add `## Output format` (missing entirely; delivery shape currently lives inside the `Deliver` step)
- [ ] `craft-prompt`: rename `## Process` to `## Steps` or `## Workflow` (new finding; ties to decision point 3)
- [ ] `craft-prompt`: convert Title Case H3s under `## Process` to sentence case (`Understand What the User Wants Built`, `Gather the Raw Material`, `Build the Prompt`) — the only craft-* heading-case deviation

### #113 — frontmatter parity + craft-survey invocation policy

- [ ] craft-* skills: decide and apply `argument-hint` / `metadata.related-skills` parity, at least for the `craft-tune` ↔ `craft-critique` ↔ `craft-autoresearch` triangle; decide `compatibility` policy once for the family
- [ ] `craft-survey`: decide implicit vs explicit-only invocation policy against the stated "read-only is implicit" rule — flip it or document why survey is higher-ceremony than critique

### Not yet mapped to an issue

- [ ] `craft-harness`: no dedicated `## References` section — its 5 `references/*.md` files are cited via `## Required reads` and inline mentions instead; add one indexing all 5 (decision point 5)
- [ ] `craft-critique`: no dedicated `## References` section — its 1 `references/failure-modes.md` is cited inline only; add one (decision point 5)
- [ ] `craft-harness`, `craft-skill-spec`: missing `## Use this when` (both use `## How it differs from related skills` instead); add `## Use this when` alongside it (decision point 2)
- [ ] `craft-tune`: `## How the loop runs` deviates from the Steps/Workflow naming rule; rename to `## Workflow` or formally bless a third name for loop-shaped skills (decision point 3)
- [ ] `craft-handoff`: missing `## Guardrails` entirely (found by the #110 check, not the original doc audit)
- [ ] `craft-handoff`: missing `## Output format` — the output shape is folded into `## Workflow` steps 3/4 prose (found by the #110 check)
- [ ] `craft-harness`: missing `## Guardrails` entirely — "guardrail" appears only in unrelated prose about hook guardrails (found by the #110 check)

## References

- `docs/prd-2026-07-consolidation.md` — source PRD, section E2 and findings C1-C9.
- `CLAUDE.md` — "Skill file conventions" and "Definition of done for each skill".
- `scripts/verify.mjs` — existing mechanical checks this contract will extend (`checkSkillFiles`, `checkOpenAiInvocationPolicies`, `checkMirroredReferences`).
