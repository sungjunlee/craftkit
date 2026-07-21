import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  radarStaleness,
  sectionContractFindings,
  matchesFilePattern,
  terminologyFindings,
  terminologyRules,
} from "../scripts/verify.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const verifyScript = path.join(repoRoot, "scripts/verify.mjs");
const radarCurrentPath = "skills/craft-skill-spec/references/radar/current.md";
const craftPromptGuidesPath = "skills/craft-prompt/guides";

function isoDateDaysAgo(days) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}

function writeFile(root, filePath, content) {
  const fullPath = path.join(root, filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
}

function removeFile(root, filePath) {
  fs.rmSync(path.join(root, filePath), { force: true });
}

function updatePackageJson(root, update) {
  const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
  update(packageJson);
  writeFile(root, "package.json", `${JSON.stringify(packageJson, null, 2)}\n`);
}

function createFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "craftkit-verify-"));

  writeFile(root, ".claude-plugin/marketplace.json", "{}\n");
  writeFile(root, "AGENTS.md", "# Agents\n");
  writeFile(root, "CHANGELOG.md", "# Changelog\n");
  writeFile(root, "README.md", "# Fixture\n\n## 30-second path\n\nSee docs/status.md and run npm run verify.\n");
  writeFile(root, "docs/status.md", "# Status\n\n## Public evidence\n\nMaintainer-local evidence\n\nRun npm run verify.\n");
  writeFile(root, "scripts/verify.mjs", fs.readFileSync(verifyScript, "utf8"));
  writeFile(
    root,
    "skills/example/SKILL.md",
    "---\nname: example\ndescription: Example skill for tests.\n---\n\n# Example\n",
  );
  writeFile(root, "skills/craft-critique/references/failure-modes.md", "# Failure Modes\n\nCanonical copy.\n");
  writeFile(root, "skills/craft-prompt/references/shared-principles.md", "# Shared principles\n\nCanonical copy.\n");
  writeFile(
    root,
    radarCurrentPath,
    `# Skill Radar: Current Canonical View\n\n- last reviewed: \`${isoDateDaysAgo(0)}\`\n`,
  );
  writeFile(
    root,
    "package.json",
    `${JSON.stringify(
      {
        name: "craftkit-verify-fixture",
        version: "0.0.0",
        type: "module",
        scripts: {
          test: "node --test",
          verify: "node scripts/verify.mjs",
        },
        files: [".claude-plugin/", "AGENTS.md", "CHANGELOG.md", "docs/", "scripts/", "skills/"],
      },
      null,
      2,
    )}\n`,
  );

  return root;
}

function withInjectedBaseline(root, baseline) {
  // The checked-in knownSectionDeviations baseline is empty (#126/#133 cleared
  // the last entries), so mechanism tests for the warn-vs-fail/stale-entry
  // branches inject a synthetic baseline into the fixture's copy of
  // scripts/verify.mjs rather than relying on real (now nonexistent) entries.
  const verifyPath = path.join(root, "scripts/verify.mjs");
  const content = fs.readFileSync(verifyPath, "utf8");
  const updated = content.replace(
    "const knownSectionDeviations = {};",
    `const knownSectionDeviations = ${JSON.stringify(baseline)};`,
  );

  if (updated === content) {
    throw new Error("expected to find `const knownSectionDeviations = {};` in the fixture's scripts/verify.mjs");
  }

  fs.writeFileSync(verifyPath, updated);
}

function runVerify(root, options = {}) {
  const env = { ...process.env };
  if (options.skipPackDryRun) {
    env.CRAFTKIT_VERIFY_TEST_SKIP_PACK_DRY_RUN = "1";
  }

  // Spawn the fixture's own copy of the script (written by createFixture),
  // not the outer repo's scripts/verify.mjs, so tests that mutate the copy
  // (e.g. withInjectedBaseline) actually take effect. Resolve the script path
  // through fs.realpathSync: on macOS, os.tmpdir() returns a /var path that is
  // itself a symlink to /private/var, so the raw path and the resolved
  // import.meta.url the script sees at runtime wouldn't match, and the
  // `if (import.meta.url === pathToFileURL(process.argv[1]).href) main();`
  // entry-point guard at the bottom of verify.mjs would silently skip main().
  const scriptPath = fs.realpathSync(path.join(root, "scripts/verify.mjs"));

  return spawnSync(process.execPath, [scriptPath], {
    cwd: root,
    encoding: "utf8",
    env,
  });
}

