# Skill Radar

`skill-radar` is CraftKit's time-aware curation layer for modern skill-authoring patterns.

Its job is not to dump research notes into the repo. Its job is to maintain a stable, reviewable answer to a narrower question:

> Given the pattern shifts we have seen recently, what should a new CraftKit skill adopt, avoid, or keep under watch right now?

## Why this exists

Search is noisy. Older styles often outrank newer guidance, provider-specific quirks leak into generic advice, and one-off browsing sessions do not accumulate taste.

`skill-radar` solves that by separating:

- **monthly or event snapshots** — what changed, what looked promising, what still felt unstable
- **current canonical view** — the default judgment a skill-design workflow should use today
- **decision log** — why a pattern moved from `watch` to `adopt`, or from `adopt` to `avoid`
- **taxonomy** — whether the design target is a skill, skill suite, subagent, or plugin
- **live source registry** — the primary references worth revisiting as the ecosystem moves
- **policy** — when to trust canon, when to reopen live sources, and when to mint a new snapshot

## Folder map

- `current.md` — current canonical judgment. Treat this as the default source of truth.
- `decision-log.md` — durable decisions and reclassifications.
- `taxonomy.md` — artifact classes and escalation path.
- `sources.md` — live reference registry.
- `policy.md` — freshness and update rules.
- `TEMPLATE.md` — template for a new monthly or event snapshot.
- `2026-04.md` — initial baseline snapshot.

Future snapshots may use either:

- monthly names such as `2026-05.md`
- event names such as `2026-05-mid.md` when a major docs or product shift lands mid-cycle

## Operating model

1. Classify the target with `taxonomy.md`.
2. Consult `current.md` for the relevant default stance.
3. Reopen live sources from `sources.md` only when `policy.md` says freshness matters.
4. Write a bounded snapshot for that month or event when the live evidence changes guidance.
5. Classify every notable pattern as `adopt`, `avoid`, or `watch`.
6. Update `current.md` only after a deliberate judgment call.
7. Record reclassification rationale in `decision-log.md`.

The important constraint is this:

- **Snapshots are for evidence.**
- **`current.md` is for runtime judgment.**

Do not make downstream skills or prompts read the full history by default. They should read `current.md` first and consult a snapshot only when a `watch` item or a low-confidence call needs deeper context.

Also do not assume every target artifact is a single skill. `taxonomy.md` exists to prevent that category error.

## Classification rules

### `adopt`

Use when a pattern is strong enough to recommend by default.

Typical signals:

- repeated across multiple primary sources
- or present in one strong primary source and clearly aligned with CraftKit constraints
- has an obvious implementation consequence for skill structure or workflow

### `avoid`

Use when a pattern is actively harmful for CraftKit's goals.

Typical reasons:

- hurts cross-agent portability
- inflates the always-loaded context budget
- increases ambiguity or branching without enough quality gain
- depends on platform-specific behavior that is not isolated

### `watch`

Use when a pattern looks promising but should not be made default yet.

Typical reasons:

- still too provider-specific
- looks directionally right but lacks enough evidence
- useful only for certain skill classes
- likely to change again soon

## Promotion and demotion rules

- `watch` -> `adopt` usually requires either:
  - confirmation across two snapshots, or
  - one strong primary-source shift plus a clear CraftKit fit judgment
- `adopt` -> `avoid` requires an explicit note in `decision-log.md`
- `adopt` -> `watch` is valid when a pattern still seems useful but no longer feels stable enough for the default path

## Update checklist

When adding a new snapshot:

1. Start from `TEMPLATE.md`.
2. Prefer primary sources over commentary.
3. Record exact source URLs.
4. Name the concrete shift, not just the topic.
5. Separate observed patterns from CraftKit judgment.
6. Keep the snapshot additive; do not rewrite history.
7. Update `current.md` only for changes that alter today's recommendation.

## Default consumer behavior

Any future meta-skill that designs new skills should follow this lookup order:

1. Classify the artifact with `references/radar/taxonomy.md`.
2. Read `references/radar/current.md`.
3. Apply `adopt` and `avoid` items by default when the target is a single skill.
4. If the target touches a `watch` area, or if the artifact is a `subagent` or `plugin`, consult `references/radar/policy.md` and the relevant source entries in `references/radar/sources.md`.
5. If a classification changed recently, read the matching entry in `decision-log.md`.

That keeps recommendations stable while still letting the system absorb change over time.
