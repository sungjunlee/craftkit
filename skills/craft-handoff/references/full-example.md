# craft-handoff full example

This is a complete paired output for the JWT-auth scenario summarized in `SKILL.md`.

## Input situation

Session spent 90 minutes adding JWT auth middleware. Two files modified. One primary decision rejected sessions in favor of JWT for stateless deploy. Two sub-decisions selected HS256 over RS256 and 15-minute TTL with no refresh tokens. One approach was abandoned: `express-session` pulled in Redis. One config experiment was reverted: secret-in-JSON. Tests pass. Next step is wiring middleware into the route table.

## Rich doc at `~/.craftkit/handoff/docs/acme-api-7c3a92.md`

```markdown
---
worktree: /Users/dev/work/acme-api
branch: feat/jwt-auth
created: 2026-04-25T00:14:09.000Z
next: Wire auth middleware into the protected route group in src/routes/index.ts
---

<context>
## Project
acme-api — Node/Express REST backend. Internal-only API in alpha; deploy target is stateless Cloud Run.

## Done (with path)
- Added JWT verification middleware at `src/middleware/auth.ts`. Exports `authMiddleware` and `signToken(payload)`. Reads `JWT_SECRET` from env at boot; throws on missing.
- Wired token issuance into `src/routes/login.ts:42`. POST `/api/login` returns `{ token, expiresAt }` on credential success.
- Added `jsonwebtoken@9.0.2` to dependencies; lockfile updated.

## State
- Branch: `feat/jwt-auth` (3 ahead of `main`)
- Tests: passing (`npm test`, all 47 specs)
- Blockers: none

## Decisions (long form)
- **JWT over server sessions.** Deploy target is stateless Cloud Run, with no sticky load balancing and no shared session store budgeted for alpha. JWT removes the server-state requirement. Revisit if the deploy target changes or token revocation requirements emerge.
- **HS256 over RS256.** Single-issuer single-verifier topology, no public client signing, and no near-term key-rotation requirement. HS256 with one env-var secret is the lowest-ceremony match for this threat model. Revisit if compliance asks for asymmetric keys or several services need to verify independently.
- **15-minute TTL, no refresh tokens.** Login flow is internal-only in alpha, so re-login friction is acceptable. Refresh-token machinery would add surface before external clients need it.

## What didn't work
- **Tried `express-session` first.** Familiar API, but the Redis-backed store dependency did not fit stateless deploy. Discarded and switched to JWT.
- **Tried embedding the secret in `config/auth.json`.** Worked locally, then was reverted because `docs/security.md:12` says secrets must come from env.

## Open notes (not blockers, parked)
- Token introspection endpoint deferred until external clients exist.
- Auth-audit channel deferred until audit infrastructure exists.
</context>
```

The doc body stops at `</context>`. The next session's `<task>` and `<rules>` come from the prompt.

## Prompt at `~/.craftkit/handoff/pending/2026-04-25T00-14-09-000Z-acme-api-7c3a92.md`

The saved prompt includes frontmatter. The clipboard body strips it:

```xml
<context>
## Project
acme-api — Node/Express REST backend (internal alpha, stateless Cloud Run target).

## State
- Branch: feat/jwt-auth (3 ahead of main)
- Tests: passing (`npm test`, 47 specs)
- Blockers: none

## Done (snapshot)
- JWT verification middleware: `src/middleware/auth.ts` (exports `authMiddleware`, `signToken`)
- Token issuance wired: `src/routes/login.ts:42` — POST `/api/login` returns `{ token, expiresAt }`
- Dependency: `jsonwebtoken@9.0.2` added

## Decisions (one-liners; long-form rationale + rejected alternatives in handoff doc)
- JWT over server sessions — because stateless Cloud Run target
- HS256 over RS256 — because single-issuer/single-verifier and no rotation requirement yet
- 15-minute TTL, no refresh — because internal-only alpha

## Background
Full session narrative, decision rationale in long form, abandoned approaches (`express-session`, secret-in-JSON), and parked notes are at `~/.craftkit/handoff/docs/acme-api-7c3a92.md`. Read it first before acting.
</context>

<task>
Wire the JWT auth middleware into the protected route group in `src/routes/index.ts`. Add an integration test that hits `/api/me` with and without a valid token.

Success criteria:
- `/api/me` returns 401 without token, 200 with valid token
- `npm test` stays green
- No new dependencies added
</task>

<rules>
- All paths are worktree-relative
- Read `~/.craftkit/handoff/docs/acme-api-7c3a92.md` first if reachable; if missing or inconsistent with this snapshot, proceed with the snapshot and flag the discrepancy
- Read `src/middleware/auth.ts` first to confirm export shape (`authMiddleware`, `signToken`)
- Run `npm test` before declaring done
- Do not add refresh-token machinery or a session store; revisit only if the handoff doc says to
</rules>
```

## Confirmation shape

```text
Prompt copied to clipboard. Saved to ~/.craftkit/handoff/pending/2026-04-25T00-14-09-000Z-acme-api-7c3a92.md. Rich doc at ~/.craftkit/handoff/docs/acme-api-7c3a92.md — the prompt instructs the next agent to read it first.
Start a fresh or reset session in the target agent, then paste. For Claude Code, run /clear first.
On Claude Code, you can skip the paste step by installing the SessionStart hook — see auto-load-hook.md.
```
