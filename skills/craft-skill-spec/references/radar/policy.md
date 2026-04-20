# Skill Radar Policy

This file defines how `skill-radar` stays fresh without turning every design task into live research.

## Core rule

Use the curated internal layer first.

That means:

1. classify the artifact with `taxonomy.md`
2. consult `current.md`
3. open a dated snapshot only when needed
4. open live sources only when the policy below says freshness matters

## Freshness policy

### Use existing canon only

Do this when:

- designing a normal single skill
- the request does not depend on a bleeding-edge platform feature
- the current canonical guidance is enough to make the decision

### Consult live registry sources

Do this when:

- the design touches `subagent` or `plugin` territory
- the request depends on host-platform behavior
- a `Watch` item is central to the design
- the last relevant source review is older than one month for a high-sensitivity source

### Create a new snapshot

Do this when:

- a live source changes a canonical recommendation
- several sources shift in the same direction
- a new artifact class becomes common enough to deserve its own pattern layer

### Update `current.md`

Do this only when today's default recommendation changes.

Do not update `current.md` for every interesting observation.

## Cadence

### Monthly baseline pass

Once per month:

- scan Tier A skill sources
- scan Tier A subagent/plugin sources
- check the Anthropic engineering index for new relevant posts
- record any real shift in a new monthly snapshot

### Event-driven pass

Run an immediate pass when:

- a major product post lands
- official docs add or remove a major extension surface
- a new best-practice or anti-pattern section appears in an official guide

Use event snapshot names such as `2026-05-mid.md` when waiting for month-end would be misleading.

## Canonical-scope rule

`current.md` is currently the default for **single-skill** design.

For other classes:

- `subagent` decisions must consult `taxonomy.md` and the live registry
- `plugin` decisions must consult `taxonomy.md` and the live registry
- `skill suite` decisions should start with `current.md` but check whether the split itself is the main design question

If these higher classes become common, split the canon into class-specific files rather than overloading one file.

## Source selection rule

Prefer sources in this order:

1. official product docs
2. official engineering posts
3. official release or help-center material
4. strong community prior art

If Tier A and Tier C disagree, Tier A wins for canonical guidance.

## Promotion rule

Promote a pattern from `watch` to `adopt` when at least one of these is true:

- two snapshots support the same direction
- one high-authority source changes the design default clearly
- repeated real usage inside CraftKit shows the pattern is stable and valuable

## Demotion rule

Move a pattern from `adopt` to `watch` or `avoid` when:

- a platform-specific dependency becomes too strong
- maintenance burden outweighs quality gain
- live sources invalidate the old recommendation
- the pattern fails repeatedly in real use

Record the reason in `decision-log.md`.

## Meta-skill behavior rule

A future meta-skill should not browse live sources on every run.

It should browse only when:

- the artifact class is `subagent` or `plugin`
- the design depends on a high-sensitivity live surface
- the relevant source review is stale by this policy

Otherwise it should stay on the curated internal layer.
