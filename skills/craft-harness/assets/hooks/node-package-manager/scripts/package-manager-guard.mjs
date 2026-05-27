#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const packagePath = path.join(root, "package.json");
const lockfiles = new Map([
  ["package-lock.json", "npm"],
  ["npm-shrinkwrap.json", "npm"],
  ["pnpm-lock.yaml", "pnpm"],
  ["yarn.lock", "yarn"],
  ["bun.lock", "bun"],
  ["bun.lockb", "bun"]
]);

if (!fs.existsSync(packagePath)) {
  console.log("node-package-manager: no package.json found; soft skip");
  process.exit(0);
}

const findings = [];
let packageJson;

try {
  packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
} catch (error) {
  console.error(`node-package-manager: package.json is invalid JSON: ${error.message}`);
  process.exit(2);
}

const present = [...lockfiles.entries()]
  .filter(([fileName]) => fs.existsSync(path.join(root, fileName)))
  .map(([fileName, manager]) => ({ fileName, manager }));
const managers = [...new Set(present.map((item) => item.manager))];
const declared = typeof packageJson.packageManager === "string"
  ? packageJson.packageManager.split("@")[0]
  : null;

if (managers.length > 1) {
  findings.push(`multiple package manager lockfiles found: ${present.map((item) => item.fileName).join(", ")}`);
}

if (declared && managers.length > 0 && !managers.includes(declared)) {
  findings.push(`packageManager declares ${declared}, but lockfile(s) indicate ${managers.join(", ")}`);
}

if (findings.length > 0) {
  console.error("node-package-manager: actionable warnings");
  for (const finding of findings) {
    console.error(`- ${finding}`);
  }
  process.exit(2);
}

const summary = declared || (managers.length === 1 ? managers[0] : "no package manager pin");
console.log(`node-package-manager: passed (${summary})`);
