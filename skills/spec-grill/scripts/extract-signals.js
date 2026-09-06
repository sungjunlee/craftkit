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

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { slugifyCandidate, readOptionalFile } from "./extract-signals-shared.js";
import {
  collectSystemMapCandidates,
  collectReadmeCandidates,
  collectSkillCandidates,
  collectScriptCandidates,
  collectCliCommandCandidates,
  collectSourceSurfaceCandidates,
  collectDocCandidates,
  collectTestCandidates,
  collectSourceTestCandidates,
} from "./extract-signals-collectors.js";
import {
  EVIDENCE_KINDS,
  makeEmptyEvidence,
  mergeCandidates,
  buildCapability,
} from "./extract-signals-merge.js";
import { parseArgs, runCli } from "./extract-signals-cli.js";

const CANONICAL_CHARTER_PATH = path.join("spec", "charter.md");
const LEGACY_CHARTER_PATH = "CHARTER.md";

const SOURCE_ROOT_CANDIDATES = ["src", "lib", "app", "packages", "skills"];
const DEFAULT_COMMIT_LIMIT = 100;

function buildSignalAuthority({
  readmeFound,
  charterFound,
  charterSource,
  systemMapFound,
  harnessFiles,
  sourceRoot,
  commitsScanned,
  repoSurfaceFound = sourceRoot !== null,
}) {
  return [
    {
      signal: "README.md",
      authority: "product",
      found: readmeFound,
      note: "User-facing product framing; can seed Problem, Approach, and capability goals.",
    },
    {
      signal: "spec/charter.md",
      authority: "product",
      found: charterFound,
      note: charterSource === "legacy"
        ? "Accepted project axis found through legacy root CHARTER.md fallback; migrate to spec/charter.md."
        : "Accepted project axis; Objectives can constrain capability candidates.",
    },
    {
      signal: "spec/system-map.md",
      authority: "system-shape",
      found: systemMapFound,
      note: "High-level boundaries, flows, invariants, and candidate capability handoff evidence.",
    },
    {
      signal: "CLAUDE.md/AGENTS.md",
      authority: "development-harness",
      found: harnessFiles.length > 0,
      note: "Agent workflow and repo conventions; does not create product capability boundaries by itself.",
    },
    {
      signal: sourceRoot ? `${sourceRoot.name}/` : "source root",
      authority: "repo-structure",
      found: sourceRoot !== null,
      note: "Code organization evidence; useful as raw candidate surface, not final capability authority.",
    },
    {
      signal: "skill/script/doc/test surfaces",
      authority: "repo-surface",
      found: repoSurfaceFound,
      note: "Command and documentation surfaces can support candidates, but do not admit capabilities by themselves.",
    },
    {
      signal: "git commit scopes",
      authority: "history",
      found: commitsScanned > 0,
      note: "Recent work history; clusters usage but does not override accepted specs.",
    },
  ];
}

function detectSourceRoot(repoRoot, { fileExists = fs.existsSync, statSync = fs.statSync } = {}) {
  for (const candidate of SOURCE_ROOT_CANDIDATES) {
    const candidatePath = path.join(repoRoot, candidate);
    if (fileExists(candidatePath) && statSync(candidatePath).isDirectory()) {
      return { name: candidate, path: candidatePath };
    }
  }
  return null;
}

function listCapabilityCandidates(sourceRoot, { readdir = fs.readdirSync, statSync = fs.statSync } = {}) {
  if (!sourceRoot) return [];
  return readdir(sourceRoot.path)
    .filter((entry) => {
      if (entry.startsWith(".") || entry.startsWith("_")) return false;
      try {
        return statSync(path.join(sourceRoot.path, entry)).isDirectory();
      } catch {
        return false;
      }
    })
    .sort();
}

function extractCommitScopes(commitMessages) {
  const scopes = new Map();
  for (const message of commitMessages) {
    const match = message.match(/^[a-z]+\(([a-z][\w.\-,/ ]*)\)[!:]/);
    if (!match) continue;
    for (const raw of match[1].split(",")) {
      const scope = slugifyCandidate(raw.trim());
      if (!scope) continue;
      scopes.set(scope, (scopes.get(scope) || 0) + 1);
    }
  }
  return scopes;
}

function getRecentCommitMessages(repoRoot, limit, { exec = execFileSync } = {}) {
  try {
    const out = exec(
      "git",
      ["-C", repoRoot, "log", `-n`, String(limit), "--pretty=%s"],
      { encoding: "utf-8", maxBuffer: 10 * 1024 * 1024 },
    );
    return out.split("\n").filter(Boolean);
  } catch {
    return [];
  }
}

