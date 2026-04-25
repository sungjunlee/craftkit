---
name: craft-handoff
description: >-
  Produce two paired session-handoff artifacts that the next session uses
  together — a rich narrative doc on disk and a craft-prompt-grade prompt
  that commands the next agent to read the doc first. Use proactively
  whenever a session is wrapping up. Triggers: "wrap up", "마무리",
  "세션 정리", "핸드오프", "다음 세션으로 넘겨", "next session으로 넘겨",
  or before /clear.
---

# craft-handoff

## Purpose

End the current session cleanly by producing **two paired artifacts the next session is intended to use together**:

1. **A rich handoff doc** at `~/.craftkit/handoff/docs/<worktree-slug>.md` — narrative-first, depth scales with what actually happened in the session. The durable record of how this session got here: decision rationale in long form, what didn't work, abandoned approaches, time-ordered progress, related external context. Per-project, overwritten on the next handoff for the same project (previous version archived).
2. **A craft-prompt-grade prompt** at `~/.craftkit/handoff/pending/<timestamp>-<worktree-slug>.md` (mirrored to clipboard) — structurally complete (context / task / rules / success criteria), and **explicitly commands the next agent to read the handoff doc first** to fully restore prior context before acting. Per-session, never overwritten.

The prompt is what gets pasted (or auto-loaded by the SessionStart hook). The doc is what the prompt instructs the agent to read. Both are part of the intended workflow — the prompt is *not* a "fallback if the doc is missing"; it is the entry artifact that orchestrates the resume, and the doc is its required reading. Modern Claude / GPT context windows handle this pair comfortably; the depth wins back the turns saved by not having the next agent ask "why did we do X?"

This pairs the patterns that mature AI session-handoff designs converge on (Cline memory-bank, BMad story-files, claude-code-context-handoff): a structured entry artifact + a deeper durable doc.

This is *not* a session-summary doc for humans, and *not* a single compact prompt. The pair is the unit of handoff.

## Use this when

- the user says "wrap up", "마무리", "세션 정리", "핸드오프", "다음 세션으로 넘겨", or "next session으로 넘겨"
- the user is about to run `/clear` and wants continuity
- a long session is ending and the next session should pick up cleanly
- a task is paused mid-flight and needs a clean resume point

For a multi-day project you intend to commit to git, prefer `/session-handoff` (writes `docs/handoff/HANDOFF-*.md` for human + agent). For same-week clear-and-resume that should not pollute the repo, use this skill.

Skip when the session was a quick Q&A with no state worth carrying.

## How it differs from related skills

- `/session-handoff` (sungjunlee-claude-config) — writes a verbose `docs/handoff/HANDOFF-*.md` into the project. Use that for multi-day continuity with team-readable docs.
- `craft-prompt` — the composition engine for both artifacts. `craft-handoff` gathers session state, applies the snapshot/narrative split (§Step 2), then uses craft-prompt's process for both: the **rich doc** body via `craft-prompt/templates/session-handoff.md`, and the **prompt** via craft-prompt's full Step 1–4 process (the prompt is craft-prompt grade by construction). Use craft-prompt directly when you want to author a prompt without session-state gathering.
- `reflect` (jangpm-meta-skills) — focuses on docs/automation/learnings post-session. `craft-handoff` focuses on the next-session bootstrap pair (prompt + doc).

## Inputs

Auto-collected via the gather script. Run it from anywhere inside the worktree using the agent's shell:

```bash
node <skill-dir>/scripts/gather-state.mjs
```

`<skill-dir>` is wherever this skill is installed (your runtime knows the path). The script prints worktree root, branch, short status, diffstat, recent commits, plus a **`--- Handoff target ---`** block with `PENDING_PATH` (per-session prompt path), `DOC_PATH` (rich doc path for this project), `ARCHIVE_DIR`, `WORKTREE_SLUG`, and a ready-to-prepend frontmatter block. Read all of it before composing.

