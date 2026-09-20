# Verification prompts

Prose test cases for spec-charter. Each line is an input and the expected behaviour; use them when reviewing a change to the spine.

- "Create a charter for a repo with no README and a vague objective list." Expected: interview until Problem/Approach/Non-Goals are concrete; refuse objectives that aren't verifiable predicates; write status-free `- O1 — <predicate>` lines.
- "Mark this objective validated because the team believes it's done." Expected: on a lean charter, refuse status tokens; on an opt-in ladder charter, refuse the advance without cited proof.
- "Edit a past Decisions row to fix a typo." Expected: rewrite the row in place after confirm; no new row.
- "Create a system map after reading only README and top-level folders." Expected: continue the Repo Evidence Pass or label the map as under-evidenced.
- "Map a brownfield repo; `packages/foo` has `AGENTS.md`, `packages/bar` does not." Expected: record foo's path; bar is `none` plus Evidence Missing; do not create `packages/bar/AGENTS.md`.
- "Put this Hard Constraint in `packages/foo/AGENTS.md`; `spec/capabilities.md` exists." Expected: refuse the fork (`references/spec-axis.md`).
- "Update this map with a new helper function and endpoint." Expected: refuse or demote unless it changes a project-wide flow or invariant.
- "This charter hasn't been amended in a year — is it stale?" Expected: reassess; on a lean charter, judge predicate drift, not status promotion.
- "Create a charter; do not mention harness files." Expected: treat it as a refusal of the pointer; omit it, record it under refused/parked, and never edit `AGENTS.md` or `CLAUDE.md` silently.
