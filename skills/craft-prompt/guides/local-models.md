# Local / Open-Source Models (Llama, Qwen, Mistral, DeepSeek, Ollama, etc.)

- **XML works on current-gen models** — Qwen 2.5+, Llama 3.3+, Mistral 3, and Phi-4 all parse XML tags reliably. For older or smaller models (<7B), use markdown headers (`# Task`, `## Context`) instead
- **Llama 4 family**: Scout (10M token context, 109B/17B active MoE), Maverick (1M context, 400B/17B active MoE). Natively multimodal, 200 languages, native tool use
- **Qwen 3.5 family** (Feb-Mar 2026): Up to 397B MoE, 262K native context extensible to 1M+. Apache 2.0, 201 languages. The 35B-A3B model handles 1M+ on consumer 32GB VRAM GPUs
- **Mistral 3 Large**: 675B MoE (41B active), Apache 2.0, 256K context. Native function calling without special prompting. Small 3 series (3B/8B/14B) runs on phones
- **DeepSeek V3.2**: GPT-5 comparable, 128K context. Integrates thinking directly into tool-use. R1-Distill series available for local execution
- **Keep prompts short** for smaller models — 7B/13B work best under 500 tokens. 70B+ can handle more
- **Chat template matters** — each model family has its own format. Match the model's expected format if pasting into a raw interface
- **Less instruction, more demonstration** — smaller models follow examples better than complex instructions. Prefer few-shot over zero-shot
- **Tool use is spreading** — Llama 4, Mistral 3, Qwen 3, DeepSeek V3.2 all support function calling. Still not universal on smaller/quantized models
- **Test and iterate** — behavior varies widely by quantization level and fine-tune. What works on 70B may fail on 7B