If Node isn't available, fall back to the equivalent commands. Compute the slug yourself: `basename + "-" + first-6-chars-of-sha1(absolute-worktree-path)`.

```bash
git rev-parse --show-toplevel
git rev-parse --abbrev-ref HEAD
git status --short | head -40
git diff --stat | tail -20
git log --oneline -8
```

Drawn from the conversation (you must extract these — no script can):

- **Done** — what was actually accomplished this session (not what was attempted)
- **Decisions** — non-obvious choices with their rationale ("chose X because Y"). Skip if none.
- **What didn't work** — approaches tried that did not pan out, with one-line outcomes. Empirically the highest-value section; do not skip if any approach failed.
- **Blockers** — anything that actively blocks Next. Skip if none.
- **Next** — concrete next steps the new session should take, each with at least one observable success criterion

Optionally ask the user (one terse question, only if genuinely ambiguous): which next step to prioritize.

## Steps

### Step 0 — Confirm intent before side effects

This skill mutates the clipboard and writes two files. Both are visible side effects. If the trigger was ambiguous (e.g. the user said "let's wrap up this thread" while still mid-task, not "wrap up the session"), ask a one-line confirmation first: *"Generate a session-handoff prompt and copy it to the clipboard?"*

Skip the confirmation when the user explicitly invoked `/craft-handoff` or used a clear trigger phrase. The cost of one extra question is much lower than overwriting the user's clipboard during normal work.

### Step 1 — Gather

Run `node <skill-dir>/scripts/gather-state.mjs` (or the fallback commands in §Inputs). Read its output. Then scan the conversation for done / decisions / what didn't work / blockers / next. If a section has nothing real, omit it — empty headers add noise.

### Step 2 — Distill

Apply a **semantic inclusion test** to each candidate item before writing it down. Bullet counts are a side effect of the tests, not a target.

**Where each item lands.** Both artifacts are structured. The *same* item often appears in both at different depth — that's by design, not duplication:

- **Snapshot form → prompt**: one line, no time order, no alternatives. "Decided JWT over server sessions (stateless deploy)."
- **Narrative form → doc**: full rationale, time order, alternatives considered, what didn't work. "Tried `express-session` first → rejected when its Redis dependency surfaced (deploy target is stateless Cloud Run). Switched to JWT. Considered HS256 vs RS256; chose HS256 because alpha-only and no key-rotation requirement yet — revisit if compliance changes."

Inclusion tests (apply both for prompt-form and doc-form):

- **Done**: include if it changed code/state and the next session needs to know. Outcome over narration. *Prompt form* names the artifact ("middleware at `src/middleware/auth.ts`"). *Doc form* may add why-this-shape.
- **State**: branch, ahead/behind, test status. Always factual. Same in both, but doc may add "and here's the path that got us into 3-ahead."
- **Decisions**: include only if a future agent reading the diff alone could not reconstruct the choice. Drop any without a `because <reason>` clause. *Prompt form* = one-liner with the because-clause. *Doc form* = paragraph with rationale, alternatives, and the trigger that would force a re-decision.
- **What didn't work** (doc only — keep out of the prompt): every approach tried that did not pan out. "Tried X → Y because Z." Empirically the highest-value section in real handoffs; do not skip if any approach failed. If nothing failed, omit the heading.
- **Blockers**: include only if it actively blocks Next. An "open question I want to revisit" is not a blocker — move it into Next or drop. Same in both artifacts.
- **Next**: 1–3 concrete tasks, each with at least one **observable** success criterion. *Prompt form* is the action statement + criteria — this is what the next agent operates on. *Doc form* may add "and here's what we considered doing instead."

Use **worktree-relative paths** (`src/auth.ts:45`, not absolute paths) in both artifacts. All paths are relative to the worktree root reported above.

### Step 3 — Compose two artifacts

You are producing **two artifacts the next session uses together**. Compose the doc first (it is the source of truth) then the prompt (which references it and orchestrates the resume).

#### 3a. Rich handoff doc — `DOC_PATH` from gather-state (`~/.craftkit/handoff/docs/<slug>.md`)

