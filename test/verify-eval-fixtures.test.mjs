/**
 * Tests for eval fixture helpers and conveyance validation utilities.
 * These are pure function tests for the helpers in test-support/eval-fixtures.mjs.
 */

import assert from "node:assert/strict";
import test from "node:test";
import {
  hasEvidence,
  hasLocationReference,
  isGenericPositive,
  hasSpecificElements,
  hasFixRationale,
  isProportional,
  generateSkillMd,
  skillFrontmatterTemplates,
  skillSectionTemplates,
  judgmentContractExamples,
} from "../test-support/eval-fixtures.mjs";

// --- Evidence validation ---

test("hasEvidence detects file:line format", () => {
  assert.ok(hasEvidence({ evidence: "file:line server.js:42" }));
  assert.ok(hasEvidence({ evidence: "line 15: missing check" }));
  assert.ok(hasEvidence({ evidence: "quoted: 'const x = null;'" }));
});

test("hasEvidence rejects missing or empty evidence", () => {
  assert.ok(!hasEvidence({ evidence: null }));
  assert.ok(!hasEvidence({ evidence: "" }));
  assert.ok(!hasEvidence({}));
});

test("hasLocationReference matches line numbers and file paths", () => {
  assert.ok(hasLocationReference("server.js:42"));
  assert.ok(hasLocationReference("line 15"));
  assert.ok(hasLocationReference("10:20 in function"));
  assert.ok(!hasLocationReference("no location here"));
});

// --- Strengths validation ---

test("isGenericPositive detects generic praise", () => {
  assert.ok(isGenericPositive("Good code quality"));
  assert.ok(isGenericPositive("Well structured"));
  assert.ok(isGenericPositive("Nice work"));
  assert.ok(isGenericPositive("Great implementation"));
  assert.ok(!isGenericPositive("Null checks prevent crashes"));
});

test("hasSpecificElements detects code references", () => {
  assert.ok(hasSpecificElements("Null check at line 15"));
  assert.ok(hasSpecificElements("function validateInput()"));
  assert.ok(hasSpecificElements("Error handling in processData()"));
  assert.ok(hasSpecificElements("variable userId at file:auth.js"));
  assert.ok(!hasSpecificElements("Good organization"));
});

// --- Fix ordering validation ---

test("hasFixRationale detects valid rationale keywords", () => {
  assert.ok(hasFixRationale({ rationale: "dependency: other fixes need this" }));
  assert.ok(hasFixRationale({ rationale: "security: blocks all work" }));
  assert.ok(hasFixRationale({ rationale: "reach: user-facing impact" }));
  assert.ok(hasFixRationale({ rationale: "risk: may break other features" }));
  assert.ok(!hasFixRationale({ rationale: "just do it" }));
  assert.ok(!hasFixRationale({ rationale: "" }));
});

// --- Proportionality ---

test("isProportional accepts short output for small input", () => {
  assert.ok(isProportional(5, 10));
  assert.ok(isProportional(8, 25));
  assert.ok(!isProportional(5, 50));
});

test("isProportional enforces ratio for larger inputs", () => {
  assert.ok(isProportional(100, 200));
  assert.ok(isProportional(100, 299));
  assert.ok(!isProportional(100, 400));
});

// --- Skill generation ---

test("generateSkillMd produces valid frontmatter and body", () => {
  const md = generateSkillMd(skillFrontmatterTemplates.minimalValid, skillSectionTemplates.craftMinimal);

  assert.match(md, /^---\n/);
  assert.match(md, /name: "example"/);
  assert.match(md, /description: "Example skill for testing\."/);
  assert.match(md, /---\n\n# example/);
  assert.match(md, /## Purpose/);
  assert.match(md, /## Output format/);
});

test("generateSkillMd handles boolean frontmatter fields", () => {
  const md = generateSkillMd(skillFrontmatterTemplates.withAllMetadata, skillSectionTemplates.craftMinimal);

  assert.match(md, /disable-model-invocation: true/);
  assert.ok(!md.includes('disable-model-invocation: "true"'), "Boolean should not be quoted");
});

test("generateSkillMd handles nested metadata", () => {
  const md = generateSkillMd(skillFrontmatterTemplates.withAllMetadata, skillSectionTemplates.craftMinimal);

  assert.match(md, /metadata:/);
  assert.match(md, /related-skills:/);
});

// --- Judgment contract examples validation ---

test("judgmentContractExamples.goodFindings have evidence", () => {
  for (const finding of judgmentContractExamples.goodFindings) {
    assert.ok(hasEvidence(finding), `Finding should have evidence: ${JSON.stringify(finding)}`);
  }
});

test("judgmentContractExamples.goodStrengths are specific", () => {
  for (const strength of judgmentContractExamples.goodStrengths) {
    assert.ok(hasSpecificElements(strength), `Strength should be specific: ${strength}`);
    assert.ok(!isGenericPositive(strength), `Strength should not be generic: ${strength}`);
  }
});

test("judgmentContractExamples.badStrengths are generic", () => {
  for (const strength of judgmentContractExamples.badStrengths) {
    assert.ok(isGenericPositive(strength), `Strength should be generic: ${strength}`);
  }
});

test("judgmentContractExamples.goodFixOrdering has rationales", () => {
  for (const fix of judgmentContractExamples.goodFixOrdering) {
    assert.ok(hasFixRationale(fix), `Fix ordering should have rationale: ${JSON.stringify(fix)}`);
  }
});

test("judgmentContractExamples.badFixOrderingNoRationale lacks rationales", () => {
  for (const fix of judgmentContractExamples.badFixOrderingNoRationale) {
    assert.ok(!hasFixRationale(fix), `Fix ordering should lack rationale: ${JSON.stringify(fix)}`);
  }
});

// --- Template coverage ---

test("skillFrontmatterTemplates covers all test cases", () => {
  const templates = skillFrontmatterTemplates;

  assert.ok(templates.minimalValid);
  assert.ok(templates.withAllMetadata);
  assert.ok(templates.providerNeutral);
  assert.ok(templates.providerViolation);
  assert.ok(templates.exactWordLimit);
  assert.ok(templates.overWordLimit);
});

test("skillSectionTemplates covers craft-* and spec-* families", () => {
  const templates = skillSectionTemplates;

  assert.ok(templates.craftMinimal);
  assert.ok(templates.craftComplete);
  assert.ok(templates.specMinimal);
  assert.ok(templates.specComplete);
});

test("craft-* section templates include required sections", () => {
  assert.match(skillSectionTemplates.craftMinimal, /## Purpose/);
  assert.match(skillSectionTemplates.craftMinimal, /## Output format/);

  assert.match(skillSectionTemplates.craftComplete, /## Purpose/);
  assert.match(skillSectionTemplates.craftComplete, /## Output format/);
  assert.match(skillSectionTemplates.craftComplete, /## Example/);
});

test("spec-* section templates include Execution Contract wrapper", () => {
  assert.match(skillSectionTemplates.specMinimal, /## Execution Contract/);
  assert.match(skillSectionTemplates.specMinimal, /### Mode Router/);
  assert.match(skillSectionTemplates.specMinimal, /### Completion Contract/);

  assert.match(skillSectionTemplates.specComplete, /## Execution Contract/);
  assert.match(skillSectionTemplates.specComplete, /### Mode Router/);
  assert.match(skillSectionTemplates.specComplete, /### Completion Contract/);
});