function expectVerifyFailure(name, mutate, expectedMessage, options = { skipPackDryRun: true }) {
  test(name, () => {
    const root = createFixture();
    mutate(root);

    const result = runVerify(root, options);

    assert.notEqual(result.status, 0);
    assert.match(`${result.stdout}\n${result.stderr}`, expectedMessage);
  });
}

test("passes against a minimal valid package fixture", () => {
  const root = createFixture();

  const result = runVerify(root);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /verify passed/);
});

expectVerifyFailure("fails on invalid checked-in JSON", (root) => {
  writeFile(root, "bad.json", "{ nope");
}, /bad\.json is invalid JSON/);

expectVerifyFailure("fails when package files allowlist is missing", (root) => {
  updatePackageJson(root, (packageJson) => {
    delete packageJson.files;
  });
}, /package\.json must declare a files allowlist/);

expectVerifyFailure("fails when scripts.verify points elsewhere", (root) => {
  updatePackageJson(root, (packageJson) => {
    packageJson.scripts.verify = "node scripts/other.mjs";
  });
}, /scripts\.verify must run node scripts\/verify\.mjs/);

expectVerifyFailure("fails when scripts.test is missing", (root) => {
  updatePackageJson(root, (packageJson) => {
    delete packageJson.scripts.test;
  });
}, /scripts\.test must run node --test/);

expectVerifyFailure("fails when skill frontmatter is missing", (root) => {
  writeFile(root, "skills/example/SKILL.md", "# Example\n");
}, /skills\/example\/SKILL\.md must start with YAML frontmatter/);

expectVerifyFailure("fails when skill frontmatter name is missing", (root) => {
  writeFile(root, "skills/example/SKILL.md", "---\ndescription: Example skill.\n---\n\n# Example\n");
}, /skills\/example\/SKILL\.md frontmatter must include name/);

expectVerifyFailure("fails when skill frontmatter description is missing", (root) => {
  writeFile(root, "skills/example/SKILL.md", "---\nname: example\n---\n\n# Example\n");
}, /skills\/example\/SKILL\.md frontmatter must include description/);

expectVerifyFailure("fails when a skill exceeds the 500-line ceiling", (root) => {
  const body = Array.from({ length: 501 }, (_, index) => `line ${index + 1}`).join("\n");
  writeFile(root, "skills/example/SKILL.md", `---\nname: example\ndescription: Example skill.\n---\n${body}\n`);
}, /over the 500-line hard ceiling/);

expectVerifyFailure("fails when a skill exceeds the 220-line soft budget", (root) => {
  const body = Array.from({ length: 221 }, (_, index) => `line ${index + 1}`).join("\n");
  writeFile(root, "skills/example/SKILL.md", `---\nname: example\ndescription: Example skill.\n---\n${body}\n`);
}, /over the 220-line soft budget/);

expectVerifyFailure("fails when a skill description exceeds the trigger budget", (root) => {
  const words = Array.from({ length: 51 }, (_, index) => `word${index + 1}`).join(" ");
  writeFile(root, "skills/example/SKILL.md", `---\nname: example\ndescription: ${words}\n---\n\n# Example\n`);
}, /over the 50-word trigger budget/);

test("passes when explicit-only skills include paired Codex policy", () => {
  const root = createFixture();
  writeFile(
    root,
    "skills/example/SKILL.md",
    "---\nname: example\ndescription: Example skill for tests.\ndisable-model-invocation: true\n---\n\n# Example\n",
  );
  writeFile(root, "skills/example/agents/openai.yaml", "policy:\n  allow_implicit_invocation: false\n");

  const result = runVerify(root);

  assert.equal(result.status, 0, result.stderr || result.stdout);
});

