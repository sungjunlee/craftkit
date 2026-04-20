# Auto-load on `/clear` (optional)

By default, `craft-handoff` copies the prompt to your clipboard and you paste it after `/clear`. This guide adds a one-time `SessionStart` hook so the new session **auto-loads** the handoff — no paste needed.

## Why a hook (and not a skill)

Claude Code's docs are explicit: *"Built-in commands like `/compact` and `/init` are not available through the Skill tool."* `/clear` is in the same bucket — a skill body cannot trigger it, and it cannot run code in the post-clear session either, because the skill's content was wiped along with everything else.

What *can* run in the post-clear session is a hook. `SessionStart` fires at the boundary of every new session, including those started by `/clear`, and supports a `matcher` field that filters by source. So the recipe is:

1. `craft-handoff` writes the prompt to `~/.craftkit/handoff/pending/<timestamp>-<worktree-slug>.md` with a small `worktree:` frontmatter (already does this).
2. User runs `/clear`.
3. `SessionStart` hook with `matcher: "clear"` fires, scans `pending/`, picks the newest entry whose `worktree:` matches the current cwd's git toplevel, returns it as `additionalContext`, and archives the consumed file to `~/.craftkit/handoff/archive/<original-name>.md`. Older same-worktree entries are moved aside as `superseded-*`.
4. New session boots with the handoff already in context.

### Concurrency model

Each craft-handoff run writes its own timestamped file — nothing is ever overwritten. Two sessions wrapping up in parallel (different worktrees *or* the same one) both get a dedicated pending entry; the hook disambiguates by reading each file's `worktree:` frontmatter against the current cwd. Same-worktree collisions keep the newest and archive the rest under `superseded-*` so they're recoverable.

### Staleness guard

If a pending entry is older than **72 hours** (3 days) when `/clear` fires, the hook archives it with a `stale-` prefix **without** injecting. This prevents a forgotten handoff from polluting an unrelated later `/clear`, while still accommodating common patterns like "end-of-Friday handoff, resume Monday morning".

Override via env var:

```bash
# Tighter TTL (e.g. 12h) — you always /clear within the same day
export CRAFTKIT_HANDOFF_TTL_HOURS=12

# Looser TTL (e.g. a week)
export CRAFTKIT_HANDOFF_TTL_HOURS=168

# Disable the guard entirely — always inject whatever is in pending.md
export CRAFTKIT_HANDOFF_TTL_HOURS=0
```

## Install

### 1. Verify the hook script exists

```bash
ls "$(npm prefix -g 2>/dev/null)/lib/node_modules" 2>/dev/null
# OR locate via the skill itself
find ~/.claude ~/.config/claude -name "load-pending-hook.mjs" 2>/dev/null | head -3
```

The script ships at `<craft-handoff>/scripts/load-pending-hook.mjs`. Note the absolute path — you'll need it for settings.json.

### 2. Add to `~/.claude/settings.json`

If `hooks` doesn't exist yet, create it. If `hooks.SessionStart` already has entries, merge the new entry into the array.

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "clear",
        "hooks": [
          {
            "type": "command",
            "command": "node /ABSOLUTE/PATH/TO/skills/craft-handoff/scripts/load-pending-hook.mjs"
          }
        ]
      }
    ]
  }
}
```

Replace `/ABSOLUTE/PATH/TO/` with your actual install path. Common locations:

- Plugin install: `~/.claude/plugins/marketplaces/<repo>/skills/craft-handoff/scripts/...`
- Personal skill: `~/.claude/skills/craft-handoff/scripts/...`
- Local dev: `~/path/to/craftkit/skills/craft-handoff/scripts/...`

### 3. Verify

Open a Claude Code session, then (substitute your actual worktree path):

```bash
mkdir -p ~/.craftkit/handoff/pending
WORKTREE=$(git rev-parse --show-toplevel)
cat > ~/.craftkit/handoff/pending/$(date -u +%Y-%m-%dT%H-%M-%S-000Z)-test.md <<EOF
---
worktree: $WORKTREE
branch: $(git rev-parse --abbrev-ref HEAD)
created: $(date -u +%Y-%m-%dT%H:%M:%S.000Z)
---
<context>test handoff</context>
EOF
```

Run `/clear`. The new session should report it received additional context. Confirm the file moved to archive:

```bash
ls ~/.craftkit/handoff/pending/
# expected: empty (or only entries from other worktrees)

ls ~/.craftkit/handoff/archive/
# expected: a new <timestamp>-test.md entry
```

## How `matcher: "clear"` works

The `SessionStart` event fires at every session boundary with a `source` field. The `matcher` filters by that source:

| `matcher` value | Fires when |
|---|---|
| `clear` | After `/clear` |
| `startup` | Cold-start of a new Claude Code instance |
| `resume` | After `/resume` or `--resume` |
| (omitted) | All sources |

Using `clear` keeps the hook scoped — it won't inject the handoff when you just open Claude Code normally.

## Gotchas

- **Stale pending file.** If you ran `craft-handoff` and never `/clear`-ed, then `/clear` much later for an unrelated reason, you don't want the old handoff. The hook has two guards: (a) after injection, it *archives* rather than deletes (so past handoffs stay recoverable under `~/.craftkit/handoff/archive/`), and (b) handoffs older than 72h (configurable via `CRAFTKIT_HANDOFF_TTL_HOURS`) are archived with a `stale-` prefix and never injected. Manual cleanup if needed: `rm -rf ~/.craftkit/handoff/pending/`.
- **Wrong-worktree injection.** The hook only injects a handoff whose `worktree:` frontmatter matches the current cwd's git toplevel. Handoffs from other checkouts stay in `pending/` until that project's next `/clear`.
- **Legacy `pending.md`.** Upgrading from the pre-directory layout? A leftover `~/.craftkit/handoff/pending.md` is treated as a match for the current worktree on first `/clear` and then archived. One-shot migration, no action needed.
- **Hook errors are silent by default.** If the script fails (bad path, no Node), Claude Code shows nothing in the chat. Check `~/.claude/logs/` or run the hook manually: `node <path>/load-pending-hook.mjs`.
- **Multiple hooks on the same matcher.** If you already have a `SessionStart` + `clear` hook (e.g. for environment setup), merge — don't replace. Their `additionalContext` outputs concatenate.
- **Path portability.** `command` requires an absolute path. If you move the install, update settings.json.

## Trust model

The hook resolves which handoff to inject by reading the `worktree:` frontmatter from each file under `~/.craftkit/handoff/pending/`. Any process running as the current OS user can drop a file into that directory with a `worktree:` matching one of your projects and have its content auto-injected into the next `/clear`. This is the same trust boundary as `~/.claude/settings.json` itself (anything writing there can rewrite the hook command, drop shell scripts, etc.), so it does not introduce new privilege — but if your threat model includes "another user-level process on this machine", treat `~/.craftkit/handoff/pending/` as trusted user input and audit its contents before `/clear`.

## Uninstall

Delete the entry from `hooks.SessionStart` in `~/.claude/settings.json`. The skill itself keeps working — it just falls back to clipboard-only.

## Reference

- Claude Code hooks: <https://code.claude.com/docs/en/hooks>
- The `additionalContext` mechanism: returned via `hookSpecificOutput` in the JSON payload, concatenated across hooks.
