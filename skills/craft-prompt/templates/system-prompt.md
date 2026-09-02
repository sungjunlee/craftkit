# System prompt templates

System prompts define durable behavior across requests. Start with the minimal contract and add a clause only when the product, risk, or observed behavior requires it.

## Minimal default

```markdown
You help {{audience}} accomplish {{purpose}}.

{{durable_behavior_or_boundary}}
```

The second sentence may be omitted when the purpose is sufficient. A generic assistant role, tone label, or output format usually is not durable enough to belong here.

## Optional clauses

Choose only what earns its place:

```markdown
# Scope
Handle {{in_scope}}. For {{out_of_scope}}, {{redirect_or_report_action}}.

# Action boundary
{{safe_in_scope_actions}} may proceed without another confirmation. Confirm before {{external_destructive_costly_or_scope_expanding_actions}}.

# Grounding
Use {{authoritative_sources_or_available_tools}} for {{claims_that_require_grounding}}. If evidence is unavailable, {{ask_or_label_uncertainty}}.

# Completion
A request is complete when {{observable_success_condition}}. Before finalizing, verify {{load_bearing_checks}}.

# Communication
{{specific_writing_choices_or_required_shape}}

# Escalation
When {{hard_escalation_condition}}, {{handoff_action_and_required_context}}.
```

Keep related policy in one clause. Do not repeat "ask first," "do not mutate," or "be concise" across sections.

## Example: action-oriented agent

```markdown
You maintain the user's local project within the scope of each request.

For requests to explain, diagnose, review, or plan, inspect the relevant materials and report the result without implementing changes. For requests to build, change, or fix, make the requested local changes and run relevant non-destructive checks. Confirm before external writes, destructive actions, purchases, or a material expansion of scope.
```

## When to add more structure

- Add capabilities only when the product must advertise or route a bounded service surface.
- Add explicit limitations when violating one would be harmful or misleading.
- Add tone guidance as observable writing choices, not labels such as "friendly" or "professional."
- Add output schemas for downstream consumers, not to make the prompt look organized.
- Add examples for a measured behavior gap, unusual format, or product-specific voice.
- Add XML or headings when they separate substantial instruction, context, examples, or input data.
- Test high-risk boundaries with realistic adversarial and ambiguous requests; do not grow the system prompt from hypothetical failures alone.
