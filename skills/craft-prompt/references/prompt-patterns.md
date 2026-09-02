# Common Prompt Patterns

Patterns for the most frequent prompt types. Each shows the structure, an example, and tips.

---

## 1. Research / Investigation

**When**: "research this for me", "compare X vs Y", "find best practices for..."

```markdown
Research {{topic}}.

Focus on:
1. {{question_1}}
2. {{question_2}}

For each, provide:
- Current consensus
- Key trade-offs
- Sources (with URLs if available)
- Confidence level and what would change the answer

Prioritize {{source_preference}}. For claims that may have changed, establish their status as of {{date}}.
Verify material claims to the degree their risk and uncertainty warrant.
```

**Tips**:
- Specify recency when the answer can change; do not add a date ritual to timeless questions
- "Compare in a table" works great for multi-option research
- If the target does not cite sources by default, require citations in the needed shape
- For complex research: define success criteria and ask for source verification, not just citations

---

## 2. Code Generation

**When**: "build this feature", "write a function that...", "build an API for..."

```markdown
# Context
{{tech_stack, existing code patterns, dependencies}}

# Task
Write {{what}} that {{does_what}}.

Success means {{observable_behavior_or_check}}.

Preserve {{load_bearing_constraint}}.

# Output
Implement the change in the current worktree and report the result and verification.
```

**Tips**:
- Point to existing code patterns only when the agent cannot discover them efficiently itself
- "No explanations" saves tokens if you just want code
- For Claude Code: reference file paths, it can read them
- For worktree-based coding prompts: use paths relative to the current worktree root, not absolute machine paths
- Add tests, tool-use, or delegation rules only when the task or repository requires them; broad persistence instructions can create overwork

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

Start with a minimal durable purpose and add only the boundaries or behavior that must hold across requests. See `templates/system-prompt.md` for optional scope, action, grounding, completion, communication, and escalation clauses.

For action-taking agents, authorization and external-action boundaries are usually more valuable than long capability lists. For chatbots with human fallback, state the actual escalation trigger and required handoff context.

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

## 7. Decision / Analysis

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
