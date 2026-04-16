# Skill Spec Checklist

Use this after drafting a `craft-skill-spec` output when the design feels plausible but you want one more structured pass before writing the actual `SKILL.md`.

## 1. Job clarity

- Can the skill's job be stated in one sentence?
- Is the wedge narrow enough that another nearby skill would not do the same job?
- Are the non-goals explicit?

If these answers feel fuzzy, the spec is still too broad.

## 2. Radar discipline

- Did the spec select a small number of `Adopt` items that actually matter here?
- Did it identify concrete `Avoid` items instead of generic bad practices?
- Did it keep `Watch` items as conditional or isolated decisions instead of default behavior?

If the output reads like a restatement of `docs/skill-radar/current.md`, it is not specific enough.

## 3. Freedom level

- Is the chosen freedom level appropriate for the workflow's fragility?
- If the skill proposes exact commands or scripts, is the repeated deterministic pain named?
- If the skill stays high-freedom, is there enough structure to prevent drift?

The common failure is choosing a freedom level by taste instead of by workflow risk.

## 4. File shape

- Does the spec start from the smallest viable file set?
- Is every proposed file justified by a repeated need?
- Would any proposed `references/`, `scripts/`, or `templates/` file remove real ambiguity or repetition?

If a file exists only because "skills often have one," cut it.

## 5. Trigger quality

- Does the frontmatter `description` say both what the skill does and when to use it?
- Does it include plausible user phrasings or aliases without becoming bloated?
- Would a person reading only the description know when this skill should trigger?

If not, the skill may be hard to discover automatically.

## 6. Eval readiness

- Are there 3-5 realistic prompts?
- Do the checks describe observable output qualities?
- Is there at least one likely failure pattern called out?

If the spec cannot name how the first draft would fail, it is probably not ready to write.

## 7. Cross-agent portability

- Does the core design avoid provider-specific assumptions?
- If platform-specific behavior exists, is it isolated in a guide, example, or optional branch?
- Would the skill still make sense if copied into another agent environment?

If portability is lost, the spec should say so explicitly as a tradeoff.

## 8. Output usefulness

- Could another agent draft `SKILL.md` from this spec without inventing architecture?
- Are open questions limited to the ones that would change the design materially?
- Does the output end in decisions, not just observations?

If another agent would still need a long clarification round, the spec is incomplete.
