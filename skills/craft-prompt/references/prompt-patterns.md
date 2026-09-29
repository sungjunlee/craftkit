# Prompt patterns

Short worked prompts for common task types. Each is an outcome, the context the target lacks, the boundaries that matter, and the evidence of done — nothing else. Treat them as shapes to adapt, not forms to fill; drop any line the request does not need.

## Research

```text
I'm deciding {{decision}} for {{who_or_what_it_is_for}}. Research {{question}}.

Use sources current as of {{date}} and cite them. Where sources disagree or evidence is thin, say so and what would settle it. End with a recommendation.
```

Add a date only when the answer can change over time. Name source preferences only when the default would pick the wrong kind.

## Code change (coding agent)

```text
{{change}} so that {{observable_outcome}}.

{{load_bearing_context: why, current state, constraint the agent cannot discover}}
Keep {{must_not_change}} unchanged. Done when {{check}} passes.
```

Point at files only when the agent cannot find them efficiently. Leave out reminders to read the codebase or run tests; say what done means instead.

## Review

```text
Review {{artifact}} for {{what_matters_here}}. Skip {{what_does_not}}.

Report only issues you are confident about, one per line: `location — issue — fix`.
```

Name the risk that matters for this artifact rather than a generic category list. Add severity only when someone will triage by it.

## Writing

```text
Write {{content_type}} for {{audience}}, who need to {{what_the_reader_does_with_it}}.

Source material:
{{notes_or_data}}

{{length_or_shape_if_the_consumer_requires_one}}
```

Raw notes and a named reader do more than tone labels. Describe a concrete voice only when the default voice has already missed.

## Extraction

```text
Extract these fields from the text as JSON: {{field}} ({{type}}), … Use null for a field the text does not state.

<text>
{{input}}
</text>
```

Prefer the target's native structured-output mode over prose schema instructions when it has one.

## Decision

```text
Help me choose between {{options}} for {{context_and_constraints}}. The criteria that matter: {{criteria}}.

Give a recommendation and the one or two facts that would change it.
```

## System prompt

See `templates/system-prompt.md`: a minimal durable purpose, plus only the scope, action, or escalation clauses that must hold across requests.
