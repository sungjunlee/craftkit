/**
 * Directory listing helper for extract-signals collectors.
 *
 * listDirs lives here so extract-signals-collectors.js can re-export it
 * without owning the filesystem helper.
 */

import fs from "node:fs";
import path from "node:path";

function listDirs(root, { readdir = fs.readdirSync, statSync = fs.statSync, fileExists = fs.existsSync } = {}) {
  if (!fileExists(root)) return [];
  return readdir(root)
    .filter((entry) => {
      if (entry.startsWith(".") || entry.startsWith("_")) return false;
      try {
        return statSync(path.join(root, entry)).isDirectory();
      } catch {
        return false;
      }
    })
    .sort();
}

export { listDirs };
