# Dual Target Layout

Use this reference when `craft-harness` builds or repairs a repo harness for both Codex and Claude Code.

## Default Shape

Prefer one shared source tree and thin provider adapters:

```text
.agents/
  skills/          # canonical shared skill source
  hooks/scripts/   # canonical shared hook scripts copied from assets
  harness/         # optional docs, checklists, and local harness notes

.codex/
  hooks.json       # Codex adapter config
  config.toml      # Codex adapter config when TOML is preferred

.claude/
  skills/<name>    # relative symlink to .agents/skills/<name>, or copied adapter
  settings.json    # Claude adapter config
```

The shared source is where humans review reusable logic. Provider folders should mostly contain load/config adapters.

## Skills

Default to `.agents/skills/<name>/SKILL.md` as the canonical source when a workflow should work in both Codex and Claude Code.

For Claude Code:

- Prefer a relative symlink from `.claude/skills/<name>` to `../../.agents/skills/<name>` when the repo and platform handle symlinks reliably.
- Use copy + drift-check guidance when symlinks are unsafe or noisy.
- Do not maintain two independent skill bodies unless target behavior truly differs.

Symlink caveats:

- Windows checkouts may turn symlinks into plain files when `core.symlinks=false`.
- Some editors and file watchers treat symlinked directories differently.
- Relative symlinks are more portable than absolute symlinks.
- If a repo has contributors on mixed OSes, prefer copy + documented drift check over surprising checkout behavior.

## Hooks

Default to `.agents/hooks/scripts/<asset>.mjs` as the canonical script location.

Provider adapters call the same script:

- Codex: `.codex/hooks.json` or `.codex/config.toml`
- Claude Code: `.claude/settings.json`

Keep provider-specific JSON/TOML snippets small. The script should contain the actual logic.

Starter recipes live under `assets/hooks/`. Treat them as copy-pasteable scripts plus provider snippets, not markdown-only hooks and not auto-installers.

## Root Context

Use `AGENTS.md` as the shared root context when both agents should read the same stable conventions. Use `CLAUDE.md` as a short bridge, import, or symlink only when it preserves clarity.

Root files should contain stable facts and triggers, not long procedures. Move repeated procedures into skills, scripts, or hooks.

## Drift Checks

When using copy instead of symlink:

- name the canonical source
- name the copied target
- include a simple comparison command
- record when divergence is intentional

Example:

```bash
diff -ru .agents/skills/pr-review .claude/skills/pr-review
```

## Placement Rule

Start with one provider-neutral placement decision, then emit Codex and Claude Code adapters. Do not mechanically mirror files when one platform has a different load model.
