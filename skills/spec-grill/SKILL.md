---
name: spec-grill
argument-hint: "[natural-language request]"
description: "Create or refine spec/capabilities.md when a consumer, a cross-tree contract, or a 3-axis audit is in play. Use for capability specs, component contracts, 능력 명세, or grill."
disable-model-invocation: true
compatibility: Requires git.
metadata:
  related-skills: "spec-charter, dev-backlog, backlog-triage"
---

# spec-grill

Author `spec/capabilities.md`, the middle layer between `spec/charter.md` and day-to-day execution work. Pressure-test repo signals into durable contracts only when a keep condition holds. Not a file generator from directory names, and not the second step of a required pipeline.

## Execution contract

### Intent router

Do not require users to memorize arguments. Interpret the user's request and choose the safest matching route. Power-user aliases such as `map`, `fill`, `audit`, and exact capability slugs are accepted, but they are optional shorthand, not the primary workflow.

| User intent | Route | Writes? |
|-------------|-------|---------|
| No argument, ambiguous capability request, or "look at the capabilities" | **Grill Report** (short diagnostic by default): diagnose current evidence and recommend next action. | No |
| "Find capability candidates", "map repo capability boundaries", or `map` | **Candidate Boundary Report**: collect raw candidates and classify them as accepted / rejected / merged / split candidates. | No |
| "Add the next missing capability", "fill the missing capability", "write/apply the recommended edit", "write the recommended first capability", "next safest capability 작성해줘", "문서 적을 건 적고 다음 제안해줘", or `fill` | **Next Capability Proposal**: propose exactly one missing capability and ask for confirmation before editing unless the user clearly authorized the edit. | Only after confirmation or clear edit authorization |
| Mentions a known capability slug or natural-language capability area | **Specific Capability Review**: resolve the mention to one capability or candidate and deep-review only that block or candidate. | No by default |
| "Audit capabilities", "find overlap", "find stale contracts", "find weak predicates", or `audit` | **Capability Audit Report**: report stale, overlapping, weak, or unsupported capability predicates. | No |

If intent is unclear, prefer report-only. Treat natural-language requests to write or apply the recommended next capability as edit intent, not as no-arg ambiguity. Creating `spec/capabilities.md` requires a keep condition. If the file already exists, edit routes may proceed. Report-only routes still run when the file is absent and none hold; emit the report first and do not create the file.

Capability slugs are strict routing handles; downstream tools (e.g. sprint tooling) may use them to route work and learnings. Keep them lowercase and singular, then put nuance in Goal/Scope prose.

### Helper scripts

Resolve helper scripts from the installed `spec-grill` skill directory, not from the target repo. In a source checkout, that means the local `scripts/` directory beside this `SKILL.md`. Always pass the target repo explicitly (`--repo-root <target-repo>`) so helpers do not inspect the skill directory by accident.

On a brownfield repo with no `spec/capabilities.md`, or when candidate evidence is requested, run `node <skill-dir>/scripts/extract-signals.js --repo-root <target-repo> --json` first. The script reports raw capability evidence. It never writes `spec/capabilities.md`; admission, merging, splitting, and naming belong to this skill.

### Completion contract

End every run with a short summary:

- capability blocks created or edited
- predicates rejected or rewritten
- constraints added
- raw candidates merged/split/refused, with raw signal, supporting evidence, and missing evidence separated
- behaviors promoted to constraints
- missing proof or evidence
- follow-up Learning Actions if any
- if the file is absent and no keep condition holds: recommend stopping after charter (plus map on brownfield) and do not create `spec/capabilities.md`

### Grill report contract

