/**
 * Terminology rules table: adding a new rule is a one-entry addition here, not
 * a new function. Called from scripts/verify.mjs.
 */

import path from "node:path";
import { root, fail, listFiles, readText, relative } from "./verify-shared.mjs";

// Each entry is { files, forbidden, why }:
//   - files: repo-relative paths, each either an explicit literal path or a
//     minimal glob (`*` = within one path segment, `**` = across segments).
//   - forbidden: literal phrases (exact substring match) or RegExp (tested
//     against the whole file text; first match is reported).
//   - why: explains the rule so a failure message points back to its source
//     of truth, so a future maintainer isn't left guessing.
export const terminologyRules = [
  {
    // README.md's "Terminology note" (search that phrase): craft-autoresearch
    // uses an "eval runner". Do not call that runner a "harness".
    // Scoped to craft-autoresearch's own docs. The forbidden pattern is a
    // word-boundary match on "harness" with a negative lookbehind for the
    // "craft-" prefix, so a leftover "craft-harness" mention would be exempt
    // but a bare "harness" is still caught.
    files: ["skills/craft-autoresearch/**/*.md"],
    forbidden: [/(?<!craft-)\bharness\b/i],
    why: 'README.md\'s Terminology note: craft-autoresearch must say "eval runner", not "harness"',
  },
  {
    // Guards the #134 neutralization (PRD-RH E2.2, commit 3bf159a): the
    // spec-* spines used to lean on dev-backlog/dev-relay vocabulary as
    // load-bearing terms — "relay-learning destination" as the admission-test
    // criterion, "relay run" as the Tier-2 proof-gate citation, and sprint
    // `component:` frontmatter as the slug consumer. All three were replaced
    // with consumer-neutral phrasing so the spines stay usable in repos that
    // never install dev-backlog/dev-relay. Scoped to the spec-* spines
    // themselves (not skills/spec-*/**), so references/ and templates/ under
    // those skills stay exempt — integration examples there may legitimately
    // name sprint/relay concepts as a named optional integration.
    files: ["skills/spec-charter/SKILL.md", "skills/spec-grill/SKILL.md"],
    forbidden: ["relay-learning", "relay run", "`component:` frontmatter"],
    why: 'spec-* spines must stay standalone-usable; "relay-learning", "relay run", and "`component:` frontmatter" are dev-relay/dev-backlog vocabulary neutralized in #134 — use consumer-neutral phrasing instead',
  },
];

// Pure, unit-testable: minimal glob match (no dependency). `*` matches within
// one path segment, `**` matches across segments (including the empty case,
// so `a/**/*.md` also matches `a/x.md`). Patterns without `*` are compared as
// exact literal paths.
export function matchesFilePattern(pattern, filePath) {
  if (!pattern.includes("*")) {
    return pattern === filePath;
  }

  let reSource = "^";
  for (let i = 0; i < pattern.length; i++) {
    const char = pattern[i];

    if (char === "*") {
      if (pattern[i + 1] === "*") {
        reSource += ".*";
        i++;
        if (pattern[i + 1] === "/") {
          i++;
        }
      } else {
        reSource += "[^/]*";
      }
      continue;
    }

    reSource += /[.+^${}()|[\]\\]/.test(char) ? `\\${char}` : char;
  }
  reSource += "$";

  return new RegExp(reSource).test(filePath);
}

// Pure, unit-testable: returns the forbidden phrases/patterns found in `text`,
// as their matched literal text (so failure messages quote what was actually
// found, not just the pattern that found it).
export function terminologyFindings(text, forbidden) {
  const found = [];

  for (const pattern of forbidden) {
    if (typeof pattern === "string") {
      if (text.includes(pattern)) {
        found.push(pattern);
      }
      continue;
    }

    const match = text.match(pattern);
    if (match) {
      found.push(match[0]);
    }
  }

  return found;
}

export function checkTerminology() {
  const allFiles = listFiles(root, () => true).map(relative);

  for (const rule of terminologyRules) {
    const matchingFiles = allFiles.filter((filePath) =>
      rule.files.some((pattern) => matchesFilePattern(pattern, filePath)),
    );

    for (const filePath of matchingFiles) {
      const text = readText(path.join(root, filePath));

      for (const match of terminologyFindings(text, rule.forbidden)) {
        fail(`${filePath} still contains "${match}" (${rule.why})`);
      }
    }
  }
}
