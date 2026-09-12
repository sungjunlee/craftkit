/**
 * CLI-command collectors for extract-signals.js.
 *
 * collectCliCommandCandidates and the helpers only it needs live here.
 * Remaining collectors stay in extract-signals-collectors.js
 * and re-export collectCliCommandCandidates so public names stay stable.
 */

import path from "node:path";
import { listDirs } from "./extract-signals-collectors.js";
import { listScriptFiles } from "./extract-signals-scripts.js";

function collectCliCommandCandidates(repoRoot, deps = {}) {
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

export {
  collectCliCommandCandidates,
};
