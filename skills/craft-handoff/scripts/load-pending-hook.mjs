#!/usr/bin/env node
// load-pending-hook.mjs — Claude Code SessionStart hook script.
//
// Reads ~/.craftkit/handoff/pending/<ts>-<worktree-slug>.md (written by
// craft-handoff), resolves which handoff belongs to the *current* worktree,
// emits it as additionalContext for the new session, then archives the
// consumed file to ~/.craftkit/handoff/archive/<timestamp>.md.
//
// Concurrency model: each craft-handoff run writes a unique timestamped
// file — nothing is ever overwritten. Multiple sessions can wrap up in
// parallel without clobbering each other. The hook disambiguates by
// reading each file's `worktree:` frontmatter and matching the current
// cwd's git toplevel (falling back to cwd itself).
//
// Stale handoffs (older than STALE_AFTER_MS) are archived without
// injection. Superseded handoffs (older matches for the same worktree)
// are archived with a `superseded-` prefix.
//
// Legacy fallback: if a pre-v2 `pending.md` exists (single-file layout),
// it is treated as a match for the current worktree and consumed on first
// run. Also covers fresh installs where pending/ may not yet exist.
//
// Wire up in ~/.claude/settings.json — see references/auto-load-hook.md.
//
// Zero dependencies. Requires Node 18+ (already required by Claude Code).

import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  statSync,
} from "node:fs";
import { homedir } from "node:os";
import { basename, join } from "node:path";

const HANDOFF_DIR = join(homedir(), ".craftkit", "handoff");
const PENDING_DIR = join(HANDOFF_DIR, "pending");
const ARCHIVE_DIR = join(HANDOFF_DIR, "archive");
const LEGACY_PENDING = join(HANDOFF_DIR, "pending.md");

// Handoffs older than this are archived without injection. Rationale:
// craft-handoff is paired with a near-term /clear. 72h (default) accommodates
// "end-of-Friday handoff, Monday /clear" while still catching week-plus-old
// pending files that predate an unrelated /clear.
//
// Override via env:
//   CRAFTKIT_HANDOFF_TTL_HOURS=<N>  — any positive number
//   CRAFTKIT_HANDOFF_TTL_HOURS=0    — disable the guard entirely
//   Anything else (empty, negative, non-numeric) falls back to the
//   default and logs to stderr. We *don't* accept empty/negative as
//   "disable" because the docs reserve that meaning for literal 0.
const DEFAULT_TTL_HOURS = 72;
const _rawTtl = process.env.CRAFTKIT_HANDOFF_TTL_HOURS;
let _ttlHours = DEFAULT_TTL_HOURS;
if (_rawTtl !== undefined) {
  const _trimmed = _rawTtl.trim();
  const _parsed = Number(_trimmed);
  if (_trimmed === "" || !Number.isFinite(_parsed) || _parsed < 0) {
    console.error(
      `craft-handoff hook: CRAFTKIT_HANDOFF_TTL_HOURS=${JSON.stringify(_rawTtl)} is invalid; using default ${DEFAULT_TTL_HOURS}h.`,
    );
  } else {
    _ttlHours = _parsed;
  }
}
const STALE_AFTER_MS =
  _ttlHours > 0 ? _ttlHours * 60 * 60 * 1000 : Number.POSITIVE_INFINITY;

