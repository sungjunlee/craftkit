# Skill Radar Sources

This file is the live reference registry for `skill-radar`.

Its goal is not to summarize every source. Its goal is to keep a maintained list of the sources that are important enough to revisit as the ecosystem shifts.

- last reviewed: `2026-05-27`
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

### Anthropic Claude prompting best practices

- tier: `A`
- surface: `prompt`
- authority: `official docs`
- URL: `https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices`
- why it matters: Current high-signal source for XML structure, examples, success criteria, source verification, autonomy/safety boundaries, and subagent overuse guidance.
- change sensitivity: `high`
- revisit when: model migration guidance, agentic research guidance, or subagent/tool-use guidance changes
- last reviewed: `2026-05-01`

### OpenAI GPT-5.5 prompt guidance

- tier: `A`
- surface: `prompt`
- authority: `official docs`
- URL: `https://developers.openai.com/api/docs/guides/prompt-guidance?model=gpt-5.5`
- why it matters: Current high-signal source for structured prompts, tool persistence, verification loops, missing-context gating, verbosity controls, and instruction-conflict avoidance.
- change sensitivity: `high`
- revisit when: prompt guidance for the current flagship model changes
- last reviewed: `2026-05-01`

### Anthropic engineering blog: Equipping agents for the real world with Agent Skills

- tier: `A`
- surface: `skill`
- authority: `official engineering blog`
- URL: `https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills`
- why it matters: Explains the mental model behind progressive disclosure, code execution, and the "onboarding guide" framing that informs durable skill design.
- change sensitivity: `medium`
- revisit when: the post is updated or when Anthropic publishes follow-up architecture guidance
- last reviewed: `2026-04-16`

### Anthropic Claude Code large-codebase harness guidance

- tier: `A`
- surface: `project-harness`
- authority: `official product blog`
- URL: `https://claude.com/blog/how-claude-code-works-in-large-codebases-best-practices-and-where-to-start`
- why it matters: Frames large-codebase agent adoption as a project-specific harness problem spanning root context, local context, skills, hooks, plugins, integrations, language intelligence, and subagents.
- change sensitivity: `medium`
- revisit when: Anthropic publishes follow-up large-codebase guidance or changes how extension surfaces are positioned
- last reviewed: `2026-05-27`

### Codex AGENTS.md docs

- tier: `A`
- surface: `project-context`
- authority: `official product docs`
- URL: `https://developers.openai.com/codex/guides/agents-md`
- why it matters: Defines Codex instruction discovery, global/project layering, nested overrides, fallback filenames, and the default context-size limit for project docs.
- change sensitivity: `high`
- revisit when: discovery order, file names, override behavior, or context caps change
- last reviewed: `2026-05-27`

### Codex skills docs

- tier: `A`
- surface: `skill`
- authority: `official product docs`
- URL: `https://developers.openai.com/codex/skills`
- why it matters: Defines Codex skill shape, progressive disclosure behavior, invocation model, repository/user/admin/system skill locations, and the current split between skills as workflow authoring format and plugins as distribution unit.
- change sensitivity: `high`
- revisit when: skill loading, install locations, or plugin relationship changes
- last reviewed: `2026-05-27`

### Codex hooks docs

- tier: `A`
- surface: `hook`
- authority: `official product docs`
- URL: `https://developers.openai.com/codex/hooks`
- why it matters: Defines Codex lifecycle hook events, config locations, trust flow, plugin-bundled hook support, and the distinction between deterministic automation and prompt guidance.
- change sensitivity: `high`
- revisit when: hook events, trust policy, plugin hook support, or config shape changes
- last reviewed: `2026-05-27`

### Codex app commands docs

- tier: `A`
- surface: `command`
- authority: `official product docs`
- URL: `https://developers.openai.com/codex/app/commands`
- why it matters: Defines Codex app command behavior, including built-in commands and skill-style command invocation, so `craft-harness` can distinguish manual shortcuts from repo-local skills or scripts.
- change sensitivity: `high`
- revisit when: app command invocation, custom command support, or skill command behavior changes
- last reviewed: `2026-05-27`

### Codex CLI slash commands docs

- tier: `A`
- surface: `command`
- authority: `official product docs`
- URL: `https://developers.openai.com/codex/cli/slash-commands`
- why it matters: Defines the CLI command surface, which is separate from checked-in project harness files but still affects how maintainers invoke local skills and workflows.
- change sensitivity: `high`
- revisit when: CLI slash commands, skill invocation, or command extensibility changes
- last reviewed: `2026-05-27`

### Codex subagents docs

