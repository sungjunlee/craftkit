/**
 * extractSignals orchestration for extract-signals.js.
 *
 * Reads repo signals and groups them into capability candidates.
 * Charter/source-root/commit-scope lookups live in extract-signals-charter.js.
 * CLI parseArgs/main stay in extract-signals.js.
 */

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { slugifyCandidate, readOptionalFile } from "./extract-signals-shared.js";
import {
  collectSystemMapCandidates,
  collectReadmeCandidates,
  collectSkillCandidates,
  collectScriptCandidates,
  collectSourceSurfaceCandidates,
  collectDocCandidates,
  collectTestCandidates,
} from "./extract-signals-collectors.js";
import {
  EVIDENCE_KINDS,
  makeEmptyEvidence,
  mergeCandidates,
  buildCapability,
} from "./extract-signals-merge.js";
import {
  detectSourceRoot,
  listCapabilityCandidates,
  extractCommitScopes,
  getRecentCommitMessages,
  resolveCharterPath,
  CANONICAL_CHARTER_PATH,
  LEGACY_CHARTER_PATH,
  resolveCharterFile,
  readCharterObjectives,
} from "./extract-signals-charter.js";

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
};
