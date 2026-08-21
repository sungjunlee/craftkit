/**
 * Evidence collectors for extract-signals.js.
 *
 * Each collect* function returns raw candidate signals
 * ({ name, signal }) that extractSignals groups into evidence.
 * Filesystem access goes through the deps object so tests can inject fakes:
 *   { readFile, fileExists, statSync, readdir }
 */

import fs from "node:fs";
import path from "node:path";
import { slugifyCandidate, readOptionalFile } from "./extract-signals-shared.js";

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

function listDirs(root, { readdir = fs.readdirSync, statSync = fs.statSync, fileExists = fs.existsSync } = {}) {
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

export function readFrontmatterValue(content, key, fallback = "") {
  if (!content?.startsWith("---\n")) return fallback;
  const end = content.indexOf("\n---\n", 4);
  if (end === -1) return fallback;

  const lines = content.slice(4, end).split("\n");
  const keyPattern = new RegExp(`^${key}:\\s*(.*)$`);

  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(keyPattern);
    if (!match) continue;

    const raw = match[1].trim();
    if (raw === ">-" || raw === ">" || raw === "|-" || raw === "|") {
      const block = [];
      for (let blockIndex = index + 1; blockIndex < lines.length; blockIndex += 1) {
        const line = lines[blockIndex];
        if (/^[A-Za-z0-9_-]+:\s*/.test(line)) break;
        if (!line.startsWith(" ") && !line.startsWith("\t")) break;
        block.push(line.trim());
      }
      return block.join(" ").trim() || fallback;
    }

    return raw.replace(/^['"]|['"]$/g, "") || fallback;
  }

  return fallback;
}

export function collectSkillCandidates(repoRoot, deps = {}) {
  const skillsRoot = path.join(repoRoot, "skills");
  return listDirs(skillsRoot, deps).flatMap((entry) => {
    const skillPath = path.join(skillsRoot, entry, "SKILL.md");
    const content = readOptionalFile(skillPath, deps);
    if (!content) return [];
    const name = readFrontmatterValue(content, "name", entry);
    const description = readFrontmatterValue(content, "description", "skill surface");
    return [{ name, signal: `skill:${entry} (${description.slice(0, 120)})` }];
  });
}

export function collectScriptCandidates(repoRoot, deps = {}) {
  const skillsRoot = path.join(repoRoot, "skills");
  const candidates = [];
  for (const skill of listDirs(skillsRoot, deps)) {
    const scriptsRoot = path.join(skillsRoot, skill, "scripts");
    for (const entry of listScriptFiles(scriptsRoot, deps)) {
      if (isSkillScriptTest(entry)) continue;
      const base = scriptCandidateName(entry);
      candidates.push({
        name: base,
        signal: `script:skills/${skill}/scripts/${entry}`,
      });
    }
  }
  candidates.push(...collectRepoScriptCandidates(repoRoot, deps));
  candidates.push(...collectCliCommandCandidates(repoRoot, deps));
  return candidates;
}

function collectRepoScriptCandidates(repoRoot, deps = {}) {
  const scriptsRoot = path.join(repoRoot, "scripts");
  return listScriptFiles(scriptsRoot, deps)
    .filter((entry) => !isSkillScriptTest(entry))
    .map((entry) => ({
      name: scriptCandidateName(entry),
      signal: `script:scripts/${entry}`,
    }));
}

function scriptCandidateName(entry) {
  return entry
    .replace(/\.(test|cli|integration)\.[cm]?[jt]s$/, "")
    .replace(/\.[cm]?[jt]s$/, "")
    .replace(/\.sh$/, "");
}

function isSkillScriptTest(entry) {
  return /\.(test|spec|integration\.test|cli\.test)\.[cm]?[jt]s$/.test(entry);
}

function listScriptFiles(root, { readdir = fs.readdirSync, statSync = fs.statSync, fileExists = fs.existsSync } = {}) {
  if (!fileExists(root)) return [];
  return readdir(root)
    .filter((entry) => {
      try {
        return statSync(path.join(root, entry)).isFile() && /\.(?:[cm]?[jt]s|sh)$/.test(entry);
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

function collectCliCommandTestCandidates(repoRoot, deps = {}) {
  const srcRoot = path.join(repoRoot, "src");
  const candidates = [];
  for (const packageName of listDirs(srcRoot, deps)) {
    const commandsRoot = path.join(srcRoot, packageName, "cli", "commands");
    for (const entry of listScriptFiles(commandsRoot, deps)) {
      if (!/\.(test|spec)\.[cm]?[jt]s$/.test(entry)) continue;
      const base = entry.replace(/\.(test|spec)\.[cm]?[jt]s$/, "");
      candidates.push({
        name: base,
        signal: `test:src/${packageName}/cli/commands/${entry}`,
      });
    }
  }
  return candidates;
}

export function collectSourceSurfaceCandidates(repoRoot, deps = {}) {
  const srcRoot = path.join(repoRoot, "src");
  const candidates = [];
  for (const packageName of listDirs(srcRoot, deps)) {
    const sourcesRoot = path.join(srcRoot, packageName, "sources");
    for (const entry of listSourceSurfaceEntries(sourcesRoot, deps)) {
      const base = entry.replace(/\.[cm]?[jt]s$/, "");
      candidates.push({
        name: base,
        signal: `source:src/${packageName}/sources/${entry}`,
      });
    }
  }
  return candidates;
}

function listSourceSurfaceEntries(root, { readdir = fs.readdirSync, statSync = fs.statSync, fileExists = fs.existsSync } = {}) {
  if (!fileExists(root)) return [];
  return readdir(root)
    .filter((entry) => {
      if (entry.startsWith(".") || entry.startsWith("_")) return false;
      try {
        const stat = statSync(path.join(root, entry));
        return stat.isDirectory()
          || (stat.isFile() && /\.[cm]?[jt]s$/.test(entry) && !/\.(test|spec)\.[cm]?[jt]s$/.test(entry));
      } catch {
        return false;
      }
    })
    .sort();
}

export function collectDocCandidates(repoRoot, deps = {}, knownNames = []) {
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

export function collectTestCandidates(repoRoot, deps = {}) {
  const skillsRoot = path.join(repoRoot, "skills");
  const candidates = [];
  for (const skill of listDirs(skillsRoot, deps)) {
    const scriptsRoot = path.join(skillsRoot, skill, "scripts");
    for (const entry of listScriptFiles(scriptsRoot, deps)) {
      if (!isSkillScriptTest(entry)) continue;
      const base = entry
        .replace(/\.(integration|cli)\.test\.[cm]?[jt]s$/, "")
        .replace(/\.(test|spec)\.[cm]?[jt]s$/, "");
      candidates.push({
        name: base,
        signal: `test:skills/${skill}/scripts/${entry}`,
      });
    }
  }
  candidates.push(...collectRepoScriptTestCandidates(repoRoot, deps));
  candidates.push(...collectSourceTestCandidates(repoRoot, deps));
  candidates.push(...collectCliCommandTestCandidates(repoRoot, deps));
  return candidates;
}

function collectRepoScriptTestCandidates(repoRoot, deps = {}) {
  const scriptsRoot = path.join(repoRoot, "scripts");
  return listScriptFiles(scriptsRoot, deps)
    .filter((entry) => /\.(test|spec)\.[cm]?[jt]s$/.test(entry))
    .map((entry) => ({
      name: entry.replace(/\.(test|spec)\.[cm]?[jt]s$/, ""),
      signal: `test:scripts/${entry}`,
    }));
}

export function collectSourceTestCandidates(repoRoot, deps = {}) {
  const testsRoot = path.join(repoRoot, "tests", "unit", "sources");
  return listScriptFiles(testsRoot, deps)
    .filter((entry) => /\.(test|spec)\.[cm]?[jt]s$|^[^.]+\.[cm]?[jt]s$/.test(entry))
    .map((entry) => ({
      name: entry.replace(/\.(test|spec)\.[cm]?[jt]s$/, "").replace(/\.[cm]?[jt]s$/, ""),
      signal: `test:tests/unit/sources/${entry}`,
    }));
}
