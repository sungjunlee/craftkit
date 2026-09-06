# Failure modes reference

A diagnostic vocabulary for reviewing prompts and skills. Use it when a critique keeps surfacing the same vague complaint and you need sharper names for what is wrong. It is a lens, not a report format — the write-up shape stays as `craft-critique` § Output format defines it, and a single artifact can fail in several categories at once.

Read each table as *symptom → candidate repair*, with two conditions on the right-hand column:

- **The symptom has to be evidenced.** Either something went wrong in an output you can point at, or inspection establishes the defect concretely — a rule and an example that contradict each other, a required field the artifact never produces. Both justify a fix; a proven contradiction does not have to wait for a production failure. What does not justify one is a repair for a failure nobody has seen and nothing in the artifact implies: label that a hypothesis, or leave it out. Prescribing against imagined failures is how artifacts accrete rules that never earned their place.
- **The repair has to fit the artifact's actual contract.** If a downstream consumer parses the output, its required format wins over anything suggested here; if the artifact's caller has already authorized an action, a fix that re-adds confirmation removes capability the user asked for. Read the reference files, surrounding instructions, and caller/consumer contracts that are reachable before recommending a change to the artifact's output or its permissions.

## Ambiguity failures

The artifact leaves room for the agent to guess.

| Symptom | Likely fix |
|---|---|
| Agent asks "did you mean X or Y?" | Tighten the objective statement; add one disambiguating sentence. |
| Output format varies run-to-run | State what the output must convey; add an explicit template only when a consumer parses the format or when conveyance rules didn't hold. |
| Agent makes a wrong default assumption | Surface the assumption as explicit context. |
| Different agents interpret the same prompt differently | Remove idioms; use explicit structure (sections, tags, templates). |
| Rules, examples, or exception cases contradict each other | Make the instruction hierarchy explicit; delete or rewrite the lower-priority instruction. |

## Scope failures

The artifact invites the agent to do too much, too little, or the wrong thing.

| Symptom | Likely fix |
|---|---|
| Agent adds features or refactors beyond the ask | Add a "non-goals" line and a "only do X" constraint. |
| Agent stops early or declares success prematurely | Enumerate all deliverables in the success criteria. |
| Output is too verbose | Name what the extra material costs the reader; a hard cap only where a real limit exists (a field, a screen, a budget). |
| Output is too terse or skeletal | Require reasoning or add a richer example. |
| Agent uses tools, files, or subagents when a direct answer would do | Add criteria for when external action is warranted; remove stale "keep going" or "use tools aggressively" language. Check first that the caller didn't ask for the extra work. |

## Context failures

The artifact omits background the agent needs to act correctly.

| Symptom | Likely fix |
|---|---|
| Agent hallucinates file paths or identifiers | Include the real file list or naming scheme in context. |
| Agent uses machine-specific absolute paths | State the base directory once; require worktree-relative paths. |
| Agent uses the wrong library or version | Name the version and any conventions up front. |
| Agent ignores project conventions | Reference the convention source (style guide, lint config, neighbors). |
| Handoff-style prompt starts reasoning from scratch | Include a concise "what was done / current state / next" block. |
| Agent proceeds despite missing required facts | Add a missing-context rule: look up if available, ask a minimal question if not, or proceed with labeled assumptions. |

## Portability failures

The artifact works for one agent or provider and breaks elsewhere.

| Symptom | Likely fix |
|---|---|
| Relies on a provider-specific tool name or feature | Name the capability generically; describe the contract, not the tool. |
| Multi-section structure is ambiguous when the artifact moves between agents | Pick one delimiter convention and apply it consistently; where a consumer requires a format, that requirement decides. No format is universally portable — verify against the agents the artifact actually runs on. |
| Assumes a specific file-system layout | Either make the layout explicit, or parameterize the relevant paths. |
| Embeds tool-call syntax inline | Describe the intent and let each agent translate into its own tool surface. |

## Verification failures

The artifact produces plausible outputs but does not force the right final checks.

| Symptom | Likely fix |
|---|---|
| Output matches the requested format but misses a stated requirement | Add a final requirements check or success-criteria checklist. |
| Research or analysis includes unsupported claims | Require grounding against provided context, named sources, or retrieved evidence. |
| Agent finalizes after a partial edit | Add a completion check that distinguishes "partially fulfilled" from "done." |
| Agent takes destructive or externally visible actions the caller did not authorize | Add an action-safety rule for irreversible, shared-system, or published changes — scoped to what is genuinely unauthorized, so a workflow the user explicitly asked to run unattended keeps working. |

## Structure failures

The artifact is readable but its shape doesn't match its job.

| Symptom | Likely fix |
|---|---|
| Purpose, constraints, and output shape are all mixed together | Separate into distinct sections; one concern per block. |
| A single section carries too much weight | Split, or push detail into a reference file and link to it. |
| Sections exist but don't earn their keep | Delete. An always-ignored section actively reduces signal. |
| Example contradicts the rules | Rewrite the example to match, or relax the rule if the example is correct. |
