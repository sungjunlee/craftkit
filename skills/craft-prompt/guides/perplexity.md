# Perplexity

- **Search-first architecture** — prompts trigger web search, then results are synthesized. Structure your prompt as a research query, not a task instruction
- **System prompt limitation** — the search component does NOT reference the system prompt. Search constraints (source filtering, date ranges) must go in the user prompt. System prompt only affects response style/tone
- **Always request citations** — "Cite sources with URLs". Note: citations can be inaccurate, so verify important URLs directly
- **Set recency filters** — "as of 2026", "Ignore results older than 2024"
- **Search operators** — `after:2024` for current results, `site:arxiv.org` for academic, `filetype:pdf` for docs, `-site:` to exclude, `inurl:` supported. Must be in user prompt, not system prompt
- **Keep prompts focused** — 100-500 tokens is optimal. Split complex research into multiple queries rather than one mega-prompt
- **Focus modes** — Web (default), Academic (peer-reviewed), Writing (drafting/editing), Math (Wolfram Alpha-powered), Video (YouTube/video transcripts), Social (Reddit + X + forums). Finance mode available for Pro/Max (SEC filings, ETF holdings)
- **Perplexity Labs** — builds reports, dashboards, and simple web apps using deep browsing + code execution. Not a replacement for dedicated coding tools
- When delivering: suggest Pro Search for thorough results; Deep Research for multi-step investigation (2-4 min, runs on Opus 4.6 for Pro/Max users); Model Council to compare outputs across frontier models
