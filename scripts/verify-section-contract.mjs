/**
 * Family section contract, derived from docs/skill-anatomy.md
 * ("craft-* family contract" and "spec-* family contract" tables, plus
 * "Documented exemptions"). Called from scripts/verify.mjs.
 */

import fs from "node:fs";
import path from "node:path";
import { root, fail, warn, relative, readText } from "./verify-shared.mjs";

// Each entry is a requirement slot: `key` is the label used in fail/warn messages,
// `match(headings)` reports whether a skill's parsed headings satisfy the slot.
// `headings` is the flat list from parseHeadings().
const CRAFT_SECTION_CONTRACT = [
  { key: "Purpose", match: (h) => hasH2(h, "purpose") },
  { key: "Use this when", match: (h) => hasH2(h, "use this when") },
  { key: "Inputs", match: (h) => hasH2(h, "inputs") },
  { key: "Steps/Workflow", match: (h) => hasH2(h, "steps") || hasH2(h, "workflow") },
  { key: "Output format", match: (h) => hasH2(h, "output format") },
  { key: "Guardrails", match: (h) => hasH2(h, "guardrails") },
  { key: "Failure modes", match: (h) => hasH2(h, "failure modes") },
  { key: "Example", match: (h) => hasH2(h, "example") },
];

// spec-* requires the Execution Contract wrapper to literally contain the Mode
// Router/Intent Router and Completion Contract H3s (docs/skill-anatomy.md "spec-*
// family contract"). Ordering within the wrapper is not checked (PRD §8
// de-risking); presence and nesting are. Headings are compared case-insensitively
// because Title Case -> sentence case normalization is #111's job, not #110's —
// checking case here would double-report the same drift under two issues.
const SPEC_SECTION_CONTRACT = [
  { key: "Execution Contract wrapper", match: (h) => hasH2(h, "execution contract") },
  {
    key: "Mode Router (nested)",
    match: (h, sections) => sectionChildIncludes(sections, "execution contract", ["mode router", "intent router"]),
  },
  {
    key: "Completion Contract (nested)",
    match: (h, sections) => sectionChildIncludes(sections, "execution contract", ["completion contract"]),
  },
  { key: "Verification prompts", match: (h) => hasH2(h, "verification prompts") },
];

// Ratchet baseline for #110: every section a skill is CURRENTLY missing, kept
// in sync with docs/skill-anatomy.md "Current deviations". A baselined miss
// warns (burn-down signal); remove the entry once the section is added, or
// verify will fail telling you the entry is stale. The baseline is currently
// empty — every live skill satisfies its family contract. Adding an entry back is an explicit,
// temporary act — do it only alongside a matching "Current deviations" note
// in docs/skill-anatomy.md, and remove both together once the section lands.
const knownSectionDeviations = {};

function normalizeHeading(text) {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

function parseHeadings(body) {
  const headings = [];
  const headingPattern = /^(#{2,3})\s+(.+?)\s*$/gm;
  let match;

  while ((match = headingPattern.exec(body))) {
    headings.push({ level: match[1].length, text: normalizeHeading(match[2]) });
  }

  return headings;
}

function hasH2(headings, text) {
  return headings.some((heading) => heading.level === 2 && heading.text === text);
}

function hasReferencesHeading(headings) {
  return headings.some((heading) => heading.level === 2 && /^references\b/.test(heading.text));
}

// Groups H3 headings under their nearest preceding H2, so nested requirements
// (spec-*'s "Execution Contract > Mode Router") can be checked without assuming
// a fixed order among sibling H2 sections.
function buildH2Sections(headings) {
  const sections = new Map();
  let currentH2 = null;

  for (const heading of headings) {
    if (heading.level === 2) {
      currentH2 = heading.text;
      if (!sections.has(currentH2)) {
        sections.set(currentH2, []);
      }
      continue;
    }

    if (currentH2 !== null) {
      sections.get(currentH2).push(heading.text);
    }
  }

  return sections;
}

function sectionChildIncludes(sections, h2Text, childTextAlternatives) {
  const children = sections.get(h2Text) ?? [];
  return childTextAlternatives.some((alternative) => children.includes(alternative));
}

function skillFamilyOf(skillName) {
  if (skillName.startsWith("craft-")) {
    return "craft";
  }

  if (skillName.startsWith("spec-")) {
    return "spec";
  }

  return null;
}

// Pure helper (unit-tested directly): returns the list of required-section keys
// a skill's SKILL.md body is currently missing, given its family contract. Does
// not know about the ratchet baseline — callers diff the result against
// knownSectionDeviations to decide warn() vs fail().
export function sectionContractFindings(skillName, body, hasReferencesDir) {
  const family = skillFamilyOf(skillName);
  if (!family) {
    return [];
  }

  const headings = parseHeadings(body);
  const findings = [];

  if (family === "craft") {
    for (const requirement of CRAFT_SECTION_CONTRACT) {
      if (!requirement.match(headings)) {
        findings.push(requirement.key);
      }
    }

    if (hasReferencesDir && !hasReferencesHeading(headings)) {
      findings.push("References");
    }

    return findings;
  }

  const sections = buildH2Sections(headings);
  for (const requirement of SPEC_SECTION_CONTRACT) {
    if (!requirement.match(headings, sections)) {
      findings.push(requirement.key);
    }
  }

  if (!hasReferencesHeading(headings)) {
    findings.push("References");
  }

  return findings;
}

export function checkFamilySectionContract() {
  const skillsRoot = path.join(root, "skills");
  const skillDirNames = fs.readdirSync(skillsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  for (const skillName of skillDirNames) {
    if (!skillFamilyOf(skillName)) {
      continue;
    }

    const skillDir = path.join(skillsRoot, skillName);
    const skillMdPath = path.join(skillDir, "SKILL.md");

    if (!fs.existsSync(skillMdPath)) {
      continue;
    }

    const body = readText(skillMdPath);
    const hasReferencesDir = fs.existsSync(path.join(skillDir, "references"));
    const findings = sectionContractFindings(skillName, body, hasReferencesDir);
    const baseline = knownSectionDeviations[skillName] ?? [];

    for (const key of findings) {
      if (baseline.includes(key)) {
        warn(`${relative(skillMdPath)} is missing the required "${key}" section (baselined deviation from docs/skill-anatomy.md — burn down when convenient)`);
      } else {
        fail(`${relative(skillMdPath)} is missing the required "${key}" section (new drift, not in the knownSectionDeviations baseline)`);
      }
    }

    for (const key of baseline) {
      if (!findings.includes(key)) {
        fail(`${relative(skillMdPath)}: knownSectionDeviations still lists "${key}" as missing, but the section is now present — remove the stale baseline entry`);
      }
    }
  }
}
