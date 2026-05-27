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

End the current session cleanly by producing **two paired artifacts the next session is intended to use together**:

1. **A rich handoff doc** at `~/.craftkit/handoff/docs/<worktree-slug>.md` — narrative-first, depth scales with what actually happened in the session. The durable record of how this session got here: decision rationale in long form, what didn't work, abandoned approaches, time-ordered progress, related external context. Per-project, overwritten on the next handoff for the same project (previous version archived).
2. **A craft-prompt-grade prompt** at `~/.craftkit/handoff/pending/<timestamp>-<worktree-slug>.md` (mirrored to clipboard) — structurally complete (context / task / rules / success criteria), and **explicitly commands the next agent to read the handoff doc first** to fully restore prior context before acting. Per-session, never overwritten.

The prompt is the entry artifact. It orients the next agent, names the next task, and tells the agent to read the doc for full context. The doc is the durable narrative. The pair is the unit of handoff.

## Use this when

- the user says "wrap up", "마무리", "세션 정리", "핸드오프", "다음 세션으로 넘겨", or "next session으로 넘겨"
- the user is about to clear or reset context and wants continuity (for Claude Code, `/clear`)
- a long session is ending and the next session should pick up cleanly
- a task is paused mid-flight and needs a clean resume point

For a multi-day project you intend to commit to git, prefer `/session-handoff` (writes `docs/handoff/HANDOFF-*.md` for human + agent). For same-week clear-and-resume that should not pollute the repo, use this skill.

Skip when the session was a quick Q&A with no state worth carrying.

## Related skills

- `/session-handoff` writes repo-local human/team handoff docs. Use that for multi-day continuity you intend to commit.
- `craft-prompt` supplies the prompt/template discipline. Use it directly when you want prompt authoring without session-state gathering.

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

**Portable fallback.** If scripts are unavailable, gather state with the commands above. If file writing is unavailable, produce the same two-artifact content shape in chat. If only clipboard access is unavailable, keep the normal file-write path and report that clipboard copy was skipped. Missing hook support alone is not a fallback trigger; hooks are optional and Claude-Code-specific.

Drawn from the conversation (you must extract these — no script can):

- **Done** — what was actually accomplished this session (not what was attempted)
- **Decisions** — non-obvious choices with their rationale ("chose X because Y"). Skip if none.
- **What didn't work** — approaches tried that did not pan out, with one-line outcomes. Empirically the highest-value section; do not skip if any approach failed.
- **Blockers** — anything that actively blocks Next. Skip if none.
- **Next** — concrete next steps the new session should take, each with at least one observable success criterion
- **Suggested skills/capabilities** — only when a specific next-step skill would materially improve the resume. Include why, not just the name.

If the user passed a focus for the next session, treat it as the intended resume target and tailor `Next`, `next:`, and suggested skills around it. Optionally ask the user (one terse question, only if genuinely ambiguous): which next step to prioritize.

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
- **Existing artifacts**: avoid duplicating material already captured in PRDs, plans, ADRs, issues, commits, diffs, or review docs. Reference them only when the next session can actually reach them. For same-worktree resume, files present in that worktree are usually reachable. For fresh/different worktree resume, prefer committed paths, GitHub URLs, issue URLs, and durable external docs. Untracked worktree-local docs are **not** safe cross-worktree references; either summarize the needed facts in the handoff, advise committing/attaching the artifact before relying on it, or mark it explicitly as "untracked local, not available in a fresh worktree."
- **Sensitive data**: redact API keys, passwords, tokens, private URLs, personal data, and customer data. Record the existence, location, or handling status without copying the secret value.
- **Suggested skills/capabilities**: include only when actionable ("Use `craft-critique` to review the updated skill before editing" beats "craft-critique"). Keep provider-specific tool names out unless the target agent requires them.

Use **worktree-relative paths** (`src/auth.ts:45`, not absolute paths) in both artifacts. All paths are relative to the worktree root reported above.

### Step 3 — Compose two artifacts

You are producing **two artifacts the next session uses together**. Compose the doc first (it is the source of truth) then the prompt (which references it and orchestrates the resume).

