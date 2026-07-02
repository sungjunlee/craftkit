# craft-harness repair example

## Input

Agents keep missing our migration safety process. We use Codex more lately, but some teammates use Claude Code too.

## Output

**Harness thesis**
- mode: `repair`
- primary target: Codex current-primary, Claude Code first-class target
- why this mode fits: the issue is a repeated agent miss in an operating repo

**Existing harness**
- keep: root context already names the repo's test command
- update: add a short pointer from root context to migration guidance
- missing: reusable migration safety workflow
- risky: automatic migration hooks, because false positives could block normal development
- prune: ad hoc migration checklist copied into old PR comments

**Pain / need map**
| need | repeated agent job | evidence | placement | promotion trigger |
|---|---|---|---|---|
| migration safety checklist | verification/review | repeated misses during DB work | repo-local skill plus short root pointer | promote to hook only if agents still skip deterministic checks |

**Buy vs build**
- source: existing repo docs and maintained public migration-safety assets
- decision: build local
- trust notes: the checklist is project-specific, repo-local markdown is reviewable, and no install or network permission is needed
- fit / failure: public guidance is useful background, but it will not know this repo's rollback, idempotency, and data-size conventions
- rollback path: remove the repo-local skill and root pointer; no hook, MCP, plugin, or global config state remains

**Proposed changes**
| path/target | action | risk gate | rationale |
|---|---|---|---|
| `skills/migration-safety/SKILL.md` | add compact repo-local skill | none | reusable judgment workflow without bloating root context |
| `AGENTS.md` | add one-line pointer | none | makes the skill discoverable during migration work |
| pre-commit hook | defer | approval required | timing may help later, but current evidence supports a skill first |

**Codex target**
- keep the shared `AGENTS.md` pointer short
- reload repo context after adding the skill

**Claude target**
- mirror the same pointer through `CLAUDE.md` only if the repo already uses that file
- avoid assuming identical skill discovery behavior

**Verification**
- Prompt: "Review this migration change and tell me what safety checks apply."
- Expected evidence: agent finds the migration skill and names rollback, idempotency, data-size, and test checks.
- Failure signal: agent only says "run tests" or misses rollback/data safety.

**Deferred / prune**
- plugin packaging: defer until the skill proves useful across more than one repo
- hook install: revisit only after the skill exists and agents still skip deterministic checks
