/**
 * Human-report presentation for extract-signals.js.
 *
 * Kept in its own module so orchestrator tests stay green when this
 * slice is deleted, while report-section tests fail.
 */

const EVIDENCE_KINDS = ["system_map", "readme", "skill", "scripts", "docs", "tests", "source_dirs", "commits"];
const SUMMARY_DIR_LIMIT = 5;

export function formatHumanReport(result) {
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
