### What is working

- Purpose names both the job (turn rough idea into blueprint) and the underlying motivation (separating goals from constraints before writing the artifact).
- Six clearly numbered Steps each carry a one-line rationale.
- Output format is explicit with four named subsections.
- The new "When the target is a skill (vs a prompt)" section gives the skill-path vocabulary that generic design guidance tends to smuggle in implicitly.
- Example produces a copy-pasteable blueprint and shows the expected shape.

### Issues

1. Inputs are named but not shaped — "brief idea or request" does not specify whether the agent should expect a paragraph, a bullet list, a user utterance, or a design doc. Downstream Steps cannot converge on a common shape.
2. The skill-specific section (five items) mixes decision criteria with rationale in running prose, so a reader scanning for "what do I decide here" has to re-read every paragraph.
3. Step 6 says "Call out any unresolved decisions briefly," but the Output-format Open questions subsection does not bound the count, and the Example shows only one — the implicit cap is ambiguous.
4. The Example covers only the prompt-target case. With the hybrid section in place, a skill-target mini-example would make the prompt/skill split concrete for the reader.
5. The Files-to-create list does not specify that paths are repo-relative; the Example uses `skills/craft-tune/SKILL.md` (absolute-from-repo) without the spec ever requiring that convention.

### Recommended changes

- Add a one-phrase Shape note to each Input item (e.g. "brief idea or request: a paragraph or 3-5 bullets") so the skill's entry contract is predictable.
- Reformat the five skill-specific items so decision is visibly separate from rationale — a bold lead or a two-column table.
- Cap Open questions in the Output-format spec (e.g. "Up to three") and update the Example if needed.
- Add a second mini-example showing a skill-target blueprint with a file-tree plan and a frontmatter draft.
- State in the Files-to-create-or-update spec that paths are repo-relative unless otherwise noted.

### Failure modes

- Blueprints leave Inputs' shape underspecified, so one agent returns a paragraph and another a checklist with incompatible detail.
- Reader skims the skill-specific section as prose and misses the decisions it is asking them to make.
- Open-questions list bloats as agents dump every minor ambiguity, diluting the "materially affects design" filter.
- Prompt-target and skill-target users both anchor on the single (prompt) Example and produce artifacts that do not fit their actual target.

### Minimal rewrite plan

1. Add one-phrase shape notes to each Input bullet.
2. Reformat the five skill-specific items so decision is visibly separate from rationale.
3. Cap Open questions at three in the spec.
4. Add a second Example for a skill-target blueprint.
