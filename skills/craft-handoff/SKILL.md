---
name: craft-handoff
description: Wrap up the current session and produce a copy-paste-ready continuation prompt for the next session. Gathers git state inline, distills decisions and blockers from the conversation, writes the prompt to ~/.craftkit/handoff/pending.md, and copies it to the clipboard. Use this when the user wants to end a session cleanly, asks for a "handoff prompt," says "wrap up," "session handoff," "next session으로 넘겨," "핸드오프 만들어," "세션 정리해" — or anytime before running /clear.
allowed-tools: Bash(git *) Bash(mkdir *) Bash(bash *) Bash(node *) Bash(cat *) Bash(test *) Bash(rm *) Read Write
---

# craft-handoff

## Purpose

End the current session cleanly by producing a **continuation prompt** the next session can paste in to resume work without losing context. The prompt is short, structural, and copy-paste-ready.

This is *not* a session-summary doc for humans. It is an LLM-targeted prompt designed to bootstrap the next agent session with exactly the context it needs — and nothing more.

## Use this when

- the user says "wrap up", "마무리", "세션 정리", "핸드오프", "다음 세션으로 넘겨"
- the user is about to run `/clear` and wants continuity
- a long session is ending and the next session should pick up cleanly
- a task is paused mid-flight and needs a clean resume point

Skip when the session was a quick Q&A with no state worth carrying.

## How it differs from related skills

- `/session-handoff` (sungjunlee-claude-config) — writes a verbose `docs/handoff/HANDOFF-*.md` into the project. Use that for multi-day continuity with team-readable docs.
- `craft-prompt` with `templates/session-handoff.md` — a *template* the user fills in manually. `craft-handoff` is the *operator*: it gathers state, drafts, and delivers automatically.
- `reflect` (jangpm-meta-skills) — focuses on docs/automation/learnings post-session. `craft-handoff` focuses on the next-session bootstrap prompt.

## Inputs

Auto-collected (via inline shell — runs before this skill body is read):

- Branch: !`git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "(not a git repo)"`
- Status: !`git status --short 2>/dev/null | head -40`
- Diffstat: !`git diff --stat 2>/dev/null | tail -20`
- Recent commits: !`git log --oneline -8 2>/dev/null`
- Worktree root: !`git rev-parse --show-toplevel 2>/dev/null || pwd`

