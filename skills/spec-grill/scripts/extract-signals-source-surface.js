/**
 * Source-surface collectors for extract-signals.js.
 *
 * collectSourceSurfaceCandidates and the helpers only it needs live here.
 * Remaining collectors stay in extract-signals-collectors.js
 * and re-export collectSourceSurfaceCandidates so public names stay stable.
 */

import fs from "node:fs";
import path from "node:path";
import { listDirs } from "./extract-signals-collectors.js";

function collectSourceSurfaceCandidates(repoRoot, deps = {}) {
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

export {
  collectSourceSurfaceCandidates,
};
