import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as facade from "../../../skills/spec-grill/scripts/extract-signals.js";
import * as collectors from "../../../skills/spec-grill/scripts/extract-signals-collectors.js";
import * as systemMap from "../../../skills/spec-grill/scripts/extract-signals-system-map.js";
import * as cliCommands from "../../../skills/spec-grill/scripts/extract-signals-cli-commands.js";
import * as tests from "../../../skills/spec-grill/scripts/extract-signals-tests.js";
import * as sourceSurface from "../../../skills/spec-grill/scripts/extract-signals-source-surface.js";
import * as skills from "../../../skills/spec-grill/scripts/extract-signals-skills.js";
import * as docs from "../../../skills/spec-grill/scripts/extract-signals-docs.js";
import * as scripts from "../../../skills/spec-grill/scripts/extract-signals-scripts.js";
import * as charter from "../../../skills/spec-grill/scripts/extract-signals-charter.js";
import * as authority from "../../../skills/spec-grill/scripts/extract-signals-authority.js";
import * as core from "../../../skills/spec-grill/scripts/extract-signals-core.js";
import * as extractCli from "../../../skills/spec-grill/scripts/extract-signals-cli.js";

const systemMapModule = fileURLToPath(
  new URL("../../../skills/spec-grill/scripts/extract-signals-system-map.js", import.meta.url),
);
const collectorsModule = fileURLToPath(
  new URL("../../../skills/spec-grill/scripts/extract-signals-collectors.js", import.meta.url),
);
const facadeModule = fileURLToPath(
  new URL("../../../skills/spec-grill/scripts/extract-signals.js", import.meta.url),
);

const OWNED_FUNCTIONS = [
  "collectSystemMapCandidates",
];

const INTERNAL_HELPERS = [
  "getMarkdownSection",
];

const KEPT_IN_COLLECTORS = [
  "listDirs",
];

describe("extract-signals-system-map structure", () => {
  it("exists as its own module (deletion test)", () => {
    assert.equal(fs.existsSync(systemMapModule), true);
    assert.match(path.basename(systemMapModule), /extract-signals-system-map\.js$/);
  });

  it("owns collectSystemMapCandidates and helpers only it needs", () => {
    const systemMapSource = fs.readFileSync(systemMapModule, "utf8");
    const collectorsSource = fs.readFileSync(collectorsModule, "utf8");
    const facadeSource = fs.readFileSync(facadeModule, "utf8");

    for (const name of [...OWNED_FUNCTIONS, ...INTERNAL_HELPERS]) {
      assert.match(systemMapSource, new RegExp(`function ${name}\\(`), `${name} should be defined in extract-signals-system-map.js`);
      assert.doesNotMatch(collectorsSource, new RegExp(`function ${name}\\(`), `${name} should not be defined in extract-signals-collectors.js`);
      assert.doesNotMatch(facadeSource, new RegExp(`function ${name}\\(`), `${name} should not be defined in extract-signals.js`);
    }

    for (const name of KEPT_IN_COLLECTORS) {
      assert.match(collectorsSource, new RegExp(`function ${name}\\(`), `${name} should stay in extract-signals-collectors.js`);
      assert.doesNotMatch(systemMapSource, new RegExp(`function ${name}\\(`), `${name} should not move to extract-signals-system-map.js`);
    }

    assert.match(collectorsSource, /from "\.\/extract-signals-system-map\.js"/);
    assert.doesNotMatch(systemMapSource, /from "\.\/extract-signals-docs\.js"/);
    assert.doesNotMatch(systemMapSource, /from "\.\/extract-signals-skills\.js"/);
    assert.doesNotMatch(systemMapSource, /from "\.\/extract-signals-source-surface\.js"/);
    assert.doesNotMatch(systemMapSource, /from "\.\/extract-signals-tests\.js"/);
    assert.doesNotMatch(systemMapSource, /from "\.\/extract-signals-cli-commands\.js"/);
    assert.doesNotMatch(systemMapSource, /from "\.\/extract-signals-charter\.js"/);
    assert.doesNotMatch(systemMapSource, /from "\.\/extract-signals-authority\.js"/);
    assert.doesNotMatch(systemMapSource, /from "\.\/extract-signals-core\.js"/);
    assert.doesNotMatch(systemMapSource, /from "\.\/extract-signals-cli\.js"/);
    assert.doesNotMatch(facadeSource, /from "\.\/extract-signals-system-map\.js"/);
  });

  it("re-exports the same collectSystemMapCandidates identity from collectors and extract-signals.js", () => {
    assert.equal(collectors.collectSystemMapCandidates, systemMap.collectSystemMapCandidates, "collectors re-export should be the same binding");
    assert.equal(facade.collectSystemMapCandidates, systemMap.collectSystemMapCandidates, "facade re-export should be the same binding");

    assert.equal(typeof systemMap.collectSystemMapCandidates, "function");
    assert.equal(systemMap.getMarkdownSection, undefined);
    assert.equal(systemMap.collectReadmeCandidates, undefined);
    assert.equal(systemMap.collectCliCommandCandidates, undefined);
    assert.equal(systemMap.collectTestCandidates, undefined);
    assert.equal(systemMap.collectSkillCandidates, undefined);
    assert.equal(systemMap.collectScriptCandidates, undefined);
    assert.equal(systemMap.collectDocCandidates, undefined);
    assert.equal(systemMap.collectSourceSurfaceCandidates, undefined);
    assert.equal(systemMap.listDirs, undefined);

    assert.equal(cliCommands.collectSystemMapCandidates, undefined);
    assert.equal(tests.collectSystemMapCandidates, undefined);
    assert.equal(sourceSurface.collectSystemMapCandidates, undefined);
    assert.equal(skills.collectSystemMapCandidates, undefined);
    assert.equal(docs.collectSystemMapCandidates, undefined);
    assert.equal(scripts.collectSystemMapCandidates, undefined);
    assert.equal(charter.collectSystemMapCandidates, undefined);
    assert.equal(authority.collectSystemMapCandidates, undefined);
    assert.equal(core.collectSystemMapCandidates, undefined);
    assert.equal(extractCli.collectSystemMapCandidates, undefined);

    assert.equal(collectors.getMarkdownSection, undefined);
    assert.equal(facade.getMarkdownSection, undefined);
  });
});
