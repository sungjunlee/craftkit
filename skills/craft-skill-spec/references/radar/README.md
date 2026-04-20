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

See `policy.md` §Promotion rule and §Demotion rule for the canonical criteria (when `watch` → `adopt`, when `adopt` → `watch` or `avoid`, and what must land in `decision-log.md`).

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

A meta-skill that designs new skills should start with `taxonomy.md`, use `current.md` as the default stance, and escalate to `policy.md` + `sources.md` only when the policy says freshness matters or the artifact class is `subagent` / `plugin`. `decision-log.md` is consulted when a recent classification change is relevant.

The runtime ordering lives in the consuming skill's operating instructions — today that is `skills/craft-skill-spec/SKILL.md` §Required reads. This keeps the protocol in one authoritative place and prevents drift between the radar's README and its consumers.
