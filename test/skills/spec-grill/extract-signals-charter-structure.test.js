import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as facade from "../../../skills/spec-grill/scripts/extract-signals.js";
import * as core from "../../../skills/spec-grill/scripts/extract-signals-core.js";
import * as charter from "../../../skills/spec-grill/scripts/extract-signals-charter.js";

const charterModule = fileURLToPath(
  new URL("../../../skills/spec-grill/scripts/extract-signals-charter.js", import.meta.url),
);
const coreModule = fileURLToPath(
  new URL("../../../skills/spec-grill/scripts/extract-signals-core.js", import.meta.url),
);
const facadeModule = fileURLToPath(
  new URL("../../../skills/spec-grill/scripts/extract-signals.js", import.meta.url),
);

const OWNED_FUNCTIONS = [
  "detectSourceRoot",
  "listCapabilityCandidates",
  "extractCommitScopes",
  "getRecentCommitMessages",
  "resolveCharterPath",
  "resolveCharterFile",
  "readCharterObjectives",
];

const OWNED_CONSTANTS = [
  "CANONICAL_CHARTER_PATH",
  "LEGACY_CHARTER_PATH",
];

describe("extract-signals-charter structure", () => {
  it("exists as its own module (deletion test)", () => {
    assert.equal(fs.existsSync(charterModule), true);
    assert.match(path.basename(charterModule), /extract-signals-charter\.js$/);
  });

  it("owns charter, source-root, and commit-scope helpers", () => {
    const charterSource = fs.readFileSync(charterModule, "utf8");
    const coreSource = fs.readFileSync(coreModule, "utf8");
    const facadeSource = fs.readFileSync(facadeModule, "utf8");

    for (const name of OWNED_FUNCTIONS) {
      assert.match(charterSource, new RegExp(`function ${name}\\(`), `${name} should be defined in extract-signals-charter.js`);
      assert.doesNotMatch(coreSource, new RegExp(`function ${name}\\(`), `${name} should not be defined in extract-signals-core.js`);
      assert.doesNotMatch(facadeSource, new RegExp(`function ${name}\\(`), `${name} should not be defined in extract-signals.js`);
    }

    for (const name of OWNED_CONSTANTS) {
      assert.match(charterSource, new RegExp(`const ${name} =`));
      assert.doesNotMatch(coreSource, new RegExp(`const ${name} =`));
      assert.doesNotMatch(facadeSource, new RegExp(`const ${name} =`));
    }

    assert.doesNotMatch(charterSource, /function extractSignals\(/);
    assert.doesNotMatch(charterSource, /function buildSignalAuthority\(/);
    assert.doesNotMatch(charterSource, /function summarizeReadme\(/);
  });

  it("re-exports the same helper identity through core and extract-signals.js", () => {
    for (const name of [...OWNED_FUNCTIONS, ...OWNED_CONSTANTS]) {
      assert.equal(core[name], charter[name], `${name} core re-export should be the same binding`);
      assert.equal(facade[name], charter[name], `${name} facade re-export should be the same binding`);
    }

    assert.equal(typeof charter.detectSourceRoot, "function");
    assert.equal(charter.extractSignals, undefined);
    assert.equal(charter.buildSignalAuthority, undefined);
    assert.equal(charter.summarizeReadme, undefined);
  });
});
