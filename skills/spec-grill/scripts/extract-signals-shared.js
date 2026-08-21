/**
 * Tiny helpers shared between extract-signals.js and
 * extract-signals-collectors.js. Kept in a third module so neither
 * side needs to import the other (no import cycles).
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
