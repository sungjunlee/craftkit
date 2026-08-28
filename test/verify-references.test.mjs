import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { REQUIRED_SKILL_REFERENCES } from "../scripts/verify-references.mjs";
import {
  createFixture,
  expectCheckFailure,
  runCheck,
  writeFile,
} from "../test-support/verify-fixture.mjs";

const moduleFile = "verify-references.mjs";
const fns = ["checkReferenceIndex", "checkRequiredSkillReferences"];

function runReferences(root) {
  return runCheck(root, moduleFile, fns);
}

test("passes when every top-level references/*.md file is cited", () => {
  const root = createFixture();
  writeFile(
    root,
    "skills/example-refs/SKILL.md",
    "---\nname: example-refs\ndescription: Example skill for reference-index tests.\n---\n\n# example-refs\n\nSee `references/one.md` and `references/two.md`.\n",
  );
  writeFile(root, "skills/example-refs/references/one.md", "# One\n");
  writeFile(root, "skills/example-refs/references/two.md", "# Two\n");

  const result = runReferences(root);

  assert.equal(result.status, 0, result.stderr || result.stdout);
});

expectCheckFailure("fails on an uncited references/*.md file", moduleFile, fns, (root) => {
  writeFile(
    root,
    "skills/example-refs/SKILL.md",
    "---\nname: example-refs\ndescription: Example skill for reference-index tests.\n---\n\n# example-refs\n\nSee `references/one.md`.\n",
  );
  writeFile(root, "skills/example-refs/references/one.md", "# One\n");
  writeFile(root, "skills/example-refs/references/two.md", "# Two\n");
}, /skills\/example-refs\/SKILL\.md does not cite references\/two\.md/);

expectCheckFailure("fails on a dangling references/ citation", moduleFile, fns, (root) => {
  writeFile(
    root,
    "skills/example-refs/SKILL.md",
    "---\nname: example-refs\ndescription: Example skill for reference-index tests.\n---\n\n# example-refs\n\nSee `references/ghost.md`.\n",
  );
}, /skills\/example-refs\/SKILL\.md cites references\/ghost\.md, which does not exist/);

test("does not require citing files inside a references/ subdirectory", () => {
  const root = createFixture();
  writeFile(
    root,
    "skills/example-refs/SKILL.md",
    "---\nname: example-refs\ndescription: Example skill for reference-index tests.\n---\n\n# example-refs\n\nSee `references/one.md`.\n",
  );
  writeFile(root, "skills/example-refs/references/one.md", "# One\n");
  writeFile(root, "skills/example-refs/references/sub/nested.md", "# Nested\n");

  const result = runReferences(root);

  assert.equal(result.status, 0, result.stderr || result.stdout);
});

test("resolves a cross-skill ../sibling/references/ citation instead of flagging it as dangling", () => {
  const root = createFixture();
  writeFile(
    root,
    "skills/example-refs-a/SKILL.md",
    "---\nname: example-refs-a\ndescription: Sibling skill A for reference-index tests.\n---\n\n# example-refs-a\n\nSee [`../example-refs-b/references/shared.md`](../example-refs-b/references/shared.md).\n",
  );
  writeFile(
    root,
    "skills/example-refs-b/SKILL.md",
    "---\nname: example-refs-b\ndescription: Sibling skill B for reference-index tests.\n---\n\n# example-refs-b\n\nSee `references/shared.md`.\n",
  );
  writeFile(root, "skills/example-refs-b/references/shared.md", "# Shared\n");

  const result = runReferences(root);

  assert.equal(result.status, 0, result.stderr || result.stdout);
});

function requiredCitations(skill) {
  const entry = REQUIRED_SKILL_REFERENCES.find((item) => item.skill === skill);
  if (!entry) {
    throw new Error(`missing REQUIRED_SKILL_REFERENCES entry for ${skill}`);
  }
  return entry.citations;
}

