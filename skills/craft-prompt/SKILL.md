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
- a `/goal` condition or other reusable prompt template is needed
- Korean prompt requests appear, such as "프롬프트 만들어" or "프롬프트 작성"

## Inputs

- **Outcome** — what the target should accomplish or return
- **Target** — the model, product surface, or agent interface when it changes the prompt
- **Context** — facts the target cannot reliably infer or retrieve itself
- **Reuse** — one-shot use, or a reusable template with placeholders
- For coding-agent or worktree prompts: the execution context — default to paths relative to the current worktree root unless the user explicitly needs machine-specific absolute paths

Don't over-ask. Infer what the request or available context already establishes, and ask only when the answer would materially change the prompt.

## Workflow

1. **Resolve the outcome.** State what should be true or delivered at the end. Preserve a shape, length, tone, or language only when the user named it or the consumer requires it.
2. **Gather only load-bearing context.** The delivered prompt usually travels without the current conversation, so include facts the target cannot reliably infer or retrieve; omit only what its surface already provides through files, tools, or attachments. For a `/goal`, read `references/goal-conditions.md`, then gather outcome, transcript-visible evidence, constraints, scope, budget, and stop condition — the evaluator's stated check is part of the completion contract, not process prescription. For a reusable template, identify values that genuinely vary, turn each into a `{{placeholder}}`, and do not hardcode recurring values.
3. **Draw the boundary.** Add scope, non-goals, approval limits, compatibility requirements, or irreversible-action rules only where violating them would matter. Keep related authorization in one compact policy rather than repeating it.
4. **Add evidence when warranted.** For research, coding-agent, or other high-impact prompts, say what should be checked before finalizing: requirements, grounding, tests, format, or side effects. Prefer observable checks over generic caution.
5. **Repair known failure modes.** Start with the lean prompt above. Add a role, explicit format, example, XML boundary, process step, or tool rule only when the request requires it or it corrects a likely or observed failure. Use `references/components-guide.md` as the repair menu and `references/quality-checklist.md` for complex prompts. For image generation, video generation, or a system prompt, load the matching template in `templates/`.
6. **Sharpen and deliver.** State each instruction once, remove prose that does not change behavior, resolve conflicts, and keep missing-context handling proportionate: retrieve when available, ask when the answer changes the work, otherwise proceed with a labeled assumption. Then follow Output format.

## Output format

A fenced code block, ready to copy-paste — always, when the user explicitly asked for a prompt or clearly invoked this skill. Never replace the prompt with direct task execution.

If relevant, add a brief note outside the code block explaining placeholders or a target setting that materially changes results. Do not append generic prompting advice.

Non-English prompts: write the prompt body in the requested language. If XML is actually useful, keep tag names in English (`<context>`, `<task>`) for portability.

## Guardrails

- always deliver the prompt when one was asked for, even if the underlying task looks simple enough to do directly
- keep volatile target-specific behavior out of this portable spine
- default to worktree-relative paths in coding/worktree prompts; state the base once if it could be ambiguous
- don't inflate a simple prompt to look thorough — see Principles
- don't encode reasoning steps the target can choose better itself unless order or completeness is part of the contract

## Principles

Full statements in `references/shared-principles.md`:

- Context beats instruction
- Outcome over process
- Boundaries over workarounds
- Earn every control
- Right-sized beats thorough-looking

Prompt-specific:

1. **The prompt is the product.** Deliver polished text the user copies as-is, not a meta-discussion about prompting.
2. **Respect the target.** Use its native controls for effort, verbosity, search, or structured output when available; don't reproduce those controls as prompt prose without a reason.
3. **Reusability when asked.** Use `{{placeholder}}` syntax with clear labels for templates; bake in specifics for one-shot prompts.
4. **Verification beats vague caution.** For complex or high-impact prompts, say what to verify before finalizing instead of piling on broad "be thorough" instructions.
5. **Know when to skip.** Skip prompt-building only when the user didn't ask for a prompt and direct execution is clearly better; if they explicitly asked for a prompt, deliver it even when the underlying task is simple.

## Failure modes

- **process worship** — listing every step to reach the outcome instead of stating the outcome and letting the target LLM find its own path
- **control accumulation** — keeping old roles, examples, formatting rules, and workarounds after the behavior they corrected has disappeared
- **template worship** — templating a one-shot request nobody will reuse, or the reverse: hardcoding a value that actually varies week to week
- **missing output contract** — delivering prose about the prompt instead of a copy-pasteable fenced block, or dropping a shape constraint the user named
- **fluff inflation** — padding with generic "be helpful/thorough" language that doesn't change behavior
- **format mismatch** — ignoring the named target's conventions, or leaking platform-specific instructions into this portable spine instead of `templates/`

## Example

Input: "write me a code review prompt for GPT, keep it short"

Delivered prompt:

```
Review the diff below for correctness bugs, security issues, and unnecessary complexity. Skip style nits.

Report only issues you're confident about, one per line: `file:line — issue — suggested fix`.

<diff>
{{diff}}
</diff>
```

Note outside the block: "Swap `{{diff}}` for the actual diff before sending."

## Templates (special cases where a well-crafted template adds real value)

- `templates/image-gen.md` — Image generation (photo, illustration, icon, per-platform notes)
- `templates/video-gen.md` — Video generation (text-to-video, image-to-video, camera keywords, per-platform notes)
- `templates/system-prompt.md` — Chatbot/agent system prompts (minimal contract plus optional clauses)

## References (load on demand)

- `references/shared-principles.md` — full statements of the five principles
- `references/components-guide.md` — optional controls to add in response to task needs or concrete failures
- `references/prompt-patterns.md` — common patterns: research, code gen, review, writing, extraction, analysis, decision
- `references/quality-checklist.md` — Quality checks with failure modes and fixes
- `references/goal-conditions.md` — Writing `/goal` completion conditions and reviewable goal specs for Claude Code and Codex autonomous loops (transcript-visible evidence, cross-platform differences, and caveats)
