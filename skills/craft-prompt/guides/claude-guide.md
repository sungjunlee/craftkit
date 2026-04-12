# Claude (Code / Web / API)

- **XML tags** for structure — `<context>`, `<task>`, `<rules>`, etc. Claude is trained on XML and parses it semantically. Up to 39% quality improvement reported with structured XML
- **Reference file paths, don't paste** — Claude Code reads files directly. Prefer worktree-relative paths like `src/auth.ts:45`; avoid absolute paths unless the prompt is intentionally machine-specific
- **Outcome-focused** — "Produce X that meets Y criteria" beats step-by-step instructions. Let Claude choose its approach
- No need for "think step by step" — Claude has built-in extended thinking. For complex tasks, "Take time to understand X before acting" is enough
- **Prefill removed** on Opus 4.6 / Sonnet 4.6 — assistant message prefilling returns 400 error. Use `output_config.format` with JSON schema for structured output instead (old `output_format` param deprecated)
- **Opus 4.6** (Feb 5, 2026): 1M context (beta), 128K max output, $5/$25 per 1M tokens. Agent teams for parallel task splitting. 80.8% SWE-bench
- **Sonnet 4.6** (Feb 17, 2026): Default on claude.ai. Same pricing as Sonnet 4.5 ($3/$15). Near-Opus performance on real-world tasks
- When delivering: use `thinking.type: "adaptive"` with `effort` parameter (`low`/`medium`/`high`/`max`). Adaptive Thinking dynamically adjusts reasoning depth per request complexity
