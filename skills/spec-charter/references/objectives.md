# Objective Predicates: Good vs. Bad

Use this reference in `spec-charter` create mode (or amend, when adding objectives) to write Tier 2 entries. An Objective is a **verifiable predicate** — a statement that can be checked true or false against the world, not a task to do or an aspiration to feel good about.

The default shape (lean, status-free):

> `O<n> — <verifiable predicate> · src: <user|inferred|execution>`

The predicate should map to a verification path you could write down today: a command to run, a scenario to walk through, a count to take. If you cannot name the verification, the predicate is not yet verifiable — sharpen it before committing it to the charter.

Do not add `[active]` / `[implemented]` / `[validated]` / `[deferred]` unless the user asked for the opt-in status ladder.

## ✅ Good Predicates

Each example pairs a predicate with a concrete check. On a lean charter the check is how you *know* the predicate still holds — not a status to stamp on the line. Prefer predicates a consumer can observe.

1. **"A user can pull open GitHub issues into `backlog/tasks/` without API tokens beyond `gh auth`"**
   *Check:* run `node scripts/sync-pull.js` against a fresh repo; assert `backlog/tasks/*.md` exists and no token was prompted.

2. **"An agent resuming a sprint mid-session sees in-flight `[~]` items it did not author and can act on them without re-asking the user"**
   *Check:* open the active sprint file in a fresh session; confirm `[~]` markers + PR refs are readable.

3. **"A user can answer 'is this project still on track?' in under 5 minutes against `spec/charter.md`"**
   *Check:* timed read + answer against the live charter.

4. **"Every open Issue maps to an Objective without manual triage"**
   *Check:* `backlog-triage` Alignment Check report shows 0 orphans on the current backlog.

5. **"A new contributor reads `spec/charter.md` in under 5 minutes and can name one explicitly rejected scope"**
   *Check:* word count + Non-Goals section non-empty + onboarding scenario.

Notice the shape: each one names **who** does **what** with a **measurable outcome**. None of them say "improve" or "implement."

## ❌ Bad Predicates (and How to Rewrite Them)

1. **"Improve sync performance"**
   *Failure:* vague aspiration — no threshold, no observation point.
   *Rewrite:* "`sync-pull` of 100 open issues completes in under 5s on a warm cache."

2. **"Implement OAuth"**
   *Failure:* a task, not an outcome.
   *Rewrite:* "A user signs in with Google and reaches their dashboard within one click of the login button."

3. **"Better DX"**
   *Failure:* unfalsifiable opinion.
   *Rewrite:* "An agent dispatches a relay run with one command and no manual edits to manifest files."

4. **"Adopt charter everywhere"**
   *Failure:* process declaration, not a user-facing outcome.
   *Rewrite:* "Every active project in this workspace has a committed `spec/charter.md`."

5. **"Reduce context loss across sessions"**
   *Failure:* direction without verification.
   *Rewrite:* "An agent reading only `_context.md` + the active sprint file resumes the previous session's in-flight work without asking the user."

## Common Rewrite Patterns

| If the draft is... | The fix is... |
|--------------------|---------------|
| Vague aspiration ("improve", "better") | Add a threshold or a binary observation. |
| A task ("implement X") | Restate as what the user observes when X exists. |
| An opinion ("better DX") | Name actor + action + observable. |
| A process declaration ("adopt Y") | Convert to a count or coverage statement. |
| A direction ("reduce Z") | Bind to a single scenario with a yes/no outcome. |

## The 30-Second Test

Before committing a new Objective, read it aloud and answer: *what would I look at, right now, to decide if this is true?* If the answer is "I don't know" or "it depends on who you ask," the predicate is not yet ready. Sharpen, then commit.
