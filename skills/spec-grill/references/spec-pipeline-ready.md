# Spec Pipeline Ready-To-Commit Checklist

Use this after the `spec-charter -> spec-system-map -> spec-grill` flow when the user wants to land the spec axis in git.

This is a quality gate, not a runtime system. It does not authorize edits by itself; it tells the agent what to verify before committing or opening a PR.

## Checklist

- `spec/charter.md` exists and names unresolved assumptions.
- `spec/system-map.md` exists and names current system shape from repo evidence.
- `spec/capabilities.md` has at least one accepted capability when capability contracts are in scope.
- The next recommended capability or action is listed.
- Relative links in the spec files resolve.
- Placeholder markers such as `<...>`, `TODO`, and `TBD` are either removed or intentionally explained.
- Candidate slugs in `spec/system-map.md` do not contradict accepted capability slugs in `spec/capabilities.md`.
- Repo-native tests or verification commands were run when available.

## Report Shape

```md
## Ready To Commit

- Charter: <present/missing; assumptions status>
- System map: <present/missing; evidence status>
- Capabilities: <present/missing; accepted capability count>
- Next action: <capability/action or none>
- Links/placeholders: <checked/issues>
- Slug consistency: <checked/issues>
- Verification: <command and result, or why unavailable>
```

## Failure Modes

- Treating generated docs as ready because files exist, without checking links, placeholders, or repo-native tests.
- Accepting system-map candidates as capability contracts before `spec-grill` has admitted, merged, split, or rejected them.
- Hiding unresolved assumptions in prose instead of listing them where the next maintainer can find them.