function currentWorktree() {
  try {
    return execFileSync("git", ["rev-parse", "--show-toplevel"], {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return process.cwd();
  }
}

// Parse the tiny `key: value` frontmatter we write. Not a full YAML parser —
// just enough for our own format. Returns {} if no frontmatter block.
function parseFrontmatter(content) {
  const lines = content.split("\n");
  if (lines[0] !== "---") return {};
  const out = {};
  for (let i = 1; i < lines.length; i++) {
    if (lines[i] === "---") return out;
    const m = lines[i].match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (m) out[m[1]] = m[2].trim();
  }
  return {};
}

function archive(src, prefix = "") {
  try {
    mkdirSync(ARCHIVE_DIR, { recursive: true });
    const name = `${prefix}${basename(src)}`;
    const dest = join(ARCHIVE_DIR, name);
    renameSync(src, dest);
    return dest;
  } catch (err) {
    console.error(`craft-handoff hook: archive failed for ${src}: ${err.message}`);
    return null;
  }
}

function safeStat(path) {
  try {
    return statSync(path);
  } catch {
    return null;
  }
}

function safeRead(path) {
  try {
    return readFileSync(path, "utf-8");
  } catch (err) {
    console.error(`craft-handoff hook: failed to read ${path}: ${err.message}`);
    return null;
  }
}

const worktree = currentWorktree();

// Collect candidates from pending/. Each candidate carries its stat +
// parsed frontmatter so we can filter and sort in one pass.
const candidates = [];
if (existsSync(PENDING_DIR)) {
  let entries = [];
  try {
    entries = readdirSync(PENDING_DIR);
  } catch (err) {
    console.error(`craft-handoff hook: failed to list ${PENDING_DIR}: ${err.message}`);
  }
  for (const name of entries) {
    if (!name.endsWith(".md")) continue;
    const path = join(PENDING_DIR, name);
    const stat = safeStat(path);
    if (!stat || !stat.isFile()) continue;
    const content = safeRead(path);
    if (content === null) continue;
    const meta = parseFrontmatter(content);
    candidates.push({ path, stat, content, meta });
  }
}

// Legacy fallback: pre-v2 single-file layout. Treated as a match for the
// current worktree (we have no frontmatter to compare) and consumed on
// first run so upgrades don't lose an in-flight handoff.
if (existsSync(LEGACY_PENDING)) {
  const stat = safeStat(LEGACY_PENDING);
  const content = stat ? safeRead(LEGACY_PENDING) : null;
  if (stat && content !== null) {
    candidates.push({
      path: LEGACY_PENDING,
      stat,
      content,
      meta: { worktree, legacy: "true" },
    });
  }
}

if (candidates.length === 0) {
  process.exit(0);
}

const now = Date.now();
const matches = [];
for (const c of candidates) {
  if (c.meta.worktree && c.meta.worktree !== worktree) continue;
  const ageMs = now - c.stat.mtimeMs;
  if (ageMs > STALE_AFTER_MS) {
    const dest = archive(c.path, "stale-");
    console.error(
      `craft-handoff hook: ${basename(c.path)} is ${(ageMs / 3_600_000).toFixed(1)}h old (>${(STALE_AFTER_MS / 3_600_000)}h), archived without injection${dest ? ` to ${dest}` : ""}.`,
    );
    continue;
  }
  matches.push(c);
}

if (matches.length === 0) {
  process.exit(0);
}

// Newest first.
matches.sort((a, b) => b.stat.mtimeMs - a.stat.mtimeMs);
const chosen = matches[0];

// Strip frontmatter before injecting — the next session doesn't need
// our internal metadata, only the composed prompt body.
function stripFrontmatter(content) {
  const lines = content.split("\n");
  if (lines[0] !== "---") return content;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i] === "---") {
      return lines
        .slice(i + 1)
        .join("\n")
        .replace(/^\n+/, "");
    }
  }
  return content;
}

const body = stripFrontmatter(chosen.content);

if (!body.trim()) {
  archive(chosen.path);
  process.exit(0);
}

const payload = {
  hookSpecificOutput: {
    hookEventName: "SessionStart",
    additionalContext: body,
  },
};

process.stdout.write(JSON.stringify(payload));

// Archive the consumed handoff. Failure is non-fatal — worst case, the
// next /clear re-injects the same content, recoverable via `rm`.
archive(chosen.path);

// Any older same-worktree matches are superseded by the one we just
// injected. Move them aside so they don't linger and pollute a future
// /clear.
for (const c of matches.slice(1)) {
  archive(c.path, "superseded-");
}
