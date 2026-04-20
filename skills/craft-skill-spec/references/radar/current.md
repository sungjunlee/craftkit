# Skill Radar: Current Canonical View

- last reviewed: `2026-04-16`
- primary basis: `references/radar/2026-04.md`
- status: `initial baseline`
- scope: `single-skill default guidance`

Use this file as the default source of truth when designing or revising a CraftKit skill. Open a snapshot file only when a `watch` item is relevant or a recent classification change needs context.

Before using this file, classify the artifact with `references/radar/taxonomy.md`. If the target is a `subagent` or `plugin`, do not treat this file as sufficient by itself.

## Default design stance

When drafting a new skill, assume the following unless there is a strong task-specific reason not to:

1. Keep the skill spine concise.
2. Put detailed material behind progressive disclosure.
3. Make the trigger description concrete and user-phrase-aware.
4. Use explicit steps or a checklist for complex workflows.
5. Add examples when acceptable vs unacceptable output needs to be pinned down.
6. Prefer eval-backed refinement over intuition-only polishing.

## Adopt

### Concise spine plus progressive disclosure

- confidence: `high`
- why: Primary guidance strongly converges on keeping `SKILL.md` lean and moving detail into on-demand references.
- default implication: Keep the always-loaded skill spine focused on purpose, inputs, steps, outputs, guardrails, and examples. Move deep detail into `references/` before the spine becomes bloated.

### Degree of freedom matched to workflow fragility

- confidence: `high`
- why: Newer guidance is clearer that fragile workflows need narrower guardrails, while exploratory tasks should keep room for judgment.
- default implication: Decide early whether the skill should be high-freedom text guidance, medium-freedom pseudocode/templates, or low-freedom exact commands/scripts.

### Explicit workflow shape for multi-step tasks

- confidence: `high`
- why: Current guidance favors sequential steps and, for complex tasks, checklist-like progression over vague prose.
- default implication: If a skill covers more than one meaningful phase, write the phase order explicitly and make handoff points visible.

### Trigger-oriented frontmatter descriptions

- confidence: `high`
- why: Discovery quality depends heavily on whether the description says both what the skill does and when it should trigger.
- default implication: Draft `description` as a compact trigger surface, not as branding copy or an abstract summary.

### Example-backed brittle definitions

- confidence: `medium`
- why: When classifications, output boundaries, or acceptable behavior are easy to misread, examples remain one of the highest-leverage ways to reduce ambiguity.
- default implication: Add one compact example, and add accept/reject contrasts when the task depends on subtle distinctions.

### Eval-first tightening before extra tooling

- confidence: `high`
- why: Recent guidance reinforces that instruction quality and concrete tests usually pay off before adding more tools or complexity.
- default implication: Before adding scripts, templates, or advanced branches, define realistic test prompts and the failure modes they should catch.

## Avoid

### Monolithic all-in-one skill files

- confidence: `high`
- why: Large undifferentiated skill files compete with live context and make future updates harder to reason about.
- default implication: Split deep detail into `references/` instead of letting `SKILL.md` become the archive.

### Too many equal-weight options in the core flow

- confidence: `high`
- why: Offering many branches without a default path weakens execution quality and makes the skill harder to follow.
- default implication: Give one default path first. Add alternatives only when they solve a real divergence.

### Time-sensitive claims in the core spine

- confidence: `high`
- why: Guidance that expires quickly makes the skill stale and pushes maintenance cost into every future read.
- default implication: Keep durable principles in `SKILL.md`; place time-bound observations in snapshots or dated references.

### Provider-specific behavior in the portable core

- confidence: `high`
- why: Core CraftKit assets should travel across agents. Provider-specific advice belongs in isolated guides or examples.
- default implication: Keep platform quirks out of the main skill spine unless the skill is explicitly platform-scoped.

## Watch

### Platform-specific invocation controls and extensions

- confidence: `medium`
- why: Useful in some environments, but not yet stable enough to recommend in CraftKit's portable core.
- what to do: Isolate in guides, examples, or optional references instead of making them foundational.

### Script-heavy skills with runtime packaging assumptions

- confidence: `medium`
- why: Stronger executable-code support is useful for deterministic tasks, but it adds runtime and portability constraints quickly.
- what to do: Add scripts only when repeated deterministic work clearly justifies them.

### Visual and intermediate-output validation patterns

- confidence: `low`
- why: Promising for complex skills, especially where human inspection matters, but still uneven across environments and workflows.
- what to do: Keep under observation; do not make it a default requirement yet.

## Default lookup rule

For a future skill-design meta-skill:

1. Classify the artifact with `references/radar/taxonomy.md`.
2. Read this file first for single-skill defaults.
3. Apply `Adopt` and `Avoid` by default only when the target is actually a single skill.
4. If the target touches a `Watch` item, read the newest relevant snapshot.
5. If the target is a `subagent` or `plugin`, consult `references/radar/policy.md` and `references/radar/sources.md`.
6. If a classification changed recently, read `references/radar/decision-log.md`.