test("passes when explicit-only Codex policy has inline YAML comments", () => {
  const root = createFixture();
  writeFile(
    root,
    "skills/example/SKILL.md",
    "---\nname: example\ndescription: Example skill for tests.\ndisable-model-invocation: true\n---\n\n# Example\n",
  );
  writeFile(root, "skills/example/agents/openai.yaml", "policy: # Codex invocation policy\n  allow_implicit_invocation: false # explicit only\n");

  const result = runVerify(root);

  assert.equal(result.status, 0, result.stderr || result.stdout);
});

test("passes when openai.yaml contains interface metadata without invocation policy", () => {
  const root = createFixture();
  writeFile(root, "skills/example/agents/openai.yaml", "interface:\n  display_name: \"Example\"\n");

  const result = runVerify(root);

  assert.equal(result.status, 0, result.stderr || result.stdout);
});

expectVerifyFailure("fails when a Claude explicit-only skill lacks Codex policy", (root) => {
  writeFile(
    root,
    "skills/example/SKILL.md",
    "---\nname: example\ndescription: Example skill for tests.\ndisable-model-invocation: true\n---\n\n# Example\n",
  );
}, /missing skills\/example\/agents\/openai\.yaml/);

expectVerifyFailure("fails when Codex explicit-only policy lacks Claude field", (root) => {
  writeFile(root, "skills/example/agents/openai.yaml", "policy:\n  allow_implicit_invocation: false\n");
}, /sets policy\.allow_implicit_invocation: false but skills\/example\/SKILL\.md is missing disable-model-invocation: true/);

expectVerifyFailure("fails when Codex policy omits allow_implicit_invocation", (root) => {
  writeFile(
    root,
    "skills/example/SKILL.md",
    "---\nname: example\ndescription: Example skill for tests.\ndisable-model-invocation: true\n---\n\n# Example\n",
  );
  writeFile(root, "skills/example/agents/openai.yaml", "policy:\n  other: false\n");
}, /must include policy\.allow_implicit_invocation as true or false/);

// The mirrored-pair machinery is dormant: craft-tune's removal (2026-07) left
// failure-modes.md and shared-principles.md as single canonical copies, so
// `mirroredPairs` in verify.mjs is empty. When a real pair returns, re-add the
// drift and missing-file failure tests alongside the new entry.

// --- Check: terminology rules table (#114) ---

