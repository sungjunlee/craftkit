# Hook Patterns

Use this reference when `craft-harness` considers hook automation.

Hooks execute or invoke configured actions during an agent lifecycle. This reference focuses on command hooks because the starter assets are shared repo-local scripts. Hooks are useful because they happen at the right time, but they expand the repo's execution surface. Treat every hook as approval-gated, reviewable, and reversible.

## Hook Classes

### Community-Proven Guardrail Hook

Use when a guardrail is common for the stack and the check is deterministic.

Examples:

- formatter, linter, or typecheck reminder
- package manager or lockfile drift guard
- secret scanner adapter
- generated-file guard
- migration safety reminder
- harness integrity check for skills, JSON snippets, and hook config

These may be proposed during `bootstrap` or `maintain` modes when the repo already has the relevant tool or configuration.

CraftKit starter assets live under `assets/hooks/` and are recipes: a shared script, Codex snippet, Claude snippet, dry-run command, rollback note, and false-positive notes.

### Project-Specific Hook

Use when a repo-specific miss keeps recurring and timing matters.

Examples:

- a migration safety command unique to the repo
- a release checklist command unique to the org
- a domain-specific generated-code boundary

Require repeated-miss evidence before recommending these as hooks. Otherwise use context, a skill, or a script first.

## Adoption Criteria

Recommend a hook candidate only when it is:

- deterministic
- fast enough for the lifecycle event
- read-only by default
- no-network by default
- low false-positive
- easy to dry-run
- easy to roll back
- narrow in matcher/event scope
- backed by an existing tool, convention, or community pattern

Avoid hook candidates that:

- run long or flaky checks on every edit
- auto-format or write files by default
- install tools or fetch network resources
- inspect broad secrets or credentials
- rely on unstable transcript parsing
- duplicate a faster existing script or CI check without adding timing value

## Decision Tree

```text
Need appears
  |
  +-- stable fact every task needs? ----> root/local context
  |
  +-- reusable judgment workflow? ------> skill
  |
  +-- deterministic on-demand check? ---> script
  |
  +-- deterministic timing-sensitive check?
        |
        +-- common stack guardrail? ----> community-proven hook candidate
        |
        +-- repeated repo miss proven? -> project-specific hook candidate
        |
        +-- otherwise -----------------> script + reminder, not hook
```

## Output Requirements

Every hook candidate should include:

- hook class: `community-proven guardrail` or `project-specific`
- event and matcher
- script path
- dry-run command
- expected runtime
- risk gate: usually `approval required`
- trust/review steps
- rollback steps
- false-positive notes

## Provider Notes

Codex:

- discovers hooks from `hooks.json` or inline `[hooks]` config
- requires non-managed command hooks to be reviewed and trusted before they run
- runs matching command hooks concurrently
- recommends resolving repo-local scripts from the git root

Claude Code:

- uses settings files such as `.claude/settings.json`
- command hooks run with the user's full permissions
- exit code behavior depends on event; use event-specific docs before relying on blocking
- project settings are shareable, local settings are not

See `platform-surfaces.md` for current paths and risk notes.

## Rollback Template

```text
Rollback:
1. Remove the hook entry from the provider config.
2. Re-run the dry-run command to confirm the script itself is still harmless.
3. Remove the copied script only if no other provider adapter calls it.
4. In Codex, review `/hooks` so stale trusted definitions are no longer enabled.
5. In Claude Code, reload or restart the session if settings did not auto-refresh.
```

## Source Notes

- Codex hook config, trust, concurrency, and git-root path guidance: <https://developers.openai.com/codex/hooks>
- Claude Code hook settings, `$CLAUDE_PROJECT_DIR`, `/hooks`, and exit behavior: <https://code.claude.com/docs/en/hooks>
- Common hook precedents: <https://github.com/pre-commit/pre-commit-hooks>
- Ruff linter command precedent: <https://docs.astral.sh/ruff/linter/>
- Secret scanner precedents: <https://github.com/gitleaks/gitleaks> and <https://github.com/Yelp/detect-secrets>
