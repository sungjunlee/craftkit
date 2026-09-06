import assert from "node:assert/strict";
import test from "node:test";
import { sectionContractFindings } from "../scripts/verify-section-contract.mjs";
import {
  createFixture,
  expectCheckFailure,
  runCheck,
  withInjectedBaseline,
  writeFile,
} from "../test-support/verify-fixture.mjs";

const moduleFile = "verify-section-contract.mjs";
const fn = "checkFamilySectionContract";

const compliantCraftSkillBody = (name) => `---
name: ${name}
description: Example ${name} skill for section contract tests.
---

# ${name}

## Purpose

Does a thing.

## Use this when

- always

## Inputs

- none

## Steps

1. Do it.

## Output format

A single line.

## Guardrails

- stay safe

## Failure modes

- it might fail

## Example

Input: x
Output: y
`;

const compliantSpecSkillBody = (name) => `---
name: ${name}
description: Example ${name} skill for section contract tests.
---

# ${name}

Intro paragraph.

## Execution Contract

### Mode Router

Routes intent to a mode.

### Completion Contract

Reports what changed.

## Domain Rules

Whatever this skill mutates.

## Verification prompts

- "A pressure-test prompt." Expected: do the right thing.

## References

Nothing to cite.
`;

expectCheckFailure("fails on a non-baselined missing required section", moduleFile, fn, (root) => {
  writeFile(
    root,
    "skills/craft-newskill/SKILL.md",
    compliantCraftSkillBody("craft-newskill").replace("## Purpose\n\nDoes a thing.\n\n", ""),
  );
}, /skills\/craft-newskill\/SKILL\.md is missing the required "Purpose" section \(new drift/);

test("warns (and still passes) on a baselined missing required section", () => {
  const root = createFixture();
  // Note: the craft-* skill names createFixture() seeds a references/ dir under
  // are avoided here — a seeded references/ dir would also trip the
  // reference-index check or the References requirement.
  // The checked-in knownSectionDeviations baseline is empty, so inject a
  // synthetic entry for craft-handoff and reproduce exactly those two gaps to
  // exercise the warn (not fail) branch.
  withInjectedBaseline(root, { "craft-handoff": ["Output format", "Guardrails"] });
  writeFile(
    root,
    "skills/craft-handoff/SKILL.md",
    compliantCraftSkillBody("craft-handoff")
      .replace("## Output format\n\nA single line.\n\n", "")
      .replace("## Guardrails\n\n- stay safe\n\n", ""),
  );

  const result = runCheck(root, moduleFile, fn);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(
    `${result.stdout}\n${result.stderr}`,
    /skills\/craft-handoff\/SKILL\.md is missing the required "Output format" section \(baselined/,
  );
});

expectCheckFailure("fails on a stale baseline entry whose section is now present", moduleFile, fn, (root) => {
  // Inject a synthetic baseline entry (the checked-in baseline is empty)
  // listing "Output format" and "Guardrails", then supply a fixture
  // that is fully compliant, satisfying both (and so making both entries stale).
  withInjectedBaseline(root, { "craft-handoff": ["Output format", "Guardrails"] });
  writeFile(root, "skills/craft-handoff/SKILL.md", compliantCraftSkillBody("craft-handoff"));
}, /knownSectionDeviations still lists "Output format".*but the section is now present/);

test("passes for a spec-* skill with the full Execution Contract + Verification prompts shape", () => {
  const root = createFixture();
  writeFile(root, "skills/spec-newmap/SKILL.md", compliantSpecSkillBody("spec-newmap"));

  const result = runCheck(root, moduleFile, fn);

  assert.equal(result.status, 0, result.stderr || result.stdout);
});

expectCheckFailure("fails on a spec-* skill missing the Execution Contract wrapper", moduleFile, fn, (root) => {
  writeFile(
    root,
    "skills/spec-newmap/SKILL.md",
    `---
name: spec-newmap
description: Example spec-newmap skill for section contract tests.
---

# spec-newmap

## Mode Router

Routes intent to a mode, but not under Execution Contract.

## Verification prompts

- "A pressure-test prompt." Expected: do the right thing.

## References

Nothing to cite.
`,
  );
}, /skills\/spec-newmap\/SKILL\.md is missing the required "Execution Contract wrapper" section \(new drift/);

test("sectionContractFindings returns no findings for a fully compliant craft-* skill", () => {
  assert.deepEqual(sectionContractFindings("craft-x", compliantCraftSkillBody("craft-x"), false), []);
});

test("sectionContractFindings requires References only when a references/ dir exists", () => {
  const bodyWithoutReferences = compliantCraftSkillBody("craft-x");

  assert.deepEqual(sectionContractFindings("craft-x", bodyWithoutReferences, false), []);
  assert.deepEqual(sectionContractFindings("craft-x", bodyWithoutReferences, true), ["References"]);

  const bodyWithReferences = `${bodyWithoutReferences}\n## References\n\n- \`references/foo.md\`\n`;
  assert.deepEqual(sectionContractFindings("craft-x", bodyWithReferences, true), []);
});

test("sectionContractFindings flags 'Common mistakes' as a missing Failure modes section (exemption retired in #150/#151)", () => {
  const body = compliantCraftSkillBody("craft-x").replace(
    "## Failure modes\n\n- it might fail\n\n",
    "## Common mistakes\n\n- it might fail\n\n",
  );

  assert.deepEqual(sectionContractFindings("craft-x", body, false), ["Failure modes"]);
});

test("sectionContractFindings requires Mode Router and Completion Contract nested under Execution Contract", () => {
  const flatBody = `---
name: spec-x
description: Example.
---

# spec-x

## Mode Router

Not nested.

## Completion Output

Not named Completion Contract.

## Verification prompts

- prompt

## References

- none
`;

  assert.deepEqual(
    sectionContractFindings("spec-x", flatBody, false),
    ["Execution Contract wrapper", "Mode Router (nested)", "Completion Contract (nested)"],
  );

  const nestedBody = `---
name: spec-x
description: Example.
---

# spec-x

## Execution Contract

### Intent Router

Nested.

### Completion Contract

Nested.

## Verification prompts

- prompt

## References

- none
`;

  assert.deepEqual(sectionContractFindings("spec-x", nestedBody, false), []);
});

test("sectionContractFindings returns no requirements for a skill outside both families", () => {
  assert.deepEqual(sectionContractFindings("example", "# example\n\nNo required sections.\n", true), []);
});
