# Charter create mode: signals, questions, seed Decisions

Use this reference in `spec-charter` create mode. The goal is a defensible first revision, not a perfect axis on day one; amend mode supplies stability later.

## Signals

Product authority comes from what the project says and ships: `README.md` for Problem and Approach, open epics and issues for active scope, recent merged PRs and `CHANGELOG.md` for what is actually being built. Harness files (`CLAUDE.md`, `AGENTS.md`, `GEMINI.md`) explain local workflow and guardrails; they seed questions but do not override product signals unless they explicitly describe product boundaries.

Stop gathering once the draft is coherent. With no README, draft Problem from recurring issue themes and Approach from recurring choices in recent PRs, and say so to the user.

When signals disagree (README says CLI, harness file says web app, commits show both), name the conflict and ask which surface is the current center of gravity. Silent picks pollute Problem and Approach for the life of the charter.

## Questions that sharpen a draft

Use these where the draft is weak, in whatever order the conversation takes.

- **Problem is diagnosis-only.** No solution language leaks into it.
- **Wedge test for Approach.** "What is the wedge that would shrink if scope shrunk?" If the user names a tool, the wedge is the *choice* behind the tool. "If we removed everything else, would this still be the project?"
- **Non-Goals.** "What would you say no to even if a user asked for it?" and "What has a contributor already proposed that you rejected, and why?" surface real rejections with rationale. Three to six is healthy; ten is bloat.
- **Initial Objectives.** "Name 2–3 outcomes a user could observe today." Write them as lean predicates and run each through the 30-second test in [`objectives.md`](objectives.md). No status tokens unless the user wants the opt-in proof ladder.

## Seed Decisions

An empty Decisions table on revision 1 is not a defect; decisions accrue through amend.

Seed three to five rows only when design docs, ADRs, or notable merged PRs already record a direction that still stands today. A reversed choice is history — leave it to git. Each row needs `date`, `decision`, and `rationale`. Tell the user that seeded rows become standing decisions from revision 2 on (rewritten or removed only under the human gate), so they do not overpopulate optimistically.

## Harness pointer

The rule lives in [`spec-axis.md`](spec-axis.md) § Harness pointer; create mode applies it as written.
