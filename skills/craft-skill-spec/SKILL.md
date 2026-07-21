---
name: craft-skill-spec
description: Design a skill-like artifact before writing it. Use for skill specs, suites, subagents, plugins, artifact-class decisions, triggers, file shape, or "meta-skill" requests.
disable-model-invocation: true
---

# craft-skill-spec

## Purpose

Design a new skill spec using CraftKit's current canonical view of good skill-authoring patterns.

This is not a generic skill-creation walkthrough. It is the decision layer that turns a rough skill idea into a concrete, reviewable spec: what the artifact should do, what patterns it should adopt or avoid, how much freedom it should allow, what files it needs, and how it should be evaluated.

Use it when the question is not just "how do I write a skill?" but "what kind of artifact should this become right now?"

The common path is intentionally light: classify the artifact, define its wedge, choose the smallest useful file shape, draft the trigger surface, and name the first eval checks. The radar exists to sharpen those decisions, not to turn every run into research.

## Use this when

- a rough skill idea needs a concrete, reviewable spec before writing `SKILL.md`
- the artifact class is unclear — single skill, skill suite, subagent, or plugin
- an existing skill needs reshaping before a redraft, not a tuning pass
- trigger wording, file shape, or eval-plan decisions need CraftKit's current radar judgment
- the user asks for a "meta-skill" or explicitly wants a skill designed, not written

## How it differs from related skills

- `craft-survey` studies prior art. `craft-skill-spec` starts from the already-curated `references/radar/current.md` and only dips into snapshots when a watched area matters.
- Improving an existing skill in place starts from `craft-critique` findings. `craft-skill-spec` is for designing a new one or reshaping a skill before the draft exists.
- generic `skill-creator` guidance explains how skills work broadly. `craft-skill-spec` makes a concrete CraftKit judgment for *this* proposed skill.

## Inputs

- the rough skill idea
- target users or agents
- expected outcome
- any hard constraints
- optional related assets or prior art

If the user does not state all of these, infer what is safe to infer and keep moving.

## Required reads

Before producing the spec:

1. Read `references/radar/taxonomy.md` and classify the artifact: `none yet`, `single skill`, `skill suite`, `subagent`, or `plugin`.
2. Read `references/radar/current.md` for the default single-skill guidance.

Then load only the branch-specific references you need:

- `references/radar/policy.md` and relevant `references/radar/sources.md` entries — when the target touches a `Watch` area, or the artifact class is `subagent` or `plugin`.
- Dated snapshots in `references/radar/` — only when a `Watch` item, subagent/plugin boundary, or freshness-sensitive decision requires historical context.
- `references/project-harness-toolkit.md` — when the target is a project-specific agent harness and the answer may be a context/command/hook/harness plan instead of a skill-like artifact.
- Existing CraftKit skills — only when one is directly adjacent to the proposed job.

Do not start with open-ended web research unless the user explicitly asks for it. The point of this skill is to use the curated internal layer first.

If the radar references are unavailable in a standalone copy, say that the spec is running in fallback mode. Use the default design stance embedded in this `SKILL.md`: classify the artifact, define its wedge, choose the smallest viable file shape, draft trigger wording when relevant, and include an eval plan. Ask for the missing radar files only when the artifact class is `subagent` or `plugin`, or when a decision would depend on current `Watch` guidance. Do not cite or summarize radar files that were not available.

## Steps

1. Classify the artifact first. If it should really be `none yet`, `subagent`, or `plugin`, say so before drafting a skill-shaped answer.
2. Restate the proposed artifact's real job in one sentence. If you cannot state the job cleanly, the spec will drift.
3. Define the wedge. Name what the artifact should do and what it should explicitly not try to do.
4. Apply the current radar. Pick the relevant `Adopt`, `Avoid`, and `Watch` items from `references/radar/current.md`. In standalone fallback mode, label this section `Fallback radar judgment` and use the default design stance above instead of pretending the missing radar file was read.
5. Decide the degree of freedom. Choose whether the core should be high-freedom guidance, medium-freedom templates/pseudocode, or low-freedom exact commands/scripts.
6. Decide the file or package shape. Start from the smallest viable artifact class and add `references/`, `scripts/`, `templates/`, agents, or plugin surfaces only when the proposed job clearly earns them.
7. Draft the trigger surface if the artifact includes one or more skills. Write frontmatter `description` lines that say what each skill does and when it should be used.
8. Draft the first eval plan. Name 3-5 realistic prompts and the key checks that would tell you whether the design is working.
9. Surface only the open questions that would materially change the architecture. Drop wording nits.

## Decision rules

### Adopt

Treat radar `Adopt` items as defaults, not suggestions. If you reject one, say why.

