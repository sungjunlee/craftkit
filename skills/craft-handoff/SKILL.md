---
name: craft-handoff
description: Produce paired session-handoff artifacts — a rich doc plus a resume prompt — when wrapping up or clearing context.
disable-model-invocation: true
---

# craft-handoff

## Purpose

End the session with a paired handoff the next session can resume from:

- **Rich doc** — `~/.craftkit/handoff/docs/<worktree-slug>.md`: the durable project narrative, archived and overwritten on the next same-project handoff.
- **Resume prompt** — `~/.craftkit/handoff/pending/<timestamp>-<worktree-slug>.md`: what the user pastes or the hook auto-loads; mirrored to the clipboard without frontmatter; tells the next agent to read the rich doc first.

The two are a unit; never write one without the other. If the session holds no state worth carrying, write nothing and say so.

## Workflow

`<skill-dir>` is the directory this `SKILL.md` was loaded from (an installed skill directory, or `skills/craft-handoff` in a source checkout).

1. **Gather.** Run `node <skill-dir>/scripts/gather-state.mjs` and use its `--- Handoff target ---` values (`PENDING_PATH`, `DOC_PATH`, `ARCHIVE_DIR`, `WORKTREE_SLUG`, frontmatter) verbatim. Without the script, gather branch, status, diff stat, and recent log with git and derive paths per `references/operational-details.md`. Outside a git repo, skip repo state and rely on the conversation.
2. **Distill.** Carry only what the next session cannot reconstruct from the diff: outcomes done, decisions with their `because`, what didn't work, active blockers, and next steps with observable success criteria. Omit empty sections. If several unrelated threads are open, ask which to carry, or take the most recent and say so in the doc.
3. **Write the doc, then the prompt.** Rationale, alternatives, and time order go in the doc; orientation snapshots go in the prompt. If the doc changes after the prompt is composed, regenerate the prompt.
4. **Persist.** Create `docs/`, `pending/`, and `archive/` under `~/.craftkit/handoff/`; archive the existing `DOC_PATH`; write the doc; write the prompt with frontmatter to `PENDING_PATH`; copy the prompt body to the clipboard:

```bash
sed '1,/^---$/d;1,/^---$/d' "$PENDING_PATH" | bash <skill-dir>/scripts/copy-clipboard.sh
```

Clipboard failure is non-fatal — report it; the files are the deliverable. If the doc was written but the prompt write failed, write only the prompt (re-running the doc step would archive the doc just written).

## Output format

- **Rich doc** — frontmatter plus a single `<context>` body: Project, Done, State, Decisions, What didn't work, Next. No `<task>` or `<rules>`.
- **Resume prompt** — `<context>` (Project, State, Done snapshot, Decisions, pointer to the doc) / `<task>` (next action and success criteria) / `<rules>` (path convention, read-the-doc-first, plus only the constraints, key files, and verification command that actually apply). Skeletons: `references/artifact-shapes.md`.

The resume prompt must stand on its own if the doc is unreachable: branch and state, a concrete next action with success criteria, the constraints and decisions that bound it — including rejected approaches not to redo — and the instruction to read the rich doc first.

Chat return: the resume prompt in a fenced block, one line naming the prompt path, doc path, and clipboard status, and the next step for the user. Mention the auto-load hook or a `/goal` candidate only when relevant. Don't paste the rich doc when it was written.

## Guardrails

- redact secrets, tokens, customer data, and personal data from both artifacts
- report only verification that was actually run
- repo paths are worktree-relative; handoff-store paths and the `worktree:` frontmatter value stay absolute, because the hook matches on that absolute path and the next session may not share this cwd

## References (load on demand)

- `references/artifact-shapes.md` — exact rich-doc and resume-prompt skeletons.
- `references/full-example.md` — a complete paired output.
- `references/operational-details.md` — fallback path derivation, clipboard portability, stale prompts, concurrent wrap-ups, pair-write recovery, cleanup commands.
- `references/auto-load-hook.md` — optional SessionStart hook that injects the pending prompt after `/clear`; the hook does not read the rich doc.
