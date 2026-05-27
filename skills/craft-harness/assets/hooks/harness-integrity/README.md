# Harness Integrity Hook

## Use When

- the repo has `skills/*/SKILL.md`, `.agents/skills/*/SKILL.md`, or `.claude/skills/*/SKILL.md`
- the repo has `.codex/hooks.json`, `.claude/settings.json`, or `.claude-plugin/marketplace.json`
- edits often break skill frontmatter or JSON snippets

## Avoid When

- the repo has no checked-in harness files
- another fast local command already validates the same files before agent work ends

## Stack Detector

The script scans known harness locations. If none exist, it prints a soft-skip message and exits `0`.

## Copy

```bash
mkdir -p .agents/hooks/scripts .codex .claude
cp skills/craft-harness/assets/hooks/harness-integrity/scripts/check-harness.mjs .agents/hooks/scripts/
node .agents/hooks/scripts/check-harness.mjs --dry-run
```

Merge `codex/hooks.json` into `.codex/hooks.json` and `claude/settings.json` into `.claude/settings.json`.

## Dry Run

```bash
node .agents/hooks/scripts/check-harness.mjs --dry-run
```

Expected pass or soft skip: exit `0`.
Actionable warning: exit `2` with missing frontmatter or JSON parse details.

## Trust / Review

- Read `.agents/hooks/scripts/check-harness.mjs`.
- Confirm it only reads local files.
- In Codex, run `/hooks` and trust the hook if the command matches what you reviewed.
- In Claude Code, run `/hooks` to confirm the project hook source and command.

## Rollback

Remove the matching entry from `.codex/hooks.json` and `.claude/settings.json`. Delete `.agents/hooks/scripts/check-harness.mjs` only if no adapter calls it.

## False Positives

- A nonstandard skill layout will be ignored unless it lives under a known skill directory.
- Intentional JSON-with-comments is still invalid JSON for these provider config files.
