# GPT (Pro / ChatGPT / API)

- last reviewed: `2026-05-01`
- source: OpenAI prompt guidance for GPT-5.5

## Structure

- **XML tags work well** for multi-section prompts. Use stable names such as `<context>`, `<task>`, `<rules>`, `<output_contract>`, and `<verification_loop>`. Markdown also works for simple prompts.
- **Instruction conflicts are expensive.** GPT-5.x follows instructions closely, so contradictory rules or examples can make the model spend effort reconciling them. Check hierarchy and exceptions before adding more text.
- **Context and scoped rules beat generic intensity.** Prefer concrete success criteria, edge cases, and output contracts over broad "be thorough" language.

## Agentic prompts

- Add tool persistence only when tools materially improve correctness, completeness, or grounding.
- Add a short verification loop for high-impact work:
  - requirements satisfied
  - claims grounded in context or tool output
  - output matches the requested format
  - irreversible or externally visible actions require confirmation
- If required context is missing, say whether the model should retrieve it, ask a minimal question, or proceed with labeled assumptions.

## Settings and delivery

- Use natural-language verbosity controls for local sections: "Be concise", "No preamble", "Use detailed reasoning in the implementation notes only", etc.
- For API prompts, split durable role/rules into the system message and task-specific context/input into the user message.
- Prefer reasoning/effort controls over "think step by step" wording when the host exposes them. If the host does not expose settings, state the desired depth in plain language.
- ChatGPT Custom Instructions should stay short and reusable. Put task-specific context in the chat, not in global instructions.

## Watch-outs

- Avoid stale model catalogs, prices, and benchmark claims in reusable prompts. Link to current model docs when a user asks for model selection.
- Avoid provider-specific API parameters in portable core prompts. Put them in deployment notes outside the prompt body.
