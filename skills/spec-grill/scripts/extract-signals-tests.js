/**
 * Test-surface collectors for extract-signals.js.
 *
 * collectTestCandidates and the helpers only it needs live here.
 * Remaining collectors stay in extract-signals-collectors.js
 * and re-export collectTestCandidates so public names stay stable.
 */

import path from "node:path";
import { listDirs } from "./extract-signals-collectors.js";
import { listScriptFiles, isSkillScriptTest } from "./extract-signals-scripts.js";

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

function collectTestCandidates(repoRoot, deps = {}) {
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

function collectSourceTestCandidates(repoRoot, deps = {}) {
  const testsRoot = path.join(repoRoot, "tests", "unit", "sources");
  return listScriptFiles(testsRoot, deps)
    .filter((entry) => /\.(test|spec)\.[cm]?[jt]s$|^[^.]+\.[cm]?[jt]s$/.test(entry))
    .map((entry) => ({
      name: entry.replace(/\.(test|spec)\.[cm]?[jt]s$/, "").replace(/\.[cm]?[jt]s$/, ""),
      signal: `test:tests/unit/sources/${entry}`,
    }));
}

export {
  collectTestCandidates,
  collectSourceTestCandidates,
};
