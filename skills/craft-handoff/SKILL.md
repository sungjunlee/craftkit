---
name: craft-handoff
description: >-
  Produce paired session-handoff artifacts: a rich doc plus a resume prompt.
  Use when wrapping up, clearing context, pausing work, or the user says
  "마무리", "세션 정리", "핸드오프", "다음 세션으로 넘겨",
  or "next session으로 넘겨".
disable-model-invocation: true
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

`<skill-dir>` is the directory containing this SKILL.md — resolve it from where the skill was loaded (e.g. an installed skill directory such as `~/.claude/skills/craft-handoff`, or `skills/craft-handoff` in a source checkout).

Gather machine state with the bundled script:

```bash
node <skill-dir>/scripts/gather-state.mjs
```

Read its full output, especially `--- Handoff target ---`: `PENDING_PATH`, `DOC_PATH`, `ARCHIVE_DIR`, `WORKTREE_SLUG`, and ready-to-prepend frontmatter.

If the script is unavailable, gather the same git facts manually:

```bash
git rev-parse --show-toplevel
git rev-parse --abbrev-ref HEAD
git status --short | head -40
git diff --stat | tail -20
git log --oneline -8
```

If you must derive paths without the script, use the fallback target rules in `references/operational-details.md`.

Then extract from the conversation:

- **Done**: completed outcomes the next session needs.
- **Decisions**: non-obvious choices with a `because <reason>` rationale.
- **What didn't work**: attempted approaches and outcomes.
- **Blockers**: active blockers only.
- **Next**: 1-3 concrete next steps with observable success criteria.
- **Suggested skills/capabilities**: only when they would materially change the next session.

## Workflow

### 0. Confirm ambiguous side effects

This skill writes files and mutates the clipboard. If the trigger is ambiguous, ask one short confirmation before running it. Skip confirmation for explicit handoff requests.

### 1. Gather

Run the gather script or fallback commands, then scan the conversation for the sections above. Omit empty sections instead of padding the handoff.

### 2. Distill

The principle: include only what the next session cannot reconstruct from the diff alone. Every decision needs a `because <reason>`. Omit empty sections rather than padding. Put rationale, alternatives, and time order in the doc; put snapshot lines for orientation and execution in the prompt.

Keep failure context and abandoned approaches in the doc, not the prompt. Make next steps observable, not aspirational. Link only to artifacts the next session can actually reach.

### 3. Compose the rich doc

Write the doc first; it is the narrative source of truth. Include Project, Done, State, Decisions, What didn't work, and Next only when those sections have real content — see § Output format for the exact shape.

Rules:

- No `<task>` or `<rules>` in the doc.
- Fill narrative depth only where it helps the next session.
- Keep decisions reasoned. Add alternatives when they shaped the current state.
- Use `references/artifact-shapes.md` when you need the exact markdown skeleton.
- If craft-prompt templates are installed, use `skills/craft-prompt/templates/session-handoff.md` as the writing model.

### 4. Compose the resume prompt

The prompt must be usable even if the doc is unreachable, but it should command the next agent to read the doc first — see § Output format for the exact shape.

Add `## Suggested skills` inside `<context>` only when a specific skill or capability would change the next agent's behavior.

Use `references/artifact-shapes.md` when you need the exact XML skeleton.

### 5. Persist and copy

Use paths from the gather script verbatim.

1. Create the `docs`, `pending`, and `archive` directories under `~/.craftkit/handoff/`.
2. Archive existing `DOC_PATH`, then write the new rich doc.
3. Write the prompt with frontmatter to `PENDING_PATH`.
4. Copy the prompt body, without frontmatter, to the clipboard:

```bash
sed '1,/^---$/d;1,/^---$/d' "$PENDING_PATH" | bash <skill-dir>/scripts/copy-clipboard.sh
```

If clipboard copy fails, it's non-fatal (see § Guardrails) — continue.

### 6. Inform

Return the artifacts per § Output format.

## Output format

Two artifacts, always produced together:

- **Rich doc** — `DOC_PATH` (e.g. `~/.craftkit/handoff/docs/<worktree-slug>.md`). Shape: frontmatter plus a single `<context>...</context>` body.
- **Resume prompt** — `PENDING_PATH` (e.g. `~/.craftkit/handoff/pending/<timestamp>-<worktree-slug>.md`). Shape: `<context>` (Project, State, Done snapshot, Decisions, Background) / `<task>` (next action, success criteria) / `<rules>` (path, doc-read, key-file, verification).

The machine wiring — `gather-state.mjs`, the paired doc+prompt layout, archive-before-overwrite, cross-platform clipboard copy, and the optional auto-load hook — is unchanged and is the durable part of this skill. Only how the artifact's prose is shaped is in the model's judgment below.

**Chat return — must-convey.** Shape the chat return at your judgment, but it must convey:

- the **resume prompt** in a fenced block (so it can be copied directly);
- a **confirmation line** naming the prompt path, doc path, and clipboard status;
- a **next-step instruction**.

Orientation floor (non-negotiable): the resume prompt itself must convey the branch/state, a concrete next action with success criteria, and the instruction to read the rich doc first. These hold even when the doc is unreachable.

Optional, when relevant: an auto-load hook pointer, or a `/goal` candidate when the next task is durable, verifiable, and multi-turn. Do not paste the rich doc in chat when it was written successfully. See `references/artifact-shapes.md` for the exact skeletons.

## Guardrails

- redact secrets, tokens, customer data, and personal data from both artifacts
- archive the existing rich doc before overwriting it — never destroy the previous handoff
- clipboard copy failure is non-fatal: report it and continue; the written files are the deliverable
- never invent test status or verification results — report only what was actually run
- the doc and prompt are a unit — never produce one without the other
- use worktree-relative paths in both artifacts

## Failure modes

- **Empty handoff**: no meaningful state exists; write nothing.
- **Outside a git repo**: omit repo state and rely on conversation-derived context.
- **Multiple unrelated threads**: ask which thread to carry forward, or choose the most recent and say so in the doc.
- **Prompt/doc divergence**: regenerate the prompt if the doc changes after prompt composition.
- **Doc unreachable on resume**: the prompt snapshot must still be usable, and the next agent should flag the missing doc.
- **Partial write**: if doc write succeeds but prompt write fails, recover by writing only the prompt.

For exact artifact skeletons, read `references/artifact-shapes.md`. For stale prompts, concurrent wrap-ups, clipboard portability, pair-write recovery, cleanup commands, and hook edge cases, read `references/operational-details.md`.

## Example

Input: session added JWT middleware, rejected server sessions because the deploy target is stateless, and left route wiring as the next task.

- Doc decision: `JWT over server sessions — because stateless deploy has no shared session store.`
- Prompt task: wire middleware into `src/routes/index.ts`.
- Success criteria: protected routes return 401 without token, 200 with a valid token, and `npm test` stays green.

See `references/full-example.md` for a complete paired output.

## References (load on demand)

- `references/full-example.md` — complete rich-doc + prompt example.
- `references/artifact-shapes.md` — exact rich-doc and resume-prompt skeletons.
- `references/operational-details.md` — clipboard portability, stale-prompt cleanup, concurrent wrap-ups, pair-write recovery, cleanup commands, and extended failure handling.
- `references/auto-load-hook.md` — optional SessionStart hook that auto-injects the pending prompt after `/clear`; the hook does not read the rich doc.
