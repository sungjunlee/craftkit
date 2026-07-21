---
name: craft-prompt
description: Craft copy-paste-ready prompts. Use to write prompts, turn notes into templates, draft `/goal` conditions, or answer "프롬프트 만들어" requests.
---

# craft-prompt

## Purpose

Turn a goal, scattered notes, or a raw ask into a clear, well-structured prompt that gets the best results from any LLM — a separate step from doing the task itself, so the result is a copy-paste-ready text block the user can drop into any AI interface.

## Use this when

- the user asks to write, make, or build a prompt from scratch
- scattered notes need to become a reusable prompt or template
- a session handoff prompt or `/goal` condition is needed
- Korean prompt requests appear, such as "프롬프트 만들어" or "프롬프트 작성"

## Inputs

- **Goal** — what the prompt should make the LLM do
- **Target** — which model, product surface, or agent interface
- **Audience** — who will use the prompt (the user, a team, non-technical users)
- **Reuse** — one-shot use, or a reusable template with placeholders
- For coding-agent or worktree prompts: the execution context — default to paths relative to the current worktree root unless the user explicitly needs machine-specific absolute paths

Don't over-ask — infer whatever the request already makes clear. "Write me a code review prompt for GPT" already gives goal and target.

## Workflow

1. **Confirm inputs.** Ask only what Inputs doesn't already make clear.
2. **Gather the raw material.** Collect what the prompt's purpose needs — task instructions and constraints; research questions and recency needs; for a session handoff, run `git status`, `git diff --stat`, `git log --oneline -5`, and note recent changes; for a `/goal` condition, outcome/evidence/constraints/non-goals/scope/budget/stop condition; for a system prompt, persona/capabilities/boundaries/tone; for a template, variable placeholders and usage notes. Distill rough notes or a conversation dump rather than repeating them verbatim.
3. **Build the prompt**, using only the blocks it needs:

   | Block | When to include |
   |-------|----------------|
   | Role | A specific expertise improves the output (one sentence) |
   | Context | The LLM needs background to reason correctly |
   | Task | Always — the core instruction |
   | Rules / Constraints | There are important do's/don'ts |
   | Output format | The default output structure won't work (see Output format) |
   | Examples | Desired behavior is hard to describe but easy to show |

   **Sizing heuristic**: a small request (under ~20 words of user specification) stops at Role + Task + Rules; add Output format only if the user names a shape, Examples only if behavior is hard to describe. A reusable template turns every value that varies week-to-week into a `{{placeholder}}` — hardcoding more than one varying value under-templates.

   For research, coding-agent, or other high-impact prompts, add a small verification contract — what to check before finalizing: requirements, grounding, format, irreversible side effects — instead of generic "be careful" prose.

   XML tags work across major LLMs; use them for complex or multi-section prompts, plain text/markdown for simple ones. If the user names a target model, product, image generator, or video generator, load the matching guide or template (below) and keep volatile target-specific behavior out of this portable spine.
4. **Sharpen.** Cut fluff (no sentence that fails to change LLM behavior); be specific (numbers beat adjectives); keep it self-contained (no dangling "this conversation" references); resolve hidden conflicts between rules, examples, and edge cases; state how missing context should be handled (look up, ask, or proceed with labeled assumptions). Weigh every cut against Principles — especially Cut in this order and Right-sized. For complex prompts, run through `references/quality-checklist.md` for deeper failure-mode analysis.
5. **Deliver.** See Output format.

## Output format

A fenced code block, ready to copy-paste — always, when the user explicitly asked for a prompt or clearly invoked this skill. Never replace the prompt with direct task execution.

If relevant, add a brief note outside the code block: how to customize placeholders, which parts to adjust if results aren't ideal, and recommended target-platform settings (model choice, search focus mode). Ask if the user wants adjustments; refine tone, blocks, or target LLM based on feedback.

Non-English prompts: write the prompt body in the requested language, but keep XML tag names in English (`<context>`, `<task>`) — all major LLMs parse English tags regardless of content language.

## Guardrails

- always deliver the prompt when one was asked for, even if the underlying task looks simple enough to do directly
- keep target-specific formatting quirks in `guides/` and `templates/`, not in this spine
- default to worktree-relative paths in coding/worktree prompts; state the base once if it could be ambiguous
- don't inflate a simple prompt to look thorough — see Principles

## Principles

Full statements in `references/shared-principles.md`:

- Context beats instruction
- Outcome over process
- Cut in this order
- Right-sized beats thorough-looking

Prompt-specific:

1. **The prompt is the product.** Deliver polished text the user copies as-is, not a meta-discussion about prompting.
2. **Respect the target LLM.** XML tags work broadly, but each interface has nuances — read the target's guide when available, especially for search-first, multimodal, or local-model workflows.
3. **Reusability when asked.** Use `{{placeholder}}` syntax with clear labels for templates; bake in specifics for one-shot prompts.
4. **Verification beats vague caution.** For complex or high-impact prompts, say what to verify before finalizing instead of piling on broad "be thorough" instructions.
5. **Know when to skip.** Skip prompt-building only when the user didn't ask for a prompt and direct execution is clearly better; if they explicitly asked for a prompt, deliver it even when the underlying task is simple.

## Failure modes

- **process worship** — listing every step to reach the outcome instead of stating the outcome and letting the target LLM find its own path
- **template worship** — templating a one-shot request nobody will reuse, or the reverse: hardcoding a value that actually varies week to week
- **missing output contract** — delivering prose about the prompt instead of a copy-pasteable fenced block, or dropping a shape constraint the user named
- **fluff inflation** — padding with generic "be helpful/thorough" language that doesn't change behavior
- **format mismatch** — ignoring the named target's conventions, or leaking platform-specific instructions into this portable spine instead of `guides/`

## Example

Input: "write me a code review prompt for GPT, keep it short"

Delivered prompt:

```
You are a senior code reviewer.

Review the diff below for correctness bugs, security issues, and unnecessary complexity. Skip style nits.

Report only issues you're confident about, one per line: `file:line — issue — suggested fix`.

<diff>
{{diff}}
</diff>
```

Note outside the block: "Swap `{{diff}}` for the actual diff before sending."

## References (load on demand)

- `references/shared-principles.md` — full statements of the four principles
- `references/components-guide.md` — Deep dive on each building block with examples and anti-patterns
- `references/prompt-patterns.md` — 8 common patterns: research, code gen, review, writing, extraction, analysis, handoff, decision
- `references/quality-checklist.md` — Quality checks with failure modes and fixes
- `references/goal-conditions.md` — Writing `/goal` completion conditions and reviewable goal specs for Claude Code and Codex autonomous loops (transcript-visible evidence, cross-platform differences, and caveats)

## Guides (platform-specific tips)

- `guides/claude-guide.md` — Claude Code / Claude web / API
- `guides/gpt.md` — GPT Pro / ChatGPT / API
- `guides/perplexity.md` — Perplexity
- `guides/gemini.md` — Gemini / Imagen
- `guides/local-models.md` — Local/open-source models (Llama, Qwen, Mistral, DeepSeek, Ollama, etc.)

## Templates (special cases where a well-crafted template adds real value)

- `templates/session-handoff.md` — AI session handoff (continuation, debug)
- `templates/image-gen.md` — Image generation (photo, illustration, icon, per-platform notes)
- `templates/video-gen.md` — Video generation (text-to-video, image-to-video, camera keywords, per-platform notes)
- `templates/system-prompt.md` — Chatbot/agent system prompts (layered architecture)
