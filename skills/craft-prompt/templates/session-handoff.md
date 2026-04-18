# Session Handoff Templates

For handing off work to a new AI coding session. The structure is rigid enough that a good template saves real time.

Unless machine-specific details matter, treat every path in these templates as relative to the current worktree root.

---

## Continuation (pick up where you left off)

```xml
<context>
## Project
{{project}} — {{one_liner}}

## Done
{{completed_items}}

## State
- Branch: {{branch}} ({{N}} ahead of {{base}})
- Tests: {{status}}
- Blockers: {{blockers}}

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
- All file paths below are relative to the current worktree root
- Read {{key_files}} first
- Run `{{test_command}}` after changes
</rules>
```

## Debug Handoff

```xml
<context>
## Problem
{{issue_description}}

## Symptoms
- {{symptom_1}}
- {{symptom_2}}

## Tried
- {{approach}} → {{outcome}}

## Suspect
- {{path_relative_to_worktree}}:{{line}} — {{why}}
</context>

<task>
Find root cause and fix.

Success criteria:
- Root cause identified with evidence
- Regression test added
- No side effects on {{related_area}}
</task>
```

---

## Tips

- Include `git diff --stat` for quick orientation
- State decisions, not deliberations — "chose JWT because X" not "we discussed JWT vs sessions"
- Name specific files using worktree-relative paths — `src/auth.ts` not "see the auth module" or `/abs/path/src/auth.ts`
- Include the test command — saves the new session from guessing
- Keep under 800 tokens — a bloated handoff defeats the purpose
