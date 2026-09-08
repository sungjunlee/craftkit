import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as facade from "../../../skills/spec-grill/scripts/extract-signals.js";
import * as core from "../../../skills/spec-grill/scripts/extract-signals-core.js";

const coreModule = fileURLToPath(
  new URL("../../../skills/spec-grill/scripts/extract-signals-core.js", import.meta.url),
);
const facadeModule = fileURLToPath(
  new URL("../../../skills/spec-grill/scripts/extract-signals.js", import.meta.url),
);

const OWNED_FUNCTIONS = [
  "buildSignalAuthority",
  "detectSourceRoot",
  "listCapabilityCandidates",
  "extractCommitScopes",
  "getRecentCommitMessages",
  "resolveCharterPath",
  "resolveCharterFile",
  "readCharterObjectives",
  "summarizeReadme",
  "extractSignals",
];

const OWNED_CONSTANTS = [
  "CANONICAL_CHARTER_PATH",
  "LEGACY_CHARTER_PATH",
];

const INTERNAL_HELPERS = [
  "addEvidence",
  "addMissingEvidence",
];

describe("extract-signals-core structure", () => {
  it("exists as its own module (deletion test)", () => {
    assert.equal(fs.existsSync(coreModule), true);
    assert.match(path.basename(coreModule), /extract-signals-core\.js$/);
  });

  it("owns extractSignals and helpers only it uses", () => {
    const coreSource = fs.readFileSync(coreModule, "utf8");
    const facadeSource = fs.readFileSync(facadeModule, "utf8");

    for (const name of [...OWNED_FUNCTIONS, ...INTERNAL_HELPERS]) {
      assert.match(coreSource, new RegExp(`function ${name}\\(`), `${name} should be defined in extract-signals-core.js`);
      assert.doesNotMatch(facadeSource, new RegExp(`function ${name}\\(`), `${name} should not be defined in extract-signals.js`);
    }

    for (const name of OWNED_CONSTANTS) {
      assert.match(coreSource, new RegExp(`const ${name} =`));
      assert.doesNotMatch(facadeSource, new RegExp(`const ${name} =`));
    }

    assert.doesNotMatch(facadeSource, /function parseArgs\(/);
    assert.doesNotMatch(coreSource, /function parseArgs\(/);
  });

  it("re-exports the same extractSignals identity from extract-signals.js", () => {
    for (const name of [...OWNED_FUNCTIONS, ...OWNED_CONSTANTS]) {
      assert.equal(facade[name], core[name], `${name} re-export should be the same binding`);
    }

    assert.equal(typeof facade.parseArgs, "function");
    assert.equal(core.parseArgs, undefined);
  });
});
