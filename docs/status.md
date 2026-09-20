# CraftKit Status

This page separates public evidence from maintainer-local evidence.

## Public evidence

From the repo root:

```bash
npm run verify
```

That check covers JSON syntax, package boundary, skill frontmatter, `SKILL.md` line budgets, terminology leaks, required README/status paths, and `npm pack --dry-run`. `node --test` covers `scripts/verify.mjs` plus `spec-grill`'s `extract-signals.js`.

## Maintainer-local evidence

Historically, `craft-prompt`, `craft-handoff`, and the retired `craft-critique` and `craft-autoresearch` had maintainer-local eval passes. Raw run artifacts remain outside the repo at `~/.craftkit/autoresearch/<skill>/<YYYY-MM-DD-slug>/`; they are historical evidence, not required inputs for a public checkout. Removing the two skills does not remove those records.

The `spec-*` skills have dogfood or contract-evidence notes only.

## Checkpoints

- 2026-12-20 — `spec-grill/scripts/extract-signals*.js` use-or-delete. Signal: at least one dogfood spec-grill run between 2026-09-20 and 2026-12-20 used the `--json` output as its candidate seed (evidence: a capabilities.md commit or a run note that cites it). If none, delete the script family and let the skill read the repo directly, as spec-charter does. Until the checkpoint, no further refactors of the script family beyond what other in-flight PRs already carry.
