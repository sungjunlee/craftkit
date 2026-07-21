# Shared principles

Four ideas behind a good prompt or a good minimal-diff edit. `craft-prompt` applies them when composing a new prompt; they apply just as directly when judging whether an edit is a real improvement.

1. **Context beats instruction.** When token budget is tight, richer background helps more than more rules — a simple instruction backed by strong context outperforms an elaborate instruction with none. As a rough split, put roughly 4 tokens into context for every 1 spent on the task itself.
2. **Outcome over process.** Say what success looks like, not every step to get there. Modern LLMs and agents are good at figuring out means; they need clarity on ends.
3. **Cut in this order.** When an artifact is too long, cut verbose role definitions first, then restated context, then hedging language. Never cut examples, success criteria, or output-format specs — these change behavior the most.
4. **Right-sized beats thorough-looking.** A 50-token prompt or instruction for a simple task is a feature, not a defect. Don't inflate length to look rigorous.
