#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const failures = [];
const skipPackDryRunForTests = process.env.CRAFTKIT_VERIFY_TEST_SKIP_PACK_DRY_RUN === "1";

function fail(message) {
  failures.push(message);
}

function listFiles(dir, predicate) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === ".git" || entry.name === "node_modules") {
        continue;
      }

      files.push(...listFiles(fullPath, predicate));
      continue;
    }

    if (entry.isFile() && predicate(fullPath)) {
      files.push(fullPath);
    }
  }

  return files;
}

function relative(filePath) {
  return path.relative(root, filePath);
}

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function checkJsonFiles() {
  for (const filePath of listFiles(root, (item) => item.endsWith(".json"))) {
    try {
      JSON.parse(readText(filePath));
    } catch (error) {
      fail(`${relative(filePath)} is invalid JSON: ${error.message}`);
    }
  }
}

function checkPackageBoundary() {
  const packageJson = JSON.parse(readText(path.join(root, "package.json")));

  if (!Array.isArray(packageJson.files) || packageJson.files.length === 0) {
    fail("package.json must declare a files allowlist for npm packaging");
  }

  if (packageJson.scripts?.verify !== "node scripts/verify.mjs") {
    fail("package.json scripts.verify must run node scripts/verify.mjs");
  }

  if (packageJson.scripts?.test !== "node --test") {
    fail("package.json scripts.test must run node --test");
  }
}

function parseFrontmatter(text) {
  if (!text.startsWith("---\n")) {
    return null;
  }

  const endIndex = text.indexOf("\n---\n", 4);
  if (endIndex === -1) {
    return null;
  }

  return text.slice(4, endIndex);
}

function checkSkillFiles() {
  const skillFiles = listFiles(path.join(root, "skills"), (item) => path.basename(item) === "SKILL.md");

  for (const filePath of skillFiles) {
    const text = readText(filePath);
    const frontmatter = parseFrontmatter(text);
    const lineCount = text.split("\n").length;

    if (!frontmatter) {
      fail(`${relative(filePath)} must start with YAML frontmatter`);
      continue;
    }

    if (!/^name:\s*\S+/m.test(frontmatter)) {
      fail(`${relative(filePath)} frontmatter must include name`);
    }

    if (!/^description:\s*\S+/m.test(frontmatter)) {
      fail(`${relative(filePath)} frontmatter must include description`);
    }

    if (lineCount > 500) {
      fail(`${relative(filePath)} has ${lineCount} lines, over the 500-line hard ceiling`);
    }
  }
}

function checkTerminology() {
  const checks = [
    {
      file: "docs/examples/tune-a-prompt.md",
      forbidden: ["run harness", "evals and a harness"],
    },
  ];

  for (const check of checks) {
    const text = readText(path.join(root, check.file));

    for (const phrase of check.forbidden) {
      if (text.includes(phrase)) {
        fail(`${check.file} still contains "${phrase}"`);
      }
    }
  }
}

function checkDocumentationPaths() {
  const text = readText(path.join(root, "README.md"));
  const statusPath = path.join(root, "docs/status.md");

  for (const phrase of ["## 30-second path", "docs/status.md", "npm run verify"]) {
    if (!text.includes(phrase)) {
      fail(`README.md must include ${phrase}`);
    }
  }

  if (text.includes("~/.craftkit/autoresearch/")) {
    fail("README.md must keep maintainer-local autoresearch paths in docs/status.md");
  }

  if (!fs.existsSync(statusPath)) {
    fail("docs/status.md must exist as the public quality evidence index");
    return;
  }

  const statusText = readText(statusPath);
  for (const phrase of ["Public evidence", "Maintainer-local evidence", "npm run verify"]) {
    if (!statusText.includes(phrase)) {
      fail(`docs/status.md must include ${phrase}`);
    }
  }
}

function checkPackDryRun() {
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

checkJsonFiles();
checkPackageBoundary();
checkSkillFiles();
checkTerminology();
checkDocumentationPaths();
checkPackDryRun();

if (failures.length > 0) {
  console.error("verify failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("verify passed");
