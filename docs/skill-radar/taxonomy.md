# Skill Radar Taxonomy

Use this file before applying `current.md` blindly. Not every agent artifact should be designed like a single `SKILL.md`.

## Why this exists

The words "skill", "agent", and "plugin" are often used loosely. That creates bad design decisions:

- a plugin gets underspecified as if it were a single skill
- a subagent gets overpacked with workflow detail that belongs in a skill
- a skill suite becomes a monolith because the boundary between one skill and many is never made explicit

This taxonomy exists to force the first design question:

> What kind of artifact are we actually designing?

## Artifact classes

### 1. Single skill

Use when one cohesive capability can be expressed as one trigger surface plus one core workflow.

Typical shape:

- one `SKILL.md`
- optional `references/`, `scripts/`, `templates/`

Good fit when:

- the workflow has one clear job
- the trigger language is compact
- the capability should be model-invoked directly

Common failure:

- over-expanding a narrow job into a mini-framework

### 2. Skill suite

Use when the problem space has several adjacent but distinct skills that should stay separate while sharing taste, terminology, or references.

Typical shape:

- several sibling skills
- shared design language
- possibly shared docs or examples outside the skill spines

Good fit when:

- triggers would become muddy if forced into one skill
- workflows are related but not identical
- users should be able to invoke one capability without pulling in all others

Common failure:

- collapsing multiple triggers into one giant skill with weak defaults

### 3. Subagent

Use when the system needs a specialized teammate with a role, tool scope, or execution posture distinct from the main agent.

Typical shape:

- role-specific instructions
- narrower tool surface or stronger execution constraints
- optimized for delegation, not for broad autonomous triggering

Good fit when:

- the work benefits from clean-room context
- role separation matters more than bundled reference material
- parallelism or delegation is part of the design

Common failure:

- treating a subagent like a skill with extra branding instead of a different execution unit

### 4. Plugin

Use when the solution must package multiple extension surfaces together: skills, subagents, commands, hooks, or MCP servers.

Typical shape:

- `.claude-plugin/`
- one or more skills
- optional agents, hooks, commands, MCP integrations

Good fit when:

- the unit of reuse is larger than one skill
- multiple projects should consume the same packaged capability set
- installability, namespacing, or cross-surface composition is part of the value

Common failure:

- reaching for a plugin before the core skill or subagent shapes are stable

## Escalation path

Default to the smallest artifact that solves the job:

1. Start with `single skill`.
2. Escalate to `skill suite` when triggers or workflows want to split.
3. Escalate to `subagent` when role separation or delegation is the primary value.
4. Escalate to `plugin` when packaging multiple extension surfaces becomes the real product.

Do not skip levels casually. Escalation should be justified by the job, not by ambition.

## Decision cues

### Choose `single skill` when

- "what should trigger this?" has one clean answer
- one `description` line can plausibly discover the job
- the main complexity is workflow guidance, not orchestration

### Choose `skill suite` when

- one trigger line would become vague or overloaded
- several narrow skills would be clearer than one broad one
- you want composition by adjacency, not by internal branching

### Choose `subagent` when

- the artifact needs a specialist role
- the main distinction is execution posture, not just reference material
- context isolation or parallel delegation matters

### Choose `plugin` when

- installation and packaging are part of the design
- the artifact spans commands, agents, skills, hooks, or MCP servers
- the user should consume a bundled toolkit, not a single capability

## Radar implications by class

`current.md` is currently written as a **single-skill baseline**.

Apply it directly for:

- `single skill`

Apply it selectively for:

- `skill suite`
- `subagent`
- `plugin`

For those higher classes:

- use `current.md` mainly for the skill-like portions
- then layer class-specific judgments from the live sources in `sources.md`
- and follow the freshness rules in `policy.md`

## Output requirement for meta-skills

Any future spec-producing skill should name the artifact class explicitly near the top of its output.

If the class is unclear, the spec should present the smallest plausible class plus one escalation note rather than pretending the ambiguity does not exist.
