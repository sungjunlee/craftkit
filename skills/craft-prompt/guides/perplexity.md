# Perplexity

- last reviewed: `2026-05-01`

- **Search-first architecture** — prompts trigger web search, then results are synthesized. Structure your prompt as a research query, not a task instruction
- **System prompt limitation** — the search component does NOT reference the system prompt. Search constraints (source filtering, date ranges) must go in the user prompt. System prompt only affects response style/tone
- **Always request citations** — "Cite sources with URLs". Note: citations can be inaccurate, so verify important URLs directly
- **Set recency filters** — "as of 2026", "Ignore results older than 2024"
- **Search operators** — `after:2024` for current results, `site:arxiv.org` for academic, `filetype:pdf` for docs, `-site:` to exclude, `inurl:` supported. Must be in user prompt, not system prompt
- **Keep prompts focused** — 100-500 tokens is optimal. Split complex research into multiple queries rather than one mega-prompt
- **Use focus or mode settings only after checking the current UI** — mode names and plan availability change quickly
- **Research verification matters** — citations are a starting point, not proof. For important claims, ask the model to cross-check sources and then verify key URLs directly.
- When delivering: recommend the current search/deep-research mode only if the user named the Perplexity product surface or you have checked the current UI/docs.
