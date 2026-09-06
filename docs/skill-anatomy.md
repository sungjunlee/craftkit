# Skill anatomy

Status: normative. Canonical section contract for every `SKILL.md` in CraftKit. `scripts/verify.mjs` enforces presence; this doc is the source of the tables.

## Scope

- **craft-\*** — artifact skills: `craft-prompt`, `craft-handoff`.
- **spec-\*** — spec-axis skills: `spec-charter`, `spec-grill`. Router-contract variant, not the craft-* shape.

## Frontmatter contract

Required for every skill: `name` (matches the skill directory) and `description` (what it does and when to use it; ≤50 words, enforced by `scripts/verify.mjs`).

Provider-neutral spine: `description` names the *capability*, not a provider's tool — no `claude`, `openai`, `chatgpt`, `codex`, etc. (AGENTS.md "Spine text names the capability, not a provider's tool"; enforced by `scripts/verify.mjs`). Examples and `guides/` may name tools, so this scope is the frontmatter `description` only.

Conditionally required: `disable-model-invocation: true` for explicit-only workflows, paired with `skills/<name>/agents/openai.yaml` setting `policy.allow_implicit_invocation: false`.

spec-* only: `argument-hint`, `compatibility: Requires git.`, `metadata.related-skills`.

craft-* extra fields are conditional on a real need, not family-wide parity:

- `metadata.related-skills` — only where a tight cluster exists. No craft-* skill qualifies today.
- `argument-hint` — only for real positional modes (`create|amend`). No craft-* skill qualifies today.
- `compatibility` — only for real requirements. Absence means none.

**H1 rule**: the H1 is the literal skill slug, e.g. `# craft-prompt`, matching `name`.

## Heading case rule

Sentence case everywhere — H1 through H3. Headings that name sections of a *generated artifact* keep the artifact's own casing.

## craft-* family contract

| Section | Required? | Notes |
|---|---|---|
| Purpose | Required | What the skill does and why it's a separate step. |
| Use this when | Required | Bullet triggers. "How it differs from related skills" may be added, not substituted. |
| Inputs | Required | What the skill needs before it runs. |
| Steps *or* Workflow | Required | Exactly one of these two names. |
| Output format | Required | Fixed template *or* a judgment contract (what the output must convey). |
| Guardrails | Required | Ongoing constraints while operating. |
| Failure modes | Required | How the skill breaks, not restated Guardrails. |
| Example | Required | At least one concrete input/output pair. |
| References | Required if `references/` exists | Dedicated `## References` (or `## References (load on demand)`), last. Every `references/` file cited; every cited path exists. |

Skills may add extra sections for their own mechanics (loop control, risk gates, required reads). Ordering of required sections is not enforced — presence only.

## spec-* family contract (router-contract variant)

| Section | Required? | Notes |
|---|---|---|
| H1 + intro paragraph(s) | Required | States the target file and its boundary vs sibling spec files. |
| Execution Contract > Mode Router (or Intent Router) | Required | Explicit modes win over file-state inference. |
| Execution Contract > Completion Contract | Required | What the skill reports at the end of each mode/route. |
| Execution Contract > Helper Scripts | Optional | Only when the skill ships bundled scripts. |
| Domain contract section(s) | Required, ≥1, name varies | Write/mutation discipline. |
| Verification prompts | Required | Last required section before References. |
| References | Required | Dedicated, last. Indexes every `references/*.md` and `templates/*.md` cited in the body. |

## Documented exemptions

- **Output judgment contracts.** `## Output format` may state what the output must *convey* instead of a fixed section template. Do not re-impose a fixed template unless downstream tooling parses the sections.
