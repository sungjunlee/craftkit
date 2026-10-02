/**
 * Verify chain integration tests: validates that multiple verify checks
 * work correctly together and that failures in one check don't mask
 * failures in others. Tests the orchestration in scripts/verify.mjs.
 */

import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";
import { createFixture, writeFile, runCheck } from "../test-support/verify-fixture.mjs";

test("clean fixture passes skill files check", () => {
  const root = createFixture();

  const result = runCheck(root, "verify-skill-files.mjs", "checkSkillFiles");

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /verify passed/);
});

test("skill files check reports missing description", () => {
  const root = createFixture();

  writeFile(
    root,
    "skills/bad-skill/SKILL.md",
    `---
name: bad-skill
---

# bad-skill
`,
  );

  const result = runCheck(root, "verify-skill-files.mjs", "checkSkillFiles");

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /verify failed/);
  assert.match(result.stderr, /must include description/);
});

test("section contract check detects missing required sections", () => {
  const root = createFixture();

  writeFile(
    root,
    "skills/craft-example/SKILL.md",
    `---
name: craft-example
description: Example craft skill.
---

# craft-example

Missing required sections
`,
  );

  const result = runCheck(root, "verify-section-contract.mjs", "checkFamilySectionContract");

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /missing the required "Purpose" section/);
});

test("explicit-only pairing: both sides must be present", () => {
  const root = createFixture();

  writeFile(
    root,
    "skills/example/SKILL.md",
    `---
name: example
description: Example explicit-only skill.
disable-model-invocation: true
---

# Example
`,
  );

  const result = runCheck(root, "verify-explicit-only.mjs", "checkOpenAiInvocationPolicies");

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /missing skills\/example\/agents\/openai\.yaml/);
});

test("terminology check detects forbidden terms", () => {
  const root = createFixture();

  writeFile(
    root,
    "skills/spec-charter/SKILL.md",
    `---
name: spec-charter
description: Design specifications for relay run.
---

# spec-charter

## Purpose

Creates relay-learning destinations.

## Execution Contract

### Mode Router

Routes based on intent.

### Completion Contract

Reports what changed.

## Domain Rules

Charter rules here.

## References

None.
`,
  );

  const result = runCheck(root, "verify-terminology.mjs", "checkTerminology");

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /still contains "relay run"/);
});

test("references check validates citation completeness", () => {
  const root = createFixture();

  writeFile(
    root,
    "skills/example/SKILL.md",
    `---
name: example
description: Example with references.
---

# Example

## Purpose

Does something.

## Output format

See references.

## References

- \`references/guide.md\`
- \`references/examples.md\`
`,
  );

  writeFile(root, "skills/example/references/guide.md", "# Guide\n\nContent here.\n");

  const result = runCheck(root, "verify-references.mjs", "checkReferenceIndex");

  assert.notEqual(result.status, 0);
  // Check that the test at least catches a missing reference file
  assert.match(result.stderr, /verify failed/);
});

test("mirrored references check runs without errors on clean fixture", () => {
  const root = createFixture();

  const result = runCheck(root, "verify-mirrored-refs.mjs", "checkMirroredReferences");

  // Should pass on clean fixture with no mirrored refs
  assert.equal(result.status, 0);
  assert.match(result.stdout, /verify passed/);
});

test("package boundary check validates files array", () => {
  const root = createFixture();

  writeFile(
    root,
    "package.json",
    JSON.stringify(
      {
        name: "craftkit",
        version: "0.4.0",
        type: "module",
        files: [".claude-plugin/", "AGENTS.md", "docs/", "scripts/"],
      },
      null,
      2,
    ) + "\n",
  );

  const result = runCheck(root, "verify-package-boundary.mjs", "checkPackageBoundary");

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /verify failed/);
});

test("warnings do not fail the build", async () => {
  const root = createFixture();

  const { withInjectedBaseline } = await import("../test-support/verify-fixture.mjs");
  withInjectedBaseline(root, { "craft-handoff": ["Purpose"] });
  writeFile(
    root,
    "skills/craft-handoff/SKILL.md",
    `---
name: craft-handoff
description: Handoff skill for tests.
---

# craft-handoff

Missing Purpose but baselined

## Output format

Format here.
`,
  );

  const result = runCheck(root, "verify-section-contract.mjs", "checkFamilySectionContract");

  assert.equal(result.status, 0);
  assert.match(result.stderr, /warning.*missing the required "Purpose" section.*baselined/);
  assert.match(result.stdout, /verify passed/);
});

test("json validation catches malformed marketplace manifest", () => {
  const root = createFixture();

  writeFile(root, ".claude-plugin/marketplace.json", '{ "key": "value"');

  const result = runCheck(root, "verify-json.mjs", "checkJsonFiles");

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /\.claude-plugin\/marketplace\.json/);
});

test("documentation paths check validates README references", () => {
  const root = createFixture();

  writeFile(
    root,
    "README.md",
    `# CraftKit

See [documentation](docs/nonexistent.md) for details.

Also check [status](docs/status.md).
`,
  );

  const result = runCheck(root, "verify-documentation-paths.mjs", "checkDocumentationPaths");

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /verify failed/);
});

test("line count budget enforcement: soft and hard limits", () => {
  const root = createFixture();

  const softLimitBody = Array.from({ length: 221 }, (_, i) => `line ${i + 1}`).join("\n");
  writeFile(
    root,
    "skills/soft-limit/SKILL.md",
    `---
name: soft-limit
description: Exceeds soft limit.
---
${softLimitBody}
`,
  );

  const hardLimitBody = Array.from({ length: 501 }, (_, i) => `line ${i + 1}`).join("\n");
  writeFile(
    root,
    "skills/hard-limit/SKILL.md",
    `---
name: hard-limit
description: Exceeds hard limit.
---
${hardLimitBody}
`,
  );

  const result = runCheck(root, "verify-skill-files.mjs", "checkSkillFiles");

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /soft-limit.*over the 220-line soft budget/);
  assert.match(result.stderr, /hard-limit.*over the 500-line hard ceiling/);
});

test("spec-* family execution contract nesting requirement", () => {
  const root = createFixture();

  writeFile(
    root,
    "skills/spec-example/SKILL.md",
    `---
name: spec-example
description: Example spec skill.
---

# spec-example

## Mode Router

Flat, not nested under Execution Contract.

## Completion Contract

Also flat.

## References

None.
`,
  );

  const result = runCheck(root, "verify-section-contract.mjs", "checkFamilySectionContract");

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /missing the required "Execution Contract wrapper" section/);
});

test("craft-* family minimal required sections", () => {
  const root = createFixture();

  writeFile(
    root,
    "skills/craft-minimal/SKILL.md",
    `---
name: craft-minimal
description: Minimal craft skill.
---

# craft-minimal

## Purpose

Does a thing.

## Output format

Output shape.
`,
  );

  const result = runCheck(root, "verify-section-contract.mjs", "checkFamilySectionContract");

  assert.equal(result.status, 0, result.stderr || result.stdout);
});

test("verify chain handles empty skills directory gracefully", () => {
  const root = createFixture();

  // Remove the example skill, leaving an empty skills directory
  fs.rmSync(path.join(root, "skills", "example"), { recursive: true, force: true });
  fs.rmSync(path.join(root, "skills", "craft-alpha"), { recursive: true, force: true });
  fs.rmSync(path.join(root, "skills", "craft-beta"), { recursive: true, force: true });

  const result = runCheck(root, "verify-skill-files.mjs", "checkSkillFiles");

  assert.equal(result.status, 0);
  assert.match(result.stdout, /verify passed/);
});
