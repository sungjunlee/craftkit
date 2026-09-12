/**
 * Skill-surface collectors for extract-signals.js.
 *
 * collectSkillCandidates and the helpers only it needs live here.
 * Remaining collectors stay in extract-signals-collectors.js
 * and re-export collectSkillCandidates so public names stay stable.
 */

import path from "node:path";
import { readOptionalFile } from "./extract-signals-shared.js";
import { listDirs } from "./extract-signals-collectors.js";

function readFrontmatterValue(content, key, fallback = "") {
  if (!content?.startsWith("---\n")) return fallback;
  const end = content.indexOf("\n---\n", 4);
  if (end === -1) return fallback;

  const lines = content.slice(4, end).split("\n");
  const keyPattern = new RegExp(`^${key}:\\s*(.*)$`);

  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(keyPattern);
    if (!match) continue;

    const raw = match[1].trim();
    if (raw === ">-" || raw === ">" || raw === "|-" || raw === "|") {
      const block = [];
      for (let blockIndex = index + 1; blockIndex < lines.length; blockIndex += 1) {
        const line = lines[blockIndex];
        if (/^[A-Za-z0-9_-]+:\s*/.test(line)) break;
        if (!line.startsWith(" ") && !line.startsWith("\t")) break;
        block.push(line.trim());
      }
      return block.join(" ").trim() || fallback;
    }

    return raw.replace(/^['"]|['"]$/g, "") || fallback;
  }

  return fallback;
}

function collectSkillCandidates(repoRoot, deps = {}) {
  const skillsRoot = path.join(repoRoot, "skills");
  return listDirs(skillsRoot, deps).flatMap((entry) => {
    const skillPath = path.join(skillsRoot, entry, "SKILL.md");
    const content = readOptionalFile(skillPath, deps);
    if (!content) return [];
    const name = readFrontmatterValue(content, "name", entry);
    const description = readFrontmatterValue(content, "description", "skill surface");
    return [{ name, signal: `skill:${entry} (${description.slice(0, 120)})` }];
  });
}

export {
  collectSkillCandidates,
  readFrontmatterValue,
};
