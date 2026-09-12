import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as facade from "../../../skills/spec-grill/scripts/extract-signals.js";
import * as collectors from "../../../skills/spec-grill/scripts/extract-signals-collectors.js";
import * as tests from "../../../skills/spec-grill/scripts/extract-signals-tests.js";
import * as sourceSurface from "../../../skills/spec-grill/scripts/extract-signals-source-surface.js";
import * as skills from "../../../skills/spec-grill/scripts/extract-signals-skills.js";
import * as docs from "../../../skills/spec-grill/scripts/extract-signals-docs.js";
import * as scripts from "../../../skills/spec-grill/scripts/extract-signals-scripts.js";
import * as charter from "../../../skills/spec-grill/scripts/extract-signals-charter.js";
import * as authority from "../../../skills/spec-grill/scripts/extract-signals-authority.js";
import * as core from "../../../skills/spec-grill/scripts/extract-signals-core.js";

const testsModule = fileURLToPath(
  new URL("../../../skills/spec-grill/scripts/extract-signals-tests.js", import.meta.url),
);
const collectorsModule = fileURLToPath(
  new URL("../../../skills/spec-grill/scripts/extract-signals-collectors.js", import.meta.url),
);
const facadeModule = fileURLToPath(
  new URL("../../../skills/spec-grill/scripts/extract-signals.js", import.meta.url),
);

const OWNED_FUNCTIONS = [
  "collectTestCandidates",
];

const INTERNAL_HELPERS = [
  "collectCliCommandTestCandidates",
  "collectRepoScriptTestCandidates",
  "collectSourceTestCandidates",
];

const KEPT_IN_COLLECTORS = [
  "collectCliCommandCandidates",
  "collectSystemMapCandidates",
  "collectReadmeCandidates",
  "listDirs",
];

describe("extract-signals-tests structure", () => {
  it("exists as its own module (deletion test)", () => {
    assert.equal(fs.existsSync(testsModule), true);
    assert.match(path.basename(testsModule), /extract-signals-tests\.js$/);
  });

  it("owns collectTestCandidates and helpers only it needs", () => {
    const testsSource = fs.readFileSync(testsModule, "utf8");
    const collectorsSource = fs.readFileSync(collectorsModule, "utf8");
    const facadeSource = fs.readFileSync(facadeModule, "utf8");

    for (const name of [...OWNED_FUNCTIONS, ...INTERNAL_HELPERS]) {
      assert.match(testsSource, new RegExp(`function ${name}\\(`), `${name} should be defined in extract-signals-tests.js`);
      assert.doesNotMatch(collectorsSource, new RegExp(`function ${name}\\(`), `${name} should not be defined in extract-signals-collectors.js`);
      assert.doesNotMatch(facadeSource, new RegExp(`function ${name}\\(`), `${name} should not be defined in extract-signals.js`);
    }

    for (const name of KEPT_IN_COLLECTORS) {
      assert.match(collectorsSource, new RegExp(`function ${name}\\(`), `${name} should stay in extract-signals-collectors.js`);
      assert.doesNotMatch(testsSource, new RegExp(`function ${name}\\(`), `${name} should not move to extract-signals-tests.js`);
    }

    assert.doesNotMatch(testsSource, /function collectCliCommandCandidates\(/);
    assert.match(collectorsSource, /from "\.\/extract-signals-tests\.js"/);
    assert.doesNotMatch(testsSource, /from "\.\/extract-signals-docs\.js"/);
    assert.doesNotMatch(testsSource, /from "\.\/extract-signals-skills\.js"/);
    assert.doesNotMatch(testsSource, /from "\.\/extract-signals-source-surface\.js"/);
    assert.doesNotMatch(testsSource, /from "\.\/extract-signals-charter\.js"/);
    assert.doesNotMatch(testsSource, /from "\.\/extract-signals-authority\.js"/);
    assert.doesNotMatch(testsSource, /from "\.\/extract-signals-core\.js"/);
    assert.doesNotMatch(facadeSource, /from "\.\/extract-signals-tests\.js"/);
  });

  it("re-exports the same collectTestCandidates identity from collectors and extract-signals.js", () => {
    assert.equal(collectors.collectTestCandidates, tests.collectTestCandidates, "collectors re-export should be the same binding");
    assert.equal(facade.collectTestCandidates, tests.collectTestCandidates, "facade re-export should be the same binding");
    assert.equal(collectors.collectSourceTestCandidates, tests.collectSourceTestCandidates, "collectors collectSourceTestCandidates re-export should be the same binding");
    assert.equal(facade.collectSourceTestCandidates, tests.collectSourceTestCandidates, "facade collectSourceTestCandidates re-export should be the same binding");

    assert.equal(typeof tests.collectTestCandidates, "function");
    assert.equal(tests.collectCliCommandTestCandidates, undefined);
    assert.equal(tests.collectRepoScriptTestCandidates, undefined);
    assert.equal(tests.collectCliCommandCandidates, undefined);
    assert.equal(tests.collectSkillCandidates, undefined);
    assert.equal(tests.collectScriptCandidates, undefined);
    assert.equal(tests.collectDocCandidates, undefined);
    assert.equal(tests.collectSourceSurfaceCandidates, undefined);
    assert.equal(tests.listDirs, undefined);

    assert.equal(sourceSurface.collectTestCandidates, undefined);
    assert.equal(skills.collectTestCandidates, undefined);
    assert.equal(docs.collectTestCandidates, undefined);
    assert.equal(scripts.collectTestCandidates, undefined);
    assert.equal(charter.collectTestCandidates, undefined);
    assert.equal(authority.collectTestCandidates, undefined);
    assert.equal(core.collectTestCandidates, undefined);

    assert.equal(collectors.collectCliCommandTestCandidates, undefined);
    assert.equal(facade.collectCliCommandTestCandidates, undefined);
    assert.equal(collectors.collectRepoScriptTestCandidates, undefined);
    assert.equal(facade.collectRepoScriptTestCandidates, undefined);
  });
});
