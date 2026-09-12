#!/usr/bin/env node
/**
 * Brownfield bootstrap for spec/capabilities.md.
 *
 * Usage: ./scripts/extract-signals.js [--repo-root PATH] [--commit-limit N] [--dry-run] [--json]
 *
 * Reads repo signals and reports raw capability seeds that
 * grill mode can interview against. Does not write spec/capabilities.md —
 * grill mode owns admission, merging, splitting, and naming.
 *
 * Signal authority:
 *   - README.md / spec/charter.md — product authority
 *   - Top-level source dirs     — repo-structure evidence
 *   - CLAUDE.md / AGENTS.md     — development-harness conventions
 *   - Last N commit messages    — history
 *
 * Output: JSON of shape
 *   {
 *     signal_authority: [{ signal, authority, found, note }],
 *     capabilities: [{
 *       name, signals, evidence, missing_evidence,
 *       evidence_class_count, evidence_classes, admission_hint,
 *       admission_reason, blocking_missing_evidence,
 *       candidate_goal, candidate_scope
 *     }]
 *   }
 *
 * Same inputs produce the same draft (deterministic ordering).
 *
 * Ownership:
 *   - extract-signals-core.js       — extractSignals orchestration
 *   - extract-signals-charter.js    — charter/source-root/commit-scope helpers
 *   - extract-signals-authority.js  — buildSignalAuthority
 *   - extract-signals-readme.js     — summarizeReadme
 *   - extract-signals-cli.js        — parseArgs / runCli report glue
 *   - extract-signals-scripts.js         — collectScriptCandidates
 *   - extract-signals-docs.js            — collectDocCandidates
 *   - extract-signals-skills.js          — collectSkillCandidates
 *   - extract-signals-source-surface.js  — collectSourceSurfaceCandidates
 *   - extract-signals-tests.js           — collectTestCandidates
 *   - extract-signals-cli-commands.js    — collectCliCommandCandidates
 *   - extract-signals-system-map.js      — collectSystemMapCandidates
 *   - extract-signals-collectors.js      — remaining evidence collectors
 *   - this file                     — CLI entry + public re-exports
 */

import { fileURLToPath } from "node:url";
import { parseArgs, runCli } from "./extract-signals-cli.js";
import {
  buildSignalAuthority,
  detectSourceRoot,
  listCapabilityCandidates,
  extractCommitScopes,
  getRecentCommitMessages,
  resolveCharterPath,
  CANONICAL_CHARTER_PATH,
  LEGACY_CHARTER_PATH,
  resolveCharterFile,
  readCharterObjectives,
  summarizeReadme,
  extractSignals,
} from "./extract-signals-core.js";

function main() {
  runCli(extractSignals);
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) main();

export {
  buildSignalAuthority,
  parseArgs,
  detectSourceRoot,
  listCapabilityCandidates,
  extractCommitScopes,
  getRecentCommitMessages,
  resolveCharterPath,
  CANONICAL_CHARTER_PATH,
  LEGACY_CHARTER_PATH,
  resolveCharterFile,
  readCharterObjectives,
  summarizeReadme,
  extractSignals,
};
export {
  summarizeEvidence,
  buildCapability,
  mergeCandidates,
} from "./extract-signals-merge.js";
export { formatHumanReport } from "./extract-signals-report.js";

export {
  slugifyCandidate,
  readOptionalFile,
} from "./extract-signals-shared.js";
export {
  collectSystemMapCandidates,
  collectReadmeCandidates,
  collectSkillCandidates,
  collectScriptCandidates,
  collectCliCommandCandidates,
  collectSourceSurfaceCandidates,
  collectDocCandidates,
  collectTestCandidates,
  collectSourceTestCandidates,
  readFrontmatterValue,
} from "./extract-signals-collectors.js";
