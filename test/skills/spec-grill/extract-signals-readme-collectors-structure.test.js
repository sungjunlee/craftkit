import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as facade from "../../../skills/spec-grill/scripts/extract-signals.js";
import * as collectors from "../../../skills/spec-grill/scripts/extract-signals-collectors.js";
import * as readmeCollectors from "../../../skills/spec-grill/scripts/extract-signals-readme-collectors.js";
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
import * as readme from "../../../skills/spec-grill/scripts/extract-signals-readme.js";

const readmeCollectorsModule = fileURLToPath(
  new URL("../../../skills/spec-grill/scripts/extract-signals-readme-collectors.js", import.meta.url),
);
const collectorsModule = fileURLToPath(
  new URL("../../../skills/spec-grill/scripts/extract-signals-collectors.js", import.meta.url),
);
const facadeModule = fileURLToPath(
  new URL("../../../skills/spec-grill/scripts/extract-signals.js", import.meta.url),
);

const OWNED_FUNCTIONS = [
  "collectReadmeCandidates",
];

const INTERNAL_HELPERS = [];

describe("extract-signals-readme-collectors structure", () => {
  it("exists as its own module (deletion test)", () => {
    assert.equal(fs.existsSync(readmeCollectorsModule), true);
    assert.match(path.basename(readmeCollectorsModule), /extract-signals-readme-collectors\.js$/);
  });

  it("owns collectReadmeCandidates and helpers only it needs", () => {
    const readmeCollectorsSource = fs.readFileSync(readmeCollectorsModule, "utf8");
    const collectorsSource = fs.readFileSync(collectorsModule, "utf8");
    const facadeSource = fs.readFileSync(facadeModule, "utf8");

    for (const name of [...OWNED_FUNCTIONS, ...INTERNAL_HELPERS]) {
      assert.match(readmeCollectorsSource, new RegExp(`function ${name}\\(`), `${name} should be defined in extract-signals-readme-collectors.js`);
      assert.doesNotMatch(collectorsSource, new RegExp(`function ${name}\\(`), `${name} should not be defined in extract-signals-collectors.js`);
      assert.doesNotMatch(facadeSource, new RegExp(`function ${name}\\(`), `${name} should not be defined in extract-signals.js`);
    }

    assert.match(collectorsSource, /from "\.\/extract-signals-readme-collectors\.js"/);
    assert.doesNotMatch(readmeCollectorsSource, /from "\.\/extract-signals-docs\.js"/);
    assert.doesNotMatch(readmeCollectorsSource, /from "\.\/extract-signals-skills\.js"/);
    assert.doesNotMatch(readmeCollectorsSource, /from "\.\/extract-signals-source-surface\.js"/);
    assert.doesNotMatch(readmeCollectorsSource, /from "\.\/extract-signals-tests\.js"/);
    assert.doesNotMatch(readmeCollectorsSource, /from "\.\/extract-signals-cli-commands\.js"/);
    assert.doesNotMatch(readmeCollectorsSource, /from "\.\/extract-signals-system-map\.js"/);
    assert.doesNotMatch(readmeCollectorsSource, /from "\.\/extract-signals-charter\.js"/);
    assert.doesNotMatch(readmeCollectorsSource, /from "\.\/extract-signals-authority\.js"/);
    assert.doesNotMatch(readmeCollectorsSource, /from "\.\/extract-signals-core\.js"/);
    assert.doesNotMatch(readmeCollectorsSource, /from "\.\/extract-signals-cli\.js"/);
    assert.doesNotMatch(readmeCollectorsSource, /from "\.\/extract-signals-readme\.js"/);
    assert.doesNotMatch(facadeSource, /from "\.\/extract-signals-readme-collectors\.js"/);
  });

  it("re-exports the same collectReadmeCandidates identity from collectors and extract-signals.js", () => {
    assert.equal(collectors.collectReadmeCandidates, readmeCollectors.collectReadmeCandidates, "collectors re-export should be the same binding");
    assert.equal(facade.collectReadmeCandidates, readmeCollectors.collectReadmeCandidates, "facade re-export should be the same binding");

    assert.equal(typeof readmeCollectors.collectReadmeCandidates, "function");
    assert.equal(readmeCollectors.collectSystemMapCandidates, undefined);
    assert.equal(readmeCollectors.collectCliCommandCandidates, undefined);
    assert.equal(readmeCollectors.collectTestCandidates, undefined);
    assert.equal(readmeCollectors.collectSkillCandidates, undefined);
    assert.equal(readmeCollectors.collectScriptCandidates, undefined);
    assert.equal(readmeCollectors.collectDocCandidates, undefined);
    assert.equal(readmeCollectors.collectSourceSurfaceCandidates, undefined);
    assert.equal(readmeCollectors.summarizeReadme, undefined);
    assert.equal(readmeCollectors.listDirs, undefined);

    assert.equal(readme.collectReadmeCandidates, undefined);
    assert.equal(systemMap.collectReadmeCandidates, undefined);
    assert.equal(cliCommands.collectReadmeCandidates, undefined);
    assert.equal(tests.collectReadmeCandidates, undefined);
    assert.equal(sourceSurface.collectReadmeCandidates, undefined);
    assert.equal(skills.collectReadmeCandidates, undefined);
    assert.equal(docs.collectReadmeCandidates, undefined);
    assert.equal(scripts.collectReadmeCandidates, undefined);
    assert.equal(charter.collectReadmeCandidates, undefined);
    assert.equal(authority.collectReadmeCandidates, undefined);
    assert.equal(core.collectReadmeCandidates, undefined);
    assert.equal(extractCli.collectReadmeCandidates, undefined);
  });
});
