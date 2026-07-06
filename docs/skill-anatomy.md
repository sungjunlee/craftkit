# Skill anatomy

Status: normative. This is the canonical section contract for every `SKILL.md` in CraftKit — what each skill family must contain, not just what skills happen to contain today. Written for Epic #103, workstream E2 (`docs/prd-2026-07-consolidation.md`). Downstream verify checks (#109 reference-index completeness, #110 family section contract) and normalization edits (#111-#113) are built against exactly what this doc says.

It is a contract, not a tutorial: read the family table, then the deviation checklist at the bottom for what still needs to change.

## Scope

- **craft-\*** — artifact skills: `craft-prompt`, `craft-skill-spec`, `craft-critique`, `craft-tune`, `craft-survey`, `craft-autoresearch`, `craft-handoff`, `craft-harness`.
- **spec-\*** — repo spec-pipeline skills: `spec-charter`, `spec-system-map`, `spec-grill`. Router-contract variant, not the craft-* shape.

## Frontmatter contract

Required for every skill, both families: `name` (matches the skill directory exactly) and `description` (states what the skill does and when to use it; ≤50 words, enforced by `scripts/verify.mjs`).

Conditionally required: `disable-model-invocation: true` for explicit-only (higher-ceremony, mutating, or side-effecting) workflows, paired with `skills/<name>/agents/openai.yaml` setting `policy.allow_implicit_invocation: false` (CLAUDE.md "Skill file conventions"; enforced by `checkOpenAiInvocationPolicies`). Already consistent across all 11 skills — no deviations found here.

spec-* only, required (all three carry these identically-shaped today): `argument-hint` (e.g. `"[create|amend|reassess]"`), `compatibility: Requires git.`, `metadata.related-skills`.

craft-* policy for these three fields (#113, decided): each is conditional on a real underlying need, not family-wide parity for its own sake.

- `metadata.related-skills` — add only where a real cluster exists. The `craft-critique` ↔ `craft-tune` ↔ `craft-autoresearch` triangle carries it today (each lists the other two), matching spec-*'s `metadata:\n  related-skills: "a, b, c"` YAML shape exactly. Other craft-* skills without a comparably tight cluster don't get it.
- `argument-hint` — add only where a skill has real positional-argument structure (explicit modes like `create|amend`). No craft-* skill has this today, so no craft-* skill carries `argument-hint`.
- `compatibility` — declare only for real requirements (spec-* skills require git). Absence means no special requirements, not an oversight. No craft-* skill has a comparable hard requirement today.

**H1 rule**: the H1 is the literal skill slug in its own case, e.g. `# craft-critique`, matching `name` — not a prose title. All 11 skills follow this (spec-* converged in #111).

## Heading case rule

Sentence case everywhere — H1 through H3, including the H1 title itself, both families (`## Execution contract`, `### Mode router`, `## Brownfield signal rules`). spec-*'s former Title Case was normalized in #111. Headings that name sections of a *generated artifact* (e.g. spec-grill's `## Grill Report` output skeleton) keep the artifact's own casing — they describe output, not this file's structure.

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

All three wrap the router under `## Execution contract` (`spec-system-map` converged in #111; its extra `## Quality checks` section stays as an allowed addition).

## Documented exemptions

- **craft-critique "Common mistakes" vs "Failure modes."** Its own meta-section is named "Common mistakes" instead of "Failure modes" because its *output contract* (what it produces for the artifact under review) already has a `### Failure modes` subsection — reusing the name would collide with the output template. Resolved in #111 by keeping this documented split (no rename); verify encodes "Common mistakes" as satisfying the Failure modes slot.
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

- [x] `spec-system-map`: rename `## Eval Prompts` to `## Verification prompts`
- [x] `spec-grill`: rename `## Pressure Prompts` to `## Verification prompts`
- [x] `spec-charter`: add a `## Verification prompts` section
- [x] `craft-critique`: "Common mistakes" vs "Failure modes" collision — resolved by keeping the documented exemption above (no rename)
- [x] `spec-charter`, `spec-system-map`, `spec-grill`: convert H1 from Title Case to the literal lowercase skill slug
- [x] `spec-charter`, `spec-system-map`, `spec-grill`: convert all Title Case section headings to sentence case
- [x] `spec-system-map`: converge onto the `## Execution contract` wrapper and rename `## Completion Output` to `### Completion contract`

### #112 — craft-prompt missing Purpose/Example/Failure modes

- [x] `craft-prompt`: add `## Purpose`
- [x] `craft-prompt`: add `## Guardrails`
- [x] `craft-prompt`: add `## Failure modes`
- [x] `craft-prompt`: add `## Example`
- [x] `craft-prompt`: add `## Inputs`
- [x] `craft-prompt`: add `## Output format`
- [x] `craft-prompt`: rename `## Process` to `## Workflow`
- [x] `craft-prompt`: Title Case H3s under the old `## Process` — resolved by folding the steps into a numbered list under `## Workflow` (no H3s remain)

### #113 — frontmatter parity + craft-survey invocation policy

- [x] craft-* skills: `metadata.related-skills` added to the `craft-critique` ↔ `craft-tune` ↔ `craft-autoresearch` triangle (each lists the other two), matching spec-*'s YAML shape; no other craft-* skill gets it (no comparably tight cluster)
- [x] craft-* skills: `argument-hint` policy decided — only for skills with real positional-argument structure (modes like `create|amend`); no craft-* skill qualifies, so none carry it
- [x] craft-* skills: `compatibility` policy decided — declare only for real requirements (spec-* require git); no craft-* skill has a comparable requirement, so none carry it
- [x] `craft-survey`: stays explicit-only — read-only is necessary but not sufficient; survey launches a time-consuming multi-source web research workflow, higher-ceremony than a quick read-only diagnosis like `craft-critique`, so the user opts in explicitly (documented in README "Invocation policy")

### Not yet mapped to an issue

- [ ] `craft-harness`: no dedicated `## References` section — its 5 `references/*.md` files are cited via `## Required reads` and inline mentions instead; add one indexing all 5 (decision point 5)
- [ ] `craft-critique`: no dedicated `## References` section — its 1 `references/failure-modes.md` is cited inline only; add one (decision point 5)
- [ ] `craft-harness`, `craft-skill-spec`: missing `## Use this when` (both use `## How it differs from related skills` instead); add `## Use this when` alongside it (decision point 2)
- [x] `craft-tune`: `## How the loop runs` renamed to `## Workflow` (decision point 3, done with #115)
- [x] `craft-handoff`: missing `## Guardrails` entirely (found by the #110 check, not the original doc audit)
- [x] `craft-handoff`: missing `## Output format` — the output shape is folded into `## Workflow` steps 3/4 prose (found by the #110 check)
- [ ] `craft-harness`: missing `## Guardrails` entirely — "guardrail" appears only in unrelated prose about hook guardrails (found by the #110 check)

## References

- `docs/prd-2026-07-consolidation.md` — source PRD, section E2 and findings C1-C9.
- `CLAUDE.md` — "Skill file conventions" and "Definition of done for each skill".
- `scripts/verify.mjs` — existing mechanical checks this contract will extend (`checkSkillFiles`, `checkOpenAiInvocationPolicies`, `checkMirroredReferences`).
