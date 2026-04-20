# Skill Radar Sources

This file is the live reference registry for `skill-radar`.

Its goal is not to summarize every source. Its goal is to keep a maintained list of the sources that are important enough to revisit as the ecosystem shifts.

- last reviewed: `2026-04-16`
- owner: `CraftKit maintainers`

## Tiers

### Tier A

Primary sources that can directly change CraftKit guidance.

Examples:

- official product docs
- official engineering blog posts
- official release or product posts

### Tier B

Strong supporting sources that shape implementation detail but should not outweigh Tier A.

Examples:

- official help center articles
- official cookbook or examples
- official webinars or talks

### Tier C

Community prior art worth learning from, but never sufficient alone for canonical guidance.

Examples:

- open-source repos
- credible practitioner writeups

## Registry

### Anthropic Agent Skills overview

- tier: `A`
- surface: `skill`
- authority: `official docs`
- URL: `https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview`
- why it matters: Defines the core architecture, loading model, progressive disclosure behavior, and cross-product scope of Agent Skills.
- change sensitivity: `high`
- revisit when: skill structure, loading model, or cross-product support changes
- last reviewed: `2026-04-16`

### Anthropic Skill authoring best practices

- tier: `A`
- surface: `skill`
- authority: `official docs`
- URL: `https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices`
- why it matters: Strongest direct source for concise spine, degrees of freedom, workflow structure, progressive disclosure, and evaluation guidance.
- change sensitivity: `high`
- revisit when: best-practice sections or anti-pattern guidance changes
- last reviewed: `2026-04-16`

### Anthropic engineering blog: Equipping agents for the real world with Agent Skills

- tier: `A`
- surface: `skill`
- authority: `official engineering blog`
- URL: `https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills`
- why it matters: Explains the mental model behind progressive disclosure, code execution, and the "onboarding guide" framing that informs durable skill design.
- change sensitivity: `medium`
- revisit when: the post is updated or when Anthropic publishes follow-up architecture guidance
- last reviewed: `2026-04-16`

### Claude Code subagents docs

- tier: `A`
- surface: `subagent`
- authority: `official product docs`
- URL: `https://code.claude.com/docs/en/sub-agents`
- why it matters: Defines how subagents are discovered, prioritized, and constrained; critical for deciding when a design should become a subagent instead of a skill.
- change sensitivity: `high`
- revisit when: subagent fields, plugin interaction, or priority rules change
- last reviewed: `2026-04-16`

### Anthropic plugins in the SDK

- tier: `A`
- surface: `plugin`
- authority: `official docs`
- URL: `https://platform.claude.com/docs/en/agent-sdk/plugins`
- why it matters: Defines plugins as packages that can include commands, agents, skills, hooks, and MCP servers; key source for plugin escalation decisions.
- change sensitivity: `high`
- revisit when: plugin structure or supported components change
- last reviewed: `2026-04-16`

### OpenAI Skills in ChatGPT

- tier: `A`
- surface: `skill`
- authority: `official help center`
- URL: `https://help.openai.com/en/articles/20001066-skills-in-chatgpt`
- why it matters: Confirms OpenAI's current framing of skills as reusable, shareable workflows that bundle instructions, examples, and code, and notes alignment with the Agent Skills open standard.
- change sensitivity: `high`
- revisit when: product coverage, interoperability, or skill packaging claims change
- last reviewed: `2026-04-16`

### OpenAI Introducing Codex

- tier: `A`
- surface: `codex`
- authority: `official product post`
- URL: `https://openai.com/index/introducing-codex/`
- why it matters: Defines Codex's execution model, cloud sandbox posture, AGENTS.md role, and parallel-task framing; important context for deciding whether a capability belongs in repo guidance, a skill, or a higher orchestration layer.
- change sensitivity: `medium`
- revisit when: execution or repo-instruction behavior changes materially
- last reviewed: `2026-04-16`

### OpenAI Introducing the Codex app

- tier: `A`
- surface: `skill`
- authority: `official product post`
- URL: `https://openai.com/index/introducing-the-codex-app/`
- why it matters: Shows the direction of skills as a first-class extension surface inside Codex and emphasizes internal operational use cases, bundled workflows, and management interfaces.
- change sensitivity: `medium`
- revisit when: Codex app skill capabilities or management model changes
- last reviewed: `2026-04-16`

### Agent Skills open standard

- tier: `B`
- surface: `cross-platform`
- authority: `open standard home`
- URL: `https://agentskills.io/home`
- why it matters: Useful anchor for portability claims and for tracking what is meant to travel across products versus what remains platform-specific.
- change sensitivity: `medium`
- revisit when: standard scope or adoption claims expand
- last reviewed: `2026-04-16`

### Anthropic engineering index

- tier: `B`
- surface: `cross-platform`
- authority: `official engineering index`
- URL: `https://www.anthropic.com/engineering`
- why it matters: High-signal place to watch for new posts on context engineering, evals, tool design, harnesses, subagents, and other agent-building patterns that may affect skill guidance.
- change sensitivity: `high`
- revisit when: new relevant posts land
- last reviewed: `2026-04-16`

## How to use this registry

1. Start with Tier A sources relevant to the artifact class.
2. Use Tier B to deepen understanding or track shifts earlier.
3. Treat Tier C as prior art, not canonical evidence.
4. When a source materially changes guidance, record it in a new snapshot and update `decision-log.md` if the canonical judgment changes.

## Gaps to watch

These are not yet fully represented in the current registry:

- stronger OpenAI-first guidance on plugin-like packaging
- more detailed official guidance on multi-skill or skill-suite design
- explicit cross-vendor guidance on when to escalate from skill to subagent or plugin
