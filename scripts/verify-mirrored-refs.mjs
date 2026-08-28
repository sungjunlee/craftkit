/**
 * Byte-identical mirrored reference pairs. Empty since craft-tune's removal.
 * Called from scripts/verify.mjs.
 */

import fs from "node:fs";
import path from "node:path";
import { root, fail, readText } from "./verify-shared.mjs";

export function checkMirroredReferences() {
  // Empty since craft-tune's removal (2026-07) left craft-critique's
  // failure-modes.md and craft-prompt's shared-principles.md as single
  // canonical copies. Add a pair only when two files must genuinely stay
  // byte-identical — the repo default is one source per thing.
  const mirroredPairs = [];

  for (const [first, second] of mirroredPairs) {
    const firstPath = path.join(root, first);
    const secondPath = path.join(root, second);

    if (!fs.existsSync(firstPath)) {
      fail(`${first} is missing from a mirrored reference pair`);
      continue;
    }

    if (!fs.existsSync(secondPath)) {
      fail(`${second} is missing from a mirrored reference pair`);
      continue;
    }

    if (readText(firstPath) !== readText(secondPath)) {
      fail(`${first} and ${second} are mirrored references and must stay identical`);
    }
  }
}
