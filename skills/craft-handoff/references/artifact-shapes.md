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
- Repo paths below are worktree-relative; handoff-store paths (`~/.craftkit/handoff/...`) are absolute
- Read `~/.craftkit/handoff/docs/<slug>.md` first if reachable; if missing or inconsistent with this snapshot, proceed with this snapshot and surface the discrepancy
- <constraint or rejected approach the next session must not redo>
- Read `<key file>` first to confirm <why>
- Run `<actual verification command>` before declaring done
</rules>
```

The first two rules always apply. The rest are conditional: include a constraint line for every boundary the next session would otherwise cross, a key-file line only when a specific file matters, and a verification line only when this project has a command that actually applies to the task. A generic "run the tests" or "read the key file" the session cannot name concretely invents work for the next session — drop the line instead.

The prompt must remain usable if the doc is unreachable, but it should still instruct the next agent to read the doc first when available.
