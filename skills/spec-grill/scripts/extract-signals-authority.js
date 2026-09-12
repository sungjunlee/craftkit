/**
 * Signal authority labeling for extract-signals.js.
 *
 * Kept in its own module so extractSignals orchestration stays in core
 * while authority labeling is a separate seam.
 */

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

export { buildSignalAuthority };
