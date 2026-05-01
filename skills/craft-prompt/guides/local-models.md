# Local / Open-Source Models (Llama, Qwen, Mistral, DeepSeek, Ollama, etc.)

- last reviewed: `2026-05-01`

- **Delimiter support varies by model and chat template.** XML often works on current instruction-tuned models; markdown headers are safer for older, smaller, or raw-completion setups.
- **Keep prompts short** for smaller local models. Move long context into files or retrieval when the runner supports it.
- **Chat template matters** — each model family has its own format. Match the model's expected format if pasting into a raw interface
- **Less instruction, more demonstration** — smaller models follow examples better than complex instructions. Prefer few-shot over zero-shot
- **Tool use is not universal** — verify the runner, quantization, and model card before relying on function calling or tool schemas
- **Avoid model catalog claims** in reusable prompts. Local model names, context windows, licenses, and hardware requirements change quickly.
- **Test and iterate** — behavior varies widely by quantization level and fine-tune. What works on 70B may fail on 7B
