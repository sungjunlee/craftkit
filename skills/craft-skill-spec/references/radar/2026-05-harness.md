# Skill Radar Snapshot: 2026-05 Harness Addendum

## Snapshot metadata

- reviewed on: `2026-05-27`
- review scope: `Codex and Claude Code project harness guidance`
- reviewer: `Codex`
- previous snapshot: `2026-05.md`

## Source set

Primary sources reviewed for this addendum:

- Anthropic, "How Claude Code works in large codebases: Best practices and where to start" — `https://claude.com/blog/how-claude-code-works-in-large-codebases-best-practices-and-where-to-start`
- Codex docs: `AGENTS.md`, skills, app/CLI commands, hooks, subagents, plugins, build plugins, MCP
- Claude Code docs: memory/rules, skills, hooks, subagents, plugins and marketplaces, MCP

## What changed in the landscape

The project-harness surface is now broad enough on both Codex and Claude Code that it should not be treated as a narrow `craft-skill-spec` placement note. Both platforms support a stack of repo instructions, reusable skills, deterministic hooks, subagents/custom agents, MCP configuration, and plugin or marketplace distribution. Codex is no longer just `AGENTS.md` plus CLI conventions; Claude Code is no longer just `CLAUDE.md` plus slash commands.

The durable pattern is to design the project harness around the real repo and task shape, then emit target-specific files for Codex and Claude Code from the same provider-neutral plan.

## Candidate patterns

### Pattern: project harness authoring as a first-class workflow

- observed signal: Codex and Claude Code both expose several harness surfaces with different load timing, trust posture, and sharing behavior.
- source support: Codex `AGENTS.md`, skills, commands, hooks, subagents, plugins, MCP docs; Claude Code memory/rules, skills/commands, hooks, subagents, plugins, MCP docs; Anthropic large-codebase guidance.
- likely benefit: gives maintainers one workflow for deciding what to create, adopt, or defer across both agents.
- likely risk: turning CraftKit into an agent-team factory or plugin generator too early.
- proposed status: `adopt` as a skill named `craft-harness`.
- CraftKit implication: keep `craft-skill-spec` as the artifact-design layer, and use `craft-harness` as the project-harness lifecycle skill.

### Pattern: dual-target adapters with a current primary

- observed signal: current Codex docs define explicit project paths for `.agents/skills`, `.codex/hooks.json`, `.codex/agents`, `.codex/config.toml`, and plugin marketplaces, while commands live in app/CLI invocation surfaces; Claude Code has parallel but not identical paths under `.claude/`, `CLAUDE.md`, skills/commands, and plugin marketplaces.
- source support: Codex configuration docs and Claude Code docs.
- likely benefit: matches current usage where Codex is slightly higher priority while preserving cross-agent portability and leaving room for the primary target to change.
- likely risk: provider-specific paths leaking into the core workflow.
- proposed status: `adopt with isolation`
- CraftKit implication: the core skill should speak in neutral placements; output should have separate `Codex target` and `Claude target` sections. Codex is the default current primary only when the user does not state another preference.

### Pattern: buy-vs-build before local generation

- observed signal: Codex and Claude Code both have plugin and skill ecosystems, and Claude Code now surfaces official/community plugin marketplaces with visible component review.
- source support: Codex plugins docs, Claude Code plugin marketplace docs, open agent skills standard.
- likely benefit: avoids rebuilding a maintained plugin, skill, MCP server, or LSP integration that already fits.
- likely risk: shallow popularity checks can install unsafe or mismatched artifacts.
- proposed status: `adopt`
- CraftKit implication: `craft-harness` should search and assess existing skills/plugins before generating local assets when the user allows research.

### Pattern: hook generation behind an explicit safety gate

- observed signal: hooks execute code during lifecycle events and both platforms require configuration/trust handling.
- source support: Codex hooks docs and Claude Code hooks docs.
- likely benefit: deterministic checks stop recurring misses better than prose.
- likely risk: hooks can block work, execute arbitrary code, leak data, or behave differently across platforms.
- proposed status: `watch`
- CraftKit implication: MVP should propose hooks and write simple scripts only after explicit user approval; default output should be a patch plan, not silent hook installation.

## Adopt this cycle

- treat project harness authoring/updating as a separate skill, not merely a `craft-skill-spec` subcase
- keep the core provider-neutral and emit Codex/Claude target sections separately
- prefer the current primary target when tradeoffs conflict; default to Codex only when no priority is stated
- include buy-vs-build assessment before generating new skills, plugins, MCP setup, hooks, or subagents
- keep hooks/subagents/plugins gated by risk and explicit approval

## Avoid this cycle

- creating a broad agent-team factory
- treating `AGENTS.md` and `CLAUDE.md` as interchangeable files with identical load behavior
- generating plugin packages before a project-local harness proves useful
- burying deterministic commands in prose when a script or hook is safer and smaller

## Watch, not default

- automatic hook installation
- project-wide plugin packaging
- multi-agent team creation
- managed-agent or cloud-only surfaces that do not copy cleanly into repo files

## Delta from previous snapshot

- promoted: project-harness work from `none yet`/placement lens to `single skill`
- unchanged: concise spine, progressive disclosure, eval-first tightening, provider-specific isolation
- new local implication: `craft-skill-spec` should identify harness needs and either hand off to `craft-harness` or design only the specific skill/subagent/plugin part.

## Proposed updates to current canonical view

- `current.md`: no change. These findings affect a project-harness skill rather than the general single-skill canon.
- `decision-log.md`: no change until `craft-harness` has been evaluated.