expectVerifyFailure("fails when craft-autoresearch docs use bare 'harness' instead of 'eval runner'", (root) => {
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
`,
  );
  writeFile(
    root,
    "skills/craft-autoresearch/references/eval-guide.md",
    "# Eval guide\n\nAn eval runner replays test inputs and scores outputs.\n",
  );

  const result = runVerify(root, { skipPackDryRun: true });

  assert.equal(result.status, 0, result.stderr || result.stdout);
});

// --- Check: spec-* spine relay/sprint vocabulary guard (#135, PRD-RH E2.2) ---

function copyRealSkillDir(root, skillName) {
  const src = path.join(repoRoot, "skills", skillName);
  const dest = path.join(root, "skills", skillName);
  fs.rmSync(dest, { recursive: true, force: true });
  fs.cpSync(src, dest, { recursive: true });
}

test("passes when the real spec-grill spine (unmodified) is dropped into the fixture", () => {
  const root = createFixture();
  copyRealSkillDir(root, "spec-grill");

  const result = runVerify(root, { skipPackDryRun: true });

  assert.equal(result.status, 0, result.stderr || result.stdout);
});

expectVerifyFailure("fails when a spec-* spine reintroduces the old relay-learning admission-test phrasing", (root) => {
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

expectVerifyFailure("fails when README required path text is missing", (root) => {
  writeFile(root, "README.md", "# Fixture\n");
}, /README\.md must include ## 30-second path/);

expectVerifyFailure("fails when README leaks maintainer-local autoresearch paths", (root) => {
  writeFile(
    root,
    "README.md",
    "# Fixture\n\n## 30-second path\n\nSee docs/status.md and run npm run verify.\n\n`~/.craftkit/autoresearch/example/run`\n",
  );
}, /README\.md must keep maintainer-local autoresearch paths in docs\/status\.md/);

expectVerifyFailure("fails when docs status is missing required evidence text", (root) => {
  writeFile(root, "docs/status.md", "# Status\n");
}, /docs\/status\.md must include Public evidence/);

expectVerifyFailure("fails when npm package misses a required file", (root) => {
  removeFile(root, "AGENTS.md");
}, /npm package is missing AGENTS\.md/, { skipPackDryRun: false });

expectVerifyFailure("fails when npm package includes forbidden local test artifacts", (root) => {
  updatePackageJson(root, (packageJson) => {
    packageJson.files.push("test/");
  });
  writeFile(root, "test/generated-output.txt", "not for package\n");
}, /npm package must not include test\/generated-output\.txt/, { skipPackDryRun: false });

expectVerifyFailure("fails when npm package includes skill script tests", (root) => {
  writeFile(root, "skills/example/scripts/helper.test.js", "export {};\n");
}, /npm package must not include skills\/example\/scripts\/helper\.test\.js/, { skipPackDryRun: false });

expectVerifyFailure("fails when npm package includes skill script jsx/tsx specs", (root) => {
  writeFile(root, "skills/example/scripts/helper.spec.tsx", "export {};\n");
}, /npm package must not include skills\/example\/scripts\/helper\.spec\.tsx/, { skipPackDryRun: false });

test("passes without a radar staleness warning when current.md was reviewed recently", () => {
  const root = createFixture();

  const result = runVerify(root, { skipPackDryRun: true });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.doesNotMatch(`${result.stdout}\n${result.stderr}`, /warning:/);
});

test("warns but still passes when radar current.md is stale", () => {
  const root = createFixture();
  writeFile(
    root,
    radarCurrentPath,
    `# Skill Radar: Current Canonical View\n\n- last reviewed: \`${isoDateDaysAgo(100)}\`\n`,
  );

  const result = runVerify(root, { skipPackDryRun: true });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(`${result.stdout}\n${result.stderr}`, /past the 75-day staleness threshold/);
});

test("warns but still passes when radar current.md is missing a last reviewed line", () => {
  const root = createFixture();
  writeFile(root, radarCurrentPath, "# Skill Radar: Current Canonical View\n\nNo review metadata here.\n");

  const result = runVerify(root, { skipPackDryRun: true });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(`${result.stdout}\n${result.stderr}`, /missing a parseable "last reviewed" date/);
});

test("warns but still passes when radar current.md has an unparseable last reviewed date", () => {
  const root = createFixture();
  writeFile(root, radarCurrentPath, "# Skill Radar: Current Canonical View\n\n- last reviewed: `not-a-date`\n");

  const result = runVerify(root, { skipPackDryRun: true });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(`${result.stdout}\n${result.stderr}`, /unparseable "last reviewed" date: not-a-date/);
});

// --- Check: craft-prompt guide staleness (#119) ---

test("skips the craft-prompt guide staleness check when the guides directory is absent", () => {
  const root = createFixture();

  const result = runVerify(root, { skipPackDryRun: true });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.doesNotMatch(`${result.stdout}\n${result.stderr}`, /warning:/);
});

test("passes without a warning when a craft-prompt guide was reviewed recently", () => {
  const root = createFixture();
  writeFile(
    root,
    `${craftPromptGuidesPath}/example-guide.md`,
    `# Example Guide\n\n- last reviewed: \`${isoDateDaysAgo(0)}\`\n`,
  );

  const result = runVerify(root, { skipPackDryRun: true });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.doesNotMatch(`${result.stdout}\n${result.stderr}`, /warning:/);
});

