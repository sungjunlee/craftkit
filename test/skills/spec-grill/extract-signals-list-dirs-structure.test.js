import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as facade from "../../../skills/spec-grill/scripts/extract-signals.js";
import * as collectors from "../../../skills/spec-grill/scripts/extract-signals-collectors.js";
import * as listDirsModule from "../../../skills/spec-grill/scripts/extract-signals-list-dirs.js";
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
import * as shared from "../../../skills/spec-grill/scripts/extract-signals-shared.js";

const listDirsFile = fileURLToPath(
  new URL("../../../skills/spec-grill/scripts/extract-signals-list-dirs.js", import.meta.url),
);
const collectorsModule = fileURLToPath(
  new URL("../../../skills/spec-grill/scripts/extract-signals-collectors.js", import.meta.url),
);
const facadeModule = fileURLToPath(
  new URL("../../../skills/spec-grill/scripts/extract-signals.js", import.meta.url),
);

const OWNED_FUNCTIONS = [
  "listDirs",
];

describe("extract-signals-list-dirs structure", () => {
  it("exists as its own module (deletion test)", () => {
    assert.equal(fs.existsSync(listDirsFile), true);
    assert.match(path.basename(listDirsFile), /extract-signals-list-dirs\.js$/);
  });

  it("owns listDirs and helpers only it needs", () => {
    const listDirsSource = fs.readFileSync(listDirsFile, "utf8");
    const collectorsSource = fs.readFileSync(collectorsModule, "utf8");
    const facadeSource = fs.readFileSync(facadeModule, "utf8");

    for (const name of OWNED_FUNCTIONS) {
      assert.match(listDirsSource, new RegExp(`function ${name}\\(`), `${name} should be defined in extract-signals-list-dirs.js`);
      assert.doesNotMatch(collectorsSource, new RegExp(`function ${name}\\(`), `${name} should not be defined in extract-signals-collectors.js`);
      assert.doesNotMatch(facadeSource, new RegExp(`function ${name}\\(`), `${name} should not be defined in extract-signals.js`);
    }

    assert.match(collectorsSource, /from "\.\/extract-signals-list-dirs\.js"/);
    assert.doesNotMatch(listDirsSource, /from "\.\/extract-signals-collectors\.js"/);
    assert.doesNotMatch(listDirsSource, /from "\.\/extract-signals-docs\.js"/);
    assert.doesNotMatch(listDirsSource, /from "\.\/extract-signals-skills\.js"/);
    assert.doesNotMatch(listDirsSource, /from "\.\/extract-signals-source-surface\.js"/);
    assert.doesNotMatch(listDirsSource, /from "\.\/extract-signals-tests\.js"/);
    assert.doesNotMatch(listDirsSource, /from "\.\/extract-signals-cli-commands\.js"/);
    assert.doesNotMatch(listDirsSource, /from "\.\/extract-signals-system-map\.js"/);
    assert.doesNotMatch(listDirsSource, /from "\.\/extract-signals-readme-collectors\.js"/);
    assert.doesNotMatch(listDirsSource, /from "\.\/extract-signals-charter\.js"/);
    assert.doesNotMatch(listDirsSource, /from "\.\/extract-signals-authority\.js"/);
    assert.doesNotMatch(listDirsSource, /from "\.\/extract-signals-core\.js"/);
    assert.doesNotMatch(listDirsSource, /from "\.\/extract-signals-cli\.js"/);
    assert.doesNotMatch(listDirsSource, /from "\.\/extract-signals-readme\.js"/);
    assert.doesNotMatch(facadeSource, /from "\.\/extract-signals-list-dirs\.js"/);
  });

  it("re-exports the same listDirs identity from collectors", () => {
    assert.equal(collectors.listDirs, listDirsModule.listDirs, "collectors re-export should be the same binding");

    assert.equal(typeof listDirsModule.listDirs, "function");
    assert.equal(listDirsModule.collectReadmeCandidates, undefined);
    assert.equal(listDirsModule.collectSystemMapCandidates, undefined);
    assert.equal(listDirsModule.collectCliCommandCandidates, undefined);
    assert.equal(listDirsModule.collectTestCandidates, undefined);
    assert.equal(listDirsModule.collectSkillCandidates, undefined);
    assert.equal(listDirsModule.collectScriptCandidates, undefined);
    assert.equal(listDirsModule.collectDocCandidates, undefined);
    assert.equal(listDirsModule.collectSourceSurfaceCandidates, undefined);
    assert.equal(listDirsModule.slugifyCandidate, undefined);
    assert.equal(listDirsModule.readOptionalFile, undefined);

    assert.equal(readmeCollectors.listDirs, undefined);
    assert.equal(systemMap.listDirs, undefined);
    assert.equal(cliCommands.listDirs, undefined);
    assert.equal(tests.listDirs, undefined);
    assert.equal(sourceSurface.listDirs, undefined);
    assert.equal(skills.listDirs, undefined);
    assert.equal(docs.listDirs, undefined);
    assert.equal(scripts.listDirs, undefined);
    assert.equal(charter.listDirs, undefined);
    assert.equal(authority.listDirs, undefined);
    assert.equal(core.listDirs, undefined);
    assert.equal(extractCli.listDirs, undefined);
    assert.equal(readme.listDirs, undefined);
    assert.equal(shared.listDirs, undefined);
    assert.equal(facade.listDirs, undefined);
  });
});
