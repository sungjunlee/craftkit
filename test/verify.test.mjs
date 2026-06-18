import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const verifyScript = path.join(repoRoot, "scripts/verify.mjs");

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
