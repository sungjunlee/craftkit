# Gemini

- **XML tags or Markdown headings** — both work as delimiters. Pick one and stay consistent within a prompt. Google officially shows `<context>`, `<task>`, `<role>`, `<constraints>` examples
- **Temperature must stay at 1.0** — Gemini 3's reasoning is optimized for this value. Lowering it causes looping/degradation. Use thinking level (LOW/HIGH) instead of temperature to control reasoning depth
- **Treat Gemini 3 as an execution engine** — direct, efficient prompts work best. The model defaults to concise answers unless told otherwise
- **Strong at math/reasoning** — leads 13 of 16 major benchmarks (Gemini 3.1 Pro, 80.6% SWE-bench). Good fit for calculation and logic
- **Multimodal native** — images, video (up to 120s), audio as first-class inputs. Place media first, questions at the end
- **Prefers few-shot over zero-shot** — provide examples when possible for better results
- Model selection: **3.1 Pro** for complex agents ($2.00/$12.00, 1M context), **3 Flash** for general use (78% SWE-bench, 3x faster than 2.5 Pro), **3.1 Flash-Lite** for bulk tasks ($0.25/$1.50, 2.5x faster TTFT)
- **Imagen 4** (image generation) — three tiers:
  - **Fast** ($0.02/image) — speed-optimized, ~2.7s generation
  - **Standard** ($0.04/image) — flagship quality, up to 2K resolution
  - **Ultra** ($0.06/image) — best photorealism, native 2048x2048
  - Use natural language descriptions — no keyword spam needed. Strong at text rendering and people/faces
- When delivering: suggest setting thinking level HIGH for complex analysis tasks
