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
 * collectReadmeCandidates lives in extract-signals-readme-collectors.js and is
 * re-exported here so extract-signals.js public names stay stable.
 * listDirs lives in extract-signals-list-dirs.js and is
 * re-exported here so existing importers stay stable.
 */

import { collectScriptCandidates } from "./extract-signals-scripts.js";
import { collectDocCandidates } from "./extract-signals-docs.js";
import { collectSkillCandidates, readFrontmatterValue } from "./extract-signals-skills.js";
import { collectSourceSurfaceCandidates } from "./extract-signals-source-surface.js";
import { collectTestCandidates, collectSourceTestCandidates } from "./extract-signals-tests.js";
import { collectCliCommandCandidates } from "./extract-signals-cli-commands.js";
import { collectSystemMapCandidates } from "./extract-signals-system-map.js";
import { collectReadmeCandidates } from "./extract-signals-readme-collectors.js";
import { listDirs } from "./extract-signals-list-dirs.js";

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
  collectReadmeCandidates,
  listDirs,
};
