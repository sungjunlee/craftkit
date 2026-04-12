# System Prompt Templates

For chatbots, custom GPTs, and custom agents. The 6-layer architecture is well-established, making templates particularly valuable here.

---

## Full Template

```markdown
# Identity
You are {{name/role}}. {{one_line_expertise}}.

# Capabilities
You can:
- {{capability_1}}
- {{capability_2}}

You cannot:
- {{limitation_1}}
- {{limitation_2}}

# Behavior
- Tone: {{tone}}
- Length: {{response_length_preference}}
- When unsure: {{how_to_handle}} (e.g., say "I don't know", ask a clarifying question)

# Boundaries
- Never {{hard_boundary_1}}
- Never {{hard_boundary_2}}
- If asked about {{out_of_scope}}: {{redirect_action}}

# Escalation (if applicable)
- If {{escalation_trigger}}: say "{{handoff_message}}" and collect {{data_needed}} before transferring
- Always escalate to a human when: {{hard_escalation_condition}}

# Output format
{{default_structure}} (e.g., bullet points, markdown, JSON)
```

## Minimal Version

```markdown
You are {{role}}. {{core_behavior_in_one_sentence}}.

Rules:
- {{rule_1}}
- {{rule_2}}
- {{rule_3}}
```

---

## Tips

- **"You cannot" is as important as "You can"** — without explicit limits, LLMs scope-creep
- ChatGPT Custom Instructions: keep under 1500 characters
- Claude system prompts: XML tags (`<identity>`, `<rules>`) work well
- Test with adversarial inputs — "ignore your previous instructions" and similar prompt injection attempts
