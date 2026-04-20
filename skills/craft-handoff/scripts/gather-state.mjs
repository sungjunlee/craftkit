#!/usr/bin/env node
// gather-state.mjs — collect git/worktree state for craft-handoff.
//
// Both Claude Code and Codex CLI ship Node, so this is the portable way
// to get the repo state without relying on agent-specific shell-substitution
// syntax in the skill body. Zero deps.
//
// Usage: node scripts/gather-state.mjs
// Output: human-readable sections (Branch, Status, Diffstat, Recent commits,
//         Worktree root) plus a Handoff target block with PENDING_PATH,
//         ARCHIVE_DIR, and a ready-to-prepend frontmatter block.

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { homedir } from "node:os";
import { basename, join } from "node:path";
import { cwd } from "node:process";

function git(...args) {
  try {
    return execFileSync("git", args, {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trimEnd();
  } catch {
    return "";
  }
}

function head(text, n) {
  return text.split("\n").slice(0, n).join("\n");
}

function tail(text, n) {
  return text.split("\n").slice(-n).join("\n");
}

const root = git("rev-parse", "--show-toplevel") || cwd();
const branch = git("rev-parse", "--abbrev-ref", "HEAD") || "(not a git repo)";
const status = git("status", "--short");
const diffstat = git("diff", "--stat");
const log = git("log", "--oneline", "-8");

// Worktree slug: <basename>-<6 char hash of absolute path>. The hash
// disambiguates same-named checkouts in different locations; the basename
// keeps filenames grep-able.
const slugHash = createHash("sha1").update(root).digest("hex").slice(0, 6);
const slug = `${basename(root).replace(/[^a-zA-Z0-9._-]/g, "_")}-${slugHash}`;

// Filename-safe ISO timestamp: 2026-04-20T03-06-40-000Z.
const now = new Date();
const fileTs = now.toISOString().replace(/[:.]/g, "-");
const handoffDir = join(homedir(), ".craftkit", "handoff");
const pendingPath = join(handoffDir, "pending", `${fileTs}-${slug}.md`);
const archiveDir = join(handoffDir, "archive");

const frontmatter = [
  "---",
  `worktree: ${root}`,
  `branch: ${branch}`,
  `created: ${now.toISOString()}`,
  "---",
].join("\n");

process.stdout.write(
  [
    `Worktree root: ${root}`,
    `Branch: ${branch}`,
    "",
    "Status (first 40):",
    status ? head(status, 40) : "(clean)",
    "",
    "Diffstat (last 20):",
    diffstat ? tail(diffstat, 20) : "(no unstaged changes)",
    "",
    "Recent commits:",
    log || "(no commits)",
    "",
    "--- Handoff target ---",
    `PENDING_PATH=${pendingPath}`,
    `ARCHIVE_DIR=${archiveDir}`,
    `WORKTREE_SLUG=${slug}`,
    "",
    "Frontmatter (prepend to composed prompt before writing, blank line after):",
    frontmatter,
    "",
  ].join("\n"),
);
