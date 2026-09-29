---
name: craft-prompt
description: Craft copy-paste-ready prompts. Use to write prompts, turn notes into templates, draft `/goal` conditions, or answer "프롬프트 만들어" requests.
---

# craft-prompt

## Purpose

Turn a goal, scattered notes, or a raw ask into a prompt the user copies as-is into another model, agent, or product surface. The prompt is the product: when the user asked for one, deliver it even if the underlying task looks simple enough to do directly.

## Workflow

Infer what the request and available context already establish; ask only when the answer would materially change the prompt.

1. **Outcome.** State what should be true or delivered at the end. Keep a shape, length, tone, or language only when the user named it or the consumer requires it.
2. **Context.** The prompt usually travels without this conversation, so include the facts the target cannot infer or retrieve; omit what its surface already provides through files, tools, or attachments. In coding or worktree prompts, paths are worktree-relative unless the user needs machine-specific ones.
3. **Boundaries.** Add scope, non-goals, approval limits, or irreversible-action rules only where crossing them would matter, stated once.
4. **Evidence.** Where done could be read more than one way, say what observable check shows it is done. Don't add generic "be thorough" caution.
5. **Controls on demand.** A role, format contract, example, XML boundary, process step, or tool rule goes in only when the consumer requires it or it corrects a likely or observed failure — `references/components-guide.md` is the menu. Use the target's native controls (effort, verbosity, structured output) rather than simulating them in prose.

Special cases: for a `/goal`, read `references/goal-conditions.md` first. For a reusable template, turn each value that genuinely varies into a `{{placeholder}}`; bake specifics into a one-shot. For image, video, or system prompts, start from the matching file in `templates/`.

A one-sentence prompt for a simple task is a feature. If removing a line would not change a competent target's output, cut it.

## Output format

One fenced code block, ready to copy-paste. If a placeholder or target setting needs explaining, add a brief note outside the block; no generic prompting advice.

Non-English prompts: write the body in the requested language; if XML earns its place, keep tag names in English.

## Example

Input: "write me a code review prompt for GPT, keep it short"

```
Review the diff below for correctness bugs, security issues, and unnecessary complexity. Skip style nits.

Report only issues you're confident about, one per line: `file:line — issue — suggested fix`.

<diff>
{{diff}}
</diff>
```

Note outside the block: "Swap `{{diff}}` for the actual diff before sending."

## References (load on demand)

- `references/components-guide.md` — optional controls and when each earns its place
- `references/quality-checklist.md` — deeper check and subtraction pass for high-risk or reusable prompts
- `references/goal-conditions.md` — `/goal` completion conditions and reviewable goal specs
- `references/prompt-patterns.md` — short worked prompts for common task types
- `references/shared-principles.md` — the five principles behind the workflow
- `templates/image-gen.md`, `templates/video-gen.md`, `templates/system-prompt.md` — special-case starting points
