/**
 * package.json packaging contract: files allowlist and verify/test scripts.
 * Called from scripts/verify.mjs.
 */

import path from "node:path";
import { root, fail, readText } from "./verify-shared.mjs";

export function checkPackageBoundary() {
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
