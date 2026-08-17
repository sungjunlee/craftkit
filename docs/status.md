# CraftKit Status

This page separates public evidence from maintainer-local evidence.

## Public evidence

From the repo root:

```bash
npm run verify
```

That check covers JSON syntax, package boundary, skill frontmatter, `SKILL.md` line budgets, terminology leaks, required README/status paths, and `npm pack --dry-run`. `node --test` covers `scripts/verify.mjs` plus `spec-grill`'s `extract-signals.js`.

## Maintainer-local evidence

Raw autoresearch run artifacts stay outside the repo at `~/.craftkit/autoresearch/<skill>/<YYYY-MM-DD-slug>/`. They are useful during development; a public checkout should not need them. The committed skill files are the kept output.

Four skills (`craft-prompt`, `craft-critique`, `craft-autoresearch`, `craft-handoff`) have maintainer-local autoresearch pass artifacts. Newer skills have dogfood or contract-evidence notes only.
