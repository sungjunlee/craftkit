#!/usr/bin/env node
// gather-state.mjs — collect git/worktree state for craft-handoff.
//
// Both Claude Code and Codex CLI ship Node, so this is the portable way
// to get the repo state without relying on agent-specific shell-substitution
// syntax in the skill body. Zero deps.
//
// Usage: node scripts/gather-state.mjs
// Output: human-readable sections (Branch, Status, Diffstat, Recent commits,
//         Worktree root) for the agent to read and distill into the handoff.

import { execFileSync } from "node:child_process";
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
  ].join("\n"),
);
