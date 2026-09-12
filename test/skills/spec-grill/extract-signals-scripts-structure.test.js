import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as facade from "../../../skills/spec-grill/scripts/extract-signals.js";
import * as collectors from "../../../skills/spec-grill/scripts/extract-signals-collectors.js";
import * as scripts from "../../../skills/spec-grill/scripts/extract-signals-scripts.js";
import * as charter from "../../../skills/spec-grill/scripts/extract-signals-charter.js";
import * as authority from "../../../skills/spec-grill/scripts/extract-signals-authority.js";
import * as core from "../../../skills/spec-grill/scripts/extract-signals-core.js";

const scriptsModule = fileURLToPath(
  new URL("../../../skills/spec-grill/scripts/extract-signals-scripts.js", import.meta.url),
);
const collectorsModule = fileURLToPath(
  new URL("../../../skills/spec-grill/scripts/extract-signals-collectors.js", import.meta.url),
);
const facadeModule = fileURLToPath(
  new URL("../../../skills/spec-grill/scripts/extract-signals.js", import.meta.url),
);

const OWNED_FUNCTIONS = [
  "collectScriptCandidates",
];

const INTERNAL_HELPERS = [
  "collectRepoScriptCandidates",
  "scriptCandidateName",
  "isSkillScriptTest",
  "listScriptFiles",
];

const KEPT_IN_COLLECTORS = [
  "listDirs",
];

describe("extract-signals-scripts structure", () => {
  it("exists as its own module (deletion test)", () => {
    assert.equal(fs.existsSync(scriptsModule), true);
    assert.match(path.basename(scriptsModule), /extract-signals-scripts\.js$/);
  });

  it("owns collectScriptCandidates and helpers only it needs", () => {
    const scriptsSource = fs.readFileSync(scriptsModule, "utf8");
    const collectorsSource = fs.readFileSync(collectorsModule, "utf8");
    const facadeSource = fs.readFileSync(facadeModule, "utf8");

    for (const name of [...OWNED_FUNCTIONS, ...INTERNAL_HELPERS]) {
      assert.match(scriptsSource, new RegExp(`function ${name}\\(`), `${name} should be defined in extract-signals-scripts.js`);
      assert.doesNotMatch(collectorsSource, new RegExp(`function ${name}\\(`), `${name} should not be defined in extract-signals-collectors.js`);
      assert.doesNotMatch(facadeSource, new RegExp(`function ${name}\\(`), `${name} should not be defined in extract-signals.js`);
    }

    for (const name of KEPT_IN_COLLECTORS) {
      assert.match(collectorsSource, new RegExp(`function ${name}\\(`), `${name} should stay in extract-signals-collectors.js`);
      assert.doesNotMatch(scriptsSource, new RegExp(`function ${name}\\(`), `${name} should not move to extract-signals-scripts.js`);
    }

    assert.match(collectorsSource, /from "\.\/extract-signals-scripts\.js"/);
    assert.doesNotMatch(scriptsSource, /from "\.\/extract-signals-charter\.js"/);
    assert.doesNotMatch(scriptsSource, /from "\.\/extract-signals-authority\.js"/);
    assert.doesNotMatch(scriptsSource, /from "\.\/extract-signals-core\.js"/);
    assert.doesNotMatch(facadeSource, /from "\.\/extract-signals-scripts\.js"/);
  });

  it("re-exports the same collectScriptCandidates identity from collectors and extract-signals.js", () => {
    assert.equal(collectors.collectScriptCandidates, scripts.collectScriptCandidates, "collectors re-export should be the same binding");
    assert.equal(facade.collectScriptCandidates, scripts.collectScriptCandidates, "facade re-export should be the same binding");

    assert.equal(typeof scripts.collectScriptCandidates, "function");
    assert.equal(scripts.collectSkillCandidates, undefined);
    assert.equal(scripts.collectDocCandidates, undefined);
    assert.equal(scripts.collectTestCandidates, undefined);

    assert.equal(charter.collectScriptCandidates, undefined);
    assert.equal(authority.collectScriptCandidates, undefined);
    assert.equal(core.collectScriptCandidates, undefined);
  });
});
