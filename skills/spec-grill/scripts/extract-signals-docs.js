/**
 * Doc-surface collectors for extract-signals.js.
 *
 * collectDocCandidates and the helpers only it needs live here.
 * Remaining collectors stay in extract-signals-collectors.js
 * and re-export collectDocCandidates so public names stay stable.
 */

import fs from "node:fs";
import path from "node:path";
import { slugifyCandidate } from "./extract-signals-shared.js";

function collectDocCandidates(repoRoot, deps = {}, knownNames = []) {
  const roots = ["docs", "skills"];
  const candidates = [];
  const known = knownNames.map((name) => slugifyCandidate(name)).filter(Boolean).sort((a, b) => b.length - a.length);
  for (const rootName of roots) {
    const root = path.join(repoRoot, rootName);
    for (const relPath of listMarkdownFiles(root, deps)) {
      const normalized = relPath.replace(/\\/g, "/");
      if (rootName === "skills" && normalized.endsWith("/SKILL.md")) continue;
      const normalizedSlug = slugifyCandidate(normalized);
      const matched = known.find((name) => hasSlugBoundaryMatch(normalizedSlug, name));
      if (!matched) continue;
      candidates.push({
        name: matched,
        signal: `doc:${rootName}/${normalized}`,
      });
      if (candidates.length >= 100) return candidates;
    }
  }
  return candidates;
}

function hasSlugBoundaryMatch(slug, candidate) {
  const escaped = candidate.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|-)${escaped}(-|$)`).test(slug);
}

function listMarkdownFiles(root, deps = {}, prefix = "") {
  const { readdir = fs.readdirSync, statSync = fs.statSync, fileExists = fs.existsSync } = deps;
  if (!fileExists(root)) return [];
  const files = [];
  for (const entry of readdir(root).sort()) {
    if (entry.startsWith(".")) continue;
    const full = path.join(root, entry);
    const rel = path.join(prefix, entry);
    let stat;
    try {
      stat = statSync(full);
    } catch {
      continue;
    }
    if (stat.isDirectory()) {
      files.push(...listMarkdownFiles(full, deps, rel));
    } else if (stat.isFile() && entry.endsWith(".md")) {
      files.push(rel);
    }
  }
  return files;
}

export {
  collectDocCandidates,
};
