---
name: craft-handoff
description: >-
  Produce two paired session-handoff artifacts that the next session uses
  together — a rich narrative doc on disk and a craft-prompt-grade prompt
  that commands the next agent to read the doc first. Use proactively
  whenever a session is wrapping up. Triggers: "wrap up", "마무리",
  "세션 정리", "핸드오프", "다음 세션으로 넘겨", "next session으로 넘겨",
  or before clearing/resetting session context.
---

# craft-handoff

## Purpose

End the session by producing a paired handoff:

- **Rich doc**: `~/.craftkit/handoff/docs/<worktree-slug>.md` — durable project narrative; overwritten on the next same-project handoff after archiving the previous doc.
- **Resume prompt**: `~/.craftkit/handoff/pending/<timestamp>-<worktree-slug>.md` — per-session entry artifact; mirrored to clipboard without frontmatter; tells the next agent to read the rich doc first.

The prompt is what the user pastes or auto-loads. The doc is the deeper record. They are a unit; do not produce one without the other.

## Use this when

- the user says "wrap up", "마무리", "세션 정리", "핸드오프", "다음 세션으로 넘겨", or "next session으로 넘겨"
- the user is about to clear or reset context and wants continuity
- a long session is ending and the next session should pick up cleanly
- a task is paused mid-flight and needs a concrete resume point

Skip quick Q&A sessions with no state worth carrying.

## Inputs

Gather machine state with the bundled script:

```bash
node <skill-dir>/scripts/gather-state.mjs
```

Read its full output, especially `--- Handoff target ---`: `PENDING_PATH`, `DOC_PATH`, `ARCHIVE_DIR`, `WORKTREE_SLUG`, and ready-to-prepend frontmatter.

If the script is unavailable, gather the same facts manually:

```bash
git rev-parse --show-toplevel
git rev-parse --abbrev-ref HEAD
git status --short | head -40
git diff --stat | tail -20
git log --oneline -8
```

Also derive the handoff target yourself: `WORKTREE_SLUG` is `<sanitized basename>-<first 6 chars of sha1(git rev-parse --show-toplevel output, or cwd outside git)>`; `DOC_PATH` is `~/.craftkit/handoff/docs/<slug>.md`; `PENDING_PATH` is `~/.craftkit/handoff/pending/<timestamp>-<slug>.md`; `ARCHIVE_DIR` is `~/.craftkit/handoff/archive`; frontmatter carries `worktree`, `branch`, and `created` for both artifacts, plus `next` for the doc.

Then extract from the conversation:

- **Done**: completed outcomes the next session needs.
- **Decisions**: non-obvious choices with a `because <reason>` rationale.
- **What didn't work**: attempted approaches and outcomes.
- **Blockers**: active blockers only.
- **Next**: 1-3 concrete next steps with observable success criteria.
- **Suggested skills/capabilities**: only when they would materially change the next session.

Use worktree-relative paths in both artifacts. Redact secrets, tokens, customer data, and personal data.

## Workflow

### 0. Confirm ambiguous side effects

This skill writes files and mutates the clipboard. If the trigger is ambiguous, ask one short confirmation before running it. Skip confirmation for explicit handoff requests.

### 1. Gather

Run the gather script or fallback commands, then scan the conversation for the sections above. Omit empty sections instead of padding the handoff.

### 2. Distill

Apply these inclusion tests:

- **Done**: include outcomes that changed code, docs, issues, branches, or project state.
- **State**: include branch, diff status, and verified test status. Do not invent test commands.
- **Decisions**: include only choices a future agent could not reconstruct from the diff alone; every item needs a reason.
- **What didn't work**: include failed or abandoned approaches in the doc, not the prompt.
- **Blockers**: include only items that actively block the next step.
- **Next**: make each step observable, not aspirational.
- **Existing artifacts**: link only to artifacts the next session can reach. Summarize untracked local context if a fresh worktree would miss it.

- **Prompt**: snapshot lines for orientation and execution.
- **Doc**: rationale, alternatives, time order, and failure context.

### 3. Compose the rich doc

Write the doc first; it is the narrative source of truth.

Shape:

