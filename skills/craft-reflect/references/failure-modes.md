# Failure Modes Reference

A diagnostic spine for reviewing prompts and skills. Use this after the main `craft-reflect` pass when the top-level issues list isn't specific enough, or when a review keeps surfacing the same vague complaint and you need a sharper vocabulary.

Organize findings by category. A single artifact can fail in multiple categories at once.

## Ambiguity failures

The artifact leaves room for the agent to guess.

| Symptom | Likely fix |
|---|---|
| Agent asks "did you mean X or Y?" | Tighten the objective statement; add one disambiguating sentence. |
| Output format varies run-to-run | Add an explicit output template with a worked example. |
| Agent makes a wrong default assumption | Surface the assumption as explicit context. |
| Different agents interpret the same prompt differently | Remove idioms; use explicit structure (sections, tags, templates). |

## Scope failures

The artifact invites the agent to do too much, too little, or the wrong thing.

| Symptom | Likely fix |
|---|---|
| Agent adds features or refactors beyond the ask | Add a "non-goals" line and a "only do X" constraint. |
| Agent stops early or declares success prematurely | Enumerate all deliverables in the success criteria. |
| Output is too verbose | Add a length cap (words, sections, bullets). |
| Output is too terse or skeletal | Require reasoning or add a richer example. |

## Context failures

The artifact omits background the agent needs to act correctly.

| Symptom | Likely fix |
|---|---|
| Agent hallucinates file paths or identifiers | Include the real file list or naming scheme in context. |
| Agent uses machine-specific absolute paths | State the base directory once; require worktree-relative paths. |
| Agent uses the wrong library or version | Name the version and any conventions up front. |
| Agent ignores project conventions | Reference the convention source (style guide, lint config, neighbors). |
| Handoff-style prompt starts reasoning from scratch | Include a concise "what was done / current state / next" block. |

## Portability failures

The artifact works for one agent or provider and breaks elsewhere.

| Symptom | Likely fix |
|---|---|
| Relies on a provider-specific tool name or feature | Name the capability generically; describe the contract, not the tool. |
| Uses only one format (e.g., markdown or XML) in a mixed-agent workflow | Prefer XML tags for multi-section structure — they travel across Claude, GPT, and Gemini. |
| Assumes a specific file-system layout | Either make the layout explicit, or parameterize the relevant paths. |
| Embeds tool-call syntax inline | Describe the intent and let each agent translate into its own tool surface. |

## Structure failures

The artifact is readable but its shape doesn't match its job.

| Symptom | Likely fix |
|---|---|
| Purpose, constraints, and output shape are all mixed together | Separate into distinct sections; one concern per block. |
| A single section carries too much weight | Split, or push detail into a reference file and link to it. |
| Sections exist but don't earn their keep | Delete. An always-ignored section actively reduces signal. |
| Example contradicts the rules | Rewrite the example to match, or relax the rule if the example is correct. |

## Failure-mode review template

When using this reference, write the review in this shape:

```
### Findings by category

Ambiguity:
- <issue> → <fix>

Scope:
- <issue> → <fix>

Context:
- <issue> → <fix>

Portability:
- <issue> → <fix>

Structure:
- <issue> → <fix>

### Top three fixes
1. <highest leverage change>
2. <second>
3. <third>
```

Keep the "Top three fixes" list short. A review that surfaces twenty issues but doesn't rank them pushes prioritization work back onto the user.