test("warns but still passes when a craft-prompt guide is stale", () => {
  const root = createFixture();
  writeFile(
    root,
    `${craftPromptGuidesPath}/example-guide.md`,
    `# Example Guide\n\n- last reviewed: \`${isoDateDaysAgo(150)}\`\n`,
  );

  const result = runVerify(root, { skipPackDryRun: true });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(
    `${result.stdout}\n${result.stderr}`,
    /guides\/example-guide\.md:.*past the 120-day staleness threshold/,
  );
});

test("warns but still passes when a craft-prompt guide is missing a last reviewed line", () => {
  const root = createFixture();
  writeFile(root, `${craftPromptGuidesPath}/example-guide.md`, "# Example Guide\n\nNo review metadata here.\n");

  const result = runVerify(root, { skipPackDryRun: true });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(
    `${result.stdout}\n${result.stderr}`,
    /guides\/example-guide\.md:.*missing a parseable "last reviewed" date/,
  );
});

test("checks every craft-prompt guide file independently, not just the first", () => {
  const root = createFixture();
  writeFile(
    root,
    `${craftPromptGuidesPath}/fresh-guide.md`,
    `# Fresh Guide\n\n- last reviewed: \`${isoDateDaysAgo(0)}\`\n`,
  );
  writeFile(
    root,
    `${craftPromptGuidesPath}/stale-guide.md`,
    `# Stale Guide\n\n- last reviewed: \`${isoDateDaysAgo(150)}\`\n`,
  );

  const result = runVerify(root, { skipPackDryRun: true });
  const output = `${result.stdout}\n${result.stderr}`;

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(output, /stale-guide\.md:.*past the 120-day staleness threshold/);
  assert.doesNotMatch(output, /fresh-guide\.md:/);
});

// --- Check: reference-index completeness (#109) ---

test("passes when every top-level references/*.md file is cited", () => {
  const root = createFixture();
  writeFile(
    root,
    "skills/example-refs/SKILL.md",
    "---\nname: example-refs\ndescription: Example skill for reference-index tests.\n---\n\n# example-refs\n\nSee `references/one.md` and `references/two.md`.\n",
  );
  writeFile(root, "skills/example-refs/references/one.md", "# One\n");
  writeFile(root, "skills/example-refs/references/two.md", "# Two\n");

  const result = runVerify(root, { skipPackDryRun: true });

  assert.equal(result.status, 0, result.stderr || result.stdout);
});

expectVerifyFailure("fails on an uncited references/*.md file", (root) => {
  writeFile(
    root,
    "skills/example-refs/SKILL.md",
    "---\nname: example-refs\ndescription: Example skill for reference-index tests.\n---\n\n# example-refs\n\nSee `references/one.md`.\n",
  );
  writeFile(root, "skills/example-refs/references/one.md", "# One\n");
  writeFile(root, "skills/example-refs/references/two.md", "# Two\n");
}, /skills\/example-refs\/SKILL\.md does not cite references\/two\.md/);

expectVerifyFailure("fails on a dangling references/ citation", (root) => {
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

  const result = runVerify(root, { skipPackDryRun: true });

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

  const result = runVerify(root, { skipPackDryRun: true });

  assert.equal(result.status, 0, result.stderr || result.stdout);
});

// --- Check: family section contract (#110) ---

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

