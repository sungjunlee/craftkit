### What is working

- Clear five-step process, each step with a distinct job.
- The process mirrors the improvement-skill family (interview → gather → build → sharpen → deliver), so agents who know the other skills transfer knowledge cleanly.
- Platform-specific guides, references, and templates are linked with one-line purposes each, letting progressive disclosure carry weight instead of the main body.
- Korean triggers live in the description where Claude Code actually reads them, rather than in a separate `triggers:` field.
- "The prompt is the product" is a strong single-line north star that survives even when the rest drifts.

### Issues

1. Process Step 4 (Sharpen) and the Principles section overlap — both preach "cut in this order," "context > instruction," and "reusability when asked" with slightly different wording. The reader learns the same point twice with unclear precedence.
2. The target-LLM table in Step 3 embeds dated provider claims ("XML officially recommended from GPT-4.1+," "Claude parses XML best") in the main skill body. Those claims drift, and the table already duplicates the preceding "XML works well across all major LLMs" sentence.
3. Step 2's "Session handoff" bullet says "Proactively gather: `git status`, `git diff --stat`, `git log --oneline -5`." This assumes the skill is running inside a git-aware coding agent, which is not guaranteed for every context in which the skill is invoked.
4. The Non-English prompts guidance is tucked at the end of Step 5. For a Korean-triggered user ("프롬프트 만들어" is a listed trigger) this is operationally critical but visually buried.
5. Six Principles after a five-step Process produces guidance fatigue; without a visual break the two blocks blur into each other.

### Recommended changes

- Merge Step 4 (Sharpen) and overlapping Principles into one shorter guidance block; keep in Principles only the true north-stars ("The prompt is the product") and move tactical checks into Step 4.
- Move the per-LLM table into `guides/overview.md` (or similar) and leave Step 3 with a two-sentence pointer plus "XML is the portable default."
- Gate the session-handoff `git status / diff / log` commands behind "if the skill is running inside a coding agent" so the skill does not overreach in other contexts.
- Promote Non-English prompts to a dedicated one-paragraph note near the top, not the tail of Step 5.
- Reduce Principles from six to three — the rest are already implicit in the Process.

### Failure modes

- Agents apply Sharpen checks and Principles as two separate passes and duplicate work.
- Platform-specific claims drift out of date and the skill produces stale advice on model-version specifics.
- Skill invoked outside a coding agent runs git commands that fail or — worse — run against the wrong repository.
- Korean-language users don't see the Non-English note and ship prompts with awkward bilingual framing.
- Users who read only Principles miss Process-level discipline and vice versa, because the two sections cover overlapping ground without clear precedence.

### Minimal rewrite plan

1. Promote Non-English prompts to a top-of-body note above Step 1.
2. Slim Principles to the three that aren't already covered in the Process.
3. Move the per-LLM table into a guides file and leave a two-sentence lead.
4. Gate session-handoff git commands on coding-agent context.
