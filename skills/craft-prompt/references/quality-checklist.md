# Prompt Quality Checklist

## Quick Check (6 items)

- [ ] **Self-contained** — Can the LLM execute this without asking clarifying questions?
- [ ] **Actionable** — Is there a clear deliverable, not just context?
- [ ] **Right-sized** — No unnecessary scaffolding or over-specification?
- [ ] **Testable** — Are success criteria concrete and verifiable?
- [ ] **LLM-appropriate** — Formatted for the target LLM's strengths?
- [ ] **Path-safe** — File paths use the right base directory (usually the current worktree root) and avoid unnecessary absolute paths

## Deep Check (by failure mode)

### Ambiguity Failures

| Symptom | Fix |
|---------|-----|
| LLM asks "did you mean X or Y?" | Add specificity to the Task block |
| Output format varies between runs | Add explicit Format block with example |
| LLM makes wrong assumptions | Add Context with the correct background |
| Different LLMs interpret differently | Remove idioms, use explicit structure |

### Scope Failures

| Symptom | Fix |
|---------|-----|
| LLM does too much (adds features) | Add Constraints: "Only do X, nothing else" |
| LLM does too little (stops early) | Add success criteria listing all deliverables |
| Output is too verbose | Add Format: word/token limit |
| Output is too terse | Add Format: "include reasoning" or add examples |

### Context Failures

| Symptom | Fix |
|---------|-----|
| LLM hallucinates file paths | Include actual file list in Context |
| Prompt uses machine-specific absolute paths | Rewrite paths relative to the current worktree root; state the base once if needed |
| LLM uses wrong library version | Specify version in Context |
| LLM ignores project conventions | Add Constraints with convention references |
| Handoff session starts from scratch | Include git log / diff summary in Context |

### Target LLM Failures

| Symptom | Fix |
|---------|-----|
| Claude ignores structure | Use XML tags instead of markdown |
| GPT output is messy | Use XML tags or markdown headers; add "Be concise" |
| Perplexity doesn't cite sources | Ask explicitly: "Cite sources with URLs" |
| Gemini gives shallow analysis | Prompt: "Think carefully, consider multiple approaches." Also suggest setting thinking_budget high when delivering |

## Token Budget Guide

| Prompt Size | Typical Use | Warning |
|-------------|-------------|---------|
| < 200 tokens | Simple tasks | Fine for most LLMs |
| 200-500 tokens | Standard tasks with context | Sweet spot |
| 500-1000 tokens | Complex handoffs, rich context | Watch limits on smaller models |
| 1000-2000 tokens | Context + examples | Ensure each token earns its place |
| > 2000 tokens | Probably over-engineered | Split into multiple prompts or use file references |
