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
 */

import { fileURLToPath } from "node:url";
import { extractSignals } from "./extract-signals-core.js";
import { formatHumanReport } from "./extract-signals-report.js";

const DEFAULT_COMMIT_LIMIT = 100;

function usage() {
  return "Usage: extract-signals.js [--repo-root PATH] [--commit-limit N] [--dry-run] [--json]";
}

function parseArgs(args) {
  const options = {
    repoRoot: ".",
    commitLimit: DEFAULT_COMMIT_LIMIT,
    dryRun: false,
    json: false,
  };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "--dry-run") { options.dryRun = true; continue; }
    if (arg === "--json")    { options.json = true;   continue; }
    if (arg === "--help" || arg === "-h") return { ...options, help: true };

    if (arg === "--repo-root") {
      const next = args[i + 1];
      if (!next || next.startsWith("-")) return { ...options, error: `Missing value for --repo-root. ${usage()}` };
      options.repoRoot = next; i += 1; continue;
    }
    if (arg.startsWith("--repo-root=")) {
      options.repoRoot = arg.slice("--repo-root=".length); continue;
    }
    if (arg === "--commit-limit") {
      const next = args[i + 1];
      if (!next || !/^[1-9]\d*$/.test(next)) {
        return { ...options, error: `--commit-limit expects a positive integer. ${usage()}` };
      }
      options.commitLimit = Number(next); i += 1; continue;
    }
    if (arg.startsWith("--commit-limit=")) {
      const raw = arg.slice("--commit-limit=".length);
      if (!/^[1-9]\d*$/.test(raw)) {
        return { ...options, error: `--commit-limit expects a positive integer. ${usage()}` };
      }
      options.commitLimit = Number(raw); continue;
    }
    return { ...options, error: `Unknown argument: ${arg}. ${usage()}` };
  }

  return options;
}

function main() {
  const parsed = parseArgs(process.argv.slice(2));
  if (parsed.error) { console.error(parsed.error); process.exit(1); }
  if (parsed.help) { console.log(usage()); return; }

  const result = extractSignals(parsed);

  if (parsed.json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  console.log(formatHumanReport(result));
  if (parsed.dryRun) {
    console.log("");
    console.log("[dry-run] No files written. extract-signals never writes; the flag is a no-op for parity with sibling scripts.");
  }
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) main();

export { parseArgs };
export {
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
