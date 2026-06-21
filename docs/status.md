# CraftKit Status

This page separates public evidence from maintainer-local evidence.

CraftKit keeps raw autoresearch run artifacts outside the repo at
`~/.craftkit/autoresearch/<skill>/<date-slug>/`. Those files are useful during
development, but a public checkout should not require them to understand the
current state.

## Public evidence

Run this from the repo root:

```bash
npm run verify
```

The verify command checks:

- JSON syntax across checked-in JSON files
- `package.json` package boundary plus `scripts.verify` and `scripts.test`
- every `skills/*/SKILL.md` frontmatter block
- every `SKILL.md` against the 500-line hard ceiling
- known terminology leaks, such as legacy harness wording in autoresearch docs
- required README and status-document paths
- `npm pack --dry-run`

## Skill status

| Skill | Current public evidence | Maintainer-local evidence | Known gap |
|---|---|---|---|
| `craft-prompt` | `npm run verify` checks frontmatter and spine budget | autoresearch pass artifacts under `~/.craftkit/autoresearch/craft-prompt/` and commit bodies | keep volatile provider guidance in guides |
| `craft-critique` | `npm run verify` checks frontmatter and spine budget | autoresearch pass artifacts under `~/.craftkit/autoresearch/craft-critique/` and commit bodies | re-run on fresh failure examples after major wording changes |
| `craft-tune` | `npm run verify` checks frontmatter and spine budget | autoresearch pass artifacts under `~/.craftkit/autoresearch/craft-tune/` and commit bodies | next pass should test the newer self-converging loop |
| `craft-survey` | `npm run verify` checks frontmatter and spine budget | autoresearch pass artifacts under `~/.craftkit/autoresearch/craft-survey/` and commit bodies | example must keep proving provenance and edit-target rules |
| `craft-autoresearch` | `npm run verify` checks terminology, frontmatter, and spine budget | reflexive autoresearch pass artifacts under `~/.craftkit/autoresearch/craft-autoresearch/` and commit bodies | examples must stay synchronized with the eval-runner contract fields |
| `craft-skill-spec` | `npm run verify` checks frontmatter and spine budget | contract evidence pass at `~/.craftkit/autoresearch/craft-skill-spec/2026-06-18-first-evidence-pass/` | replay after the next radar refresh against real drafted specs |
| `craft-harness` | `npm run verify` checks frontmatter and spine budget | contract evidence pass at `~/.craftkit/autoresearch/craft-harness/2026-06-18-first-evidence-pass/` | replay after the next substantial wording change against real agent outputs |
| `craft-handoff` | `npm run verify` checks frontmatter and spine budget | autoresearch pass artifacts and real-output replay under `~/.craftkit/autoresearch/craft-handoff/` | re-run replay after prompt/doc storage, frontmatter, hook, or sizing changes |
| `spec-charter` | `npm run verify` checks frontmatter and spine budget | dogfooded on brownfield spec-axis creation flows | run a dedicated autoresearch or replay pass after more public repo examples |
| `spec-system-map` | `npm run verify` checks frontmatter and spine budget | dogfooded with `spec-charter -> spec-system-map -> spec-grill` pipeline usage | add replay evidence for candidate-boundary handoff quality |
| `spec-grill` | `npm run verify` checks frontmatter and spine budget; `node --test` covers `extract-signals.js` evidence summaries | dogfooded on brownfield capability-contract extraction and admission review | add replay evidence for report-only, next-capability, and audit routes |

## Maintainer-local evidence

Autoresearch artifacts stay outside the repo by design:

- they can be large or noisy
- they may include one-off run logs
- the committed skill files are the kept output
- public claims should either be reproducible by command or labeled as maintainer-local

When updating README claims, prefer linking here instead of adding long status
tables to the top-level adoption path.
