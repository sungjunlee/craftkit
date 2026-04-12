# GPT (Pro / ChatGPT / API)

- **XML tags work well** — supported from GPT-4.1+, standard for GPT-5.x agentic workflows. Use `<context>`, `<instructions>`, `<output_contract>` style tags. GPT-5.4 docs: "trained to read XML tags as intent signals". Markdown also works well as an alternative
- **GPT-5.4** (March 5, 2026): 1M token context, native computer use, first general-purpose model with computer-use capabilities. Incorporates GPT-5.3-Codex coding strengths. ~80% SWE-bench Verified
- **Thinking mode** — GPT-5.4 Thinking has visible thinking tokens and generates an upfront plan; you can steer mid-response. 33% fewer claim errors vs GPT-5.2. No need to prompt "think step by step"
- GPT tends **verbose** — add "Be concise", "No preamble", or explicit word limits
- "Be opinionated" is often needed — otherwise GPT hedges with "it depends on your use case"
- ChatGPT Custom Instructions: keep under 1500 characters per field
- **Character escape issues**: backtick nesting, `*`/`_` conflicts in code-heavy prompts — XML avoids these
- **API delivery note**: system/user split — put Role + Rules in system message, Context + Task in user message
- When delivering: GPT-5.x doesn't support temperature; suggest `reasoning_effort` parameter instead (`none` to `xhigh`)
- **Current models** (as of March 2026): GPT-5.4 (Mar 5, $2.50/$15.00), GPT-5.3 Codex (Feb 5, coding), GPT-5.2 (Dec 2025)
