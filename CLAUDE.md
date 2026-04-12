# CLAUDE.md

Claude Code–specific context for this repo. Shared conventions live in `AGENTS.md`; workspace structure lives in `../CLAUDE.md`. Don't restate those here.

## Repo shape

- Docs-first. No code, no test command.
- `skills/<skill-name>/SKILL.md` is always loaded — keep under ~500 lines. `references/*.md` loads on demand.
- All six `craft-*` skills have been through `craft-autoresearch` eval-driven passes.

## craft-autoresearch workflow

- Run artifacts go to `~/.craftkit/autoresearch/<skill>/<YYYY-MM-DD-slug>/` — **outside the repo**. Never commit run artifacts.
- Only kept mutations (the skill files themselves) land in git. Finding prose goes in the commit message body.
- For `craft-autoresearch` itself, `SKILL.md` and `references/*.md` are one unit — include related reference updates in the same commit.

## Commit prefixes (match existing history)

`improve(<skill>)` for SKILL.md tuning · `docs(<skill>)` for reference updates · `refactor(<skill>)` for structural moves · `chore:` for cleanup.