#### 3a. Rich handoff doc — `DOC_PATH` from gather-state (`~/.craftkit/handoff/docs/<slug>.md`)

The durable narrative. Depth scales with what actually happened in the session — short for a quick task, long for a multi-day investigation. There is no hard cap and no minimum; every line earns its place via the §Step 2 inclusion tests, no padding.

**Prerequisite**: craft-prompt must be co-installed (ships together in craftkit). If standalone, see the fallback in `## Failure modes`.

1. Read `craft-prompt/templates/session-handoff.md` and pick the variant:
   - **Continuation** — normal wrap-up (most common)
   - **Debug Handoff** — mid-investigation session
2. **Fill only the `<context>` block** of the template with the **narrative form** of the §Step 2 output (paragraph rationale, time order, alternatives, what didn't work). **Drop the `<task>` and `<rules>` blocks entirely from the doc** — those belong to the prompt (§Step 3b). The doc's role is durable narrative; orchestration (next task + rules) is the prompt's job. Two `<task>` blocks would create a "which is operative" ambiguity for the next agent.
3. Prepend a YAML frontmatter to the doc. Take the `Frontmatter` block from gather-state's output (`worktree` / `branch` / `created` lines), and **insert one extra line** `next: <one-liner action-first summary, ≤120 chars>` after `created:`, before the closing `---`. The doc's frontmatter has 4 fields (worktree, branch, created, next); the prompt's has 3 (no next).

**Required signals** (enforce after fill):

- Every `## Decisions` item carries a `because <reason>` (or `— <reason>`) clause; drop lines without one. When the alternatives are non-trivial, add at least one sentence of context — strongly preferred but not blocking.
- `## What didn't work` (if present) names approach + outcome on each line. Detail freely — this section earns its weight in the next session.
- The doc body is wrapped in `<context>...</context>` only (no `<task>` or `<rules>`).
- All paths are worktree-relative — strip `/Users/…`, `/home/…`, `C:\…` before writing.
- Verify any test command matches the project's actual stack. If unsure, omit rather than guess.

#### 3b. Prompt — `PENDING_PATH` from gather-state (`~/.craftkit/handoff/pending/<ts>-<slug>.md`) + clipboard

This is the entry artifact: craft-prompt grade, structurally complete. The next agent paste-and-runs this. It carries the **snapshot form** of state and decisions plus an explicit `<rules>` line commanding the agent to read the handoff doc first (with a fallback for when the doc is unreachable).

Compose with craft-prompt discipline: understand the target agent, include only the needed building blocks, then sharpen for specificity.

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

{{optional_suggested_skills_block}}
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

Fill `{{optional_suggested_skills_block}}` only when a specific skill or capability would materially change the next agent's behavior:

```markdown
## Suggested skills
- <skill/capability> — because <why it helps the next task>
```

Otherwise remove the placeholder entirely.

**Required signals** (enforce after fill):

- The `<rules>` block contains a conditional read-doc line that (a) references the doc path, (b) makes the read conditional on reachability, and (c) tells the agent what to do if the doc is missing or inconsistent with the snapshot. Wording flexibility allowed; the three components are required. This is the orchestration link, not optional.
- Every `## Decisions` one-liner is one sentence with a `because` clause; if you have more than ~5 worth carrying as snapshots, the rest live only in the doc.
- Every `## Done` bullet is one line; outcomes only.
- `<task>` has a `Success criteria:` (or `성공 기준:`) list with at least one **observable** item.
- All paths are worktree-relative.
- References to existing artifacts are reachable from the intended receiving session. Do not make an untracked local doc the only source of needed context for a fresh/different worktree; summarize the needed facts or advise committing/attaching it.
- Sensitive values are redacted from both the doc and the prompt before writing files or copying to the clipboard.
- `## Suggested skills` is omitted when no specific skill/capability would change the next agent's behavior.
- The prompt is as long as the structure makes it — do not pad to a target, do not trim past structural completeness. If the prompt feels thin, the session probably was; that's fine.

If the rich doc was not produced (e.g. empty handoff), do not write the prompt either — fail loudly per §Failure modes.

#### 3c. Optional goal candidate — chat output only

If the next task is durable, verifiable, and likely to need multiple turns, compose an **optional goal candidate** for the final response. This is not a third handoff artifact: do not write it into the rich doc, do not put it inside the paste-and-resume prompt by default, and do not activate it automatically.

Only include the candidate when all of these are true:

- the next task has an observable end state
- there is a concrete verification surface (command, artifact, report, source, or transcript-visible check)
- there are meaningful constraints or non-goals
- there is a reasonable turn/time budget or blocked stop condition

Use this shape:

```text
Optional goal candidate, review before activating:

/goal Continue from the handoff prompt until <observable end state>, verified by <command/artifact output visible in transcript>, while preserving <constraints>. Stop after <N> turns or if <blocked condition>.
```

Skip the candidate when the next step is small, vague, exploratory, or not independently verifiable. The normal handoff prompt is still the primary resume artifact.

### Step 4 — Persist + copy

The slug `<slug>` and paths come from gather-state's `--- Handoff target ---` block. Use them verbatim.

#### 4a. Rich doc

1. Create directories: `mkdir -p ~/.craftkit/handoff/docs ~/.craftkit/handoff/archive`.
2. **If a previous doc exists** at `DOC_PATH`, archive it first by moving to `~/.craftkit/handoff/archive/<ISO-timestamp>-doc-<slug>.md`, where `<ISO-timestamp>` is the current run's `created:` value from gather-state's frontmatter (filename-safe form: `:` and `.` replaced by `-`, matching the `PENDING_PATH` filename format). Past docs stay recoverable in archive; the live `DOC_PATH` always reflects the latest session.
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

If clipboard copy fails, surface the error. Both file writes still succeeded.

### Step 5 — Inform

Show the **prompt** first — that's what the user pastes. Do not paste the rich doc when file writing succeeded. If §Step 3c produced a goal candidate, append it after the normal confirmation lines and label it `review before activating`.

## Output format

Always deliver in this order:

1. The **prompt** (fenced XML code block) — what the user pastes.
2. A 1-line confirmation: prompt path, doc path, clipboard status.
3. The next-step instruction (one line).
4. The Claude Code auto-load pointer when applicable.
5. The optional goal candidate when §Step 3c says it is warranted.

In the normal file-write path, do not paste or summarize the rich doc; it lives on disk. If the doc could not be written, paste the doc body after the prompt and clearly mark the file-write fallback.

## Failure modes

- **Empty handoff**: skill ran on a no-state session. Tell the user there's nothing to hand off and skip both file writes.
- **Outside a git repo**: `gather-state.mjs` reports `(not a git repo)` for branch and `(clean)` for status. Drop the State block from both artifacts and lean on the conversation-derived sections.
- **Multi-subtask session**: the conversation covered several unrelated threads. Don't merge them — ask the user which thread to carry forward, or pick the most recently active one and say so explicitly in the doc's Project section.
- **Prompt / doc divergence**: if the rich doc is edited after prompt generation, regenerate the prompt or update its snapshot too.
- **Stale pending handoffs**: the hook archives stale/superseded prompts; details live in `references/auto-load-hook.md`. The rich doc stays at `DOC_PATH` until the next same-project handoff archives it.
- **Concurrent wrap-ups in the same worktree**: prompts do not collide, but both runs target the same `DOC_PATH`; recover older narratives from `~/.craftkit/handoff/archive/`.
- **Wrong sizing**: if the prompt cannot orient without the doc, pull up Done/State/Decision snapshots; if it repeats narrative, push detail back to the doc. If the doc narrates every turn, apply §Step 2 harder.
- **Doc unreachable on resume**: the prompt snapshot must remain usable on its own, and the next agent should flag the missing doc.
- **Pair-write atomicity (§4a succeeds, §4b fails)**: re-run §3b/§4b only; do not re-run §4a or the just-written doc will be archived.
- **Auto-load surprises** (Claude Code only): clear `~/.craftkit/handoff/pending/` manually when you want a true reset or see repeated injection.
- **craft-prompt not installed**: Step 3a delegates the doc body to craft-prompt's template, and Step 3b uses craft-prompt's process to compose the prompt. If craft-prompt is absent (craft-handoff copied standalone), compose both directly using the §Step 2 inclusion tests + the shapes shown in the Example below. Tell the user to install craft-prompt — the two ship together in craftkit.

For stale prompt cleanup, concurrent wrap-ups, pair-write recovery, clipboard portability, and maintenance commands, load `references/operational-details.md`. For the optional Claude Code auto-load hook, load `references/auto-load-hook.md`.

## Example

### Input situation

Session added JWT auth middleware. Two files modified. One primary decision (JWT over sessions for stateless deploy), one abandoned approach (`express-session`), tests passing. Next step: wire middleware into the route table.

### Output sketch

```markdown
---
worktree: /Users/dev/work/acme-api
branch: feat/jwt-auth
created: 2026-04-25T00:14:09.000Z
next: Wire auth middleware into the protected route group
---

<context>
## Project
acme-api — Node/Express REST backend.

## Done (with path)
- Added JWT verification middleware at `src/middleware/auth.ts`. Exports `authMiddleware` and `signToken`.

## State
- Branch: `feat/jwt-auth` (3 ahead of `main`)
- Tests: passing (`npm test`)
- Blockers: none

## Decisions (long form)
- **JWT over server sessions.** Deploy target is stateless Cloud Run — no sticky load balancing and no shared session store budgeted for alpha. JWT removes the server-state requirement entirely. Trigger to revisit: if Cloud Run is replaced with a sticky-capable target, or if token revocation requirements emerge that exceed what short TTLs can absorb.

## What didn't work
- **Tried `express-session` first.** Looked promising (familiar API, well-trodden path) but pulling its `connect-redis` adapter surfaced a Redis dependency that doesn't fit the stateless deploy. Discarded after ~20 minutes; switched to JWT.
- **Tried embedding the secret in `config/auth.json`.** Worked locally, reverted before commit. Record the convention ("secrets come from env") but never copy secret values into handoff artifacts.
</context>
```

```xml
<context>
## Project
acme-api — Node/Express REST backend.

## State
- Branch: feat/jwt-auth (3 ahead of main)
- Tests: passing (`npm test`)
- Blockers: none

## Done (snapshot)
- JWT verification middleware: `src/middleware/auth.ts` (exports `authMiddleware`, `signToken`)

## Decisions (one-liners; long-form rationale + rejected alternatives in handoff doc)
- JWT over server sessions — because stateless Cloud Run target

## Background
Full session narrative, decision rationale in long form, and abandoned approaches are at `~/.craftkit/handoff/docs/acme-api-7c3a92.md`. Read it first before acting — it captures *why* the current shape is what it is.
</context>

<task>
Wire the JWT auth middleware into the protected route group in `src/routes/index.ts`.

Success criteria:
- protected routes return 401 without token and 200 with a valid token
- `npm test` stays green
</task>

<rules>
- All paths are worktree-relative
- Read `~/.craftkit/handoff/docs/acme-api-7c3a92.md` first if reachable — it has the prior context (rationale and rejected alternatives); if missing or inconsistent with this snapshot, proceed and flag it
- Read `src/middleware/auth.ts` first to confirm export shape (`authMiddleware`, `signToken`)
- Run `npm test` before declaring done
</rules>
```

When §Step 3c is warranted, append this after the normal confirmation lines:

```text
Optional goal candidate, review before activating:

/goal Continue from the handoff prompt until the JWT middleware is wired into protected routes and verified by `npm test` output in the conversation, while preserving route URLs and avoiding refresh-token or session-store changes. Stop after 20 turns or if the auth export shape is inconsistent with the handoff snapshot.
```

For a complete paired output, load `references/full-example.md`.

## References (load on demand)

- `references/auto-load-hook.md` — Optional `SessionStart` hook that auto-injects the prompt for the current worktree after `/clear`, removing the manual paste step. The doc is read by the next agent on the prompt's instruction, not injected by the hook.
- `references/operational-details.md` — Clipboard portability, stale-prompt cleanup, concurrent wrap-ups, pair-write recovery, and maintenance commands.
- `references/full-example.md` — Full rich-doc + prompt example for the JWT auth scenario.
