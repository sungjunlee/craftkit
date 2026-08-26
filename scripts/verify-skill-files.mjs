/**
 * SKILL.md contract checks: frontmatter, soft 220 / hard 500 line budgets,
 * description 50-word trigger budget, and spine provider-neutrality.
 * Called from scripts/verify.mjs.
 */

import path from "node:path";
import { root, fail, listFiles, relative, readText, parseFrontmatter } from "./verify-shared.mjs";

const maxSkillSoftLines = 220;
const maxDescriptionWords = 50;

function parseDescription(frontmatter) {
  const lines = frontmatter.split("\n");
  const descriptionIndex = lines.findIndex((line) => line.startsWith("description:"));

  if (descriptionIndex === -1) {
    return "";
  }

  const rawDescription = lines[descriptionIndex].replace(/^description:\s*/, "").trim();
  if (!["|-", "|", ">-", ">"].includes(rawDescription)) {
    return rawDescription.replace(/^["']|["']$/g, "");
  }

  const descriptionLines = [];
  for (const line of lines.slice(descriptionIndex + 1)) {
    if (!/^\s+/.test(line)) {
      break;
    }

    descriptionLines.push(line.trim());
  }

  return descriptionLines.join(" ");
}

function countWords(text) {
  return text.split(/\s+/).filter(Boolean).length;
}

// Spine provider-neutrality invariant: AGENTS.md's "Spine text names the
// capability, not a provider's tool" (CHANGELOG: "no provider-specific tool
// names in skill spines"; README § cross-agent portability).
// docs/skill-anatomy.md "Frontmatter contract" governs `description` as the
// spine's identity label. Scope is the frontmatter `description` only:
// AGENTS.md lets Examples and `guides/` name tools, so the body is not scanned.
// Unambiguous provider/product names only — not ordinary English (cursor, grok,
// copilot, llama, mistral). Word boundaries: "claude" does not match inside
// "claudecode"; a hyphen is a boundary, so "chatgpt" matches in
// "Noble-chatgpt-adjacent". Regex is constructed per call so /g lastIndex
// cannot leak across descriptions.
const providerSpinePatternSource = String.raw`\b(?:claude|anthropic|chatgpt|openai|codex|gemini)\b`;

// Pure, unit-testable: returns the provider terms found in a skill `description`,
// as their matched literal text (case preserved), so failure messages quote what
// was actually written rather than a canned list.
export function spineProviderFindings(description) {
  const matches = description.match(new RegExp(providerSpinePatternSource, "gi")) ?? [];
  return [...new Set(matches)];
}

export function checkSkillFiles() {
  const skillFiles = listFiles(path.join(root, "skills"), (item) => path.basename(item) === "SKILL.md");

  for (const filePath of skillFiles) {
    const text = readText(filePath);
    const frontmatter = parseFrontmatter(text);
    const lineCount = text.trimEnd().split("\n").length;

    if (!frontmatter) {
      fail(`${relative(filePath)} must start with YAML frontmatter`);
      continue;
    }

    if (!/^name:\s*\S+/m.test(frontmatter)) {
      fail(`${relative(filePath)} frontmatter must include name`);
    }

    const description = parseDescription(frontmatter);
    if (!description) {
      fail(`${relative(filePath)} frontmatter must include description`);
    }

    const descriptionWords = countWords(description);
    if (descriptionWords > maxDescriptionWords) {
      fail(`${relative(filePath)} description has ${descriptionWords} words, over the ${maxDescriptionWords}-word trigger budget`);
    }

    for (const term of spineProviderFindings(description)) {
      fail(`${relative(filePath)} description names a provider's tool ("${term}"); spine text must name the capability, not a provider's tool (AGENTS.md spine rule; docs/skill-anatomy.md "Frontmatter contract")`);
    }

    if (lineCount > maxSkillSoftLines) {
      fail(`${relative(filePath)} has ${lineCount} lines, over the ${maxSkillSoftLines}-line soft budget; move deep detail into references or split the skill`);
    }

    if (lineCount > 500) {
      fail(`${relative(filePath)} has ${lineCount} lines, over the 500-line hard ceiling`);
    }
  }
}