**Sizing rule**: the no-arg and ambiguous routes emit a **short diagnostic** by default — three sections: `### Evidence Read`, `### Evidence Missing`, and `### Recommended Edit`. Reserve the full **Grill Report** below for the Candidate Boundary Report (`map`) and Capability Audit Report (`audit`) routes, or when the user explicitly asks for the full report. Every full report must include these sections in order: `## Grill Report`, `### Evidence Read`, `### Evidence Missing`, `### Raw Candidates`, `### Accepted / Rejected / Merged / Split Candidates`, `### Sharp Questions`, `### 3-Axis Predicate Findings`, `### Proposed Next Capability`, `### Recommended Edit`. See `references/grill-report-template.md` for the full skeleton with placeholder fields. When the file is absent and no keep condition holds, set Proposed Next Capability to none and Recommended Edit to stop after charter (plus map on brownfield); do not create the file.

Separate diagnosis from mutation. The report can recommend edits, but it must not edit `spec/capabilities.md` unless the user clearly asked for editing or confirms the proposed edit. This write-gating rule applies in full at every size — a short diagnostic never relaxes the "report first, edit only when authorized" discipline, it only trims what gets written down.

## Brownfield signal rules

`extract-signals.js` draws from README, `spec/charter.md` with legacy root `CHARTER.md` fallback, `spec/system-map.md`, `CLAUDE.md`/`AGENTS.md`, top-level source dirs, skill files, script surfaces, docs, tests, and recent commit messages.

Use the draft as interview seed only. The script labels signal authority:

- README/charter/issues are product authority.
- source directories are repo-structure evidence.
- commit scopes are history.
- `CLAUDE.md`/`AGENTS.md` are development-harness context.

Harness context can seed questions about conventions and workflow, but it must not create accepted capability boundaries by itself. The script clusters evidence from code organization and command surfaces, while real capabilities are functional contracts; expect grill mode to merge, split, or regroup raw signals rather than adopt them verbatim.

Accepted brownfield capabilities need code-understood support, not just surface signals. Normally require at least two evidence classes, such as system-map boundary + scripts, source surface + tests, README/product signal + command surface, or recurring commits + docs/tests. A single strong user statement may override this, but the report must say that explicitly.

## File shape

`spec/capabilities.md` lives at the target repo root in `spec/`. The single-file shape is intentional while the spec remains compact: target 5-10 capabilities, warn above 12 capabilities or 400 lines, and split only above 500 lines, above 15 capabilities, or when ownership boundaries demand separate review paths.

The file's mutation discipline:

- Goal / In-scope / Out-of-scope: human-gated through this skill.
- Expected Behaviors / Hard Constraints: human-gated and must pass the 3-axis predicate test.
- `## Learnings`: not an interview target. If a bounded Learnings writer exists, only that writer appends between magic markers. Until then, Learnings changes require a human-approved Learning Action.
- `## Decisions`: append-only by convention; promote cross-cutting decisions to `spec/charter.md` through `spec-charter amend`.

## Keep conditions

Create `spec/capabilities.md` only when at least one holds:

- a consumer exists
- the contract is cross-tree, not the same as a directory
- the user asked for a 3-axis audit

If the file already exists, this skill may amend it. A bare invocation may still emit a report. If the file is absent and none hold, Recommended Edit is stop after charter (plus map on brownfield); do not create the file. Directory names alone are not a keep condition.

## Capability admission test

Before interviewing a candidate capability, decide whether it deserves to exist. Raw extraction signals are not accepted specs.

Admit a capability only when most of these are true:

- It is a repeated decision boundary, not just a directory name or commit scope.
- It is supported by at least two evidence classes in brownfield mode, unless the user explicitly authorizes a single-source capability.
- It owns a primary destination for captured learnings.
- Its Goal can be stated as an observable user or operator outcome.
- Its Behaviors and Hard Constraints differ meaningfully from neighboring candidates.
- If two candidates share nearly all predicates, merge them.
- If one candidate needs more than five Behaviors to feel complete, split it along the contract boundary the extra Behaviors describe.

Use this as a bloat check before the per-capability flow. A large feature-first app may have many feature folders but only 5-10 durable capability contracts.