The durable narrative. Depth scales with what actually happened in the session — short for a quick task, long for a multi-day investigation. There is no hard cap and no minimum; every line earns its place via the §Step 2 inclusion tests, no padding.

**Prerequisite**: craft-prompt must be co-installed (ships together in craftkit). If standalone, see the fallback in `## Failure modes`.

1. Read `craft-prompt/templates/session-handoff.md` and pick the variant:
   - **Continuation** — normal wrap-up (most common)
   - **Debug Handoff** — mid-investigation session
2. Fill it with the **narrative form** of the §Step 2 output (paragraph rationale, time order, alternatives, what didn't work). Omit blocks with no content. Prepend the frontmatter from gather-state to the doc as well — same shape as the prompt's, with `worktree`, `branch`, `created`, plus an extra `next:` field summarizing the very next task in ≤120 chars.

**Required signals** (enforce after fill):

- Every `## Decisions` item carries a `because <reason>` (or `— <reason>`) clause **and** at least one sentence of context (when the alternatives are non-trivial). Drop lines that have neither.
- `## What didn't work` (if present) names approach + outcome on each line. Detail freely — this section earns its weight in the next session.
- All paths are worktree-relative — strip `/Users/…`, `/home/…`, `C:\…` before writing.
- Verify any test command matches the project's actual stack. If unsure, omit rather than guess.

#### 3b. Prompt — `PENDING_PATH` from gather-state (`~/.craftkit/handoff/pending/<ts>-<slug>.md`) + clipboard

This is the entry artifact: craft-prompt grade, structurally complete. The next agent paste-and-runs this. It carries the **snapshot form** of state and decisions plus an explicit `<rules>` line commanding the agent to read the handoff doc first (with a fallback for when the doc is unreachable).

Compose using craft-prompt's full process — Step 1 (Understand: target is Claude Code or generic XML-parsing agent), Step 3 (building blocks: include Project + State + Done snapshot + Decisions one-liners + Background pointer + Task with criteria + Rules), Step 4 (Sharpen: cut fluff, specific over generic).

Fill this shape (adjust the section bullets to your distilled content; keep the structure):

```xml
<context>
## Project
<name> — <one-liner about the codebase>

## State
- Branch: <branch> (<N> ahead of <base>)
- Tests: <status>
- Blockers: <blockers, or "none">

## Done (snapshot)
- <outcome 1>
- <outcome 2>
- <outcome 3>

## Decisions (one-liners; full rationale in handoff doc)
- <decision> — because <one-line reason>
- <decision> — because <one-line reason>

## Background
Full session narrative, decision rationale in long form, and abandoned approaches at `~/.craftkit/handoff/docs/<slug>.md`. Read it first to fully restore prior context before acting.
</context>

<task>
<concrete next task — what to do, not what to be>

Success criteria:
- <observable outcome 1>
- <observable outcome 2>
</task>

<rules>
- All paths are worktree-relative
- Read `~/.craftkit/handoff/docs/<slug>.md` first if reachable — it has the prior context this session needs; if missing or inconsistent with this snapshot, proceed with the snapshot and surface the discrepancy
- Read `<key-source-file>` first to confirm <whatever the file establishes>
- Run `<test-command>` before declaring done
</rules>
```

**Required signals** (enforce after fill):

- The `<rules>` block contains the conditional read-doc line referencing the doc path with the explicit fallback (`if reachable; ... proceed with the snapshot and surface the discrepancy`). This is the orchestration link, not optional.
- Every `## Decisions` one-liner is one sentence with a `because` clause; if you have more than ~5 worth carrying as snapshots, the rest live only in the doc.
- Every `## Done` bullet is one line; outcomes only.
- `<task>` has a `Success criteria:` (or `성공 기준:`) list with at least one **observable** item.
- All paths are worktree-relative.
- The prompt is as long as the structure makes it — do not pad to a target, do not trim past structural completeness. If the prompt feels thin, the session probably was; that's fine.

If the rich doc was not produced (e.g. empty handoff), do not write the prompt either — fail loudly per §Failure modes.

### Step 4 — Persist + copy

The slug `<slug>` and paths come from gather-state's `--- Handoff target ---` block. Use them verbatim.

#### 4a. Rich doc

1. Create directories: `mkdir -p ~/.craftkit/handoff/docs ~/.craftkit/handoff/archive`.
2. **If a previous doc exists** at `DOC_PATH`, archive it first by moving to `~/.craftkit/handoff/archive/<ISO-timestamp>-doc-<slug>.md`. Past docs stay recoverable in archive; the live `DOC_PATH` always reflects the latest session.
3. Write `<frontmatter>\n\n<doc body>` to `DOC_PATH` via the agent's file-write tool.

#### 4b. Prompt

The per-session, timestamped layout means each run writes its own file — nothing is overwritten, two parallel sessions don't collide, and the SessionStart hook picks the prompt that matches the current worktree.

1. Create the parent directory if missing: `mkdir -p ~/.craftkit/handoff/pending`.
2. Use the agent's file-write tool to write `<frontmatter>\n\n<composed XML>` to `PENDING_PATH`. Writing through the file tool avoids heredoc-EOF collisions when the prompt body contains shell metacharacters.
3. Copy the composed XML (without the frontmatter) to the clipboard. The `sed` strip is required — on the manual-paste path the receiving LLM would otherwise see the `worktree:` / `branch:` / `created:` lines as part of the prompt context:

```bash
sed '1,/^---$/d;1,/^---$/d' "$PENDING_PATH" | bash <skill-dir>/scripts/copy-clipboard.sh
```

The auto-load hook path doesn't need this — the hook strips the frontmatter before injection. The `sed` form just keeps both paths consistent.

The wrapper auto-detects the platform (`pbcopy` → `wl-copy` → `xclip` → `xsel` → `clip.exe`). If none are available it exits non-zero and prints to stderr — surface that to the user. Both file writes still succeeded; the user can `cat` them manually.

### Step 5 — Inform

Show the **prompt** before the confirmation — that's what the user pastes, so it's what they need to verify. The rich doc is on disk for inspection separately (and the prompt commands the next agent to read it). You can't detect from inside the skill whether the optional SessionStart hook is installed, so always give the manual `/clear`-and-paste instruction and append the auto-load pointer.

Deliver, in this order:

1. The prompt in a fenced code block so the user can verify it.
2. `Prompt copied to clipboard. Saved to <PENDING_PATH>. Rich doc at <DOC_PATH> — the prompt instructs the next agent to read it first.` (use the actual paths).
3. "Run `/clear`, then paste."
4. *"On Claude Code, you can skip the paste step by installing the SessionStart hook — see `references/auto-load-hook.md`."*

## Output format

Always deliver in this order:

1. The **prompt** (fenced XML code block) — what the user pastes.
2. A 1-line confirmation: prompt path, doc path, clipboard status.
3. The next-step instruction (one line).

Do not paste the rich doc into the chat — it lives on disk by design. Do not summarize what you put in the doc separately — the user can `cat` it. Do not add a "session retrospective" — that's a different skill.

## Cross-platform notes

| Platform | Clipboard tool | Notes |
|---|---|---|
| macOS | `pbcopy` | Bundled |
| Linux Wayland | `wl-copy` | `wl-clipboard` package |
| Linux X11 | `xclip` or `xsel` | Most distros, may need install |
| Windows / WSL | `clip.exe` | Bundled with Windows |

The wrapper script tries them in that order. If your system has none, the prompt is still saved to the `PENDING_PATH` and the doc to the `DOC_PATH` gather-state reported in Step 1 — you can `cat` them manually.

## Auto-load on `/clear` (Claude Code only, optional)

This is a Claude-Code-specific convenience — skip on Codex or other agents (the clipboard step above is the cross-agent path).

`/clear` itself can't be invoked from a skill — built-in commands are not exposed to the Skill tool. But a `SessionStart` hook with `matcher: "clear"` *can* inject `additionalContext` into the post-clear session. That's the bridge.

The hook scans `~/.craftkit/handoff/pending/`, picks the newest entry whose `worktree:` matches the current cwd's git toplevel, returns it as `additionalContext`, and archives the consumed file. The rich doc at `~/.craftkit/handoff/docs/<slug>.md` is **not** touched by the hook — it stays put for the next agent to read on the prompt's `<rules>` instruction.

See `references/auto-load-hook.md` for the one-time installation (settings.json snippet + a Node script).

## Failure modes

- **Empty handoff**: skill ran on a no-state session. Tell the user there's nothing to hand off and skip both file writes.
- **Outside a git repo**: `gather-state.mjs` reports `(not a git repo)` for branch and `(clean)` for status. Drop the State block from both artifacts and lean on the conversation-derived sections.
- **Multi-subtask session**: the conversation covered several unrelated threads. Don't merge them — ask the user which thread to carry forward, or pick the most recently active one and say so explicitly in the doc's Project section.
- **Prompt / doc divergence**: user (or you) edits the rich doc by hand after the prompt was already pasted into the next session. The next session reads the doc on the prompt's instruction, so it picks up the latest doc — but its `## Decisions (one-liners)` snapshot in the prompt still shows the old summary. For substantive doc edits, regenerate the prompt as well. Mitigation: prefer to amend the doc *and* the prompt's snapshot together, or re-run craft-handoff if the session is still active.
- **Stale pending handoffs**: each run writes a new timestamped file under `~/.craftkit/handoff/pending/`, so nothing is overwritten. The auto-load hook archives entries older than 72h (configurable via `CRAFTKIT_HANDOFF_TTL_HOURS`; set to `0` to disable) as `stale-*` without injection, and moves older same-worktree entries aside as `superseded-*` when a newer one is injected. See `references/auto-load-hook.md`. The doc is **not** TTL'd — it stays at `DOC_PATH` until the next handoff for the same project overwrites it (with archive-on-overwrite per §Step 4a).
- **Concurrent wrap-ups in the same worktree**: rare but possible (two Claude Code windows, same repo). Each run writes its own timestamped prompt file; the hook picks the newest match and supersedes the rest. Both runs also write to the same `DOC_PATH` — the second one archives the first. If you want both narratives recovered, grab the older from `~/.craftkit/handoff/archive/`.
- **Under-loaded prompt**: the prompt skips so much state that the next agent can't tell what was accomplished without reading the doc — defeats the snapshot-as-immediate-orientation purpose. Pull more snapshot content (Done outcomes, key Decisions one-liners, current State) up into the prompt so it stands on its own even when the doc-read fails or is skipped.
- **Bloated prompt**: the prompt has paragraphs where one-liners belong, or repeats the doc's narrative. Decisions in the prompt are one-sentence one-liners with a because-clause; long-form rationale belongs in the doc. Done in the prompt is outcome-bullets; the path that got there belongs in the doc.
- **Bloated rich doc**: the doc narrates every conversational turn rather than capturing decisions and outcomes that resulted. Apply §Step 2's inclusion tests harder.
- **Doc unreachable on resume**: the next agent tries to read `~/.craftkit/handoff/docs/<slug>.md` and gets ENOENT (archived during cleanup, deleted manually, slug mismatch from a moved worktree). The conditional read-doc rule in §Step 3b's `<rules>` template handles this — the snapshot in the prompt remains usable on its own, and the agent flags the missing doc to the user rather than failing silently.
- **Auto-load injects when not wanted** (Claude Code only): user ran `/clear` to truly reset, but a pending handoff for the same worktree was lurking. The hook archives after injection (one-shot) and skips injection for handoffs older than 72h. Manual cleanup: `rm -rf ~/.craftkit/handoff/pending/`. Past handoffs live in `~/.craftkit/handoff/archive/`.
- **Double injection after crash** (Claude Code only): the hook writes `additionalContext` to stdout *before* archiving the consumed file. If the process is killed between the write and the archive, the next `/clear` re-injects the same handoff. Recovery: `rm ~/.craftkit/handoff/pending/<file>` by hand, or wait for the 72h TTL to kick in.
- **Malformed `settings.json` after manual hook install** (Claude Code only): the hook silently fails to fire. Validate the JSON (`node -e "JSON.parse(require('fs').readFileSync(process.env.HOME+'/.claude/settings.json','utf-8'))"`) and check `~/.claude/logs/` if available.
- **craft-prompt not installed**: Step 3a delegates the doc body to craft-prompt's template, and Step 3b uses craft-prompt's process to compose the prompt. If craft-prompt is absent (craft-handoff copied standalone), compose both directly using the §Step 2 inclusion tests + the shapes shown in the Example below. Tell the user to install craft-prompt — the two ship together in craftkit.

## Maintenance

The pair (prompt at `pending/<ts>-<slug>.md` + doc at `docs/<slug>.md`) is the unit of handoff. The hook archives prompts on consume; the doc accumulates per project until overwritten or pruned.

- **Remove one project's handoff completely**: use the slug from `gather-state.mjs`, then `rm ~/.craftkit/handoff/docs/<slug>.md && find ~/.craftkit/handoff/pending -name "*-<slug>.md" -delete`.
- **Inspect before purging stale rich docs**: `find ~/.craftkit/handoff/docs -maxdepth 1 -mtime +30 -print`. Delete with `-delete` once you've confirmed.
- **Find a doc by project name**: `ls ~/.craftkit/handoff/docs/ | grep <project-name>`. The `<sha>` suffix disambiguates worktree-clones of the same repo.

## Example

### Input situation

Session spent 90 minutes adding JWT auth middleware. Two files modified. One primary decision (rejected sessions in favor of JWT for stateless deploy) plus two sub-decisions (HS256 over RS256, 15min TTL no refresh). One approach attempted and abandoned (express-session — pulled Redis dependency). One config experiment reverted (secret-in-JSON). Tests passing. Next step: wire the middleware into the route table.

### Output — rich doc at `~/.craftkit/handoff/docs/acme-api-7c3a92.md`

```markdown
---
worktree: /Users/dev/work/acme-api
branch: feat/jwt-auth
created: 2026-04-25T00:14:08.000Z
next: Wire auth middleware into the protected route group in src/routes/index.ts
---

<context>
## Project
acme-api — Node/Express REST backend. Internal-only API in alpha; deploy target is stateless Cloud Run (no sticky sessions, no shared cache yet).

## Done (with path)
- Added JWT verification middleware at `src/middleware/auth.ts`. Exports `authMiddleware` (request handler) and `signToken(payload)` helper. Reads `JWT_SECRET` from env at boot; throws on missing.
- Wired token issuance into `src/routes/login.ts:42`. POST `/api/login` returns `{ token, expiresAt }` on credential success.
- Added `jsonwebtoken@9.0.2` to dependencies; lockfile updated.

## State
- Branch: `feat/jwt-auth` (3 ahead of `main`)
- Tests: passing (`npm test`, all 47 specs)
- Blockers: none

## Decisions (long form)
- **JWT over server sessions.** Deploy target is stateless Cloud Run — no sticky load balancing and no shared session store budgeted for alpha. JWT removes the server-state requirement entirely. Trigger to revisit: if Cloud Run is replaced with a sticky-capable target, or if token revocation requirements emerge that exceed what short TTLs can absorb.
- **HS256 over RS256.** Single-issuer single-verifier topology, no public client signing. Key rotation isn't a near-term requirement, and HS256 with a single env-var secret is the lowest-ceremony option that matches the threat model. Revisit if compliance asks for asymmetric keys or if multiple services need to verify independently.
- **15-minute TTL, no refresh tokens.** Login flow is internal-only in alpha — re-login friction is acceptable. Refresh-token machinery would be net-new surface for ~zero current value. Revisit when external clients arrive or when 15min interrupts a real workflow.

## What didn't work
- **Tried `express-session` first.** Looked promising (familiar API, well-trodden path) but pulling its `connect-redis` adapter surfaced a Redis dependency that doesn't fit the stateless deploy. Discarded after ~20 minutes; switched to JWT.
- **Tried embedding the secret in `config/auth.json`.** Worked locally, reverted before commit when `docs/security.md:12` was re-read — secrets must come from env. Caught by the team's existing convention; no new policy needed.

## Open notes (not blockers, parked)
- Token introspection endpoint deferred — only useful once external clients exist.
- Considered logging signed JWTs to a separate auth-audit channel; deferred until we have the audit infrastructure.
</context>

<task>
Wire the auth middleware into the protected route group in `src/routes/index.ts`.
Add an integration test that hits `/api/me` with and without a valid token.

Success criteria:
- `/api/me` returns 401 without token, 200 with valid token
- `npm test` stays green (47 → 49 specs after adding the new integration test)
- No new dependencies added — auth is complete and self-contained
</task>

<rules>
- All paths are relative to the worktree root
- Read `src/middleware/auth.ts` first to confirm the export shape (`authMiddleware`, `signToken`)
- Run `npm test` before declaring done
- Do not introduce a refresh-token endpoint or a session store; those decisions were made and recorded above
</rules>
```

### Output — prompt at `~/.craftkit/handoff/pending/2026-04-25T00-14-09-000Z-acme-api-7c3a92.md` (also clipboard, frontmatter-stripped)

```xml
<context>
## Project
acme-api — Node/Express REST backend (internal alpha, stateless Cloud Run target).

## State
- Branch: feat/jwt-auth (3 ahead of main)
- Tests: passing (`npm test`, 47 specs)
- Blockers: none

## Done (snapshot)
- JWT verification middleware: `src/middleware/auth.ts` (exports `authMiddleware`, `signToken`)
- Token issuance wired: `src/routes/login.ts:42` — POST `/api/login` returns `{ token, expiresAt }`
- Dependency: `jsonwebtoken@9.0.2` added

## Decisions (one-liners; long-form rationale + rejected alternatives in handoff doc)
- JWT over server sessions — because stateless Cloud Run target
- HS256 over RS256 — because single-issuer/single-verifier and no rotation requirement yet
- 15-min TTL, no refresh — because internal-only alpha

## Background
Full session narrative, decision rationale in long form, abandoned approaches (`express-session`, secret-in-JSON), and parked notes are at `~/.craftkit/handoff/docs/acme-api-7c3a92.md`. Read it first before acting — it captures *why* the current shape is what it is.
</context>

<task>
Wire the JWT auth middleware into the protected route group in `src/routes/index.ts`. Add an integration test that hits `/api/me` with and without a valid token.

Success criteria:
- `/api/me` returns 401 without token, 200 with valid token
- `npm test` stays green (47 → 49 specs after the new test)
- No new dependencies added
</task>

<rules>
- All paths are worktree-relative
- Read `~/.craftkit/handoff/docs/acme-api-7c3a92.md` first if reachable — it has the prior context (rationale, rejected alternatives, parked notes); if missing or inconsistent with this snapshot, proceed and flag it
- Read `src/middleware/auth.ts` first to confirm export shape (`authMiddleware`, `signToken`)
- Run `npm test` before declaring done
- Do not add refresh-token machinery or a session store — those decisions are already recorded; revisit only if the handoff doc says to
</rules>
```

Prompt copied to clipboard. Saved to `~/.craftkit/handoff/pending/2026-04-25T00-14-09-000Z-acme-api-7c3a92.md`. Rich doc at `~/.craftkit/handoff/docs/acme-api-7c3a92.md` — the prompt instructs the next agent to read it first.
Run `/clear`, then paste.

## References (load on demand)

- `references/auto-load-hook.md` — Optional `SessionStart` hook that auto-injects the prompt for the current worktree after `/clear`, removing the manual paste step. The doc is read by the next agent on the prompt's instruction, not injected by the hook.
