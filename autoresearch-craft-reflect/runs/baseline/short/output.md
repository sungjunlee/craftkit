### What is working

- Intent is clear at the concept level — the user wants a review of a draft.
- Short enough to edit in one pass.

### Issues

1. "Expert" is undefined — expert at what? Legal, code, copywriting, medical? The agent must guess, and different agents will guess differently.
2. "Draft" has no referent — the prompt does not embed the draft or point to a file/URL. The agent cannot act on a thing it cannot see.
3. "What's wrong" frames the review as purely negative, so the output will be a nit list with no recognition of strengths and no prioritization.
4. "Be thorough" has no bound. The output may run thousands of words on a small draft or be three bullets on a large one, depending on model mood.
5. No output format — no structure, no length cap, no prioritization scheme — so the shape of the response drifts between runs and between models.

### Recommended changes

- Replace "expert" with a specific domain (e.g. "senior backend engineer," "copy editor for SaaS marketing") to calibrate depth and register.
- Surface "draft" into the prompt itself — either embed it inline or reference a specific file path or URL the agent can read.
- Replace "what's wrong" with a balanced brief: what's working, what's weak, what to change first.
- Cap thoroughness: bound the output (e.g. "Top 5 issues, each one line").
- Add an explicit output template so the structure stays consistent across runs.

### Failure modes

- Agent produces a wall of stylistic nits because "thorough" rewards breadth over substance.
- Agent reviews the wrong artifact because "my draft" has no referent.
- Output shape varies wildly between runs on the same prompt.
- Different models interpret "expert" with different tone and depth; the prompt is not portable.

### Minimal rewrite plan

1. Add a role line with a specific domain.
2. Inline or explicitly reference the draft.
3. Replace the goal with a three-part brief (strengths / issues / priority).
4. Add a capped, ordered output template.