function resolveCharterPath({ repoRoot, fileExists = fs.existsSync } = {}) {
  const canonicalPath = path.join(repoRoot, CANONICAL_CHARTER_PATH);
  if (fileExists(canonicalPath)) {
    return { found: true, charterPath: canonicalPath, source: "canonical" };
  }

  const legacyPath = path.join(repoRoot, LEGACY_CHARTER_PATH);
  if (fileExists(legacyPath)) {
    return { found: true, charterPath: legacyPath, source: "legacy" };
  }

  return { found: false, charterPath: canonicalPath, source: "missing" };
}

function addEvidence(candidates, name, kind, value) {
  const slug = slugifyCandidate(name);
  if (!slug || !EVIDENCE_KINDS.includes(kind) || !value) return;
  if (!candidates.has(slug)) {
    candidates.set(slug, {
      name: slug,
      signals: new Set(),
      evidence: makeEmptyEvidence(),
      missing_evidence: new Set(),
    });
  }
  const candidate = candidates.get(slug);
  if (!candidate.evidence[kind].includes(value)) {
    candidate.evidence[kind].push(value);
  }
  candidate.signals.add(value);
}

function addMissingEvidence(candidates, name, value) {
  const slug = slugifyCandidate(name);
  if (!slug) return;
  if (!candidates.has(slug)) {
    candidates.set(slug, {
      name: slug,
      signals: new Set(),
      evidence: makeEmptyEvidence(),
      missing_evidence: new Set(),
    });
  }
  candidates.get(slug).missing_evidence.add(value);
}

function resolveCharterFile(repoRoot, deps = {}) {
  const resolved = resolveCharterPath({ repoRoot, fileExists: deps.fileExists });
  if (!resolved.found) {
    return { found: false, path: resolved.charterPath, source: resolved.source, content: null };
  }
  return {
    found: true,
    path: resolved.charterPath,
    source: resolved.source,
    content: readOptionalFile(resolved.charterPath, deps),
  };
}

function readCharterObjectives(repoRoot, deps = {}) {
  const charter = resolveCharterFile(repoRoot, deps);
  if (!charter.content) return [];
  const objectives = [];
  for (const line of charter.content.split("\n")) {
    const statusMatch = line.match(/^- (O\d+) \[(validated|implemented|active|deferred)\]\s+(.*?)(?:\s+·\s+src:|\s*$)/);
    if (statusMatch) {
      objectives.push({ id: statusMatch[1], status: statusMatch[2], predicate: statusMatch[3].trim() });
      continue;
    }
    const leanMatch = line.match(/^- (O\d+)\s+[—–-]\s+(.*?)(?:\s+·\s+src:|\s*$)/);
    if (leanMatch) {
      objectives.push({ id: leanMatch[1], status: null, predicate: leanMatch[2].trim() });
    }
  }
  return objectives;
}

function summarizeReadme(readme) {
  if (!readme) return null;
  for (const line of readme.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith("#")) continue;
    if (trimmed.startsWith("[!")) continue;
    if (trimmed.startsWith("<!--")) continue;
    if (/^<\/?div\b/i.test(trimmed)) continue;
    if (/^<p\b/i.test(trimmed) || /^<\/p>/i.test(trimmed)) continue;
    if (/^<br\s*\/?>$/i.test(trimmed)) continue;
    if (/^\[.+\]\(.+\)(\s*[•|·]\s*\[.+\]\(.+\))*$/.test(trimmed)) continue;
    return trimmed.length > 240 ? `${trimmed.slice(0, 237)}...` : trimmed;
  }
  return null;
}

