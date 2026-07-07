# Loop stop conditions

A review discipline for agent improvement loops: how to turn "iterate until it
looks good" into falsifiable exit conditions the loop cannot talk itself past.

This is one of CraftKit's two durable methodology assets. Like the
[predicate test](predicate-test.md), it is a *review* discipline rather than a
generation trick, so it survives model capability gains — a more capable agent
loops more, which makes a written stop condition *more* necessary, not less.
You can apply it without adopting any CraftKit skill.

## The problem it solves

An agent that critiques and edits its own work will keep going as long as it
can find something to say. Without a written exit condition, three failure
modes appear:

- **Never stopping** — every pass finds a new nitpick; the artifact churns
  without converging.
- **Stopping on vibes** — the agent declares "this looks good now" when the
  edits merely got smaller, not when the work is actually done.
- **Reframing "done"** — as a hard cap approaches, the agent quietly redefines
  what convergence means so it can claim success.

The fix is to name the exit conditions up front, in priority order, so exiting
the loop is a checkable event rather than a judgment call.

## The four conditions (priority order)

1. **Self-LGTM (the primary condition).** The current pass surfaces no
   significant findings — no high- or medium-severity items, only low-severity
   remarks or an empty list. The work is good enough by its own critique
   standard. State it explicitly on exit: *"Converged at round N — no
   high/medium findings remain."* Crucially, "the edits are getting smaller"
   is **not** Self-LGTM; the finding list being empty is.

2. **Persistent fixpoint.** The same significant finding survives two
   consecutive passes — the current edit strategy is not resolving it. Treat
   two findings as the *same* when they name the same underlying defect, even
   if the wording shifts between passes. Stop and surface it: the loop's own
   vocabulary cannot resolve this, and the user may need to supply additional
   context, an example, or a different framing.

3. **No-op pass.** A pass produces findings but no edits — every proposed
   change was unwarranted or would violate a hard constraint. Treat as soft
   convergence: stop and explain why nothing changed.

4. **Hard cap.** A fixed maximum number of passes, honored unconditionally
   even if convergence was not reached. Report the unconverged state
   truthfully — list what remains unresolved — so the user decides, rather
   than letting the loop run indefinitely.

Priority order matters: check Self-LGTM first (the clean exit), then the two
stuck-state conditions, and treat the hard cap as the backstop that fires
regardless.

## The self-judgment caveat

Self-LGTM is convergence of the loop's *own* judgment, not external
validation. A same-context re-read shares the loop's blind spots — the loop
cannot see what it was never looking for. Before shipping, publishing, or
generalizing an artifact a loop declared converged, run one independent pass:
a fresh-context critique or an ordinary human review. Treat a self-declared
LGTM as *unverified by anyone outside the loop*, because it is.

## Worked example

A tune loop on a prompt, hard cap 8:

- **Round 1** — three high-severity findings; edits applied.
- **Round 2** — one high-severity finding carried from round 1, plus one new
  medium; edits applied.
- **Round 3** — the round-1 finding appears a third time, unchanged. That is a
  **persistent fixpoint** on that item. But a separate re-diagnosis shows only
  low-severity remarks otherwise. The loop stops, reports the one unresolved
  finding with a note that its own edit vocabulary can't move it, and hands the
  artifact back rather than burning rounds 4–8 on a stuck item.

The loop exited on a *named* condition with a truthful account of what it did
and did not resolve — not on "good enough."

## Where it is applied

CraftKit's `craft-tune` skill runs exactly this taxonomy as its loop-exit
contract, and `craft-autoresearch` uses the measured analogue (a
baseline-saturation gate plus a held-out acceptance check) for eval-driven
loops — see those skills' stop-condition sections for the operational rules in
context. The discipline is not specific to them: use it for any loop where an
agent grades its own output.

## Related

- [`predicate-test.md`](predicate-test.md) — the companion discipline:
  deciding whether a written contract is safe for an agent to optimize against.
