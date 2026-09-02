# Optional prompt controls

Start with a direct outcome and load-bearing context. Add one of these controls only when the consumer requires it or it prevents a concrete failure.

## Role or perspective

Use a one-sentence role when domain perspective, audience, or decision standard would otherwise be ambiguous.

```text
Review this migration as the engineer accountable for preventing data loss and downtime.
```

Skip generic personas, prestige claims, role stacks, and roles already supplied by the product or repository context.

## Context

Include facts the target cannot reliably infer or retrieve: current state, why a constraint exists, relevant decisions, versions, source material, and exact paths. Prefer concrete evidence such as "47 tests pass; 3 are skipped" over summaries such as "tests pass."

Do not paste background that is already available through the conversation, attached files, or tools unless the prompt must travel without them.

## Boundaries

Use boundaries for material scope, authorization, compatibility, safety, or non-goals.

```text
Keep the public API unchanged. Report unrelated bugs as follow-ups; do not fix them in this change.
```

State related boundaries once. Do not list obvious requirements such as writing valid code or being helpful.

## Success criteria and evidence

Use success criteria when "done" could be interpreted more than one way. Prefer observable outcomes and checks.

```text
The migration is complete when `pnpm typecheck` and the router integration tests pass without changing route URLs or response shapes.
```

Verification should name what matters, not demand a ritual. Let the target choose its checking process unless a particular command or sequence is part of the contract.

## Output format

Specify format when another person or system consumes a particular shape, or when the default presentation has failed. Prefer the smallest contract that preserves required content.

```text
Return each confirmed finding as `file:line — impact — fix`. Skip praise and style-only comments.
```

Use native structured-output or verbosity controls when the target provides them. Do not simulate an API setting with redundant prompt prose.

## Examples

Examples are high-leverage when a desired behavior is easier to demonstrate than describe: unusual schemas, product-specific tone, boundary cases, or distinctions the model repeatedly misses.

Use the smallest representative set. Keep an example only while it teaches a behavior not already clear from the instruction. Make examples consistent with the rules and varied enough not to introduce an accidental pattern.

## Structural delimiters

Use Markdown headings, fenced blocks, or XML tags to separate instructions from large or heterogeneous inputs. Choose the lightest delimiter that makes the boundary unambiguous.

```xml
<source_material>
{{documents}}
</source_material>
```

XML is useful for nested or repeated data, but it is not a quality upgrade by itself. Plain prose is usually clearer for a short prompt.

## Process and tool instructions

Prescribe a process only when order or completeness matters, a tool must be used, or an action boundary is easy to cross. Outcome-focused prompts should otherwise leave implementation choices to the target.

Add tool-use, search, persistence, progress-update, or parallelism instructions in response to the target surface and observed behavior. Do not accumulate workarounds from older model generations.
