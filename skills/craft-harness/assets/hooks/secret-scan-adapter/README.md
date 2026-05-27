# Secret Scan Adapter Hook

## Use When

- the repo already uses `gitleaks` or `detect-secrets`
- agents may touch files that could accidentally include tokens or credentials
- a fast local scanner is available

## Avoid When

- no scanner is installed or configured
- scans are slow enough to interrupt ordinary edits
- the team has not agreed on baseline handling

## Stack Detector

The script checks for `gitleaks` first, then `detect-secrets`. If neither exists, it exits `0` with a soft-skip message. It does not install scanners and does not invent a scanner.

## Copy

```bash
mkdir -p .agents/hooks/scripts .codex .claude
cp skills/craft-harness/assets/hooks/secret-scan-adapter/scripts/secret-scan-adapter.mjs .agents/hooks/scripts/
node .agents/hooks/scripts/secret-scan-adapter.mjs --dry-run
```

Merge `codex/hooks.json` into `.codex/hooks.json` and `claude/settings.json` into `.claude/settings.json`.

## Dry Run

```bash
node .agents/hooks/scripts/secret-scan-adapter.mjs --dry-run
```

Expected pass or missing-tool soft skip: exit `0`.
Scanner finding: exit `2`.

## Trust / Review

- Confirm the command uses the repo's existing scanner.
- Confirm it does not upload code or credentials.
- Confirm expected baselines and allowlists are already reviewed.
- In Codex, review and trust the hook through `/hooks`.
- In Claude Code, inspect the project hook through `/hooks`.

## Rollback

Remove the provider config entries first. Keep or delete the script based on whether another adapter still calls it.

## False Positives

- Generated fixtures and test credentials should be allowlisted in the scanner's own config.
- The Gitleaks adapter scans the working tree with `--no-git`, not full history. Use a separate slower audit for historical leaks.
- If the scanner has no baseline, the first run may report existing working-tree findings unrelated to the agent's edit.