function seedSpecCharter(root, { omitFiles = [], omitCitations = [] } = {}) {
  const omitFileSet = new Set(omitFiles);
  const omitCitationSet = new Set(omitCitations);
  const citations = requiredCitations("spec-charter")
    .filter((citation) => !omitCitationSet.has(citation))
    .map((citation) => `- \`${citation}\``)
    .join("\n");

  writeFile(
    root,
    "skills/spec-charter/SKILL.md",
    `---
name: spec-charter
description: Example spec-charter skill for required-reference tests.
---

# spec-charter

Intro paragraph.

## Execution Contract

### Mode Router

Routes intent to a mode.

### Completion Contract

Reports what changed.

## Verification prompts

- "A pressure-test prompt." Expected: do the right thing.

## References

${citations}
`,
  );

  for (const citation of requiredCitations("spec-charter")) {
    if (omitFileSet.has(citation)) {
      continue;
    }

    writeFile(root, path.join("skills/spec-charter", citation), `# ${path.basename(citation, ".md")}\n`);
  }
}

function seedSpecGrill(root, { omitFiles = [], omitCitations = [] } = {}) {
  const omitFileSet = new Set(omitFiles);
  const omitCitationSet = new Set(omitCitations);
  const citations = requiredCitations("spec-grill")
    .filter((citation) => !omitCitationSet.has(citation))
    .map((citation) => `- \`${citation}\``)
    .join("\n");

  writeFile(
    root,
    "skills/spec-grill/SKILL.md",
    `---
name: spec-grill
description: Example spec-grill skill for required-reference tests.
---

# spec-grill

Intro paragraph.

## Execution Contract

### Mode Router

Routes intent to a mode.

### Completion Contract

Reports what changed.

## Verification prompts

- "A pressure-test prompt." Expected: do the right thing.

## References

${citations}
`,
  );

  for (const citation of requiredCitations("spec-grill")) {
    if (omitFileSet.has(citation)) {
      continue;
    }

    writeFile(root, path.join("skills/spec-grill", citation), `# ${path.basename(citation, ".md")}\n`);
  }
}

function seedCraftAutoresearch(root, { omitFiles = [], omitCitations = [] } = {}) {
  const omitFileSet = new Set(omitFiles);
  const omitCitationSet = new Set(omitCitations);
  const citations = requiredCitations("craft-autoresearch")
    .filter((citation) => !omitCitationSet.has(citation))
    .map((citation) => `- \`${citation}\``)
    .join("\n");

  writeFile(
    root,
    "skills/craft-autoresearch/SKILL.md",
    `---
name: craft-autoresearch
description: Example craft-autoresearch skill for required-reference tests.
---

# craft-autoresearch

## Purpose

Runs measured iterations against an eval runner.

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

## References

${citations}
`,
  );

  for (const citation of requiredCitations("craft-autoresearch")) {
    if (omitFileSet.has(citation)) {
      continue;
    }

    writeFile(root, path.join("skills/craft-autoresearch", citation), `# ${path.basename(citation, ".md")}\n`);
  }
}

const requiredReferenceSeeders = {
  "spec-charter": seedSpecCharter,
  "spec-grill": seedSpecGrill,
  "craft-autoresearch": seedCraftAutoresearch,
};

for (const { skill, citations } of REQUIRED_SKILL_REFERENCES) {
  const seed = requiredReferenceSeeders[skill];

  test(`passes when ${skill} cites every required reference that exists on disk`, () => {
    const root = createFixture();
    seed(root);

    const result = runReferences(root);

    assert.equal(result.status, 0, result.stderr || result.stdout);
  });

  for (const citation of citations) {
    const escaped = citation.replaceAll(".", "\\.");
    expectCheckFailure(
      `fails when a required ${skill} reference file is missing even if SKILL.md does not cite it (${citation})`,
      moduleFile,
      fns,
      (root) => {
        seed(root, {
          omitFiles: [citation],
          omitCitations: [citation],
        });
      },
      new RegExp(`skills/${skill}/${escaped} is a required ${skill} reference and is missing`),
    );

    expectCheckFailure(
      `fails when a required ${skill} reference exists but SKILL.md does not cite it (${citation})`,
      moduleFile,
      fns,
      (root) => {
        seed(root, {
          omitCitations: [citation],
        });
      },
      new RegExp(`skills/${skill}/SKILL\\.md does not cite ${escaped}, which is a required ${skill} reference`),
    );
  }
}
