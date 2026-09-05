/**
 * Tiny helpers shared across extract-signals modules.
 * Kept in a third module so siblings need not import each other
 * (no import cycles).
 */

import fs from "node:fs";

export function slugifyCandidate(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/`/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function readOptionalFile(filePath, { readFile = fs.readFileSync, fileExists = fs.existsSync } = {}) {
  if (!fileExists(filePath)) return null;
  try {
    return readFile(filePath, "utf-8");
  } catch {
    return null;
  }
}
