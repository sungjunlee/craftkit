# Charter Amendment Guidance

Use this reference in `spec-charter` amend mode after re-reading `spec/charter.md`, or legacy root `CHARTER.md` only as a fallback. The default bias is stability: no change unless concrete evidence shows the charter is stale, weak, or newly validated.

## Tier 1 Challenge Checklist

Tier 1 covers Problem, Approach, and Non-Goals. It is human-gated: propose, challenge, confirm, then apply.

Problem:

- Does it still describe the actual pain the project exists to solve?
- Is it diagnosis-only, without solution language hidden inside it?
- Has recent work revealed a narrower, broader, or different pain?
- Would a new contributor understand why this project should exist?

Approach:

- Is this still how work is really being done?
- Does it describe a guiding policy rather than a task list?
- Has execution proven the current approach ineffective or misleading?
- Is the approach specific enough to reject plausible but wrong work?

Non-Goals:

- Has any Non-Goal silently been violated by recent issues, PRs, or sprint plans?
- Is each Non-Goal still an intentional boundary with a reason?
- Should a violated Non-Goal become an accepted direction change, or should the violating work be dropped?
- Are any Non-Goals stale because the project scope has legitimately moved?

## Tier 2 — lean default, opt-in ladder

Default charters are status-free. Adding or removing objectives is human-gated. Retired objective IDs are never reused; move the retired line to `docs/spec-history.md`.

If — and only if — the live charter already uses `[active]` / `[implemented]` / `[validated]` / `[deferred]`, apply the proof gate:

- `active` → `implemented` requires cited producer-side proof (merged PR, passing check, or a recorded agent run whose Done Criteria match).
- `implemented` → `validated` requires cited use by a consumer other than the authoring repo. Producer-side proof alone stays at `implemented`.
- `active` or `implemented` → `deferred` requires a cited parking or scope-change rationale.
- If proof or rationale is missing, refuse the advance. Do not weaken the objective so the proof appears sufficient.

Do not introduce status tokens onto a lean charter during amend.

## No Rubber-Stamp Rule

Re-apply pushback on every amend. Treat requested changes as proposals, not instructions to silently accept.

- Default to no change unless there is concrete evidence.
- Ask what changed in the world, backlog, or execution record.
- Prefer precise diffs over broad rewrites.
- Preserve the charter's role as a yardstick; do not mutate it to declare victory.

## Bloat Check

Protect the ~5-minute-read property on every amendment.

- Challenge additions that duplicate `README.md`, `CLAUDE.md`, or `_context.md`.
- Collapse long retired-objective lists; they belong in `docs/spec-history.md`, not the live charter.
- Move operational HOW-knowledge to `_context.md`.
- Keep Decisions append-only, but avoid recording trivia as decisions.
