/**
 * System-map collectors for extract-signals.js.
 *
 * collectSystemMapCandidates and the helpers only it needs live here.
 * Remaining collectors stay in extract-signals-collectors.js
 * and re-export collectSystemMapCandidates so public names stay stable.
 */

function getMarkdownSection(content, heading) {
  if (!content) return null;
  const lines = content.split("\n");
  const startPattern = new RegExp(`^##\\s+${heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "i");
  const start = lines.findIndex((line) => startPattern.test(line.trim()));
  if (start === -1) return null;
  const section = [];
  for (let i = start + 1; i < lines.length; i += 1) {
    if (/^##\s+/.test(lines[i])) break;
    section.push(lines[i]);
  }
  return section.join("\n").trim();
}

function collectSystemMapCandidates(systemMap) {
  const section = getMarkdownSection(systemMap, "Candidate Capability Boundaries");
  if (!section) return [];
  const candidates = [];
  for (const line of section.split("\n")) {
    const match = line.match(/^-\s+`?([a-z][a-z0-9-]*)`?\s+-\s+(.+)$/);
    if (!match) continue;
    candidates.push({
      name: match[1],
      signal: `system-map:${match[1]} (${match[2].trim()})`,
    });
  }
  return candidates;
}

export {
  collectSystemMapCandidates,
};
