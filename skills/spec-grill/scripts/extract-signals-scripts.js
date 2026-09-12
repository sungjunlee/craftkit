/**
 * Script-surface collectors for extract-signals.js.
 *
 * collectScriptCandidates and the helpers only it needs live here.
 * Skill, doc, and test collectors stay in extract-signals-collectors.js
 * and re-export collectScriptCandidates so public names stay stable.
 */

import fs from "node:fs";
import path from "node:path";
import { listDirs, collectCliCommandCandidates } from "./extract-signals-collectors.js";

function collectScriptCandidates(repoRoot, deps = {}) {
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

export {
  collectScriptCandidates,
  listScriptFiles,
  isSkillScriptTest,
};
