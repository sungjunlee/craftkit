import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { radarStaleness } from "../scripts/verify.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const verifyScript = path.join(repoRoot, "scripts/verify.mjs");
const radarCurrentPath = "skills/craft-skill-spec/references/radar/current.md";

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
  writeFile(root, "docs/examples/tune-a-prompt.md", "Use an eval runner.\n");
  writeFile(root, "scripts/verify.mjs", fs.readFileSync(verifyScript, "utf8"));
  writeFile(
    root,
    "skills/example/SKILL.md",
    "---\nname: example\ndescription: Example skill for tests.\n---\n\n# Example\n",
  );
  writeFile(root, "skills/craft-critique/references/failure-modes.md", "# Failure Modes\n\nShared fixture.\n");
  writeFile(root, "skills/craft-tune/references/failure-modes.md", "# Failure Modes\n\nShared fixture.\n");
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

function runVerify(root, options = {}) {
  const env = { ...process.env };
  if (options.skipPackDryRun) {
    env.CRAFTKIT_VERIFY_TEST_SKIP_PACK_DRY_RUN = "1";
  }

  return spawnSync(process.execPath, [verifyScript], {
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

expectVerifyFailure("fails when mirrored references drift", (root) => {
  writeFile(root, "skills/craft-critique/references/failure-modes.md", "# Failure Modes\n\nSame.\n");
  writeFile(root, "skills/craft-tune/references/failure-modes.md", "# Failure Modes\n\nDifferent.\n");
}, /mirrored references and must stay identical/);

expectVerifyFailure("fails when a mirrored reference is missing", (root) => {
  removeFile(root, "skills/craft-tune/references/failure-modes.md");
}, /skills\/craft-tune\/references\/failure-modes\.md is missing from a mirrored reference pair/);

expectVerifyFailure("fails on legacy autoresearch harness wording", (root) => {
  writeFile(root, "docs/examples/tune-a-prompt.md", "This still says run harness.\n");
}, /docs\/examples\/tune-a-prompt\.md still contains "run harness"/);

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
