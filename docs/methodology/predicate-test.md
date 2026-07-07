# The 3-axis predicate test

A review discipline for deciding whether a written contract — a capability
predicate, an acceptance check, a "done" definition — is safe to commit, or
whether an agent can satisfy it while defeating its intent.

This is one of CraftKit's two durable methodology assets. It is a *review*
discipline, not a generation trick: it survives model capability gains,
because a smarter agent is exactly the thing that finds the loophole in a
loosely written predicate. You can apply it without adopting any CraftKit
skill — it is a way of reading a contract.

## The problem it solves

Any measurable target an agent optimizes against can be gamed. Goodhart's law
("when a measure becomes a target, it ceases to be a good measure") is not a
theoretical worry for agents — it is the default failure mode. Write "all
tests pass" and an agent may weaken the tests. Write "the summary is under 200
words" and an agent may drop the load-bearing sentence. The predicate reads as
satisfied while the intent behind it is gone.

The test is three questions you ask of every predicate *before* you commit it.
A predicate that passes all three is committable. A predicate that fails any
axis is rewritten or split — never rubber-stamped.

## The three axes

1. **Authority axis.** Would the user be unhappy if an agent satisfied this
   measurably but in a way that ignored their intent? If yes, the intent is
   the real contract and the predicate is only a proxy for it — encode the
   missing intent as a sharper predicate, or promote it to a hard constraint
   the work may never cross.

2. **Distributional axis.** Does this predicate hold in unseen code areas or
   unseen workloads, or only in the examples you had in front of you when you
   wrote it? If it only holds locally, restate it as environment-independent,
   or scope it explicitly to the conditions where it holds. A predicate that
   silently assumes today's inputs breaks the first time the inputs change.

3. **Manipulability axis.** Can an agent satisfy this by editing the
   measurement channel rather than the system — changing the test, the metric
   definition, the log line the check reads — instead of changing the thing
   being measured? If yes, the guard has to live *outside* the spec the agent
   edits: a structural restriction, not just sharper prose. Prose an agent can
   rewrite is not a constraint on that agent.

## Positive vs bright-line framing

Classify positive, normal outcomes as expected behaviors — what the system
does when it works. Classify bright-line negations and anti-Goodhart guards as
hard constraints — the lines the work never crosses even under optimization
pressure. When both forms fit, prefer the hard constraint only when the
negative form is what protects against an optimization or data-loss shortcut.

The asymmetry is deliberate: an expected behavior tells an agent what to aim
for; a hard constraint tells it what no amount of cleverness may trade away.

## Worked example

A predicate under review: *"The migration script completes without error."*

- **Authority.** Would the user be unhappy if it "completed without error" but
  silently skipped rows it couldn't parse? Yes. → The intent is *no data
  loss*, not *no thrown exception*. Add a predicate: every input row is either
  migrated or recorded in a rejects file.
- **Distributional.** Does "completes without error" hold on a table 100× the
  size of the test fixture, or under a mid-run connection drop? Unknown as
  written. → Scope it: completes without error *and* is safely re-runnable
  from a partial state.
- **Manipulability.** Can an agent satisfy it by wrapping the body in a
  catch-all that swallows exceptions? Yes, trivially. → Move the guard
  outside the script: an external row-count reconciliation the script cannot
  edit.

The original one-line predicate passed a naive read and failed all three
axes. The rewritten set is committable.

## Where it is applied

CraftKit's `spec-grill` skill applies this test as the admission gate for
every capability predicate it writes into `spec/capabilities.md` — see that
skill's `## The 3-axis predicate test` section for the operational checklist
in context. The test is not specific to `spec-grill`, though: use it whenever
an agent will optimize against something you wrote.

## Related

- [`loop-stop-conditions.md`](loop-stop-conditions.md) — the companion
  discipline: falsifiable exit conditions for agent improvement loops.
