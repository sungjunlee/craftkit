#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const args = new Set(process.argv.slice(2));
const findings = [];
const inspected = [];

function exists(filePath) {
  return fs.existsSync(path.join(root, filePath));
}

function readText(filePath) {
  return fs.readFileSync(path.join(root, filePath), "utf8");
}

function listSkillFiles(baseDir) {
  const absoluteBase = path.join(root, baseDir);
  if (!fs.existsSync(absoluteBase)) return [];

  return fs.readdirSync(absoluteBase, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() || entry.isSymbolicLink())
    .map((entry) => path.join(baseDir, entry.name, "SKILL.md"))
    .filter(exists);
}

function validateSkill(filePath) {
  inspected.push(filePath);
  const text = readText(filePath);
  if (!text.startsWith("---\n")) {
    findings.push(`${filePath}: missing YAML frontmatter`);
    return;
  }

  const end = text.indexOf("\n---", 4);
  if (end === -1) {
    findings.push(`${filePath}: frontmatter is not closed`);
    return;
  }

  const frontmatter = text.slice(4, end);
  if (!/^name:\s*\S+/m.test(frontmatter)) {
    findings.push(`${filePath}: frontmatter missing name`);
  }
  if (!/^description:\s*\S+/m.test(frontmatter)) {
    findings.push(`${filePath}: frontmatter missing description`);
  }
}

function validateJson(filePath) {
  if (!exists(filePath)) return;
  inspected.push(filePath);
  try {
    JSON.parse(readText(filePath));
  } catch (error) {
    findings.push(`${filePath}: invalid JSON: ${error.message}`);
  }
}

for (const filePath of [
  ...listSkillFiles("skills"),
  ...listSkillFiles(".agents/skills"),
  ...listSkillFiles(".claude/skills")
]) {
  validateSkill(filePath);
}

for (const filePath of [
  ".codex/hooks.json",
  ".claude/settings.json",
  ".claude-plugin/marketplace.json"
]) {
  validateJson(filePath);
}

if (inspected.length === 0) {
  console.log("harness-integrity: no known harness files found; soft skip");
  process.exit(0);
}

if (findings.length > 0) {
  console.error("harness-integrity: actionable warnings");
  for (const finding of findings) {
    console.error(`- ${finding}`);
  }
  process.exit(2);
}

const mode = args.has("--dry-run") ? "dry-run" : "hook";
console.log(`harness-integrity: ${mode} passed (${inspected.length} files inspected)`);