- tier: `A`
- surface: `subagent`
- authority: `official product docs`
- URL: `https://developers.openai.com/codex/subagents`
- why it matters: Defines Codex subagent orchestration, built-in agent roles, explicit-spawn behavior, project/user custom agent locations, and inheritance of sandbox and approval settings.
- change sensitivity: `high`
- revisit when: custom agent file format, automatic spawning, visibility, or sandbox inheritance changes
- last reviewed: `2026-05-27`

### Codex plugins docs

- tier: `A`
- surface: `plugin`
- authority: `official product docs`
- URL: `https://developers.openai.com/codex/plugins`
- why it matters: Defines Codex plugins as reusable bundles for skills, app integrations, and MCP servers, plus plugin directory and marketplace discovery behavior.
- change sensitivity: `high`
- revisit when: supported plugin components, marketplace behavior, or distribution rules change
- last reviewed: `2026-05-27`

### Codex build plugins docs

- tier: `A`
- surface: `plugin`
- authority: `official product docs`
- URL: `https://developers.openai.com/codex/plugins/build`
- why it matters: Gives the current escalation rule: start with a local skill for one repo or personal workflow; build a plugin when sharing, bundling integrations/MCP config/hooks, or publishing stable packages becomes the value.
- change sensitivity: `high`
- revisit when: plugin manifest, marketplace paths, or packaged hook support changes
- last reviewed: `2026-05-27`

### Codex MCP docs

- tier: `A`
- surface: `mcp`
- authority: `official product docs`
- URL: `https://developers.openai.com/codex/mcp`
- why it matters: Defines Codex MCP configuration through `config.toml`, including user scope and trusted project-scoped `.codex/config.toml`, plus plugin-provided MCP servers and approval controls.
- change sensitivity: `high`
- revisit when: MCP config shape, project trust behavior, OAuth handling, or plugin-provided MCP behavior changes
- last reviewed: `2026-05-27`

### Claude Code subagents docs

- tier: `A`
- surface: `subagent`
- authority: `official product docs`
- URL: `https://code.claude.com/docs/en/sub-agents`
- why it matters: Defines how subagents are discovered, prioritized, and constrained; critical for deciding when a design should become a subagent instead of a skill.
- change sensitivity: `high`
- revisit when: subagent fields, plugin interaction, or priority rules change
- last reviewed: `2026-05-27`

### Claude Code memory and rules docs

- tier: `A`
- surface: `project-context`
- authority: `official product docs`
- URL: `https://code.claude.com/docs/en/memory`
- why it matters: Defines `CLAUDE.md`, `AGENTS.md`, imported files, `.claude/rules/`, path-scoped rules, and large-team memory management for Claude Code project harnesses.
- change sensitivity: `high`
- revisit when: loading hierarchy, rules behavior, `AGENTS.md` support, or auto-memory behavior changes
- last reviewed: `2026-05-27`

### Claude Code skills docs

- tier: `A`
- surface: `skill`
- authority: `official product docs`
- URL: `https://code.claude.com/docs/en/slash-commands`
- why it matters: Defines Claude Code skills as `SKILL.md` workflows invocable by slash command or model selection, with frontmatter for tool permissions, argument hints, path scoping, forked subagent context, and skill-scoped hooks.
- change sensitivity: `high`
- revisit when: frontmatter fields, invocation, tool permissions, or path-scoped activation changes
- last reviewed: `2026-05-27`

### Claude Code hooks docs

- tier: `A`
- surface: `hook`
- authority: `official product docs`
- URL: `https://code.claude.com/docs/en/hooks`
- why it matters: Defines Claude Code hook settings, events, matchers, project script references, JSON control outputs, and MCP tool naming for hook targeting.
- change sensitivity: `high`
- revisit when: supported events, JSON output fields, or project hook config behavior changes
- last reviewed: `2026-05-27`

### Claude Code plugins marketplace docs

- tier: `A`
- surface: `plugin`
- authority: `official product docs`
- URL: `https://code.claude.com/docs/en/discover-plugins`
- why it matters: Defines marketplace discovery, official/community plugin sources, install scopes, visible component review, auto-update behavior, and security caveats for adopting instead of building harness parts.
- change sensitivity: `high`
- revisit when: marketplace commands, install scopes, component review, or official plugin categories change
- last reviewed: `2026-05-27`

### Claude Code MCP docs

- tier: `A`
- surface: `mcp`
- authority: `official product docs`
- URL: `https://code.claude.com/docs/en/mcp`
- why it matters: Defines Claude Code MCP installation scopes, project-shared `.mcp.json`, user/local storage, plugin-provided MCP servers, approval prompts, remote authentication, resources, prompts, and tool-search scaling.
- change sensitivity: `high`
- revisit when: MCP scopes, `.mcp.json` shape, plugin MCP behavior, approval flow, or tool-search behavior changes
- last reviewed: `2026-05-27`

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