expectVerifyFailure("fails on a non-baselined missing required section", (root) => {
  writeFile(
    root,
    "skills/craft-newskill/SKILL.md",
    compliantCraftSkillBody("craft-newskill").replace("## Purpose\n\nDoes a thing.\n\n", ""),
  );
}, /skills\/craft-newskill\/SKILL\.md is missing the required "Purpose" section \(new drift/);

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

test("warns (and still passes) on a baselined missing required section", () => {
  const root = createFixture();
  // Note: craft-critique, craft-prompt, and craft-skill-spec are avoided here
  // because createFixture() already seeds a references/ dir under each of them
  // (canonical reference copies and the radar-staleness check), which
  // would also trip the reference-index check or the References requirement.
  // The checked-in knownSectionDeviations baseline is empty (#126/#133), so
  // inject a synthetic entry for craft-handoff and reproduce exactly those
  // two gaps to exercise the warn (not fail) branch.
  withInjectedBaseline(root, { "craft-handoff": ["Output format", "Guardrails"] });
  writeFile(
    root,
    "skills/craft-handoff/SKILL.md",
    compliantCraftSkillBody("craft-handoff")
      .replace("## Output format\n\nA single line.\n\n", "")
      .replace("## Guardrails\n\n- stay safe\n\n", ""),
  );

  const result = runVerify(root, { skipPackDryRun: true });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(
    `${result.stdout}\n${result.stderr}`,
    /skills\/craft-handoff\/SKILL\.md is missing the required "Output format" section \(baselined/,
  );
});

expectVerifyFailure("fails on a stale baseline entry whose section is now present", (root) => {
  // Inject a synthetic baseline entry (the checked-in baseline is empty as of
  // #126/#133) listing "Output format" and "Guardrails", then supply a fixture
  // that is fully compliant, satisfying both (and so making both entries stale).
  withInjectedBaseline(root, { "craft-handoff": ["Output format", "Guardrails"] });
  writeFile(root, "skills/craft-handoff/SKILL.md", compliantCraftSkillBody("craft-handoff"));
}, /knownSectionDeviations still lists "Output format".*but the section is now present/);

test("passes for a spec-* skill with the full Execution Contract + Verification prompts shape", () => {
  const root = createFixture();
  writeFile(root, "skills/spec-newmap/SKILL.md", compliantSpecSkillBody("spec-newmap"));

  const result = runVerify(root, { skipPackDryRun: true });

  assert.equal(result.status, 0, result.stderr || result.stdout);
});

expectVerifyFailure("fails on a spec-* skill missing the Execution Contract wrapper", (root) => {
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

// --- sectionContractFindings unit tests ---

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
  const body = compliantCraftSkillBody("craft-critique").replace(
    "## Failure modes\n\n- it might fail\n\n",
    "## Common mistakes\n\n- it might fail\n\n",
  );

  assert.deepEqual(sectionContractFindings("craft-critique", body, false), ["Failure modes"]);
});

test("sectionContractFindings accepts the loop-shaped Output format decomposition", () => {
  const body = compliantCraftSkillBody("craft-autoresearch")
    .replace("## Steps\n\n1. Do it.\n\n", "## How the loop runs\n\n1. Do it.\n\n")
    .replace(
      "## Output format\n\nA single line.\n\n",
      "## Experiment contract\n\nContract fields.\n\n## Final artifact\n\nAccepted version.\n\n",
    );

  assert.deepEqual(sectionContractFindings("craft-autoresearch", body, false), ["Steps/Workflow"]);
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

test("radarStaleness returns null for a fresh review date", () => {
  const now = new Date("2026-07-04T00:00:00Z");

  assert.equal(radarStaleness("- last reviewed: `2026-07-04`\n", now), null);
});

test("radarStaleness warns for a review date past the threshold", () => {
  const now = new Date("2026-07-04T00:00:00Z");

  assert.match(
    radarStaleness("- last reviewed: `2026-03-01`\n", now),
    /past the 75-day staleness threshold/,
  );
});

test("radarStaleness warns when the last reviewed line is missing", () => {
  const now = new Date("2026-07-04T00:00:00Z");

  assert.match(radarStaleness("no metadata here\n", now), /missing a parseable "last reviewed" date/);
});

test("radarStaleness warns when the last reviewed date is unparseable", () => {
  const now = new Date("2026-07-04T00:00:00Z");

  assert.match(
    radarStaleness("- last reviewed: `soon`\n", now),
    /unparseable "last reviewed" date: soon/,
  );
});

test("radarStaleness honors a custom max age", () => {
  const now = new Date("2026-07-04T00:00:00Z");
  const content = "- last reviewed: `2026-06-01`\n";

  assert.equal(radarStaleness(content, now, 90), null);
  assert.match(radarStaleness(content, now, 20), /past the 20-day staleness threshold/);
});
