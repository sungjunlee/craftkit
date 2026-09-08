import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as facade from "../../../skills/spec-grill/scripts/extract-signals.js";
import * as cli from "../../../skills/spec-grill/scripts/extract-signals-cli.js";

const cliModule = fileURLToPath(
  new URL("../../../skills/spec-grill/scripts/extract-signals-cli.js", import.meta.url),
);
const facadeModule = fileURLToPath(
  new URL("../../../skills/spec-grill/scripts/extract-signals.js", import.meta.url),
);

const OWNED_FUNCTIONS = [
  "parseArgs",
  "runCli",
];

const INTERNAL_HELPERS = [
  "usage",
];

describe("extract-signals-cli structure", () => {
  it("exists as its own module (deletion test)", () => {
    assert.equal(fs.existsSync(cliModule), true);
    assert.match(path.basename(cliModule), /extract-signals-cli\.js$/);
  });

  it("owns parseArgs and the JSON/human/dry-run report glue", () => {
    const cliSource = fs.readFileSync(cliModule, "utf8");
    const facadeSource = fs.readFileSync(facadeModule, "utf8");

    for (const name of [...OWNED_FUNCTIONS, ...INTERNAL_HELPERS]) {
      assert.match(cliSource, new RegExp(`function ${name}\\(`), `${name} should be defined in extract-signals-cli.js`);
      assert.doesNotMatch(facadeSource, new RegExp(`function ${name}\\(`), `${name} should not be defined in extract-signals.js`);
    }

    assert.match(cliSource, /JSON\.stringify\(result/);
    assert.doesNotMatch(facadeSource, /JSON\.stringify\(result/);
    assert.match(cliSource, /formatHumanReport\(result\)/);
    assert.doesNotMatch(facadeSource, /formatHumanReport\(result\)/);
    assert.match(cliSource, /\[dry-run\] No files written/);
    assert.doesNotMatch(facadeSource, /\[dry-run\] No files written/);

    assert.doesNotMatch(facadeSource, /function extractSignals\(/);
    assert.doesNotMatch(cliSource, /function extractSignals\(/);
  });

  it("re-exports the same parseArgs identity from extract-signals.js", () => {
    assert.equal(facade.parseArgs, cli.parseArgs, "parseArgs re-export should be the same binding");
    assert.equal(typeof facade.parseArgs, "function");
    assert.equal(typeof cli.runCli, "function");
    assert.equal(facade.runCli, undefined);
  });
});