### Avoid

Treat radar `Avoid` items as hard warnings. If you knowingly violate one, mark it as an explicit tradeoff.

### Watch

Use `Watch` items to decide whether to:

- keep a pattern out of the core spine
- isolate it in a guide, example, or optional reference
- postpone the decision until later

Do not silently convert a `Watch` item into a default.

## Output format

### Summary
One short paragraph: what artifact is being proposed, for whom, and why this shape is better than a generic skill-creation pass.

### Artifact class
- class
- why this class fits better than the next smaller one
- escalation note if the boundary is close

### Artifact thesis
- job
- non-goals
- target users or agents
- success condition

### Radar judgment
- **Adopt** — 3-5 patterns from `references/radar/current.md` that should shape this skill, each with a one-line why
- **Avoid** — 2-4 patterns that would hurt this skill, each with a one-line why
- **Watch** — only the watched patterns that actually matter here, with a one-line handling rule

Every item must be specific to the proposed skill. Do not repeat the radar file mechanically.

If running in standalone fallback mode, keep the same three bullets but label each item as inferred from this `SKILL.md` rather than sourced from `references/radar/current.md`. Do not cite missing radar files.

### Design spec
- freedom level
- workflow shape
- output shape
- progressive disclosure plan
- file or package plan

For the file or package plan, name concrete paths and one-line purposes. Start with the smallest viable set.

### Trigger draft
Provide this section only when the artifact includes one or more skills.

Skip this section when the class is `none yet` or a non-skill harness placement.

Provide:

- `name`
- frontmatter `description`
- one sentence on why the trigger wording should discover well

### Eval plan
- 3-5 realistic user prompts
- 3-6 checks the outputs should satisfy
- one likely failure pattern to watch in the first draft

### Open questions
0-3 items only. If none remain, write `none - current constraints are sufficient`.

## Guardrails

- keep the spec narrower than the user's first instinct if that produces a stronger skill
- do not turn the output into a survey report
- do not import provider-specific quirks into the core skill unless the skill is explicitly platform-bound
- prefer one default path over many equal-weight branches
- if a script, template, reference file, subagent, or plugin surface is proposed, name the repeated pain it removes

## Failure modes

- producing a generic "good skill" checklist instead of a real spec for this skill
- repeating every radar item instead of selecting the ones that matter
- proposing too many files before the core `SKILL.md` shape is earned
- forcing a plugin or subagent when a single skill would do
- treating `Watch` items as fashionable defaults
- skipping the eval plan and leaving the design untestable

## Example

Input: "Design a meta-skill that helps create good new skills without re-researching the web every time."

Output sketch:
- Summary: propose a single skill that turns CraftKit's radar into a reusable decision layer.
- Artifact class: `single skill`; smaller than this would be one-off advice; plugin only if bundled agents or MCP servers become part of the value.
- Artifact thesis: design a skill spec from a rough idea; do not write the full body or run broad web research every time; success means another agent can draft `SKILL.md` without guessing.
- Radar judgment: Adopt concise spine/progressive disclosure and trigger-oriented descriptions; Avoid monolithic all-in-one files; Watch script-heavy packaging until a deterministic transform repeats.
- Design spec: medium-freedom workflow; output includes summary, radar judgment, file plan, trigger draft, and eval plan; `SKILL.md` carries the path while references carry depth.
- Trigger draft: `craft-skill-spec` - "Design a skill-like artifact before writing it..."
- Eval plan: prompts include release-note skill, jira-triage skill, code-review subagent, and skill-vs-plugin choice; checks cover artifact class, selected radar items, concrete file plan, conditional trigger draft, and eval plan.
- Open questions: none - current constraints are sufficient.

For a fuller worked version, load `references/spec-example.md`.

## References (load on demand)

- `references/radar/taxonomy.md` — artifact classes and escalation path
- `references/radar/current.md` — current canonical judgment for skill-authoring patterns
- `references/radar/sources.md` — live reference registry for skills, subagents, plugins, and cross-platform guidance
- `references/radar/policy.md` — when canon is enough and when fresh live-source review is required
- `references/radar/decision-log.md` — why a pattern moved between adopt / avoid / watch
- `references/radar/TEMPLATE.md` — if a new snapshot or event-based addendum is needed
- `references/spec-checklist.md` — structured review pass for checking whether the spec is specific, narrow, and ready to turn into `SKILL.md`
- `references/spec-example.md` — fuller worked example for the compact in-spine sample above
- `references/project-harness-toolkit.md` — optional project-harness design seed for deciding when repo guidance should become context files, skills, commands, hooks, subagents, plugins, MCP setup, or external adoption work
