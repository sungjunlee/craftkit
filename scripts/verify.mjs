#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const failures = [];
const warnings = [];
const skipPackDryRunForTests = process.env.CRAFTKIT_VERIFY_TEST_SKIP_PACK_DRY_RUN === "1";
const maxSkillSoftLines = 220;
const maxDescriptionWords = 50;
const radarCurrentPath = "skills/craft-skill-spec/references/radar/current.md";
// radar/policy.md sets a 2-month (~60 day) review cadence for current.md; 75 days
// adds slack before this becomes a warning.
const radarMaxAgeDays = 75;
const craftPromptGuidesPath = "skills/craft-prompt/guides";
// craft-prompt's guides/*.md track vendor prompting behavior (Claude, GPT,
// Gemini, Perplexity, local models), which drifts slower than the radar's
// single-skill classification snapshot. 120 days gives each guide a longer
// horizon than the radar's 75-day cadence while still forcing a periodic
// look — a guide that hasn't been reviewed in four months can easily be
// citing a superseded model or API shape.
const guideMaxAgeDays = 120;

// Family section contract, derived from docs/skill-anatomy.md ("craft-* family
// contract" and "spec-* family contract" tables, plus "Documented exemptions").
// Each entry is a requirement slot: `key` is the label used in fail/warn messages,
// `match(headings)` reports whether a skill's parsed headings satisfy the slot.
// `headings` is the flat list from parseHeadings(); `hasHeadingAnyLevel` lets
// loop-shaped skills satisfy "Output format" via their multi-part decomposition
// (docs/skill-anatomy.md "Documented exemptions" § Loop-shaped Output format
// decomposition) without hardcoding craft-autoresearch by name.
const CRAFT_SECTION_CONTRACT = [
  { key: "Purpose", match: (h) => hasH2(h, "purpose") },
  { key: "Use this when", match: (h) => hasH2(h, "use this when") },
  { key: "Inputs", match: (h) => hasH2(h, "inputs") },
  { key: "Steps/Workflow", match: (h) => hasH2(h, "steps") || hasH2(h, "workflow") },
  {
    key: "Output format",
    match: (h) =>
      hasH2(h, "output format") ||
      (hasHeadingAnyLevel(h, "experiment contract") && hasHeadingAnyLevel(h, "final artifact")),
  },
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
// verify will fail telling you the entry is stale. #111/#112/#115 cleared the
// spec-* and early craft-* entries; #126/#133 (the review-hardening
// pass) cleared the remaining craft-harness/craft-skill-spec/craft-critique
// entries, so the baseline is empty. Adding an entry back is an explicit,
// temporary act — do it only alongside a matching "Current deviations" note
// in docs/skill-anatomy.md, and remove both together once the section lands.
const knownSectionDeviations = {};

function fail(message) {
  failures.push(message);
}

function warn(message) {
  warnings.push(message);
}

function listFiles(dir, predicate) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === ".git" || entry.name === "node_modules") {
        continue;
      }

      files.push(...listFiles(fullPath, predicate));
      continue;
    }

    if (entry.isFile() && predicate(fullPath)) {
      files.push(fullPath);
    }
  }

  return files;
}

function relative(filePath) {
  return path.relative(root, filePath);
}

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function checkJsonFiles() {
  for (const filePath of listFiles(root, (item) => item.endsWith(".json"))) {
    try {
      JSON.parse(readText(filePath));
    } catch (error) {
      fail(`${relative(filePath)} is invalid JSON: ${error.message}`);
    }
  }
}

function checkPackageBoundary() {
  const packageJson = JSON.parse(readText(path.join(root, "package.json")));

  if (!Array.isArray(packageJson.files) || packageJson.files.length === 0) {
    fail("package.json must declare a files allowlist for npm packaging");
  }

  if (packageJson.scripts?.verify !== "node scripts/verify.mjs") {
    fail("package.json scripts.verify must run node scripts/verify.mjs");
  }

  if (packageJson.scripts?.test !== "node --test") {
    fail("package.json scripts.test must run node --test");
  }
}

function parseFrontmatter(text) {
  if (!text.startsWith("---\n")) {
    return null;
  }

  const endIndex = text.indexOf("\n---\n", 4);
  if (endIndex === -1) {
    return null;
  }

  return text.slice(4, endIndex);
}

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

