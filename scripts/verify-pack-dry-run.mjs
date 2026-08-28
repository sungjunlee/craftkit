/**
 * npm pack --dry-run: required files present, forbidden artifacts absent.
 * Called from scripts/verify.mjs.
 */

import path from "node:path";
import { spawnSync } from "node:child_process";
import { root, fail, listFiles, relative } from "./verify-shared.mjs";

const skipPackDryRunForTests = process.env.CRAFTKIT_VERIFY_TEST_SKIP_PACK_DRY_RUN === "1";

export function checkPackDryRun() {
  if (skipPackDryRunForTests) {
    return;
  }

  const result = spawnSync("npm", ["pack", "--dry-run", "--json"], {
    cwd: root,
    encoding: "utf8",
  });

  if (result.status !== 0) {
    fail(`npm pack --dry-run failed: ${result.stderr || result.stdout}`);
    return;
  }

  let packEntries;
  try {
    packEntries = JSON.parse(result.stdout);
  } catch (error) {
    fail(`npm pack --dry-run did not return JSON: ${error.message}`);
    return;
  }

  const packageFiles = new Set(packEntries.flatMap((entry) => entry.files?.map((file) => file.path) ?? []));
  const requiredFiles = [
    ".claude-plugin/marketplace.json",
    "AGENTS.md",
    "CHANGELOG.md",
    "README.md",
    "docs/status.md",
    "package.json",
    "scripts/verify.mjs",
    ...listFiles(path.join(root, "skills"), (item) => path.basename(item) === "SKILL.md").map(relative),
  ];

  for (const requiredFile of requiredFiles) {
    if (!packageFiles.has(requiredFile)) {
      fail(`npm package is missing ${requiredFile}`);
    }
  }

  const forbiddenPatterns = [
    /^\.git\//,
    /^node_modules\//,
    /^test\//,
    /^tests\//,
    /^\.craftkit\//,
    /^\.relay\//,
    /^skills\/.*\/scripts\/.*\.(test|spec)\.(js|mjs|cjs|ts|mts|cts|jsx|tsx)$/,
  ];

  for (const packageFile of packageFiles) {
    if (forbiddenPatterns.some((pattern) => pattern.test(packageFile))) {
      fail(`npm package must not include ${packageFile}`);
    }
  }
}
