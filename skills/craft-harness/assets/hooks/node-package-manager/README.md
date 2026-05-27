# Node Package Manager Guard

## Use When

- the repo has `package.json`
- agents often mix package managers or leave lockfiles inconsistent
- the repo has an expected package manager in `packageManager` or a single lockfile convention

## Avoid When

- the repo intentionally supports multiple package managers
- package manager policy is already enforced in CI and timing does not matter

## Stack Detector

The script reads `package.json` and known lockfiles. If no `package.json` exists, it exits `0` with a soft-skip message.

## Copy

```bash
mkdir -p .agents/hooks/scripts .codex .claude
cp skills/craft-harness/assets/hooks/node-package-manager/scripts/package-manager-guard.mjs .agents/hooks/scripts/
node .agents/hooks/scripts/package-manager-guard.mjs --dry-run
```

Merge `codex/hooks.json` into `.codex/hooks.json` and `claude/settings.json` into `.claude/settings.json`.

## Dry Run

```bash
node .agents/hooks/scripts/package-manager-guard.mjs --dry-run
```

Expected pass or soft skip: exit `0`.
Actionable drift warning: exit `2`.

## Trust / Review

- Confirm the script only reads `package.json` and lockfiles.
- Confirm it does not run install commands.
- In Codex, review and trust the hook through `/hooks`.
- In Claude Code, inspect the project hook through `/hooks`.

## Rollback

Remove the provider config entries first. Delete the copied script only if unused.

## False Positives

- Polyglot repos with nested packages may need one hook per package root.
- Repos intentionally keeping multiple lockfiles should document that policy and skip this asset.
