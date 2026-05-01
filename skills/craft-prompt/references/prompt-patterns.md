# Common Prompt Patterns

Patterns for the most frequent prompt types. Each shows the structure, an example, and tips.

---

## 1. Research / Investigation

**When**: "research this for me", "compare X vs Y", "find best practices for..."

```markdown
Research {{topic}} as of {{date/year}}.

Focus on:
1. {{question_1}}
2. {{question_2}}

For each, provide:
- Current consensus
- Key trade-offs
- Sources (with URLs if available)
- Confidence level and what would change the answer

Prioritize {{source_preference}} (e.g., recent, production-focused, academic).
Ignore results older than {{cutoff_year}}.
Verify important claims across more than one source when possible.
```

**Tips**:
- Always specify recency — LLMs default to training data
- "Compare in a table" works great for multi-option research
- For Perplexity: add "cite sources with URLs"
- For complex research: define success criteria and ask for source verification, not just citations

---

## 2. Code Generation

**When**: "build this feature", "write a function that...", "build an API for..."

```markdown
# Context
{{tech_stack, existing code patterns, dependencies}}

# Task
Write {{what}} that {{does_what}}.

# Requirements
- {{requirement_1}}
- {{requirement_2}}

# Constraints
- Match the existing code style in {{reference_file}}
- Handle errors: {{error_handling_approach}}
- Include tests
- Before finalizing, verify requirements, error paths, and formatting

# Output
{{language}} code. No explanations unless the logic is non-obvious.
```

**Tips**:
- Include existing code patterns — LLMs match style better with examples
- "No explanations" saves tokens if you just want code
- For Claude Code: reference file paths, it can read them
- For worktree-based coding prompts: use paths relative to the current worktree root, not absolute machine paths
- Add tool-use or delegation rules only when the task genuinely needs them; broad persistence instructions can create overwork on newer models

---

## 3. Code Review / Analysis

**When**: "review this code", "review this PR", "find bugs in..."

```markdown
Review the following code for:
1. **Correctness** — logic errors, edge cases
2. **Security** — injection, auth, data exposure
3. **Performance** — complexity, memory, unnecessary work
4. **Readability** — naming, structure, unnecessary complexity

For each issue found:
- Severity: Critical / High / Medium / Low
- Location: file:line (relative to repo/worktree root) or function name
- Problem: what's wrong
- Fix: how to fix it

Code:
~~~{{language}}
{{code}}
~~~

Be direct. Skip praise. Only report actual issues.
```

**Tips**:
- "Skip praise" prevents the "this is well-written, however..." padding
- Severity ratings make the output actionable
- For large codebases: provide file paths, not pasted code

---

## 4. Writing / Content Creation

**When**: "write a doc about this", "write a blog post about...", "draft an email..."

```markdown
# Role
You are a {{writer_type}} writing for {{audience}}.

# Task
Write a {{content_type}} about {{topic}}.

# Tone
{{tone_description}} (e.g., professional but conversational, technical but accessible)

# Structure
{{outline_or_structure_guidance}}

# Constraints
- Length: {{word_count_or_range}}
- {{style_constraints}}

# Source material
{{raw_notes, data, or key points to include}}
```

**Tips**:
- Providing raw notes/data produces much better output than "write about X"
- Tone guidance is critical — otherwise you get generic AI-voice
- Specify what NOT to include: "No generic introductions", "Skip the conclusion"

---

## 5. System Prompt / Persona

**When**: "create a chatbot system prompt", "create a custom GPT instruction", "build a persona..."

System prompts have a well-established layered architecture. See `templates/system-prompt.md` for the full template (Identity → Capabilities → Behavior → Boundaries → Verification → Escalation → Output format) with both full and minimal versions.

**Key insight**: "You cannot" is as important as "You can" — without explicit limits, LLMs scope-creep. For chatbots with human fallback, the Escalation layer is critical.

---

## 6. Data Extraction / Transformation

**When**: "extract info from this text", "extract from...", "convert this to..."

```markdown
Extract the following from the text below:

| Field | Type | Notes |
|-------|------|-------|
| {{field_1}} | string | {{description}} |
| {{field_2}} | number | {{description}} |
| {{field_3}} | string or null | null if not found |

Output as JSON. No explanation, just the JSON.

Text:
"""
{{input_text}}
"""
```

**Tips**:
- Explicit schema with types prevents format guessing
- "or null" for optional fields prevents hallucination
- "No explanation, just the JSON" is essential for parsing

---

## 7. Session Handoff (Agent CLI)

**When**: "make a prompt to continue in a new session", "hand off to a new session"

Hand off context from one AI coding session to another. The key is compressing what was done, what's next, and what state the code is in — all in under 800 tokens.

Two variants: **Continuation** (pick up where you left off) and **Debug** (hand off a problem).

See `templates/session-handoff.md` for ready-to-use templates and tips.

---

## 8. Decision / Analysis

**When**: "analyze this", "should I use X or Y?", "pros and cons of..."

```markdown
Analyze {{topic/decision}}.

## Context
{{background_and_constraints}}

## Options
1. {{option_1}}
2. {{option_2}}
3. {{option_3}} (if applicable)

## Evaluate each option on:
- {{criterion_1}}
- {{criterion_2}}
- {{criterion_3}}

## Output
For each option: strengths, weaknesses, and risks.
Then: your recommendation with reasoning.
Be opinionated — don't hedge with "it depends on your needs."
```

**Tips**:
- "Be opinionated" prevents wishy-washy non-answers
- Explicit criteria focus the analysis
- Include your constraints so the LLM can reason about trade-offs
