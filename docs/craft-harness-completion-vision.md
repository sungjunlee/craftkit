# craft-harness: completion vision and use-or-delete checkpoint

Source: PRD-RS (`docs/prd-2026-07-rightsizing.md` §4.2, E1.3). Recorded 2026-07-24.

`craft-harness` was **right-sized, not removed**, in the 2026-07 right-sizing
pass (see the shrink commit and `CHANGELOG.md`). The reason is a split verdict:
the *capability* — set up a good per-project harness of skills and hooks once —
is genuinely wanted, but the *skill as built* went unused because it
over-prescribed a lifecycle before the first use ever landed. Shrinking removed
the ceremony; it did not answer why the capability never got pull. This note
records the vision that might close that gap, and a dated trigger so an
aspirational-but-unused skill is not carried forever.

## Completion vision — feed the harness from the spec axis

The recurring cost that keeps `craft-harness` from being reached for is that it
re-derives "what is this project, and what does it need" every single time.
The maintainer already runs the `spec-*` pipeline (`spec-charter` →
`spec-system-map` → `spec-grill`) and gets real value from it as a durable
direction anchor. That pipeline's outputs are exactly the missing input:

- `spec/charter.md` — direction and objectives → what the harness should optimize for.
- `spec/system-map.md` — system shape, boundaries, runtime flows → where guidance belongs and which surfaces exist.
- `spec/capabilities.md` — capability contracts → the repeated jobs a harness must support.

A completed `craft-harness` would **consume these as input** instead of
re-inspecting from zero: read the spec axis (when present), then propose the
smallest project-fit harness against it. The skill the maintainer *uses* would
feed the one they *want*.

This is a vision, not committed work. Do **not** build the feed until there is a
concrete pull (a real repo where the spec axis exists and a harness is actually
wanted). Building it speculatively against a fuzzy target is the same mistake
that made the original skill go unused. Related open questions already live in
`skills/craft-skill-spec/references/project-harness-toolkit.md` (proposal-first
vs edit-by-default; radar-as-input).

## Use-or-delete checkpoint

**By 2026-10-24**, review whether `craft-harness` has been used on a real repo
(any lifecycle: bootstrap, a repair, a sync, an adoption decision).

- **Used at least once** → keep; consider whether the completion vision above
  now has enough pull to schedule.
- **Still unused** → remove it, on the usage axis, exactly as `craft-survey`
  (2026-07) and `craft-tune` (2026-07) were removed. Aspiration alone does not
  justify carrying a skill; a wanted-but-unbuildable capability can be
  re-approached fresh when a concrete pull appears.

This trigger is deliberate: the right-sizing pass shrank the skill on the bet
that lower entry cost drives usage. This checkpoint tests that bet instead of
assuming it.
