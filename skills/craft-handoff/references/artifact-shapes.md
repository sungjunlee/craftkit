# craft-handoff artifact shapes

Load this reference when the compact `SKILL.md` shape is not enough and you need exact skeletons for the paired handoff artifacts.

## Rich doc skeleton

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

The body contains only `<context>...</context>`. Put next-session instructions in the prompt, not in the rich doc.

## Resume prompt skeleton

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

The prompt must remain usable if the doc is unreachable, but it should still instruct the next agent to read the doc first when available.