Drawn from the conversation (you must extract these — the shell can't):

- **Done** — what was actually accomplished this session (not what was attempted)
- **Decisions** — non-obvious choices with their rationale ("chose X because Y"). Skip if none.
- **Blockers** — anything that stopped progress and needs resolution. Skip if none.
- **Next** — concrete next steps the new session should take

Optionally ask the user (one terse question, only if genuinely ambiguous): which next step to prioritize, or which kind of handoff (continuation / debug / fresh-start).

## Steps

### Step 1 — Gather

The inline shell blocks above already populated git state. Read it. Then scan the conversation for done / decisions / blockers / next. If a section has nothing real, omit it — empty headers add noise.

### Step 2 — Distill

For each section, write the *minimum* a future agent needs:

- **Done**: 2–5 bullets, outcomes not narration ("added auth middleware" not "we discussed and then implemented…")
- **State**: branch, ahead/behind, test status if known, blockers
- **Decisions**: only the non-obvious ones, each with its because-clause
- **Next**: 1–3 concrete tasks with success criteria

Use **worktree-relative paths** (`src/auth.ts:45`, not absolute paths). All paths are relative to the worktree root reported above.

### Step 3 — Compose

Use this XML template (Claude/GPT/Gemini all parse it). Skip blocks with no content.

```xml
<context>
## Project
{{project}} — {{one_liner}}

## Done
- {{done_1}}
- {{done_2}}

## State
- Branch: {{branch}} ({{ahead_behind}})
- Tests: {{status}}
- Blockers: {{blockers_or_none}}

## Decisions
- {{decision}} — because {{reason}}
</context>

<task>
{{next_steps}}

Success criteria:
- {{criterion_1}}
- {{criterion_2}}
</task>

<rules>
- All paths below are relative to the current worktree root
- Read {{key_files}} first
- {{test_or_verify_command}}
</rules>
```

**Size budget**: target ≤ 800 tokens. A bloated handoff defeats the purpose.

### Step 4 — Persist + copy

Run these in order. Replace `<<<PROMPT>>>` with the composed XML block.

```bash
mkdir -p ~/.craftkit/handoff
cat > ~/.craftkit/handoff/pending.md <<'HANDOFF_EOF'
<<<PROMPT>>>
HANDOFF_EOF
bash "${CLAUDE_SKILL_DIR}/scripts/copy-clipboard.sh" < ~/.craftkit/handoff/pending.md
```

The clipboard wrapper auto-detects the platform (`pbcopy` → `wl-copy` → `xclip` → `xsel` → `clip.exe`). If none are available it exits non-zero and prints to stderr — surface that to the user.

### Step 5 — Inform

Tell the user:

1. ✅ "Copied to clipboard. Saved to `~/.craftkit/handoff/pending.md`."
2. Show the prompt in a fenced code block so they can verify.
3. Next-step instructions (pick the right one):
   - **Manual flow** (default): "Run `/clear`, then paste."
   - **Auto-load flow** (if user has installed the SessionStart hook): "Run `/clear` — it will auto-load."

Add one line: *"To enable auto-load on `/clear`, see `references/auto-load-hook.md`."* — only if user hasn't already installed it.

## Output format

Always deliver in this order:

1. The composed prompt (fenced XML code block)
2. A 1-line confirmation: file path + clipboard status
3. The next-step instruction (one line)

Do not summarize what you put in the prompt — the user can read it. Do not add a "session retrospective" — that's a different skill.

## Cross-platform notes

| Platform | Clipboard tool | Notes |
|---|---|---|
| macOS | `pbcopy` | Bundled |
| Linux Wayland | `wl-copy` | `wl-clipboard` package |
| Linux X11 | `xclip` or `xsel` | Most distros, may need install |
| Windows / WSL | `clip.exe` | Bundled with Windows |

The wrapper script tries them in that order. If your system has none, the prompt is still saved to `~/.craftkit/handoff/pending.md` — you can `cat` it manually.

## Auto-load on /clear (optional)

`/clear` itself can't be invoked from a skill — built-in commands are not exposed to the Skill tool. But a `SessionStart` hook with `matcher: "clear"` *can* inject `additionalContext` into the post-clear session. That's the bridge.

See `references/auto-load-hook.md` for the one-time installation (settings.json snippet + a 15-line Node script).

## Failure modes

- **Empty handoff**: skill ran on a no-state session. Tell the user there's nothing to hand off and skip the file write.
- **Stale pending.md**: a previous handoff was never consumed. Overwrite without asking — the new state supersedes.
- **Auto-load injects when not wanted**: user ran `/clear` to truly reset, but pending.md was lurking. Mitigation in the hook script: it deletes pending.md after injection (one-shot). For manual cleanup: `rm ~/.craftkit/handoff/pending.md`.
- **Bloated prompt**: token budget blown. Cut decisions first, then state details, never the next-step block.

## Example

### Input situation

Session spent 90 minutes adding JWT auth middleware. Two files modified, one decision made (rejected sessions in favor of JWT for stateless deploy). Tests passing. Next step: wire the middleware into the route table.

### Output

```xml
<context>
## Project
acme-api — Node/Express REST backend

## Done
- Added JWT verification middleware at `src/middleware/auth.ts`
- Wired token issuance into `src/routes/login.ts:42`

## State
- Branch: feat/jwt-auth (3 ahead of main)
- Tests: passing (`npm test`)

## Decisions
- Chose JWT over server sessions — because deploy target is stateless (Cloud Run, no sticky)
</context>

<task>
Wire the auth middleware into the protected route group in `src/routes/index.ts`.
Add an integration test that hits `/api/me` with and without a valid token.

Success criteria:
- `/api/me` returns 401 without token, 200 with valid token
- `npm test` stays green
</task>

<rules>
- All paths are relative to the worktree root
- Read `src/middleware/auth.ts` first to confirm the export shape
- Run `npm test` before declaring done
</rules>
```

✅ Copied to clipboard. Saved to `~/.craftkit/handoff/pending.md`.
Run `/clear`, then paste.

## References (load on demand)

- `references/auto-load-hook.md` — Optional `SessionStart` hook that auto-injects `pending.md` after `/clear`, removing the manual paste step.
