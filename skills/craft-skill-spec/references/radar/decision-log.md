# Skill Radar Decision Log

Record only durable judgment changes here. Do not duplicate full snapshot content.

## 2026-04-16

### Decision: `current.md` is the default runtime source

- status: `accepted`
- rationale: Downstream skill-design workflows need a stable canonical view, not a requirement to re-read the full history on every run.
- consequence: Snapshots provide evidence; `current.md` provides today's judgment.

### Decision: snapshots stay time-scoped and mostly append-only

- status: `accepted`
- rationale: A monthly or event snapshot should preserve what looked true at that time. Rewriting old snapshots would erase the trend line this system is supposed to keep.
- consequence: Corrections belong in a newer snapshot plus, when needed, a note here.

### Decision: every notable pattern must end in `adopt`, `avoid`, or `watch`

- status: `accepted`
- rationale: A radar that only lists ideas does not reduce ambiguity. The value comes from classification, not collection.
- consequence: Snapshots may contain nuance, but they still need a terminal judgment.

### Decision: `watch` is the default holding state for promising but unstable patterns

- status: `accepted`
- rationale: This prevents CraftKit from overfitting to a single documentation wave or product moment.
- consequence: Promotion from `watch` to `adopt` should usually require either repeated support or one strong primary-source shift plus a clear CraftKit fit call.

### Decision: artifact classification happens before canonical guidance

- status: `accepted`
- rationale: Not every design target is a single skill. Treating subagents and plugins as if they were plain skills produces bad architecture.
- consequence: `taxonomy.md` is now a required first read for future meta-skills and design workflows.

## 2026-04-20

### Decision: skill-radar lives under its consuming skill, not in `docs/`

- status: `accepted`
- rationale: The radar is skill-ingested reference material, not human documentation. Keeping it at `docs/skill-radar/` broke CraftKit's copy-paste portability rule: `skills/craft-skill-spec/` with bare `docs/` references could not be lifted into another repo without drag-along fixups. Today `craft-skill-spec` is the only consumer, so colocating radar with its owner is the honest shape.
- consequence: radar moved to `skills/craft-skill-spec/references/radar/`. All references in SKILL.md, spec-checklist.md, and the radar files themselves now resolve from the skill root. If a second consumer appears later, promote the radar to a shared location at that point (YAGNI until then).

## 2026-05-01

### Decision: verification and context gates are now default guidance for complex prompts

- status: `accepted`
- rationale: OpenAI and Anthropic's latest prompt guidance converges on explicit success checks, grounding/source verification, missing-context handling, and safer action boundaries. These are durable cross-agent patterns, not merely provider settings.
- consequence: `current.md` now treats verification gates, missing-context behavior, and instruction hierarchy review as default considerations for complex, research, and agentic workflows.

### Decision: autonomy should be calibrated, not maximized

- status: `accepted`
- rationale: Newer agentic models are proactive enough that old anti-laziness prompts can cause tool, file, or subagent overuse.
- consequence: CraftKit should prefer criteria-driven tool/subagent rules and avoid blanket "use tools aggressively" language unless a fragile workflow earns it.