function hasHeadingAnyLevel(headings, text) {
  return headings.some((heading) => heading.text === text);
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
function sectionContractFindings(skillName, body, hasReferencesDir) {
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

function checkSkillFiles() {
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

    if (lineCount > maxSkillSoftLines) {
      fail(`${relative(filePath)} has ${lineCount} lines, over the ${maxSkillSoftLines}-line soft budget; move deep detail into references or split the skill`);
    }

    if (lineCount > 500) {
      fail(`${relative(filePath)} has ${lineCount} lines, over the 500-line hard ceiling`);
    }
  }
}

function parseOpenAiInvocationPolicy(text) {
  const lines = text.split(/\r?\n/);
  let inPolicy = false;
  let hasPolicy = false;

  for (const line of lines) {
    if (/^\s*(#.*)?$/.test(line)) {
      continue;
    }

    const indent = line.match(/^\s*/)[0].length;
    const trimmed = line.replace(/\s+#.*$/, "").trim();

    if (indent === 0) {
      inPolicy = /^policy:\s*$/.test(trimmed);
      hasPolicy ||= inPolicy;
      continue;
    }

    if (!inPolicy) {
      continue;
    }

    const match = trimmed.match(/^allow_implicit_invocation:\s*(true|false)\s*$/);
    if (match) {
      return { hasPolicy, allowImplicit: match[1] === "true" };
    }
  }

  return { hasPolicy, allowImplicit: null };
}

function checkOpenAiInvocationPolicies() {
  const skillFiles = listFiles(path.join(root, "skills"), (item) => path.basename(item) === "SKILL.md");

  for (const filePath of skillFiles) {
    const text = readText(filePath);
    const frontmatter = parseFrontmatter(text);
    const skillDir = path.dirname(filePath);
    const skillName = path.basename(skillDir);
    const openAiYamlPath = path.join(skillDir, "agents", "openai.yaml");
    const claudeExplicitOnly = Boolean(frontmatter?.match(/^disable-model-invocation:\s*true\s*$/m));

    if (!fs.existsSync(openAiYamlPath)) {
      if (claudeExplicitOnly) {
        fail(`${relative(filePath)} has disable-model-invocation: true but is missing ${path.join("skills", skillName, "agents", "openai.yaml")} with policy.allow_implicit_invocation: false`);
      }
      continue;
    }

    const { hasPolicy, allowImplicit } = parseOpenAiInvocationPolicy(readText(openAiYamlPath));
    if (hasPolicy && allowImplicit === null) {
      fail(`${relative(openAiYamlPath)} must include policy.allow_implicit_invocation as true or false`);
      continue;
    }

    if (claudeExplicitOnly && !hasPolicy) {
      fail(`${relative(openAiYamlPath)} must include policy.allow_implicit_invocation: false because ${relative(filePath)} is explicit-only`);
      continue;
    }

    if (claudeExplicitOnly && allowImplicit !== false) {
      fail(`${relative(openAiYamlPath)} must set policy.allow_implicit_invocation: false because ${relative(filePath)} is explicit-only`);
    }

    if (!claudeExplicitOnly && allowImplicit === false) {
      fail(`${relative(openAiYamlPath)} sets policy.allow_implicit_invocation: false but ${relative(filePath)} is missing disable-model-invocation: true`);
    }
  }
}

function checkMirroredReferences() {
  // Empty since craft-tune's removal (2026-07) left craft-critique's
  // failure-modes.md and craft-prompt's shared-principles.md as single
  // canonical copies. Add a pair only when two files must genuinely stay
  // byte-identical — the repo default is one source per thing.
  const mirroredPairs = [];

  for (const [first, second] of mirroredPairs) {
    const firstPath = path.join(root, first);
    const secondPath = path.join(root, second);

    if (!fs.existsSync(firstPath)) {
      fail(`${first} is missing from a mirrored reference pair`);
      continue;
    }

    if (!fs.existsSync(secondPath)) {
      fail(`${second} is missing from a mirrored reference pair`);
      continue;
    }

    if (readText(firstPath) !== readText(secondPath)) {
      fail(`${first} and ${second} are mirrored references and must stay identical`);
    }
  }
}

// Conservative citation matcher for #109: matches `references/...md` path-like
// strings, with an optional chain of leading path segments (`../`, `skills/`,
// `spec-grill/`, ...) so cross-skill citations like
// `../spec-grill/references/spec-pipeline-ready.md` or
// `skills/craft-prompt/references/prompt-patterns.md` are captured whole rather
// than truncated at the literal "references/" token.
//
// templates/...md and guides/...md are deliberately NOT in scope here (issue
// #109 globs references/ only): craft-handoff/SKILL.md has an existing
// `craft-prompt/templates/session-handoff.md` mention that is missing a `../`
// or `skills/` prefix and would dangle under this same regex — extending scope
// to templates/guides is not "trivially the same code path" once that citation
// style exists, so it's left unenforced rather than papered over with more
// special-casing. See the verify report for this finding.
const referenceCitationPattern = /(?:[\w.-]+\/)*references\/[\w.\-/]+\.md/g;

function resolveCitation(skillDir, citation) {
  if (citation.startsWith("skills/")) {
    return path.join(root, citation);
  }

  return path.join(skillDir, citation);
}

function checkReferenceIndex() {
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
    // somewhere in this skill's own SKILL.md. Subdirectories (e.g.
    // craft-skill-spec/references/radar/) are out of scope for this direction —
    // the issue globs one level only.
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

    // Direction (b): every references/templates/guides path-like citation must
    // resolve to a real file, relative to the skill dir (or the repo root for
    // citations spelled out from `skills/...`).
    const citations = new Set(body.match(referenceCitationPattern) ?? []);
    for (const citation of citations) {
      const resolvedPath = resolveCitation(skillDir, citation);
      if (!fs.existsSync(resolvedPath)) {
        fail(`${relative(skillMdPath)} cites ${citation}, which does not exist (resolved to ${relative(resolvedPath)})`);
      }
    }
  }
}

function checkFamilySectionContract() {
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

// Terminology rules table: adding a new rule is a one-entry addition here, not
// a new function. Each entry is { files, forbidden, why }:
//   - files: repo-relative paths, each either an explicit literal path or a
//     minimal glob (`*` = within one path segment, `**` = across segments).
//   - forbidden: literal phrases (exact substring match) or RegExp (tested
//     against the whole file text; first match is reported).
//   - why: explains the rule so a failure message points back to its source
//     of truth, so a future maintainer isn't left guessing.
const terminologyRules = [
  {
    // Original single-file check this table replaces (#114); behavior preserved
    // exactly (same file, same two phrases).
    files: ["docs/examples/tune-a-prompt.md"],
    forbidden: ["run harness", "evals and a harness"],
    why: 'craft-autoresearch renamed its loop mechanism to "eval runner"; this doc should not still say "harness"',
  },
  {
    // README.md's "Terminology note" (search that phrase): craft-autoresearch
    // uses an "eval runner"; "harness" is craft-harness's word for repo-local
    // agent guidance/provider surfaces — "Do not use 'harness' for both."
    // Scoped to craft-autoresearch's own docs (not the whole repo) because
    // other skills — most obviously craft-harness itself, and any skill that
    // cross-references it by name — legitimately say "craft-harness". The
    // forbidden pattern is a word-boundary match on "harness" with a negative
    // lookbehind for the "craft-" prefix, so "craft-harness" mentions are
    // exempt but a bare "harness" (the word this rule actually bans here) is
    // still caught. As of this writing skills/craft-autoresearch/** contains
    // zero occurrences of "harness" in any form, so this passes the existing
    // tree cleanly; it exists to catch future regressions.
    files: ["skills/craft-autoresearch/**/*.md"],
    forbidden: [/(?<!craft-)\bharness\b/i],
    why: 'README.md\'s Terminology note reserves "harness" for craft-harness; craft-autoresearch must say "eval runner" instead',
  },
  {
    // Guards the #134 neutralization (PRD-RH E2.2, commit 3bf159a): the
    // spec-* spines used to lean on dev-backlog/dev-relay vocabulary as
    // load-bearing terms — "relay-learning destination" as the admission-test
    // criterion, "relay run" as the Tier-2 proof-gate citation, and sprint
    // `component:` frontmatter as the slug consumer. All three were replaced
    // with consumer-neutral phrasing so the spines stay usable in repos that
    // never install dev-backlog/dev-relay. Scoped to the three spec-* spines
    // themselves (not skills/spec-*/**), so references/ and templates/ under
    // those skills stay exempt — integration examples there may legitimately
    // name sprint/relay concepts as a named optional integration.
    files: ["skills/spec-charter/SKILL.md", "skills/spec-grill/SKILL.md", "skills/spec-system-map/SKILL.md"],
    forbidden: ["relay-learning", "relay run", "`component:` frontmatter"],
    why: 'spec-* spines must stay standalone-usable; "relay-learning", "relay run", and "`component:` frontmatter" are dev-relay/dev-backlog vocabulary neutralized in #134 — use consumer-neutral phrasing instead',
  },
];

// Pure, unit-testable: minimal glob match (no dependency). `*` matches within
// one path segment, `**` matches across segments (including the empty case,
// so `a/**/*.md` also matches `a/x.md`). Patterns without `*` are compared as
// exact literal paths.
function matchesFilePattern(pattern, filePath) {
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
function terminologyFindings(text, forbidden) {
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

function checkTerminology() {
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

function checkDocumentationPaths() {
  const text = readText(path.join(root, "README.md"));
  const statusPath = path.join(root, "docs/status.md");

  for (const phrase of ["## 30-second path", "docs/status.md", "npm run verify"]) {
    if (!text.includes(phrase)) {
      fail(`README.md must include ${phrase}`);
    }
  }

  if (text.includes("~/.craftkit/autoresearch/")) {
    fail("README.md must keep maintainer-local autoresearch paths in docs/status.md");
  }

  if (!fs.existsSync(statusPath)) {
    fail("docs/status.md must exist as the public quality evidence index");
    return;
  }

  const statusText = readText(statusPath);
  for (const phrase of ["Public evidence", "Maintainer-local evidence", "npm run verify"]) {
    if (!statusText.includes(phrase)) {
      fail(`docs/status.md must include ${phrase}`);
    }
  }
}

// Shared review-date staleness helper (radar current.md, craft-prompt guides).
// The caller prefixes its own file path, so messages stay file-agnostic;
// cadenceHint names where the refresh rule lives, when there is one.
function radarStaleness(content, now, maxAgeDays = radarMaxAgeDays, cadenceHint = "see radar/policy.md for the refresh cadence") {
  const match = content.match(/^- last reviewed:\s*`([^`]*)`/m);
  if (!match) {
    return 'missing a parseable "last reviewed" date';
  }

  const reviewedDate = new Date(`${match[1]}T00:00:00Z`);
  if (Number.isNaN(reviewedDate.getTime())) {
    return `unparseable "last reviewed" date: ${match[1]}`;
  }

  const ageDays = Math.floor((now.getTime() - reviewedDate.getTime()) / 86_400_000);
  if (ageDays > maxAgeDays) {
    return `last reviewed ${match[1]} (${ageDays} days ago), past the ${maxAgeDays}-day staleness threshold${cadenceHint ? ` — ${cadenceHint}` : ""}`;
  }

  return null;
}

function checkRadarStaleness() {
  const filePath = path.join(root, radarCurrentPath);
  if (!fs.existsSync(filePath)) {
    return;
  }

  const message = radarStaleness(readText(filePath), new Date());
  if (message) {
    warn(`${relative(filePath)}: ${message}`);
  }
}

function checkGuideStaleness() {
  const guidesDir = path.join(root, craftPromptGuidesPath);
  if (!fs.existsSync(guidesDir)) {
    return;
  }

  const guideFiles = fs.readdirSync(guidesDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => path.join(guidesDir, entry.name));

  for (const filePath of guideFiles) {
    const message = radarStaleness(readText(filePath), new Date(), guideMaxAgeDays, "platform guides are reviewed on a 120-day horizon");
    if (message) {
      warn(`${relative(filePath)}: ${message}`);
    }
  }
}

function checkPackDryRun() {
  if (skipPackDryRunForTests) {
    return;
  }

  const result = spawnSync("npm", ["pack", "--dry-run", "--json"], {
    cwd: root,
    encoding: "utf8",
  });

  if (result.status !== 0) {
    fail(`npm pack --dry-run failed: ${result.stderr || result.stdout}`);
    return;
  }

  let packEntries;
  try {
    packEntries = JSON.parse(result.stdout);
  } catch (error) {
    fail(`npm pack --dry-run did not return JSON: ${error.message}`);
    return;
  }

  const packageFiles = new Set(packEntries.flatMap((entry) => entry.files?.map((file) => file.path) ?? []));
  const requiredFiles = [
    ".claude-plugin/marketplace.json",
    "AGENTS.md",
    "CHANGELOG.md",
    "README.md",
    "docs/status.md",
    "package.json",
    "scripts/verify.mjs",
    ...listFiles(path.join(root, "skills"), (item) => path.basename(item) === "SKILL.md").map(relative),
  ];

  for (const requiredFile of requiredFiles) {
    if (!packageFiles.has(requiredFile)) {
      fail(`npm package is missing ${requiredFile}`);
    }
  }

  const forbiddenPatterns = [
    /^\.git\//,
    /^node_modules\//,
    /^test\//,
    /^tests\//,
    /^\.craftkit\//,
    /^\.relay\//,
    /^skills\/.*\/scripts\/.*\.(test|spec)\.(js|mjs|cjs|ts|mts|cts|jsx|tsx)$/,
  ];

  for (const packageFile of packageFiles) {
    if (forbiddenPatterns.some((pattern) => pattern.test(packageFile))) {
      fail(`npm package must not include ${packageFile}`);
    }
  }
}

function main() {
  checkJsonFiles();
  checkPackageBoundary();
  checkSkillFiles();
  checkOpenAiInvocationPolicies();
  checkMirroredReferences();
  checkReferenceIndex();
  checkFamilySectionContract();
  checkTerminology();
  checkDocumentationPaths();
  checkRadarStaleness();
  checkGuideStaleness();
  checkPackDryRun();

  for (const warning of warnings) {
    console.warn(`warning: ${warning}`);
  }

  if (failures.length > 0) {
    console.error("verify failed:");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log("verify passed");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}

export { radarStaleness, sectionContractFindings, matchesFilePattern, terminologyFindings, terminologyRules };
