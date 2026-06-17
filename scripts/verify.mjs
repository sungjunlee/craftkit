#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const failures = [];

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

function checkReadmePath() {
  const text = readText(path.join(root, "README.md"));

  for (const phrase of ["## 30-second path", "npm run verify"]) {
    if (!text.includes(phrase)) {
      fail(`README.md must include ${phrase}`);
    }
  }
}

function checkPackDryRun() {
  const result = spawnSync("npm", ["pack", "--dry-run", "--json"], {
    cwd: root,
    encoding: "utf8",
  });

  if (result.status !== 0) {
    fail(`npm pack --dry-run failed: ${result.stderr || result.stdout}`);
  }
}

checkJsonFiles();
checkPackageBoundary();
checkSkillFiles();
checkTerminology();
checkReadmePath();
checkPackDryRun();

if (failures.length > 0) {
  console.error("verify failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("verify passed");
