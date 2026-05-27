#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const dryRun = process.argv.includes("--dry-run");

function commandExists(command) {
  const result = spawnSync(command, ["--version"], { stdio: "ignore" });
  return !result.error && result.status === 0;
}

function walk(dir, result = []) {
  if (!fs.existsSync(dir)) return result;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if ([".git", "node_modules", ".venv", "venv", "dist", "build"].includes(entry.name)) continue;
    const next = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(next, result);
    } else if (entry.isFile() && next.endsWith(".py")) {
      result.push(path.relative(root, next));
    }
  }
  return result;
}

function changedPythonFiles() {
  const diff = spawnSync("git", ["diff", "--name-only", "--diff-filter=ACMR", "HEAD"], {
    cwd: root,
    encoding: "utf8"
  });
  if (diff.status !== 0) return [];
  return diff.stdout.split(/\r?\n/).filter((filePath) => filePath.endsWith(".py"));
}

function collectStrings(value, result = []) {
  if (typeof value === "string") {
    result.push(value);
  } else if (Array.isArray(value)) {
    for (const item of value) collectStrings(item, result);
  } else if (value && typeof value === "object") {
    for (const item of Object.values(value)) collectStrings(item, result);
  }
  return result;
}

async function stdinJsonFiles() {
  if (dryRun) return [];
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  if (chunks.length === 0) return [];

  try {
    const payload = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    return collectStrings(payload).filter((filePath) => filePath.endsWith(".py"));
  } catch {
    return [];
  }
}

if (!commandExists("ruff")) {
  console.log("python-ruff: ruff executable not found; soft skip");
  process.exit(0);
}

const inputFiles = await stdinJsonFiles();
const candidateFiles = dryRun ? walk(root) : [...inputFiles, ...changedPythonFiles()];
const files = [...new Set(candidateFiles)]
  .filter((filePath) => fs.existsSync(path.join(root, filePath)));

if (files.length === 0) {
  console.log("python-ruff: no Python files found; soft skip");
  process.exit(0);
}

const run = spawnSync("ruff", ["check", "--", ...files], {
  cwd: root,
  encoding: "utf8"
});

if (run.stdout) process.stdout.write(run.stdout);
if (run.stderr) process.stderr.write(run.stderr);

if (run.status === 0) {
  console.log(`python-ruff: checked ${files.length} Python file(s)`);
  process.exit(0);
}

process.exit(2);
