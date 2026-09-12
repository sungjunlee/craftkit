import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as facade from "../../../skills/spec-grill/scripts/extract-signals.js";
import * as core from "../../../skills/spec-grill/scripts/extract-signals-core.js";
import * as readme from "../../../skills/spec-grill/scripts/extract-signals-readme.js";

const readmeModule = fileURLToPath(
  new URL("../../../skills/spec-grill/scripts/extract-signals-readme.js", import.meta.url),
);
const coreModule = fileURLToPath(
  new URL("../../../skills/spec-grill/scripts/extract-signals-core.js", import.meta.url),
);
const facadeModule = fileURLToPath(
  new URL("../../../skills/spec-grill/scripts/extract-signals.js", import.meta.url),
);

const OWNED_FUNCTIONS = [
  "summarizeReadme",
];

const KEPT_IN_CORE = [
  "extractSignals",
  "addEvidence",
  "addMissingEvidence",
];

describe("extract-signals-readme structure", () => {
  it("exists as its own module (deletion test)", () => {
    assert.equal(fs.existsSync(readmeModule), true);
    assert.match(path.basename(readmeModule), /extract-signals-readme\.js$/);
  });

  it("owns summarizeReadme and helpers only it needs", () => {
    const readmeSource = fs.readFileSync(readmeModule, "utf8");
    const coreSource = fs.readFileSync(coreModule, "utf8");
    const facadeSource = fs.readFileSync(facadeModule, "utf8");

    for (const name of OWNED_FUNCTIONS) {
      assert.match(readmeSource, new RegExp(`function ${name}\\(`), `${name} should be defined in extract-signals-readme.js`);
      assert.doesNotMatch(coreSource, new RegExp(`function ${name}\\(`), `${name} should not be defined in extract-signals-core.js`);
      assert.doesNotMatch(facadeSource, new RegExp(`function ${name}\\(`), `${name} should not be defined in extract-signals.js`);
    }

    for (const name of KEPT_IN_CORE) {
      assert.match(coreSource, new RegExp(`function ${name}\\(`), `${name} should stay in extract-signals-core.js`);
      assert.doesNotMatch(readmeSource, new RegExp(`function ${name}\\(`), `${name} should not move to extract-signals-readme.js`);
    }

    assert.match(coreSource, /from "\.\/extract-signals-readme\.js"/);
    assert.doesNotMatch(facadeSource, /from "\.\/extract-signals-readme\.js"/);
    assert.doesNotMatch(readmeSource, /from "\.\/extract-signals-core\.js"/);
    assert.doesNotMatch(readmeSource, /from "\.\/extract-signals-charter\.js"/);
    assert.doesNotMatch(readmeSource, /from "\.\/extract-signals-authority\.js"/);
    assert.doesNotMatch(readmeSource, /from "\.\/extract-signals-collectors\.js"/);
  });

  it("re-exports the same summarizeReadme identity through core and extract-signals.js", () => {
    for (const name of OWNED_FUNCTIONS) {
      assert.equal(core[name], readme[name], `${name} core re-export should be the same binding`);
      assert.equal(facade[name], readme[name], `${name} facade re-export should be the same binding`);
    }

    assert.equal(typeof readme.summarizeReadme, "function");
    assert.equal(readme.extractSignals, undefined);
    assert.equal(readme.addEvidence, undefined);
    assert.equal(readme.addMissingEvidence, undefined);
    assert.equal(readme.buildSignalAuthority, undefined);
  });
});
