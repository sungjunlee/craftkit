Run a quality pass on the core CraftKit files.

Scope:
- README.md
- AGENTS.md
- docs/product.md
- docs/roadmap.md
- all core `skills/<skill-name>/SKILL.md` files

Review criteria:
- clarity of purpose
- structural consistency across skills (Purpose, Use this when, Inputs, Steps, Output format, Guardrails, Failure modes, Example)
- cross-agent portability
- explicit inputs and outputs
- reusability
- hidden assumptions
- redundancy
- example usefulness
- copy-pasteability
- YAML frontmatter quality — `description` should clearly signal both what the skill does and when to trigger it

Tasks:
1. Review each file against the criteria above.
2. Improve the files with minimal, coherent diffs.
3. Where needed, add or sharpen a "Failure modes" or "Guardrails" section.
4. Remove wording that is too vague, too vendor-specific, or too abstract.
5. Normalize headings and output templates across the skill files.
6. Sanity-check each skill's `description` against the "pushy but accurate" bar: it should make a coding agent confidently invoke the skill in the right contexts without overreaching into unrelated ones.

Constraints:
- Do not rewrite everything from scratch unless clearly necessary.
- Preserve strong parts of the current files.
- Prefer small high-leverage edits.
- Keep the repository lightweight and docs-first.

Final output:
- brief audit report
- files improved
- top remaining weaknesses
- recommended next milestone