Directory-only, commit-scope-only, or harness-context-only candidates remain interview seeds. Report them as missing supporting evidence instead of accepting them silently.

## Per-capability interview flow

For each capability, walk the user through this order; do not skip ahead:

1. **Goal** — one sentence: what the user can observe when this works. Diagnosis-side framing belongs in the charter; capability Goal is the observable outcome. Do not run Goals through the 3-axis predicate test; use plain-language observability instead.
2. **In-scope / Out-of-scope** — what this capability owns, and the boundary it deliberately respects. Out-of-scope prevents creep.
3. **Expected Behaviors** — three verifiable predicates. Each one must pass the 3-axis test below. Reject and rewrite until it does.
4. **Hard Constraints** — two bright-lines this capability never crosses, even if asked. Adversarial-Goodhart defenses live here.

Stop at three Behaviors and two Hard Constraints per capability on the first pass; more is bloat and harder to keep falsifiable. Add later via rerun.

## The 3-axis predicate test

Every Behavior and Hard Constraint must pass all three axes before it is committed. The rationale and a worked example behind this test live in [`docs/methodology/predicate-test.md`](../../docs/methodology/predicate-test.md), CraftKit's standalone methodology reference.

1. **Authority axis.** Would the user be unhappy if an agent satisfied this measurably but in a way that ignored their intent? If yes, encode the missing intent as a sharper Behavior or promote it to a Hard Constraint.
2. **Distributional axis.** Does this predicate hold in unseen code areas or unseen workloads? If no, restate it as environment-independent or scope it to the conditions where it holds.
3. **Manipulability axis.** Can an agent satisfy this by editing the measurement channel rather than the system? If yes, add a structural restriction outside the spec, not just sharper prose.

A predicate that passes all three is committable. A predicate that fails any axis is rewritten or split, never rubber-stamped.

Classify positive normal outcomes as Expected Behaviors. Classify bright-line negations and anti-Goodhart guards as Hard Constraints. When both forms fit, prefer the Hard Constraint only when the negative form protects against an optimization or data-loss shortcut.

## Writing rules

When the user accepts a first capability edit and `spec/capabilities.md` is absent, copy `templates/capabilities.md` to `spec/capabilities.md` at the repo root only if a keep condition holds, then write only the accepted capability. On rerun, edit only the named capability block and leave the rest of the file untouched.

After applying an accepted change, do not bump a revision number on `spec/capabilities.md`; `git blame` is the source of truth. Note in the conversation which capability was edited. Echo charter Decisions at capability level only when they explain a Behavior or Hard Constraint; promote cross-cutting capability Decisions through `spec-charter amend`.

See `references/capabilities.md` for additional grill heuristics and [`../spec-charter/SKILL.md`](../spec-charter/SKILL.md) for the project-wide charter layer.

## Verification prompts

- "Create capabilities from a repo where only top-level directories are known." Expected: use directories as raw signals only; directory names are not a keep condition; do not write the file.
- "We finished charter and map; write capabilities from the folder list." Expected: refuse; same gate.
- "A commit scope appears often but has no docs, tests, or distinct behavior." Expected: keep it as an interview seed or merge it into a supported capability.
- "User says this weakly evidenced surface is important." Expected: allow admission only with the user-authorized override called out in the report.
- "문서 적을 건 적고 다음 제안해줘." Expected: if the file is absent and no keep condition holds, stop without a create proposal; otherwise route to Next Capability Proposal, propose one supported next capability, and ask before writing unless edit authorization is explicit.
- "We finished charter, system map, and first capability; is this ready to commit?" Expected: use the ready-to-commit checklist in `references/spec-pipeline-ready.md`.

## References

- `references/capabilities.md` — grill heuristics (naming, goal rewrites, 3-axis examples, admission patterns) used after the interview flow.
- `references/grill-report-template.md` — the full Grill Report skeleton.
- `references/spec-pipeline-ready.md` — lightweight ready-to-commit checklist when capability contracts are in scope.
