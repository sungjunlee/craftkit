# Python Ruff Hook

## Use When

- the repo has Python files
- Ruff is already the formatter/linter or is already installed in the local environment
- agents often edit Python without running the existing fast check

## Avoid When

- the repo has no Ruff convention
- the check is too slow for the chosen event
- the team expects formatters to write files automatically from hooks

## Stack Detector

The script looks for Python files from hook input, then falls back to changed files. In `--dry-run`, it scans the repo for `*.py`. If no `ruff` executable is found, it exits `0` with a soft-skip message.

## Copy

```bash
mkdir -p .agents/hooks/scripts .codex .claude
cp skills/craft-harness/assets/hooks/python-ruff/scripts/python-ruff-check.mjs .agents/hooks/scripts/
node .agents/hooks/scripts/python-ruff-check.mjs --dry-run
```

Merge `codex/hooks.json` into `.codex/hooks.json` and `claude/settings.json` into `.claude/settings.json`.

## Dry Run

```bash
node .agents/hooks/scripts/python-ruff-check.mjs --dry-run
```

Expected pass or soft skip: exit `0`.
Ruff findings: exit `2`.

## Trust / Review

- Confirm the script runs `ruff check`, not `ruff check --fix`.
- Confirm it does not install Ruff or fetch network resources.
- In Codex, review and trust the hook through `/hooks`.
- In Claude Code, inspect the project hook through `/hooks`.

## Rollback

Remove the matching provider config entries first. Keep the script only if another provider adapter still calls it.

## False Positives

- Generated Python files should be excluded in Ruff config, not in this hook.
- If Ruff is installed through a project runner (`uv run ruff`, `poetry run ruff`), adapt the command after reviewing the repo convention.
