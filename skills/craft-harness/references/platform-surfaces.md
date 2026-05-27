# Platform Surfaces

Use this reference when `craft-harness` recommendations touch Codex- or Claude-Code-specific files. Keep the core skill provider-neutral and put volatile path details here.

Source registry: see `skills/craft-skill-spec/references/radar/sources.md` in a full CraftKit checkout, especially the 2026-05 harness addendum.

## Codex

| Surface | Common repo path | Scope and load behavior | Use when | Avoid when | Risk |
|---|---|---|---|---|---|
| Root context | `AGENTS.md` | Project instructions for Codex. Nested files can refine or override depending on Codex config and file placement. | Stable rules every Codex task needs. | Multi-step workflows or directory-only facts. | Context bloat and stale rules. |
| Local override | `AGENTS.override.md` or nested agent docs | More specific repo guidance for a subtree or configured fallback. | A subdirectory needs different commands or ownership rules. | The rule applies across the whole repo. | Conflicting guidance if hierarchy is unclear. |
| Skill | `.agents/skills/<name>/SKILL.md` | Reusable workflow available to Codex surfaces. | The agent should load an on-demand procedure, examples, or domain workflow. | One-line stable fact or deterministic check. | Too many skills can crowd discovery; descriptions matter. |
| Command | app/CLI slash commands and skill invocation | Codex has built-in commands and skill invocation; project-specific reusable workflows usually live as skills or scripts rather than a checked-in command file. | A user needs an explicit manual action or shortcut. | The behavior should auto-load by relevance or needs support files. | Command behavior differs by surface; do not promise Claude-style command files. |
| Hook | `.codex/hooks.json` or `.codex/config.toml` | Lifecycle script. Codex requires review/trust for non-managed command hooks. | Timing matters and a repeated miss can be checked deterministically. | The logic is judgment-heavy or untrusted. | Code execution, blocking work, trust hash churn. |
| Custom agent | `.codex/agents/*.toml` | Specialized subagent/custom agent, often with sandbox and model settings. | Isolation, role separation, or parallel exploration improves output. | The main agent can do the task with a skill. | Tool scope and write access can expand blast radius. |
| MCP/integration | `.codex/config.toml` | Structured external access for tools and data. | A source of truth lives outside the repo. | A local file or command is enough. | Auth, data exposure, availability. |
| Plugin | `.codex-plugin/plugin.json` plus marketplace entries | Installable package for reusable skills, apps, MCP, and bundled setup. | Sharing/versioning/bundling is part of the value. | One repo-local workflow is still being proven. | Packaging overhead and distribution trust. |

Codex defaults:

- Prefer repo-local `AGENTS.md` for stable shared conventions.
- Prefer `.agents/skills/` for reusable workflows.
- Prefer skills or scripts for project-specific repeatable commands; document manual invocation separately for Codex app/CLI surfaces.
- Prefer `.agents/hooks/scripts/` as the shared source for hook scripts, then call those scripts from `.codex/hooks.json` or `.codex/config.toml`.
- Prefer hooks only when the check is deterministic and timing-sensitive. Community-proven guardrails may be proposed as approval-gated candidates during bootstrap/maintain; project-specific hooks still need repeated-miss evidence.
- Prefer plugin packaging after project-local value is proven and sharing matters.

## Claude Code

| Surface | Common repo path | Scope and load behavior | Use when | Avoid when | Risk |
|---|---|---|---|---|---|
| Root context | `CLAUDE.md` or `.claude/CLAUDE.md` | Loaded as persistent project instruction. `CLAUDE.local.md` is personal. | Stable project facts Claude should always see. | Multi-step procedures or large topic docs. | Context bloat; Claude treats this as guidance, not enforcement. |
| AGENTS bridge | `CLAUDE.md` importing `@AGENTS.md` or symlink | Lets Claude consume shared agent instructions while keeping Claude-specific notes separate. | A repo already uses `AGENTS.md` as the shared core. | Claude needs substantially different project guidance. | Imports load into context and may need approval. |
| Rules | `.claude/rules/*.md` | Modular rules; optional `paths` frontmatter scopes loading to matching files. | Directory/file-type guidance should not live in root context. | Task-specific workflow belongs in a skill. | Path scopes can drift from repo structure. |
| Skill | `.claude/skills/<name>/SKILL.md` | Reusable workflow, invocable by slash command or model selection. | On-demand procedure with supporting files. | Simple command shortcut or stable project fact. | Discovery budget and stale descriptions. |
| Command | `.claude/commands/*.md` | Legacy/manual slash-command style. | Explicit manual shortcut that should not auto-trigger. | A reusable workflow needs supporting files or model selection. | New workflows usually fit skills better. |
| Hook | `.claude/settings.json`, `.claude/settings.local.json`, or plugin/skill/agent hook config | Lifecycle automation with event matchers and optional JSON control output. This skill's starter assets use command hooks only. | Deterministic enforcement, logging, context injection, or validation. | The behavior is exploratory or risky. | Code execution, settings drift, hard-to-debug blocking. |
| Subagent | `.claude/agents/*.md` | Markdown + frontmatter; project/user/plugin scopes with priority rules. | Specialized role, isolated context, or delegated investigation. | A skill is enough. | Tool permissions and duplicate names. |
| MCP/integration | `.mcp.json`, settings, or plugin-provided config | External tools and data access. | The agent needs structured access outside the repo. | A local command or checked-in doc is enough. | Auth, data exposure, platform-specific setup. |
| Plugin | `.claude-plugin/plugin.json` plus marketplace | Installable package with visible components and optional auto-update. | Sharing skills/hooks/agents/MCP across projects or teams. | One repo-local harness is still changing. | Supply-chain review and version drift. |

Claude Code defaults:

- If `AGENTS.md` is the shared source, use a `CLAUDE.md` import or symlink rather than duplicating content.
- Keep `CLAUDE.md` concise; move path-specific detail to `.claude/rules/`.
- Prefer skills for reusable workflows and commands only for manual shortcuts.
- Prefer `.agents/hooks/scripts/` as the shared source for hook scripts, then call those scripts from `.claude/settings.json`.
- Treat hooks, MCP, plugins, and write-capable subagents as approval-gated changes.

## Cross-target rules

- Do not mechanically mirror paths. Start from one provider-neutral placement decision, then emit separate Codex and Claude targets.
- Root context should contain triggers and stable facts, not long procedures.
- If both agents need the same workflow, write one neutral skill body first and adapt install paths second.
- If both agents need the same hook logic, write one neutral script first and adapt hook config second.
- If one agent has a mature surface and the other does not, make the asymmetry explicit instead of pretending parity.
- Prefer checked-in repo-local files for team-shared behavior. Use user/global config only for personal preferences.
- Record trust and rollback notes for anything executable.

For a concrete dual-target repo layout, see `dual-target-layout.md`. For deciding whether a hook is appropriate at all, see `hook-patterns.md`.
