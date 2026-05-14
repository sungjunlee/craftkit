# Writing `/goal` completion conditions

For the `/goal` slash command in **Claude Code** (2.1.139+) and **Codex CLI**. The value you pass to `/goal` is a single condition string read by two consumers:

- **The main model** treats it as a directive — it starts working toward the condition.
- **A separate evaluator** (Claude Code: small fast model, usually Haiku; Codex: internal) decides "done or not done" after every turn. The evaluator **does not call tools**. It only sees the condition + what already appears in the conversation transcript.

That second consumer is the load-bearing one. Most bad `/goal` conditions fail because the evaluator has no way to decide.

---

## What the condition must contain

Three load-bearing parts. Keep them inline in 1–3 sentences — this is a single string, not a multi-section prompt:

1. **One measurable end state** — a test result, a build exit code, an empty queue, a file count. The evaluator must be able to read the transcript and answer yes/no.
2. **A stated check** — the exact command the operator must run so its output lands in the transcript. Without this, the evaluator has nothing to read.
3. **Constraints that matter** — what must not change on the way there (paths, APIs, behaviors). Inline as a clause; do not break into a separate section.

Optional but usually wise:

- **A turn or time cap** as a clause: *"…or stop after 25 turns."* Claude Code reports progress against this clause each turn; in Codex, surface the turn count in the operator's own output so the evaluator can see it.

---

## Condition vs process — don't mix

A common trap is stuffing operator process into the `/goal` string:

> ❌ `…run npm test after each change, print exit codes, keep a checkpoint log every 5 turns, then verify…`

The evaluator can't enforce process. It can only check whether the end state is visible in the transcript. Process belongs in a normal directive you send *before* `/goal`, or just folded into the stated check.

> ✅ `…all tests in test/auth/ pass when run via npm test -- test/auth …`

If you want progress logs, ask for them in a normal turn first, then set `/goal`.

---

## Three worked examples

### A. Test-and-lint gate (small scope)

```
all tests in test/auth/ pass and `npm run lint` exits 0.
Run `npm test -- test/auth && npm run lint` after each change so exit codes appear in the conversation.
Do not modify any file outside src/auth/ or test/auth/.
Stop after 25 turns regardless.
```

Why it works: the end state (two exit codes) is a single yes/no the evaluator can read off the transcript. The stated check guarantees the output is visible. Constraints scope the blast radius. Turn cap bounds cost.

### B. API migration with contract parity

```
Migrate src/legacy-router/ call sites to the new router API in src/router-v2/
until `pnpm typecheck` and `pnpm test` both exit 0.
Do not change route URLs, response shapes, or any file under src/legacy-router/ itself.
After each batch, run both commands and print exit codes.
Stop after 40 turns or when both have been clean for 2 consecutive turns.
```

Why it works: end state is two exit codes. "What not to change" is explicit and observable (file paths, response shapes). The two-clean-turns clause protects against false-positive completion when the build is briefly green during refactor.

### C. Backlog drain pointing to a file

```
Work through every unchecked item in docs/SPRINT-2026-05.md (top to bottom)
until `grep -c '^- \[ \] ' docs/SPRINT-2026-05.md` prints 0.
After each item, edit the file to check the box and run that grep so the
remaining count appears in the conversation. Do not add new items.
Stop after 30 turns or when the printed count is 0.
```

Why it works: pointing to a file (`docs/SPRINT-2026-05.md`) keeps the condition under the 4000-char budget. The end state is a single integer the evaluator can read directly from the transcript — `git diff --stat` would only show *which* files changed, not the remaining unchecked count, so the example uses `grep -c` to surface the actual fact the evaluator needs.

---

## What a bad condition looks like

Each of these *sounds* measurable but fails on a specific axis:

| Bad condition | Why it fails |
|---|---|
| `fix the auth bugs` | No end state, no check, no cap. Will burn turns forever. |
| `the auth module is well-tested` | "Well" is undecidable. Evaluator has no rule to apply. |
| `tests pass` | Which tests? Which command? Evaluator may yes on the first turn that says "tests passing locally." |
| `implement everything in docs/PLAN.md` | Acceptance criteria are non-atomic — even with the file pointed at, the evaluator has no grep-able fact to read off the transcript. Pick one concrete end state instead. |
| `refactor until the code is clean` | Both end state and check missing. Worst possible /goal. |

---

## Checklist before pasting

- [ ] One measurable end state, stated in terms the evaluator can read from the transcript
- [ ] At least one exact command the operator must run after changes
- [ ] Inline constraint on what must NOT change (paths/APIs/behaviors)
- [ ] Turn or time cap as a clause
- [ ] No operator process inside the string (no "keep a log", "checkpoint every N")
- [ ] Under 4000 characters; references files instead of inlining long criteria
- [ ] Reads naturally as 1–3 sentences, not as a multi-section prompt

---

## Cross-platform differences

| Aspect | Claude Code `/goal` | Codex `/goal` |
|---|---|---|
| **Availability** | Built in (2.1.139+) | **Experimental** — enable via `/experimental` or set `[features] goals = true` in `config.toml` |
| **Char budget** | 4000 chars | Not documented; same discipline applies |
| **Lifecycle** | `/goal`, `/goal clear` (aliases: `stop`/`off`/`reset`/`none`/`cancel`) | `/goal`, `/goal pause`, `/goal resume`, `/goal clear` |
| **Evaluator** | Configured small fast model (Haiku default) | Internal |
| **Resume behavior** | `--resume` / `--continue` restores the goal but **resets turn counter, timer, and token-spend baseline** | Not the same lifecycle; persists differently |
| **Disablement** | Off if `disableAllHooks=true` at any settings level, or `allowManagedHooksOnly=true` in managed settings | N/A |
| **Headless** | `claude -p "/goal <condition>"` runs the loop to completion | Use Codex's standard non-interactive flags |

The same condition string usually works in both products if you follow the discipline above. The differences matter mostly for **lifecycle commands** and **resume semantics**.

---

## Three caveats before you paste

1. **Codex needs the flag.** If `/goal` does nothing in Codex, you probably haven't enabled it. `/experimental` or `goals = true` in `config.toml` under `[features]`.
2. **Claude Code `--resume` resets the turn counter.** A `"…stop after 20 turns"` cap becomes a 40-turn cap after one resume, a 60-turn cap after two. If cost matters across resumes, use a **time clause** ("stop after 90 minutes of wall clock") or bake a stop fact into the transcript (e.g., a file the operator writes when done).
3. **Don't inline long acceptance criteria.** The 4000-char budget fills fast with prose, and the evaluator has to re-read the condition every turn. Point to a file (`docs/PLAN.md`, `docs/SPRINT-2026-05.md`) and make the end state a grep-able fact about that file.

---

## When `/goal` is the wrong tool

- **Time-driven re-runs** (every 5 minutes) → use `/loop`. `/goal` only fires after a turn finishes.
- **Custom evaluation logic** (calls APIs, parses logs externally) → write a prompt-based Stop hook directly. `/goal` is a session-scoped wrapper around exactly that.
- **Open-ended exploration** with no verifiable end state → don't use `/goal`. Use a normal turn and stop when you're satisfied.

---

## See also

- [Claude Code `/goal` docs](https://code.claude.com/docs/en/goal)
- [Codex `/goal` use-case docs](https://developers.openai.com/codex/use-cases/follow-goals)
- `references/prompt-patterns.md` — other prompt patterns
- `references/quality-checklist.md` — deeper failure-mode review for complex prompts
