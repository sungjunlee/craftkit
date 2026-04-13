#!/usr/bin/env node
// load-pending-hook.mjs — Claude Code SessionStart hook script.
//
// Reads ~/.craftkit/handoff/pending.md (written by craft-handoff),
// emits it as additionalContext for the new session, then deletes
// the file so it's a one-shot.
//
// Wire up in ~/.claude/settings.json — see references/auto-load-hook.md.
//
// Zero dependencies. Requires Node 18+ (already required by Claude Code).

import { readFileSync, unlinkSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const pending = join(homedir(), ".craftkit", "handoff", "pending.md");

if (!existsSync(pending)) {
  // No pending handoff — exit silently. Hook contributes nothing.
  process.exit(0);
}

let content;
try {
  content = readFileSync(pending, "utf-8");
} catch (err) {
  // Surface read errors to stderr so the user sees them in hook logs.
  console.error(`craft-handoff hook: failed to read ${pending}: ${err.message}`);
  process.exit(0);
}

if (!content.trim()) {
  // Empty file — clean up and bail.
  try { unlinkSync(pending); } catch { /* best-effort */ }
  process.exit(0);
}

const payload = {
  hookSpecificOutput: {
    hookEventName: "SessionStart",
    additionalContext: content,
  },
};

process.stdout.write(JSON.stringify(payload));

// One-shot: delete after consuming. Failure here is non-fatal — the next
// /clear would just re-inject the same content, which the user can recover
// from with `rm ~/.craftkit/handoff/pending.md`.
try {
  unlinkSync(pending);
} catch (err) {
  console.error(`craft-handoff hook: injected but could not delete ${pending}: ${err.message}`);
}
