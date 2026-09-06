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

test("terminologyRules ships the seeded spec-* rule with files/forbidden/why", () => {
  // Down to one: the eval-runner-vs-harness rule left with the skill whose
  // docs it scoped over.
  assert.equal(terminologyRules.length, 1);
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
  const pattern = "skills/craft-alpha/**/*.md";

  assert.equal(matchesFilePattern(pattern, "skills/craft-alpha/SKILL.md"), true);
  assert.equal(matchesFilePattern(pattern, "skills/craft-alpha/references/alpha-notes.md"), true);
  assert.equal(matchesFilePattern(pattern, "skills/craft-beta/SKILL.md"), false);
  assert.equal(matchesFilePattern(pattern, "skills/craft-alpha/references/nested/deep.md"), true);
  assert.equal(matchesFilePattern(pattern, "skills/craft-alpha/README.txt"), false);
});

test("terminologyFindings reports the matched literal phrase for a string rule (violation found)", () => {
  assert.deepEqual(
    terminologyFindings("This still says relay run.\n", ["relay run", "relay-learning"]),
    ["relay run"],
  );
});

test("terminologyFindings returns no findings for a clean file", () => {
  assert.deepEqual(
    terminologyFindings("Uses consumer-neutral phrasing instead.\n", ["relay run", "relay-learning"]),
    [],
  );
});

test("terminologyFindings' regex rules match case-insensitively and honour a negative lookbehind", () => {
  const forbidden = [/(?<!dev-)\brelay\b/i];

  assert.deepEqual(terminologyFindings("Set up the relay first.", forbidden), ["relay"]);
  assert.deepEqual(terminologyFindings("See dev-relay for repo guidance.", forbidden), []);
  assert.deepEqual(terminologyFindings("Name the consumer, not a Relay.", forbidden), ["Relay"]);
});
