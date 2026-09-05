/**
 * Capability merge, score, and build for extract-signals.js.
 *
 * mergeCandidates combines directory, commit-scope, and evidence signals.
 * candidateSignalScore orders the merged list. buildCapability turns a
 * merged candidate into the JSON capability object extractSignals emits.
 */

import { slugifyCandidate } from "./extract-signals-shared.js";

export const EVIDENCE_KINDS = ["system_map", "readme", "skill", "scripts", "docs", "tests", "source_dirs", "commits"];

export function makeEmptyEvidence() {
  return Object.fromEntries(EVIDENCE_KINDS.map((kind) => [kind, []]));
}

export function summarizeEvidence(evidence = makeEmptyEvidence(), missingEvidence = []) {
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

export function buildCapability({ name, sourceRootName, signals, evidence, missingEvidence, readmeSummary, charterObjectives }) {
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

export function mergeCandidates({ sourceRoot, dirNames, scopeCounts, evidenceCandidates = [] }) {
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

export function candidateSignalScore(signals) {
  if (signals.some((signal) => signal.startsWith("system-map:"))) return 0;
  if (signals.some((signal) => signal.startsWith("skill:") || /^[a-z]+\/.+\/$/.test(signal))) return 1;
  if (signals.some((signal) => signal.startsWith("script:") || signal.startsWith("test:"))) return 2;
  if (signals.some((signal) => signal.startsWith("commit-scope:"))) return 3;
  if (signals.some((signal) => signal.startsWith("doc:"))) return 4;
  return 5;
}
