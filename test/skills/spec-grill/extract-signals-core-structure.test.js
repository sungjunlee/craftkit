import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as facade from "../../../skills/spec-grill/scripts/extract-signals.js";
import * as core from "../../../skills/spec-grill/scripts/extract-signals-core.js";
import * as charter from "../../../skills/spec-grill/scripts/extract-signals-charter.js";

const coreModule = fileURLToPath(
  new URL("../../../skills/spec-grill/scripts/extract-signals-core.js", import.meta.url),
);
const facadeModule = fileURLToPath(
  new URL("../../../skills/spec-grill/scripts/extract-signals.js", import.meta.url),
);

const OWNED_FUNCTIONS = [
  "buildSignalAuthority",
  "summarizeReadme",
  "extractSignals",
];

const REEXPORTED_FUNCTIONS = [
  "detectSourceRoot",
  "listCapabilityCandidates",
  "extractCommitScopes",
  "getRecentCommitMessages",
  "resolveCharterPath",
  "resolveCharterFile",
  "readCharterObjectives",
];

const REEXPORTED_CONSTANTS = [
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

    for (const name of REEXPORTED_FUNCTIONS) {
      assert.doesNotMatch(coreSource, new RegExp(`function ${name}\\(`), `${name} should not be defined in extract-signals-core.js`);
    }

    for (const name of REEXPORTED_CONSTANTS) {
      assert.doesNotMatch(coreSource, new RegExp(`const ${name} =`));
    }

    assert.doesNotMatch(facadeSource, /function parseArgs\(/);
    assert.doesNotMatch(coreSource, /function parseArgs\(/);
  });

  it("re-exports the same extractSignals identity from extract-signals.js", () => {
    for (const name of [...OWNED_FUNCTIONS, ...REEXPORTED_FUNCTIONS, ...REEXPORTED_CONSTANTS]) {
      assert.equal(facade[name], core[name], `${name} re-export should be the same binding`);
    }

    for (const name of [...REEXPORTED_FUNCTIONS, ...REEXPORTED_CONSTANTS]) {
      assert.equal(core[name], charter[name], `${name} core re-export should be the charter binding`);
    }

    assert.equal(typeof facade.parseArgs, "function");
    assert.equal(core.parseArgs, undefined);
  });
});
