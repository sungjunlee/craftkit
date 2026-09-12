/**
 * Charter path, source-root, and commit-scope helpers for extract-signals.js.
 *
 * extractSignals orchestration stays in extract-signals-core.js and imports
 * these lookups. Charter path constants live here with the resolvers.
 */

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { slugifyCandidate, readOptionalFile } from "./extract-signals-shared.js";

const CANONICAL_CHARTER_PATH = path.join("spec", "charter.md");
const LEGACY_CHARTER_PATH = "CHARTER.md";

const SOURCE_ROOT_CANDIDATES = ["src", "lib", "app", "packages", "skills"];

function detectSourceRoot(repoRoot, { fileExists = fs.existsSync, statSync = fs.statSync } = {}) {
  for (const candidate of SOURCE_ROOT_CANDIDATES) {
    const candidatePath = path.join(repoRoot, candidate);
    if (fileExists(candidatePath) && statSync(candidatePath).isDirectory()) {
      return { name: candidate, path: candidatePath };
    }
  }
  return null;
}

function listCapabilityCandidates(sourceRoot, { readdir = fs.readdirSync, statSync = fs.statSync } = {}) {
  if (!sourceRoot) return [];
  return readdir(sourceRoot.path)
    .filter((entry) => {
      if (entry.startsWith(".") || entry.startsWith("_")) return false;
      try {
        return statSync(path.join(sourceRoot.path, entry)).isDirectory();
      } catch {
        return false;
      }
    })
    .sort();
}

function extractCommitScopes(commitMessages) {
  const scopes = new Map();
  for (const message of commitMessages) {
    const match = message.match(/^[a-z]+\(([a-z][\w.\-,/ ]*)\)[!:]/);
    if (!match) continue;
    for (const raw of match[1].split(",")) {
      const scope = slugifyCandidate(raw.trim());
      if (!scope) continue;
      scopes.set(scope, (scopes.get(scope) || 0) + 1);
    }
  }
  return scopes;
}

function getRecentCommitMessages(repoRoot, limit, { exec = execFileSync } = {}) {
  try {
    const out = exec(
      "git",
      ["-C", repoRoot, "log", `-n`, String(limit), "--pretty=%s"],
      { encoding: "utf-8", maxBuffer: 10 * 1024 * 1024 },
    );
    return out.split("\n").filter(Boolean);
  } catch {
    return [];
  }
}

function resolveCharterPath({ repoRoot, fileExists = fs.existsSync } = {}) {
  const canonicalPath = path.join(repoRoot, CANONICAL_CHARTER_PATH);
  if (fileExists(canonicalPath)) {
    return { found: true, charterPath: canonicalPath, source: "canonical" };
  }

  const legacyPath = path.join(repoRoot, LEGACY_CHARTER_PATH);
  if (fileExists(legacyPath)) {
    return { found: true, charterPath: legacyPath, source: "legacy" };
  }

  return { found: false, charterPath: canonicalPath, source: "missing" };
}

function resolveCharterFile(repoRoot, deps = {}) {
  const resolved = resolveCharterPath({ repoRoot, fileExists: deps.fileExists });
  if (!resolved.found) {
    return { found: false, path: resolved.charterPath, source: resolved.source, content: null };
  }
  return {
    found: true,
    path: resolved.charterPath,
    source: resolved.source,
    content: readOptionalFile(resolved.charterPath, deps),
  };
}

function readCharterObjectives(repoRoot, deps = {}) {
  const charter = resolveCharterFile(repoRoot, deps);
  if (!charter.content) return [];
  const objectives = [];
  for (const line of charter.content.split("\n")) {
    const statusMatch = line.match(/^- (O\d+) \[(validated|implemented|active|deferred)\]\s+(.*?)(?:\s+·\s+src:|\s*$)/);
    if (statusMatch) {
      objectives.push({ id: statusMatch[1], status: statusMatch[2], predicate: statusMatch[3].trim() });
      continue;
    }
    const leanMatch = line.match(/^- (O\d+)\s+[—–-]\s+(.*?)(?:\s+·\s+src:|\s*$)/);
    if (leanMatch) {
      objectives.push({ id: leanMatch[1], status: null, predicate: leanMatch[2].trim() });
    }
  }
  return objectives;
}

export {
  detectSourceRoot,
  listCapabilityCandidates,
  extractCommitScopes,
  getRecentCommitMessages,
  resolveCharterPath,
  CANONICAL_CHARTER_PATH,
  LEGACY_CHARTER_PATH,
  resolveCharterFile,
  readCharterObjectives,
};
