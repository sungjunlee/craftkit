import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as facade from "../../../skills/spec-grill/scripts/extract-signals.js";
import * as collectors from "../../../skills/spec-grill/scripts/extract-signals-collectors.js";
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

const cliCommandsModule = fileURLToPath(
  new URL("../../../skills/spec-grill/scripts/extract-signals-cli-commands.js", import.meta.url),
);
const collectorsModule = fileURLToPath(
  new URL("../../../skills/spec-grill/scripts/extract-signals-collectors.js", import.meta.url),
);
const facadeModule = fileURLToPath(
  new URL("../../../skills/spec-grill/scripts/extract-signals.js", import.meta.url),
);

const OWNED_FUNCTIONS = [
  "collectCliCommandCandidates",
];

const INTERNAL_HELPERS = [];

describe("extract-signals-cli-commands structure", () => {
  it("exists as its own module (deletion test)", () => {
    assert.equal(fs.existsSync(cliCommandsModule), true);
    assert.match(path.basename(cliCommandsModule), /extract-signals-cli-commands\.js$/);
  });

  it("owns collectCliCommandCandidates and helpers only it needs", () => {
    const cliCommandsSource = fs.readFileSync(cliCommandsModule, "utf8");
    const collectorsSource = fs.readFileSync(collectorsModule, "utf8");
    const facadeSource = fs.readFileSync(facadeModule, "utf8");

    for (const name of [...OWNED_FUNCTIONS, ...INTERNAL_HELPERS]) {
      assert.match(cliCommandsSource, new RegExp(`function ${name}\\(`), `${name} should be defined in extract-signals-cli-commands.js`);
      assert.doesNotMatch(collectorsSource, new RegExp(`function ${name}\\(`), `${name} should not be defined in extract-signals-collectors.js`);
      assert.doesNotMatch(facadeSource, new RegExp(`function ${name}\\(`), `${name} should not be defined in extract-signals.js`);
    }

    assert.match(collectorsSource, /from "\.\/extract-signals-cli-commands\.js"/);
    assert.doesNotMatch(cliCommandsSource, /from "\.\/extract-signals-docs\.js"/);
    assert.doesNotMatch(cliCommandsSource, /from "\.\/extract-signals-skills\.js"/);
    assert.doesNotMatch(cliCommandsSource, /from "\.\/extract-signals-source-surface\.js"/);
    assert.doesNotMatch(cliCommandsSource, /from "\.\/extract-signals-tests\.js"/);
    assert.doesNotMatch(cliCommandsSource, /from "\.\/extract-signals-charter\.js"/);
    assert.doesNotMatch(cliCommandsSource, /from "\.\/extract-signals-authority\.js"/);
    assert.doesNotMatch(cliCommandsSource, /from "\.\/extract-signals-core\.js"/);
    assert.doesNotMatch(cliCommandsSource, /from "\.\/extract-signals-cli\.js"/);
    assert.doesNotMatch(facadeSource, /from "\.\/extract-signals-cli-commands\.js"/);
  });

  it("re-exports the same collectCliCommandCandidates identity from collectors and extract-signals.js", () => {
    assert.equal(collectors.collectCliCommandCandidates, cliCommands.collectCliCommandCandidates, "collectors re-export should be the same binding");
    assert.equal(facade.collectCliCommandCandidates, cliCommands.collectCliCommandCandidates, "facade re-export should be the same binding");

    assert.equal(typeof cliCommands.collectCliCommandCandidates, "function");
    assert.equal(cliCommands.collectSystemMapCandidates, undefined);
    assert.equal(cliCommands.collectReadmeCandidates, undefined);
    assert.equal(cliCommands.collectTestCandidates, undefined);
    assert.equal(cliCommands.collectSkillCandidates, undefined);
    assert.equal(cliCommands.collectScriptCandidates, undefined);
    assert.equal(cliCommands.collectDocCandidates, undefined);
    assert.equal(cliCommands.collectSourceSurfaceCandidates, undefined);
    assert.equal(cliCommands.listDirs, undefined);
    assert.equal(cliCommands.listScriptFiles, undefined);

    assert.equal(tests.collectCliCommandCandidates, undefined);
    assert.equal(sourceSurface.collectCliCommandCandidates, undefined);
    assert.equal(skills.collectCliCommandCandidates, undefined);
    assert.equal(docs.collectCliCommandCandidates, undefined);
    assert.equal(scripts.collectCliCommandCandidates, undefined);
    assert.equal(charter.collectCliCommandCandidates, undefined);
    assert.equal(authority.collectCliCommandCandidates, undefined);
    assert.equal(core.collectCliCommandCandidates, undefined);
    assert.equal(extractCli.collectCliCommandCandidates, undefined);
  });
});