function extractSignals({
  repoRoot = ".",
  commitLimit = DEFAULT_COMMIT_LIMIT,
  readFile = fs.readFileSync,
  fileExists = fs.existsSync,
  readdir = fs.readdirSync,
  statSync = fs.statSync,
  exec = execFileSync,
} = {}) {
  const deps = { readFile, fileExists, statSync, readdir, exec };

  const readme = readOptionalFile(path.join(repoRoot, "README.md"), deps);
  const charter = resolveCharterFile(repoRoot, deps);
  const systemMap = readOptionalFile(path.join(repoRoot, "spec", "system-map.md"), deps);
  const claudeMd = readOptionalFile(path.join(repoRoot, "CLAUDE.md"), deps);
  const agentsMd = readOptionalFile(path.join(repoRoot, "AGENTS.md"), deps);
  const harnessFiles = [
    ["CLAUDE.md", claudeMd],
    ["AGENTS.md", agentsMd],
  ].filter(([, content]) => content !== null).map(([name]) => name);
  const sourceRoot = detectSourceRoot(repoRoot, deps);
  const dirNames = listCapabilityCandidates(sourceRoot, deps);
  const normalizedDirNames = new Set(dirNames.map((name) => slugifyCandidate(name)).filter(Boolean));
  const commitMessages = getRecentCommitMessages(repoRoot, commitLimit, deps);
  const scopeCounts = extractCommitScopes(commitMessages);
  const charterObjectives = readCharterObjectives(repoRoot, deps);
  const readmeSummary = summarizeReadme(readme);
  const groupedEvidence = new Map();

  const inventory = {
    repoRoot: path.resolve(repoRoot),
    readmeFound: readme !== null,
    charterFound: charter.found,
    charterPath: charter.found ? charter.path : null,
    charterSource: charter.source,
    systemMapFound: systemMap !== null,
    claudeMdFound: harnessFiles.length > 0,
    harnessFiles,
    sourceRoot: sourceRoot ? sourceRoot.name : null,
    sourceDirCount: dirNames.length,
    commitsScanned: commitMessages.length,
    commitScopeCount: scopeCounts.size,
    charterObjectiveCount: charterObjectives.length,
  };
  for (const name of dirNames) {
    if (sourceRoot) addEvidence(groupedEvidence, name, "source_dirs", `${sourceRoot.name}/${name}/`);
  }
  for (const [scope, count] of scopeCounts.entries()) {
    if (count >= 2 || normalizedDirNames.has(scope)) {
      addEvidence(groupedEvidence, scope, "commits", `commit-scope:${scope} (${count})`);
    }
  }
  for (const candidate of collectSystemMapCandidates(systemMap)) {
    addEvidence(groupedEvidence, candidate.name, "system_map", candidate.signal);
  }
  for (const candidate of collectReadmeCandidates(readme)) {
    addEvidence(groupedEvidence, candidate.name, "readme", candidate.signal);
  }
  for (const candidate of collectSkillCandidates(repoRoot, deps)) {
    addEvidence(groupedEvidence, candidate.name, "skill", candidate.signal);
  }
  for (const candidate of collectSourceSurfaceCandidates(repoRoot, deps)) {
    addEvidence(groupedEvidence, candidate.name, "source_dirs", candidate.signal);
  }
  for (const candidate of collectScriptCandidates(repoRoot, deps)) {
    addEvidence(groupedEvidence, candidate.name, "scripts", candidate.signal);
  }
  for (const candidate of collectTestCandidates(repoRoot, deps)) {
    addEvidence(groupedEvidence, candidate.name, "tests", candidate.signal);
  }
  for (const candidate of collectDocCandidates(repoRoot, deps, [...groupedEvidence.keys()])) {
    addEvidence(groupedEvidence, candidate.name, "docs", candidate.signal);
  }

  const repoSurfaceFound = [...groupedEvidence.values()].some((candidate) =>
    ["skill", "scripts", "docs", "tests"].some((kind) => (candidate.evidence[kind] || []).length > 0),
  );
  const signalAuthority = buildSignalAuthority({
    readmeFound: readme !== null,
    charterFound: charter.found,
    charterSource: charter.source,
    systemMapFound: systemMap !== null,
    harnessFiles,
    sourceRoot,
    commitsScanned: commitMessages.length,
    repoSurfaceFound,
  });

  if (!systemMap) {
    for (const name of dirNames) addMissingEvidence(groupedEvidence, name, "spec/system-map.md");
  }

  const evidenceCandidates = [...groupedEvidence.values()].flatMap((candidate) =>
    EVIDENCE_KINDS.flatMap((kind) =>
      candidate.evidence[kind].map((signal) => ({ name: candidate.name, signal })),
    ),
  );

  const candidates = sourceRoot
    ? mergeCandidates({ sourceRoot, dirNames, scopeCounts, evidenceCandidates })
    : mergeCandidates({ sourceRoot: { name: "", path: "" }, dirNames: [], scopeCounts, evidenceCandidates });

  const capabilities = candidates.map(([name, signals]) =>
    buildCapability({
      name,
      sourceRootName: sourceRoot ? sourceRoot.name : null,
      signals,
      evidence: groupedEvidence.get(name)?.evidence,
      missingEvidence: [...(groupedEvidence.get(name)?.missing_evidence || [])].sort(),
      readmeSummary,
      charterObjectives,
    }),
  );

  return { inventory, signal_authority: signalAuthority, capabilities };
}

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
