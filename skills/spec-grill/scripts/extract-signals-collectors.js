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
 * collectCliCommandCandidates lives in extract-signals-cli-commands.js and is
 * re-exported here so extract-signals.js public names stay stable.
 * collectSystemMapCandidates lives in extract-signals-system-map.js and is
 * re-exported here so extract-signals.js public names stay stable.
 */

import fs from "node:fs";
import path from "node:path";
import { slugifyCandidate } from "./extract-signals-shared.js";
import { collectScriptCandidates } from "./extract-signals-scripts.js";
import { collectDocCandidates } from "./extract-signals-docs.js";
import { collectSkillCandidates, readFrontmatterValue } from "./extract-signals-skills.js";
import { collectSourceSurfaceCandidates } from "./extract-signals-source-surface.js";
import { collectTestCandidates, collectSourceTestCandidates } from "./extract-signals-tests.js";
import { collectCliCommandCandidates } from "./extract-signals-cli-commands.js";
import { collectSystemMapCandidates } from "./extract-signals-system-map.js";

export {
  collectScriptCandidates,
  collectDocCandidates,
  collectSkillCandidates,
  readFrontmatterValue,
  collectSourceSurfaceCandidates,
  collectTestCandidates,
  collectSourceTestCandidates,
  collectCliCommandCandidates,
  collectSystemMapCandidates,
};

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
