# Shared principles

Five ideas behind a good prompt or a good minimal-diff edit. `craft-prompt` applies them when composing a new prompt; they apply just as directly when judging whether an edit is a real improvement.

1. **Context beats instruction.** Give the target facts, state, and rationale it cannot reliably infer or retrieve. Do not turn available context into a second set of rules.
2. **Outcome over process.** Say what success looks like and let a capable model choose the means. Prescribe order only when sequence, completeness, safety, or a fragile interface makes it load-bearing.
3. **Boundaries over workarounds.** Preserve hard scope, authorization, compatibility, and safety limits. Remove model workarounds when the behavior they corrected is no longer observed.
4. **Earn every control.** Roles, examples, schemas, XML, style rules, and verification steps are controls, not ingredients. Add one because the consumer requires it or because it prevents a concrete failure; otherwise leave it out.
5. **Right-sized beats thorough-looking.** A one-sentence prompt for a simple task is a feature, not a defect. Complexity should follow task risk and ambiguity, not prompt-writing ceremony.
