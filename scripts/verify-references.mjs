/**
 * Skill reference load path: cited files exist, on-disk top-level
 * references/*.md are cited, and required-reference locks stay present.
 * Called from scripts/verify.mjs.
 */

import fs from "node:fs";
import path from "node:path";
import { root, fail, relative, readText } from "./verify-shared.mjs";

// Conservative citation matcher for #109: matches `references/...md` path-like
// strings, with an optional chain of leading path segments (`../`, `skills/`,
// `spec-grill/`, ...) so cross-skill citations like
// `../spec-grill/references/spec-pipeline-ready.md` or
// `skills/craft-prompt/references/prompt-patterns.md` are captured whole rather
// than truncated at the literal "references/" token.
//
// templates/...md are deliberately NOT in scope here (issue #109 globs
// references/ only). Cross-skill template citations are left to the skill
// author; extending this regex to templates/ is a separate change.
const referenceCitationPattern = /(?:[\w.-]+\/)*references\/[\w.\-/]+\.md/g;

function resolveCitation(skillDir, citation) {
  if (citation.startsWith("skills/")) {
    return path.join(root, citation);
  }

  return path.join(skillDir, citation);
}

export function checkReferenceIndex() {
  const skillsRoot = path.join(root, "skills");
  const skillDirNames = fs.readdirSync(skillsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  for (const skillName of skillDirNames) {
    const skillDir = path.join(skillsRoot, skillName);
    const skillMdPath = path.join(skillDir, "SKILL.md");

    if (!fs.existsSync(skillMdPath)) {
      continue;
    }

    const body = readText(skillMdPath);

    // Direction (a): every top-level references/*.md file must be cited
    // somewhere in this skill's own SKILL.md. Subdirectories under
    // references/ are out of scope for this direction — the issue globs one
    // level only.
    const referencesDir = path.join(skillDir, "references");
    if (fs.existsSync(referencesDir)) {
      const topLevelFiles = fs.readdirSync(referencesDir, { withFileTypes: true })
        .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
        .map((entry) => entry.name);

      for (const fileName of topLevelFiles) {
        const citation = `references/${fileName}`;
        if (!body.includes(citation)) {
          fail(`${relative(skillMdPath)} does not cite ${citation}, which exists in ${relative(referencesDir)}/`);
        }
      }
    }

    // Direction (b): every references/...md path-like citation must resolve to
    // a real file, relative to the skill dir (or the repo root for citations
    // spelled out from `skills/...`).
    const citations = new Set(body.match(referenceCitationPattern) ?? []);
    for (const citation of citations) {
      const resolvedPath = resolveCitation(skillDir, citation);
      if (!fs.existsSync(resolvedPath)) {
        fail(`${relative(skillMdPath)} cites ${citation}, which does not exist (resolved to ${relative(resolvedPath)})`);
      }
    }
  }
}

// Required skill reference load path (#186/#188/#190): checkReferenceIndex
// only catches uncited-on-disk files and dangling citations. Deleting a
// required file AND its citation would still pass. This table is the explicit
// lock. Skip a skill when its SKILL.md is absent so fixtures without it stay valid.
export const REQUIRED_SKILL_REFERENCES = [
  {
    skill: "spec-charter",
    citations: [
      "references/create.md",
      "references/amendment.md",
      "references/alignment.md",
      "references/objectives.md",
      "references/reassess.md",
      "references/spec-axis.md",
      "references/system-map.md",
    ],
  },
  {
    skill: "spec-grill",
    citations: [
      "references/capabilities.md",
      "references/grill-report-template.md",
      "references/spec-pipeline-ready.md",
    ],
  },
  {
    skill: "craft-autoresearch",
    citations: [
      "references/mutation-guide.md",
      "references/worked-example.md",
      "references/contract-example.md",
      "references/eval-guide.md",
    ],
  },
];

export function checkRequiredSkillReferences() {
  for (const { skill, citations } of REQUIRED_SKILL_REFERENCES) {
    const skillDir = path.join(root, "skills", skill);
    const skillMdPath = path.join(skillDir, "SKILL.md");

    if (!fs.existsSync(skillMdPath)) {
      continue;
    }

    const body = readText(skillMdPath);

    for (const citation of citations) {
      const requiredPath = path.join(skillDir, citation);

      if (!fs.existsSync(requiredPath)) {
        fail(`${relative(requiredPath)} is a required ${skill} reference and is missing`);
        continue;
      }

      if (!body.includes(citation)) {
        fail(`${relative(skillMdPath)} does not cite ${citation}, which is a required ${skill} reference`);
      }
    }
  }
}
