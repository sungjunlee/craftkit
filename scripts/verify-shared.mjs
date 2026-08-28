/**
 * Tiny helpers shared between verify.mjs and the verify-* check modules.
 * Kept in this module so check families do not import each other
 * (no import cycles).
 */

import fs from "node:fs";
import path from "node:path";

export const root = process.cwd();
export const failures = [];
export const warnings = [];

export function fail(message) {
  failures.push(message);
}

export function warn(message) {
  warnings.push(message);
}

export function listFiles(dir, predicate) {
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

export function relative(filePath) {
  return path.relative(root, filePath);
}

export function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

export function parseFrontmatter(text) {
  if (!text.startsWith("---\n")) {
    return null;
  }

  const endIndex = text.indexOf("\n---\n", 4);
  if (endIndex === -1) {
    return null;
  }

  return text.slice(4, endIndex);
}
