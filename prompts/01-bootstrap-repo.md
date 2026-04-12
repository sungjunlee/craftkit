You are working inside a new repository called CraftKit.

Goal:
Bootstrap the repository as a cross-agent toolkit for prompts and coding-agent skills.

Core context:
- Top-level brand: CraftKit
- Core skills: craft-prompt, craft-blueprint, craft-reflect, craft-tune, craft-loop, craft-autoresearch
- Scope: skill + prompt + research loop + best practices
- Style: markdown-first, diff-friendly, reusable, copy-pasteable, cross-agent
- Do not overengineer

Skill file conventions:
- Each skill lives at `skills/<skill-name>/SKILL.md`
- Each `SKILL.md` starts with YAML frontmatter: `name` and `description`
- The `description` is the triggering mechanism — include both what the skill does and when to use it
- Keep each `SKILL.md` body under ~500 lines; split into `references/` only if needed
- Favor imperative form and explain the *why* rather than rigid ALWAYS/NEVER rules
- Include at least one concrete example per skill

Tasks:
1. Create the initial repository structure for docs, prompts, and skill files.
2. Draft first-pass contents for:
   - README.md
   - AGENTS.md
   - docs/product.md
   - docs/roadmap.md
   - each core skill's `skills/<skill-name>/SKILL.md`
3. Keep everything markdown-only unless code is clearly necessary.
4. Normalize terminology across all files.
5. Favor portable, provider-neutral wording in core assets.
6. Make the repository understandable to a new contributor by reading the docs alone.

Constraints:
- Prefer small, coherent files.
- Prefer clarity over cleverness.
- Do not add a runtime, CLI, or complex packaging yet.
- Keep the diff focused and bootstrapping-oriented.

If any existing local prompt-builder or meta-skill assets are present in the workspace, inspect them and borrow only reusable patterns, not repo-specific clutter.

Final output:
- concise summary of what was created
- file tree
- top 5 next tasks
- assumptions made
