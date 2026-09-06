import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  matchesFilePattern,
  terminologyFindings,
  terminologyRules,
} from "../scripts/verify-terminology.mjs";
import {
  createFixture,
  expectCheckFailure,
  repoRoot,
  runCheck,
  writeFile,
} from "../test-support/verify-fixture.mjs";

const moduleFile = "verify-terminology.mjs";
const fn = "checkTerminology";

function copyRealSkillDir(root, skillName) {
  const src = path.join(repoRoot, "skills", skillName);
  const dest = path.join(root, "skills", skillName);
  fs.rmSync(dest, { recursive: true, force: true });
  fs.cpSync(src, dest, { recursive: true });
}

expectCheckFailure("fails when craft-autoresearch docs use bare 'harness' instead of 'eval runner'", moduleFile, fn, (root) => {
  writeFile(
    root,
    "skills/craft-autoresearch/SKILL.md",
    "---\nname: craft-autoresearch\ndescription: Example.\n---\n\n# craft-autoresearch\n\nSet up the harness and replay inputs.\n",
  );
}, /skills\/craft-autoresearch\/SKILL\.md still contains "harness"/);

test("passes when craft-autoresearch docs use 'eval runner' and only mention craft-harness by name", () => {
  const root = createFixture();
  writeFile(
    root,
    "skills/craft-autoresearch/SKILL.md",
    `---
name: craft-autoresearch
description: Example craft-autoresearch skill for terminology tests.
---

# craft-autoresearch

## Purpose

Runs measured iterations against an eval runner.

## Use this when

- always

## Inputs

- none

## Steps

1. Use an eval runner to replay inputs, per \`references/eval-guide.md\`. For
   repo agent guidance instead, see craft-harness.

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

- \`references/eval-guide.md\`
- \`references/mutation-guide.md\`
- \`references/worked-example.md\`
`,
  );
  writeFile(
    root,
    "skills/craft-autoresearch/references/eval-guide.md",
    "# Eval guide\n\nAn eval runner replays test inputs and scores outputs.\n",
  );
  writeFile(
    root,
    "skills/craft-autoresearch/references/mutation-guide.md",
    "# Mutation guide\n\nAn eval runner mutation note.\n",
  );
  writeFile(
    root,
    "skills/craft-autoresearch/references/worked-example.md",
    "# Worked example\n\nAn eval runner cycle.\n",
  );

  const result = runCheck(root, moduleFile, fn);

  assert.equal(result.status, 0, result.stderr || result.stdout);
});

test("passes when the real spec-grill spine (unmodified) is dropped into the fixture", () => {
  const root = createFixture();
  copyRealSkillDir(root, "spec-grill");

  const result = runCheck(root, moduleFile, fn);

  assert.equal(result.status, 0, result.stderr || result.stdout);
});

expectCheckFailure("fails when a spec-* spine reintroduces the old relay-learning admission-test phrasing", moduleFile, fn, (root) => {
  copyRealSkillDir(root, "spec-grill");
  const skillMdPath = path.join(root, "skills/spec-grill/SKILL.md");
  const content = fs.readFileSync(skillMdPath, "utf8");
  const updated = content.replace(
    "- Its Goal can be stated as an observable user or operator outcome.",
    "- It owns a primary relay-learning destination.\n- Its Goal can be stated as an observable user or operator outcome.",
  );
  fs.writeFileSync(skillMdPath, updated);
}, /skills\/spec-grill\/SKILL\.md still contains "relay-learning"/);

test("terminologyRules ships the two seeded rules with files/forbidden/why", () => {
  // Was three until the docs/examples/tune-a-prompt.md rule left with
  // craft-tune's removal (2026-07); the doc it guarded is deleted.
  assert.equal(terminologyRules.length, 2);
  for (const rule of terminologyRules) {
    assert.ok(Array.isArray(rule.files) && rule.files.length > 0);
    assert.ok(Array.isArray(rule.forbidden) && rule.forbidden.length > 0);
    assert.equal(typeof rule.why, "string");
  }
});

test("matchesFilePattern treats a pattern without '*' as an exact literal path", () => {
  assert.equal(matchesFilePattern("docs/examples/sample.md", "docs/examples/sample.md"), true);
  assert.equal(matchesFilePattern("docs/examples/sample.md", "docs/examples/other.md"), false);
});

test("matchesFilePattern's '**/*.md' matches nested files but not sibling skills", () => {
  const pattern = "skills/craft-autoresearch/**/*.md";

  assert.equal(matchesFilePattern(pattern, "skills/craft-autoresearch/SKILL.md"), true);
  assert.equal(matchesFilePattern(pattern, "skills/craft-autoresearch/references/eval-guide.md"), true);
  assert.equal(matchesFilePattern(pattern, "skills/craft-harness/SKILL.md"), false);
  assert.equal(matchesFilePattern(pattern, "skills/craft-autoresearch/references/nested/deep.md"), true);
  assert.equal(matchesFilePattern(pattern, "skills/craft-autoresearch/README.txt"), false);
});

test("terminologyFindings reports the matched literal phrase for a string rule (violation found)", () => {
  assert.deepEqual(
    terminologyFindings("This still says run harness.\n", ["run harness", "evals and a harness"]),
    ["run harness"],
  );
});

test("terminologyFindings returns no findings for a clean file", () => {
  assert.deepEqual(
    terminologyFindings("Uses an eval runner instead.\n", ["run harness", "evals and a harness"]),
    [],
  );
});

test("terminologyFindings' harness-vs-eval-runner regex catches bare 'harness' but permits 'craft-harness' (scoping respected)", () => {
  const forbidden = [/(?<!craft-)\bharness\b/i];

  assert.deepEqual(terminologyFindings("Set up the harness first.", forbidden), ["harness"]);
  assert.deepEqual(terminologyFindings("See craft-harness for repo guidance.", forbidden), []);
  assert.deepEqual(terminologyFindings("Use an eval runner, not a Harness.", forbidden), ["Harness"]);
});
