/**
 * Evidence collectors for extract-signals.js.
 *
 * Each collect* function returns raw candidate signals
 * ({ name, signal }) that extractSignals groups into evidence.
 * Filesystem access goes through the deps object so tests can inject fakes:
 *   { readFile, fileExists, statSync, readdir }
 *
 * collectScriptCandidates lives in extract-signals-scripts.js and is
 * re-exported here so extract-signals.js public names stay stable.
 * collectDocCandidates lives in extract-signals-docs.js and is
 * re-exported here so extract-signals.js public names stay stable.
 * collectSkillCandidates lives in extract-signals-skills.js and is
 * re-exported here so extract-signals.js public names stay stable.
 * collectSourceSurfaceCandidates lives in extract-signals-source-surface.js and is
 * re-exported here so extract-signals.js public names stay stable.
 * collectTestCandidates lives in extract-signals-tests.js and is
 * re-exported here so extract-signals.js public names stay stable.
 */

import fs from "node:fs";
import path from "node:path";
import { slugifyCandidate } from "./extract-signals-shared.js";
import {
  collectScriptCandidates,
  listScriptFiles,
} from "./extract-signals-scripts.js";
import { collectDocCandidates } from "./extract-signals-docs.js";
import { collectSkillCandidates, readFrontmatterValue } from "./extract-signals-skills.js";
import { collectSourceSurfaceCandidates } from "./extract-signals-source-surface.js";
import { collectTestCandidates, collectSourceTestCandidates } from "./extract-signals-tests.js";

export {
  collectScriptCandidates,
  collectDocCandidates,
  collectSkillCandidates,
  readFrontmatterValue,
  collectSourceSurfaceCandidates,
  collectTestCandidates,
  collectSourceTestCandidates,
};

function getMarkdownSection(content, heading) {
  if (!content) return null;
  const lines = content.split("\n");
  const startPattern = new RegExp(`^##\\s+${heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "i");
  const start = lines.findIndex((line) => startPattern.test(line.trim()));
  if (start === -1) return null;
  const section = [];
  for (let i = start + 1; i < lines.length; i += 1) {
    if (/^##\s+/.test(lines[i])) break;
    section.push(lines[i]);
  }
  return section.join("\n").trim();
}

export function collectSystemMapCandidates(systemMap) {
  const section = getMarkdownSection(systemMap, "Candidate Capability Boundaries");
  if (!section) return [];
  const candidates = [];
  for (const line of section.split("\n")) {
    const match = line.match(/^-\s+`?([a-z][a-z0-9-]*)`?\s+-\s+(.+)$/);
    if (!match) continue;
    candidates.push({
      name: match[1],
      signal: `system-map:${match[1]} (${match[2].trim()})`,
    });
  }
  return candidates;
}

export function collectReadmeCandidates(readme) {
  if (!readme) return [];
  const candidates = [];
  let activeHeading = null;
  for (const line of readme.split("\n")) {
    const heading = line.match(/^#{2,4}\s+(.+?)\s*$/);
    if (heading) {
      activeHeading = /capabilit|feature|support|command|skill/i.test(heading[1])
        ? heading[1].trim()
        : null;
      continue;
    }
    if (!activeHeading) continue;
    const bullet = line.match(/^-\s+(?:`([^`]+)`|([A-Za-z][A-Za-z0-9 -]{2,60}))(?:\s+[-:\u2013\u2014]\s+(.+))?/);
    if (!bullet) continue;
    const rawName = bullet[1] || bullet[2];
    const name = slugifyCandidate(rawName.split(/\s+/).slice(0, 4).join("-"));
    if (!name) continue;
    candidates.push({
      name,
      signal: `README:${activeHeading}: ${line.trim()}`,
    });
  }
  return candidates;
}

export function listDirs(root, { readdir = fs.readdirSync, statSync = fs.statSync, fileExists = fs.existsSync } = {}) {
  if (!fileExists(root)) return [];
  return readdir(root)
    .filter((entry) => {
      if (entry.startsWith(".") || entry.startsWith("_")) return false;
      try {
        return statSync(path.join(root, entry)).isDirectory();
      } catch {
        return false;
      }
    })
    .sort();
}

export function collectCliCommandCandidates(repoRoot, deps = {}) {
  const srcRoot = path.join(repoRoot, "src");
  const candidates = [];
  for (const packageName of listDirs(srcRoot, deps)) {
    const commandsRoot = path.join(srcRoot, packageName, "cli", "commands");
    for (const entry of listScriptFiles(commandsRoot, deps)) {
      if (/\.(test|spec)\.[cm]?[jt]s$/.test(entry)) continue;
      const base = entry.replace(/\.[cm]?[jt]s$/, "");
      candidates.push({
        name: base,
        signal: `script:src/${packageName}/cli/commands/${entry}`,
      });
    }
  }
  return candidates;
}
