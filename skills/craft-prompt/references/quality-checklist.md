# Prompt quality check

Use this for prompts whose risk, ambiguity, reuse, or downstream parsing justifies a deeper pass. A short ordinary request does not need checklist ceremony.

## Core check

- **Outcome** — Is the requested end state or deliverable clear?
- **Context** — Does the prompt include only facts the target cannot reliably infer or retrieve?
- **Boundaries** — Are material scope, authorization, compatibility, and non-goals explicit without repetition?
- **Evidence** — Is success observable where correctness or completion matters?
- **Consumer fit** — Are language, shape, and reuse appropriate for the person, agent, or parser receiving the result?
- **Conflict-free** — Do instructions, examples, and source material agree?
- **Right-sized** — Does every control prevent a real failure or preserve a real requirement?
- **Portable enough** — Are paths and provider-specific assumptions correct for where the prompt will run?

## Repair by symptom

| Symptom | Smallest likely repair |
|---|---|
| The target asks which interpretation was intended | Clarify the outcome or add the missing fact; ask the user only if the choice materially changes the work |
| The target invents facts or paths | Supply the source, require retrieval, or label assumptions; use paths relative to the stated root |
| The target does too much | Add one scope or non-goal boundary; name how to report useful out-of-scope findings |
| The target stops too early | State the complete end condition and required evidence |
| The target keeps asking permission | Clarify what the request already authorizes and which actions still require confirmation |
| The target pauses or changes course because surrounding instructions conflict | Audit the prompt, active skills, and repository guidance together; remove stale rules or make precedence explicit |
| The output shape varies | Add a compact format contract; add an example only if the contract remains ambiguous |
| The output is too short or long | Use a native verbosity control when available; otherwise state what must be preserved and what may be omitted |
| Research answers from memory | Require current retrieval, source quality, dates, and citations appropriate to the claim |
| Tool calls are wasteful or serial | Add a tool rule only if the surface does not already handle selection or parallelism well |
| Verification expands beyond the task | Require checks proportionate to the change; broaden or repeat them only after new changes, failures, or unresolved concerns |
| Reasoning is rigid or meandering | Remove hand-written thinking steps; adjust the target's effort control before adding more process prose |
| Formatting looks dated or unnatural | Remove inherited formatting rules; describe the actual readability failure, not a provider stereotype |
| A reusable prompt grows after every incident | Remove controls whose motivating failure is no longer reproducible; keep the regression case in evals instead |

## Final subtraction pass

Remove, in order:

1. generic roles, praise, and exhortations
2. repeated rules and context already available to the target
3. speculative edge-case instructions
4. formatting and model workarounds without a current failure
5. examples that no longer teach a distinct behavior

Keep required outcomes, hard boundaries, consumer contracts, and evidence. If removing a line would not change a competent target's decision or output, the line has not earned its place.
