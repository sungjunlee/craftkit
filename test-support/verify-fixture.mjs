/**
 * Shared fixture helpers for check-module tests.
 * Lives outside test/ so `node --test` does not execute it as a test file.
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

export const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export function writeFile(root, filePath, content) {
  const fullPath = path.join(root, filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
}

export function removeFile(root, filePath) {
  fs.rmSync(path.join(root, filePath), { force: true });
}

export function updatePackageJson(root, update) {
  const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
  update(packageJson);
  writeFile(root, "package.json", `${JSON.stringify(packageJson, null, 2)}\n`);
}

export function createFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "craftkit-verify-"));

  writeFile(root, ".claude-plugin/marketplace.json", "{}\n");
  writeFile(root, "AGENTS.md", "# Agents\n");
  writeFile(root, "CHANGELOG.md", "# Changelog\n");
  writeFile(root, "README.md", "# Fixture\n\n## 30-second path\n\nSee docs/status.md and run npm run verify.\n");
  writeFile(root, "docs/status.md", "# Status\n\n## Public evidence\n\nMaintainer-local evidence\n\nRun npm run verify.\n");
  fs.cpSync(path.join(repoRoot, "scripts"), path.join(root, "scripts"), { recursive: true });
  writeFile(
    root,
    "skills/example/SKILL.md",
    "---\nname: example\ndescription: Example skill for tests.\n---\n\n# Example\n",
  );
  writeFile(root, "skills/craft-critique/references/failure-modes.md", "# Failure Modes\n\nCanonical copy.\n");
  writeFile(root, "skills/craft-prompt/references/shared-principles.md", "# Shared principles\n\nCanonical copy.\n");
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

export function withInjectedBaseline(root, baseline) {
  // The checked-in knownSectionDeviations baseline is empty (#126/#133 cleared
  // the last entries), so mechanism tests for the warn-vs-fail/stale-entry
  // branches inject a synthetic baseline into the fixture's copy of
  // scripts/verify-section-contract.mjs rather than relying on real (now
  // nonexistent) entries.
  const contractPath = path.join(root, "scripts/verify-section-contract.mjs");
  const content = fs.readFileSync(contractPath, "utf8");
  const updated = content.replace(
    "const knownSectionDeviations = {};",
    `const knownSectionDeviations = ${JSON.stringify(baseline)};`,
  );

  if (updated === content) {
    throw new Error("expected to find `const knownSectionDeviations = {};` in the fixture's scripts/verify-section-contract.mjs");
  }

  fs.writeFileSync(contractPath, updated);
}

export function runCheck(root, moduleFile, fnNames, options = { skipPackDryRun: true }) {
  const names = Array.isArray(fnNames) ? fnNames : [fnNames];
  const runner = `import { ${names.join(", ")} } from ${JSON.stringify(`./scripts/${moduleFile}`)};
import { failures, warnings } from "./scripts/verify-shared.mjs";

${names.map((name) => `${name}();`).join("\n")}

for (const warning of warnings) {
  console.warn(\`warning: \${warning}\`);
}

if (failures.length > 0) {
  console.error("verify failed:");
  for (const failure of failures) {
    console.error(\`- \${failure}\`);
  }
  process.exit(1);
}

console.log("verify passed");
`;

  writeFile(root, "run-check.mjs", runner);

  const env = { ...process.env };
  if (options.skipPackDryRun) {
    env.CRAFTKIT_VERIFY_TEST_SKIP_PACK_DRY_RUN = "1";
  }

  // Spawn the fixture's own copy of the scripts (written by createFixture),
  // not the outer repo, so tests that mutate the copy (e.g. withInjectedBaseline)
  // actually take effect. Resolve through fs.realpathSync: on macOS, os.tmpdir()
  // returns a /var path that is itself a symlink to /private/var.
  const scriptPath = fs.realpathSync(path.join(root, "run-check.mjs"));

  return spawnSync(process.execPath, [scriptPath], {
    cwd: root,
    encoding: "utf8",
    env,
  });
}

export function expectCheckFailure(name, moduleFile, fnNames, mutate, expectedMessage, options = { skipPackDryRun: true }) {
  test(name, () => {
    const root = createFixture();
    mutate(root);

    const result = runCheck(root, moduleFile, fnNames, options);

    assert.notEqual(result.status, 0);
    assert.match(`${result.stdout}\n${result.stderr}`, expectedMessage);
  });
}
