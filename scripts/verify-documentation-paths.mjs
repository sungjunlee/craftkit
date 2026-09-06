/**
 * Public path contract for README.md and docs/status.md.
 * Called from scripts/verify.mjs.
 */

import fs from "node:fs";
import path from "node:path";
import { root, fail, readText } from "./verify-shared.mjs";

export function checkDocumentationPaths() {
  const text = readText(path.join(root, "README.md"));
  const statusPath = path.join(root, "docs/status.md");

  for (const phrase of ["## 30-second path", "docs/status.md", "npm run verify"]) {
    if (!text.includes(phrase)) {
      fail(`README.md must include ${phrase}`);
    }
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
