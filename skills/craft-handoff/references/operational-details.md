# craft-handoff operational details

Load this reference when the main workflow hits clipboard portability, stale pending prompts, concurrent wrap-ups, pair-write recovery, or cleanup questions.

## Clipboard portability

| Platform | Clipboard tool | Notes |
|---|---|---|
| macOS | `pbcopy` | Bundled |
| Linux Wayland | `wl-copy` | `wl-clipboard` package |
| Linux X11 | `xclip` or `xsel` | Most distros, may need install |
| Windows / WSL | `clip.exe` | Bundled with Windows |

`scripts/copy-clipboard.sh` tries these in order. If none are available, the prompt is still saved to `PENDING_PATH` and the rich doc to `DOC_PATH`; report that clipboard copy was skipped.

## Prompt/doc lifecycle

The pair is the unit of handoff:

- prompt: `~/.craftkit/handoff/pending/<timestamp>-<slug>.md`
- rich doc: `~/.craftkit/handoff/docs/<slug>.md`

Each run writes a new timestamped prompt, so pending prompts are not overwritten. The live rich doc is per project and is archived before overwrite.

## Stale pending prompts

The optional auto-load hook archives pending prompts older than 72h by default. Configure with `CRAFTKIT_HANDOFF_TTL_HOURS`; set it to `0` to disable stale cleanup.

The doc is not TTL'd. It stays at `DOC_PATH` until the next handoff for the same project overwrites it after archiving the previous version.

## Concurrent wrap-ups in the same worktree

Two agent windows can wrap up the same repo at roughly the same time:

- each writes its own timestamped prompt file
- the hook picks the newest matching prompt and supersedes older same-worktree entries
- both write to the same `DOC_PATH`; the second archive-on-overwrite preserves the first doc

If both narratives matter, recover the older one from `~/.craftkit/handoff/archive/`.

## Pair-write recovery

If rich-doc write succeeds but prompt-write fails, do not re-run the doc write. The doc already reflects this session, and re-running Step 4a would archive it immediately.

Recover by composing and writing the prompt only, then copying that prompt body to the clipboard. If recovery is not possible, tell the user the rich doc exists but no pending prompt is queued.

## Auto-load edge cases

- **Unwanted injection**: remove pending prompts with `rm -rf ~/.craftkit/handoff/pending/` when the user wants a true reset.
- **Double injection after crash**: delete the consumed pending prompt by hand, or wait for TTL cleanup.
- **Malformed hook config**: validate `~/.claude/settings.json` with Node JSON parsing and inspect Claude logs if available.

For hook installation and matching behavior, see `auto-load-hook.md`.

## Maintenance commands

Remove one project's handoff completely:

```bash
rm ~/.craftkit/handoff/docs/<slug>.md
find ~/.craftkit/handoff/pending -name "*-<slug>.md" -delete
```

Inspect old rich docs before deleting:

```bash
find ~/.craftkit/handoff/docs -maxdepth 1 -mtime +30 -print
```

Find a doc by project name:

```bash
ls ~/.craftkit/handoff/docs/ | grep <project-name>
```

The 6-character suffix is the first six SHA-1 characters of the absolute worktree path. It disambiguates multiple worktree clones of the same repo.
