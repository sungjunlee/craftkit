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

const CANONICAL_CHARTER_PATH = path.join("spec", "charter.md");
const LEGACY_CHARTER_PATH = "CHARTER.md";

const SOURCE_ROOT_CANDIDATES = ["src", "lib", "app", "packages", "skills"];
const EVIDENCE_KINDS = ["system_map", "readme", "skill", "scripts", "docs", "tests", "source_dirs", "commits"];
const SUMMARY_DIR_LIMIT = 5;
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

function makeEmptyEvidence() {
  return Object.fromEntries(EVIDENCE_KINDS.map((kind) => [kind, []]));
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

function summarizeEvidence(evidence = makeEmptyEvidence(), missingEvidence = []) {
  const evidenceClasses = EVIDENCE_KINDS.filter((kind) => (evidence[kind] || []).length > 0);
  const evidenceClassCount = evidenceClasses.length;
  const hasOnlySourceDirs = evidenceClassCount === 1 && evidenceClasses.includes("source_dirs");
  const hasOnlyCommits = evidenceClassCount === 1 && evidenceClasses.includes("commits");
  const hasOnlySkill = evidenceClassCount === 1 && evidenceClasses.includes("skill");
  const hasOnlySkillAndDirectory = evidenceClassCount === 2
    && evidenceClasses.includes("skill")
    && evidenceClasses.includes("source_dirs");
  const blockingMissingEvidence = [...missingEvidence].sort();
  let admissionHint = "interview-seed";
  let admissionReason = "Raw signal needs grill review before it becomes a durable capability contract.";

  if (hasOnlySkillAndDirectory) {
    admissionHint = "weak-single-source";
    admissionReason = "Only a skill file and its directory are present; find docs, tests, scripts, commits, or system-map evidence before admission.";
  } else if (evidenceClassCount >= 2) {
    admissionHint = "supported";
    admissionReason = `Supported by ${evidenceClassCount} evidence classes: ${evidenceClasses.join(", ")}.`;
  } else if (hasOnlySourceDirs || hasOnlyCommits || hasOnlySkill) {
    admissionHint = "weak-single-source";
    admissionReason = `Only ${evidenceClasses[0]} evidence is present; keep as an interview seed unless the user explicitly overrides.`;
  } else if (evidenceClassCount === 1) {
    admissionHint = "interview-seed";
    admissionReason = `Single evidence class (${evidenceClasses[0]}) is present; find a second class before admission.`;
  } else {
    admissionHint = "weak-single-source";
    admissionReason = "No supporting evidence classes were grouped for this candidate.";
  }

  if (blockingMissingEvidence.length > 0 && admissionHint === "supported") {
    admissionReason = `${admissionReason} Missing evidence still affects confidence: ${blockingMissingEvidence.join(", ")}.`;
  }

  return {
    evidence_class_count: evidenceClassCount,
    evidence_classes: evidenceClasses,
    admission_hint: admissionHint,
    admission_reason: admissionReason,
    blocking_missing_evidence: blockingMissingEvidence,
  };
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

function buildCapability({ name, sourceRootName, signals, evidence, missingEvidence, readmeSummary, charterObjectives }) {
  const sourceDirSignals = evidence?.source_dirs || [];
  const directorySignal = sourceRootName
    ? sourceDirSignals.find((signal) => signal.startsWith(`${sourceRootName}/`))
      || signals.find((signal) => signal === `${sourceRootName}/${name}/`)
      || null
    : null;
  const commitSignals = signals.filter((signal) => signal.startsWith("commit-scope:"));
  const systemMapSignals = evidence?.system_map || [];
  const scriptSignals = evidence?.scripts || [];
  const evidenceHint = systemMapSignals[0] || scriptSignals[0] || null;
  let candidateGoal = `Draft: what the user observes when the '${name}' capability works. Fill in via grill.`;
  if (evidenceHint) {
    candidateGoal = `Draft (from evidence): ${evidenceHint} - refine via grill so the Goal names what the user observes when '${name}' works.`;
  } else if (readmeSummary) {
    candidateGoal = `Draft (from README): ${readmeSummary} - refine via grill so the Goal names what the user observes when '${name}' works.`;
  }

  let candidateScope = `Inferred from raw evidence for '${name}'. Confirm the owning surface and out-of-scope boundary in grill.`;
  if (systemMapSignals[0]) {
    candidateScope = `Inferred from ${systemMapSignals[0]}. Confirm ownership, neighboring candidates, and out-of-scope boundary in grill.`;
  } else if (directorySignal) {
    candidateScope = `Owns the ${directorySignal} surface. Out-of-scope deferred to grill.`;
  } else if (commitSignals.length > 0) {
    candidateScope = `Inferred from commit scope '${name}'. Confirm the owning source surface and out-of-scope boundary in grill.`;
  }

  const objectiveHint = charterObjectives.length > 0
    ? ` Candidate charter objective served: ${charterObjectives[0].id} (${charterObjectives[0].predicate.slice(0, 80)}${charterObjectives[0].predicate.length > 80 ? "..." : ""}). Confirm in grill.`
    : "";

  const evidenceSummary = summarizeEvidence(evidence || makeEmptyEvidence(), missingEvidence || []);

  return {
    name,
    signals,
    provenance: {
      directory: directorySignal,
      commit_scopes: commitSignals,
    },
    evidence: evidence || makeEmptyEvidence(),
    missing_evidence: missingEvidence || [],
    ...evidenceSummary,
    confidence: "candidate-only",
    candidate_goal: candidateGoal + objectiveHint,
    candidate_scope: candidateScope,
  };
}

function mergeCandidates({ sourceRoot, dirNames, scopeCounts, evidenceCandidates = [] }) {
  const merged = new Map();

  for (const name of dirNames) {
    const slug = slugifyCandidate(name);
    if (!slug) continue;
    const signals = [`${sourceRoot.name}/${name}/`];
    const count = scopeCounts.get(slug) ?? 0;
    if (count > 0) signals.push(`commit-scope:${slug} (${count})`);
    const existing = merged.get(slug) || [];
    for (const signal of signals) {
      if (!existing.includes(signal)) existing.push(signal);
    }
    merged.set(slug, existing);
  }

  for (const [scope, count] of scopeCounts.entries()) {
    if (merged.has(scope)) continue;
    if (count < 2) continue;
    merged.set(scope, [`commit-scope:${scope} (${count})`]);
  }

  for (const { name, signal } of evidenceCandidates) {
    const slug = slugifyCandidate(name);
    if (!slug || !signal) continue;
    const signals = merged.get(slug) || [];
    if (!signals.includes(signal)) signals.push(signal);
    merged.set(slug, signals);
  }

  return [...merged.entries()].sort(([a, aSignals], [b, bSignals]) => {
    const scoreDiff = candidateSignalScore(aSignals) - candidateSignalScore(bSignals);
    return scoreDiff || a.localeCompare(b);
  });
}

function candidateSignalScore(signals) {
  if (signals.some((signal) => signal.startsWith("system-map:"))) return 0;
  if (signals.some((signal) => signal.startsWith("skill:") || /^[a-z]+\/.+\/$/.test(signal))) return 1;
  if (signals.some((signal) => signal.startsWith("script:") || signal.startsWith("test:"))) return 2;
  if (signals.some((signal) => signal.startsWith("commit-scope:"))) return 3;
  if (signals.some((signal) => signal.startsWith("doc:"))) return 4;
  return 5;
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

function formatHumanReport(result) {
  const { inventory, capabilities } = result;
  const lines = [];
  lines.push(`Repo: ${inventory.repoRoot}`);
  lines.push("Signals:");
  lines.push(`  - README.md: ${inventory.readmeFound ? "found" : "missing"}`);
  lines.push(`  - spec/charter.md: ${inventory.charterFound ? `found (${inventory.charterSource})` : "missing"}; objectives: ${inventory.charterObjectiveCount}`);
  lines.push(`  - spec/system-map.md: ${inventory.systemMapFound ? "found" : "missing"}`);
  lines.push(`  - CLAUDE.md/AGENTS.md: ${inventory.claudeMdFound ? `found (${(inventory.harnessFiles || []).join(", ")})` : "missing"}; authority: development-harness`);
  lines.push(`  - source root: ${inventory.sourceRoot ?? "none detected"} (${inventory.sourceDirCount} dir(s))`);
  lines.push(`  - commits scanned: ${inventory.commitsScanned}; scopes seen: ${inventory.commitScopeCount}`);
  lines.push("");

  if (capabilities.length === 0) {
    lines.push("No raw capability signals detected.");
    lines.push("Grill mode will run in greenfield mode (interview from scratch).");
    return lines.join("\n");
  }

  lines.push(`Raw capability signals (${capabilities.length}, top ${Math.min(capabilities.length, SUMMARY_DIR_LIMIT)} shown):`);
  lines.push("  Note: these are interview seeds, not accepted capabilities. Grill mode admits, merges, splits, and names functional contracts.");
  for (const cap of capabilities.slice(0, SUMMARY_DIR_LIMIT)) {
    lines.push(`  - ${cap.name}`);
    lines.push(`      signals: ${cap.signals.join(", ")}`);
    const evidenceKinds = EVIDENCE_KINDS.filter((kind) => (cap.evidence?.[kind] || []).length > 0);
    if (evidenceKinds.length > 0) {
      lines.push(`      evidence: ${evidenceKinds.join(", ")}`);
    }
    lines.push(`      admission: ${cap.admission_hint ?? "interview-seed"} (${cap.evidence_class_count ?? evidenceKinds.length} evidence class(es))`);
    if (cap.admission_reason) {
      lines.push(`      reason: ${cap.admission_reason}`);
    }
    if ((cap.missing_evidence || []).length > 0) {
      lines.push(`      missing: ${cap.missing_evidence.join(", ")}`);
    }
  }
  if (capabilities.length > SUMMARY_DIR_LIMIT) {
    lines.push(`  ... and ${capabilities.length - SUMMARY_DIR_LIMIT} more (use --json for full draft)`);
  }
  lines.push("");
  lines.push("Next: ask `spec-grill` to review these candidate capability boundaries before editing spec/capabilities.md.");
  return lines.join("\n");
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

export {
  buildSignalAuthority,
  parseArgs,
  detectSourceRoot,
  listCapabilityCandidates,
  extractCommitScopes,
  getRecentCommitMessages,
  resolveCharterPath,
  summarizeEvidence,
  CANONICAL_CHARTER_PATH,
  LEGACY_CHARTER_PATH,
  resolveCharterFile,
  readCharterObjectives,
  summarizeReadme,
  buildCapability,
  mergeCandidates,
  extractSignals,
  formatHumanReport,
};

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
