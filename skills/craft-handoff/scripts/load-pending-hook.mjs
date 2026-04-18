#!/usr/bin/env node
// load-pending-hook.mjs — Claude Code SessionStart hook script.
//
// Reads ~/.craftkit/handoff/pending.md (written by craft-handoff),
// emits it as additionalContext for the new session, then archives
// the file to ~/.craftkit/handoff/archive/<timestamp>.md.
//
// Stale handoffs (older than STALE_AFTER_MS) are archived without
// injection — prevents an old pending.md from polluting an unrelated
// /clear that happens hours or days later.
//
// Wire up in ~/.claude/settings.json — see references/auto-load-hook.md.
//
// Zero dependencies. Requires Node 18+ (already required by Claude Code).

import { readFileSync, renameSync, mkdirSync, statSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const HANDOFF_DIR = join(homedir(), ".craftkit", "handoff");
const pending = join(HANDOFF_DIR, "pending.md");
const archiveDir = join(HANDOFF_DIR, "archive");

// Handoffs older than this are archived without injection. Rationale:
// craft-handoff is paired with an imminent /clear. If pending.md has been
// sitting for half a day, the /clear is likely unrelated to that handoff.
const STALE_AFTER_MS = 12 * 60 * 60 * 1000;

if (!existsSync(pending)) {
  process.exit(0);
}

let stat;
try {
  stat = statSync(pending);
} catch (err) {
  console.error(`craft-handoff hook: failed to stat ${pending}: ${err.message}`);
  process.exit(0);
}

let content = "";
try {
  content = readFileSync(pending, "utf-8");
} catch (err) {
  console.error(`craft-handoff hook: failed to read ${pending}: ${err.message}`);
  process.exit(0);
}

function archive(prefix = "") {
  try {
    mkdirSync(archiveDir, { recursive: true });
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    const dest = join(archiveDir, `${prefix}${ts}.md`);
    renameSync(pending, dest);
    return dest;
  } catch (err) {
    console.error(`craft-handoff hook: archive failed: ${err.message}`);
    return null;
  }
}

const ageMs = Date.now() - stat.mtimeMs;
if (ageMs > STALE_AFTER_MS) {
  const ageHours = (ageMs / 3_600_000).toFixed(1);
  const ttlHours = STALE_AFTER_MS / 3_600_000;
  const dest = archive("stale-");
  console.error(
    `craft-handoff hook: pending.md is ${ageHours}h old (>${ttlHours}h), archived without injection${dest ? ` to ${dest}` : ""}.`,
  );
  process.exit(0);
}

if (!content.trim()) {
  archive();
  process.exit(0);
}

const payload = {
  hookSpecificOutput: {
    hookEventName: "SessionStart",
    additionalContext: content,
  },
};

process.stdout.write(JSON.stringify(payload));

// Move to archive after injection. Failure is non-fatal — worst case, the
// next /clear re-injects the same content, recoverable via `rm pending.md`.
archive();
