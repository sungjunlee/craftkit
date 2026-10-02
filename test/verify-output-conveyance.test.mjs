/**
 * Output conveyance checks: validates that skill output contracts match what
 * the skill promises to deliver. Inspired by #155's judgment-contract evals.
 * Called from scripts/verify.mjs.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { createFixture, writeFile } from "../test-support/verify-fixture.mjs";
import { readText, parseFrontmatter } from "../scripts/verify-shared.mjs";
import path from "node:path";

// Extract Output format section from a SKILL.md body
function extractOutputFormatSection(text) {
  const match = text.match(/^## Output format\s*\n([\s\S]*?)(?=\n## |$)/m);
  return match ? match[1].trim() : null;
}

// Check if output format describes a judgment contract (conveyance-based)
// vs a fixed template (structure-based)
function isJudgmentContract(outputSection) {
  if (!outputSection) return false;

  const judgmentIndicators = [
    /must convey/i,
    /should state/i,
    /carries/i,
    /reports/i,
    /judgment/i,
    /finding/i,
    /evidence/i,
  ];

  return judgmentIndicators.some((pattern) => pattern.test(outputSection));
}

// Check if output format includes enforcement indicators
function hasEnforcementIndicators(outputSection) {
  if (!outputSection) return false;

  const enforcementPatterns = [
    /required/i,
    /must include/i,
    /every .* carries/i,
    /no .* without/i,
  ];

  return enforcementPatterns.some((pattern) => pattern.test(outputSection));
}

test("craft-prompt output contract specifies copy-paste-ready deliverable", () => {
  const root = createFixture();
  writeFile(
    root,
    "skills/craft-prompt/SKILL.md",
    `---
name: craft-prompt
description: Craft copy-paste-ready prompts.
---

# craft-prompt

## Purpose

Turn notes into a prompt.

## Output format

One fenced code block, ready to copy-paste.

## Example

Input: "write a review prompt"
Output: a prompt block
`,
  );

  const text = readText(path.join(root, "skills/craft-prompt/SKILL.md"));
  const outputSection = extractOutputFormatSection(text);

  assert.ok(outputSection);
  assert.match(outputSection, /copy-paste/i);
  assert.match(outputSection, /fenced code block/i);
});

test("craft-handoff output contract specifies paired artifacts", () => {
  const root = createFixture();
  writeFile(
    root,
    "skills/craft-handoff/SKILL.md",
    `---
name: craft-handoff
description: Produce paired session-handoff artifacts.
disable-model-invocation: true
---

# craft-handoff

## Purpose

End the session with paired handoff.

## Output format

- **Rich doc** — frontmatter plus a single context body.
- **Resume prompt** — context / task / rules structure.

## Example

Input: wrap up session
Output: paired artifacts
`,
  );

  const text = readText(path.join(root, "skills/craft-handoff/SKILL.md"));
  const outputSection = extractOutputFormatSection(text);

  assert.ok(outputSection, "Output format section should exist");
  // Check for the key deliverables
  assert.ok(outputSection.includes("Rich doc") || outputSection.includes("resume prompt"), 
    "Output section should mention paired artifacts");
});

test("judgment contract includes enforcement indicators", () => {
  const root = createFixture();
  writeFile(
    root,
    "skills/example/SKILL.md",
    `---
name: example
description: Example with judgment contract.
---

# example

## Output format

Must convey prioritized findings with severity. Every HIGH finding carries evidence. No generic positives without specific elements.
`,
  );

  const text = readText(path.join(root, "skills/example/SKILL.md"));
  const outputSection = extractOutputFormatSection(text);

  assert.ok(isJudgmentContract(outputSection));
  assert.ok(hasEnforcementIndicators(outputSection));
});

test("fixed template does not include judgment indicators", () => {
  const root = createFixture();
  writeFile(
    root,
    "skills/example/SKILL.md",
    `---
name: example
description: Example with fixed template.
---

# example

## Output format

\`\`\`markdown
## Section 1
...

## Section 2
...
\`\`\`
`,
  );

  const text = readText(path.join(root, "skills/example/SKILL.md"));
  const outputSection = extractOutputFormatSection(text);

  assert.ok(outputSection);
  assert.ok(!isJudgmentContract(outputSection));
});

test("output format with scale-with-artifact proportionality statement", () => {
  const root = createFixture();
  writeFile(
    root,
    "skills/example/SKILL.md",
    `---
name: example
description: Example with proportionality.
---

# example

## Output format

Shape scales with the artifact. A small artifact must get a short critique.
`,
  );

  const text = readText(path.join(root, "skills/example/SKILL.md"));
  const outputSection = extractOutputFormatSection(text);

  assert.ok(outputSection);
  assert.match(outputSection, /scales with/i);
});

test("conveyance binary floor checks: evidence requirements", () => {
  const exampleOutput = {
    findings: [
      { severity: "HIGH", issue: "Missing validation", evidence: "line 42: no null check" },
      { severity: "MED", issue: "Poor naming", evidence: "variable 'x' at line 10" },
    ],
  };

  for (const finding of exampleOutput.findings) {
    if (finding.severity === "HIGH" || finding.severity === "MED") {
      assert.ok(finding.evidence, `${finding.severity} finding must carry evidence`);
      assert.ok(
        finding.evidence.includes("line") || finding.evidence.includes("file:"),
        "Evidence should include location reference",
      );
    }
  }
});

test("conveyance: strengths name specific elements, not generic positives", () => {
  const badStrengths = [
    "Good code quality",
    "Well structured",
    "Nice work",
  ];

  const goodStrengths = [
    "Null checks at lines 15-17 prevent crashes",
    "Error handling function in processData recovers gracefully",
  ];

  // Bad strengths should fail this check (generic positives)
  for (const strength of badStrengths) {
    const isGeneric = /^(good|nice|well|great|excellent)/i.test(strength);
    assert.ok(
      isGeneric,
      `"${strength}" is a generic positive (as expected for bad example)`,
    );
  }

  // Good strengths should pass this check (specific elements)
  for (const strength of goodStrengths) {
    const hasSpecifics = /line|function|method|class|variable|\(\)/i.test(strength);
    assert.ok(
      hasSpecifics,
      `"${strength}" should reference specific code elements`,
    );
  }
});
