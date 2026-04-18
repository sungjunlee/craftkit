# Auto-load on `/clear` (optional)

By default, `craft-handoff` copies the prompt to your clipboard and you paste it after `/clear`. This guide adds a one-time `SessionStart` hook so the new session **auto-loads** the handoff — no paste needed.

## Why a hook (and not a skill)

Claude Code's docs are explicit: *"Built-in commands like `/compact` and `/init` are not available through the Skill tool."* `/clear` is in the same bucket — a skill body cannot trigger it, and it cannot run code in the post-clear session either, because the skill's content was wiped along with everything else.

What *can* run in the post-clear session is a hook. `SessionStart` fires at the boundary of every new session, including those started by `/clear`, and supports a `matcher` field that filters by source. So the recipe is:

1. `craft-handoff` writes the prompt to `~/.craftkit/handoff/pending.md` (already does this).
2. User runs `/clear`.
3. `SessionStart` hook with `matcher: "clear"` fires, reads `pending.md`, returns it as `additionalContext`, and archives the file to `~/.craftkit/handoff/archive/<timestamp>.md`.
4. New session boots with the handoff already in context.

### Staleness guard

If `pending.md` is older than **12 hours** when `/clear` fires, the hook archives it with a `stale-` prefix **without** injecting. This prevents a forgotten handoff from polluting an unrelated later `/clear`. The threshold is the `STALE_AFTER_MS` constant in `load-pending-hook.mjs` — adjust if your workflow differs.

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

Open a Claude Code session, then:

```bash
echo "<context>test handoff</context>" > ~/.craftkit/handoff/pending.md
```

Run `/clear`. The new session should report it received additional context. Confirm `pending.md` moved to the archive:

```bash
ls ~/.craftkit/handoff/pending.md
# expected: No such file or directory

ls ~/.craftkit/handoff/archive/
# expected: a new <timestamp>.md entry
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

- **Stale pending file.** If you ran `craft-handoff` and never `/clear`-ed, then `/clear` much later for an unrelated reason, you don't want the old handoff. The hook has two guards: (a) after injection, it *archives* rather than deletes (so past handoffs stay recoverable under `~/.craftkit/handoff/archive/`), and (b) handoffs older than 12h are archived with a `stale-` prefix and never injected. Manual cleanup if needed: `rm ~/.craftkit/handoff/pending.md`.
- **Hook errors are silent by default.** If the script fails (bad path, no Node), Claude Code shows nothing in the chat. Check `~/.claude/logs/` or run the hook manually: `node <path>/load-pending-hook.mjs`.
- **Multiple hooks on the same matcher.** If you already have a `SessionStart` + `clear` hook (e.g. for environment setup), merge — don't replace. Their `additionalContext` outputs concatenate.
- **Path portability.** `command` requires an absolute path. If you move the install, update settings.json.

## Uninstall

Delete the entry from `hooks.SessionStart` in `~/.claude/settings.json`. The skill itself keeps working — it just falls back to clipboard-only.

## Reference

- Claude Code hooks: <https://code.claude.com/docs/en/hooks>
- The `additionalContext` mechanism: returned via `hookSpecificOutput` in the JSON payload, concatenated across hooks.
