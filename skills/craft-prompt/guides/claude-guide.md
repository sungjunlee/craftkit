# Claude (Code / Web / API)

- last reviewed: `2026-05-01`
- source: Anthropic Claude prompting best practices

## Structure

- **XML tags** are the default for complex Claude prompts. Use descriptive tags such as `<context>`, `<task>`, `<rules>`, `<examples>`, and `<output>`.
- **Examples are high leverage** when format, tone, or boundary behavior matters. Keep them relevant, diverse enough to avoid accidental patterns, and wrapped in `<example>` or `<examples>`.
- **Reference file paths, don't paste** for Claude Code. Prefer worktree-relative paths like `src/auth.ts:45`; avoid absolute paths unless the prompt is intentionally machine-specific.
- **Outcome-focused** prompts work best: "Produce X that meets Y criteria" beats a long procedure for how to think.

## Agentic prompts

- Add clear success criteria for research and information gathering.
- Ask for source verification when factual accuracy matters, especially for recent or high-stakes claims.
- Give tool and subagent criteria, not blanket tool-use pressure. Latest Claude models can be proactive; stale anti-laziness prompts may cause overuse.
- For risky actions, state the confirmation boundary: destructive operations, hard-to-reverse git history changes, public comments, shared infrastructure, or other externally visible effects.

## Settings and delivery

- No need to prompt "think step by step." If the host exposes effort or adaptive thinking settings, recommend the level separately from the prompt body.
- Use structured output controls or schemas when the API supports them. Do not rely on assistant prefill patterns for portable prompts.
- For complex pipelines, chain prompts only when intermediate outputs need inspection, logging, branching, or evals. Otherwise let the model handle the steps inside one clear task.

## Watch-outs

- Avoid making subagents the default for simple code exploration, single-file edits, or tightly coupled context.
- Avoid embedding time-sensitive model names, prices, or benchmark claims in reusable prompts. Keep those in dated deployment notes if needed.
