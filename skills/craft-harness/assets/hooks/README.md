# Hook Asset Pack

These assets are reviewable recipes for repo-local command hooks. They are not installers.

Default layout:

```text
.agents/hooks/scripts/   # copied script, shared by Codex and Claude Code
.codex/hooks.json        # Codex adapter snippet
.claude/settings.json    # Claude Code adapter snippet
```

Copy only the assets that fit the repo. Merge JSON snippets into existing provider config; do not replace existing hook arrays without reviewing them.

## Assets

| Asset | Use when | Soft skip |
|---|---|---|
| `harness-integrity` | a repo has CraftKit-style skills, hook snippets, or marketplace JSON | no harness files found |
| `python-ruff` | a Python repo already uses Ruff | no Python files or no `ruff` executable |
| `node-package-manager` | a Node/TS repo has `package.json` and lockfiles | no `package.json` |
| `secret-scan-adapter` | a repo already uses `gitleaks` or `detect-secrets` | no supported scanner executable |

## Install Shape

Example:

```bash
mkdir -p .agents/hooks/scripts .codex .claude
cp skills/craft-harness/assets/hooks/harness-integrity/scripts/check-harness.mjs .agents/hooks/scripts/
node .agents/hooks/scripts/check-harness.mjs --dry-run
```

Then merge the matching `codex/hooks.json` and `claude/settings.json` snippets.

## Review Checklist

- Read the script before copying it.
- Run the dry-run command.
- Confirm the command is read-only and does not install dependencies.
- Confirm the hook event and matcher are narrow enough.
- In Codex, use `/hooks` to review and trust the new hook definition.
- In Claude Code, use `/hooks` to inspect the registered hook after editing settings.
- Keep rollback simple: remove the provider config entry first; delete the copied script only if no adapter calls it.

## Exit Behavior

Scripts exit:

- `0` for pass or soft skip
- `2` for an actionable warning that should be surfaced to the agent/user
- another nonzero code only for unexpected script failure

## Verification Commands

From the repo root after copying a script:

```bash
node .agents/hooks/scripts/check-harness.mjs --dry-run
node .agents/hooks/scripts/python-ruff-check.mjs --dry-run
node .agents/hooks/scripts/package-manager-guard.mjs --dry-run
node .agents/hooks/scripts/secret-scan-adapter.mjs --dry-run
```

For fixture-shaped hook input:

```bash
node .agents/hooks/scripts/python-ruff-check.mjs < skills/craft-harness/assets/hooks/python-ruff/fixtures/codex-post-tool-use.json
```

Expected evidence:

- pass or soft skip exits `0`
- actionable warnings exit `2`
- JSON snippets parse with `node -e 'JSON.parse(require("fs").readFileSync(process.argv[1], "utf8"))' <file>`