```markdown
---
worktree: <absolute worktree>
branch: <branch>
created: <timestamp>
next: <action-first one-liner>
---
<context>
## Project
...
## Done
...
## State
...
## Decisions
...
## What didn't work
...
## Next
...
</context>
```

Rules:

- The body contains only `<context>...</context>`; no `<task>` or `<rules>`.
- Fill narrative depth only where it helps the next session.
- Keep decisions reasoned. Add alternatives when they shaped the current state.
- If craft-prompt templates are installed, use `craft-prompt/templates/session-handoff.md` as the writing model. If not, use the shape above directly.

### 4. Compose the resume prompt

The prompt must be usable even if the doc is unreachable, but it should command the next agent to read the doc first.

Shape:

```xml
<context>
## Project
<name> — <one-liner>

## State
- Branch: <branch>
- Tests: <verified status>
- Blockers: <none or blockers>

## Done (snapshot)
- <outcome>

## Decisions (one-liners; full rationale in handoff doc)
- <decision> — because <reason>

## Background
Full session narrative, decision rationale, and abandoned approaches are at `~/.craftkit/handoff/docs/<slug>.md`. Read it first to fully restore prior context before acting.
</context>

<task>
<next task>

Success criteria:
- <observable criterion>
</task>

<rules>
- All paths are worktree-relative
- Read `~/.craftkit/handoff/docs/<slug>.md` first if reachable; if missing or inconsistent with this snapshot, proceed with this snapshot and surface the discrepancy
- Read `<key file>` first to confirm <why>
- Run `<actual verification command>` before declaring done
</rules>
```

Add `## Suggested skills` inside `<context>` only when a specific skill or capability would change the next agent's behavior.

### 5. Persist and copy

Use paths from the gather script verbatim.

1. Create the `docs`, `pending`, and `archive` directories under `~/.craftkit/handoff/`.
2. Archive existing `DOC_PATH`, then write the new rich doc.
3. Write the prompt with frontmatter to `PENDING_PATH`.
4. Copy the prompt body, without frontmatter, to the clipboard:

```bash
sed '1,/^---$/d;1,/^---$/d' "$PENDING_PATH" | bash <skill-dir>/scripts/copy-clipboard.sh
```

If clipboard copy fails, report that the files were written and clipboard copy was skipped.

### 6. Inform

Return:

1. resume prompt in a fenced `xml` block
2. confirmation line with prompt path, doc path, and clipboard status
3. next-step instruction
4. optional auto-load hook pointer when relevant
5. optional `/goal` candidate only when the next task is durable, verifiable, and multi-turn

Do not paste the rich doc in chat when it was written successfully.

## Failure modes

- **Empty handoff**: no meaningful state exists; write nothing.
- **Outside a git repo**: omit repo state and rely on conversation-derived context.
- **Multiple unrelated threads**: ask which thread to carry forward, or choose the most recent and say so in the doc.
- **Prompt/doc divergence**: regenerate the prompt if the doc changes after prompt composition.
- **Doc unreachable on resume**: the prompt snapshot must still be usable, and the next agent should flag the missing doc.
- **Partial write**: if doc write succeeds but prompt write fails, recover by writing only the prompt.

For stale prompts, concurrent wrap-ups, clipboard portability, pair-write recovery, cleanup commands, and hook edge cases, read `references/operational-details.md`.

## Example

Input: session added JWT middleware, rejected server sessions because the deploy target is stateless, and left route wiring as the next task.

- Doc decision: `JWT over server sessions — because stateless deploy has no shared session store.`
- Prompt task: wire middleware into `src/routes/index.ts`.
- Success criteria: protected routes return 401 without token, 200 with a valid token, and `npm test` stays green.

See `references/full-example.md` for a complete paired output.

## References (load on demand)

- `references/full-example.md` — complete rich-doc + prompt example.
- `references/operational-details.md` — clipboard portability, stale-prompt cleanup, concurrent wrap-ups, pair-write recovery, cleanup commands, and extended failure handling.
- `references/auto-load-hook.md` — optional SessionStart hook that auto-injects the pending prompt after `/clear`; the hook does not read the rich doc.
